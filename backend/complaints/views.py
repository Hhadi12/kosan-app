from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError as DRFValidationError
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta

from .models import Complaint, ComplaintComment
from .serializers import (
    ComplaintListSerializer,
    ComplaintDetailSerializer,
    ComplaintCreateSerializer,
    ComplaintUpdateSerializer,
    ComplaintCommentSerializer,
    ComplaintStatsSerializer,
)
from tenants.models import TenantProfile


# ============================================================
# CUSTOM PERMISSIONS
# ============================================================

class IsAdminUser(permissions.BasePermission):
    """Permission class for admin-only access."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsOwnerOrAdmin(permissions.BasePermission):
    """Permission class for owner or admin access."""

    def has_object_permission(self, request, view, obj):
        # Admin has full access
        if request.user.role == 'admin':
            return True

        # For complaints: check if user is the tenant
        if isinstance(obj, Complaint):
            return hasattr(request.user, 'tenant_profile') and obj.tenant == request.user.tenant_profile

        # For comments: check if user posted the comment
        if isinstance(obj, ComplaintComment):
            return obj.user == request.user

        return False


# ============================================================
# COMPLAINT VIEWS
# ============================================================

class ComplaintListView(generics.ListAPIView):
    """
    List complaints.

    Permissions:
    - Admin: See all complaints
    - Tenant: See only own complaints

    Filters:
    - status (open, in_progress, resolved, closed)
    - category (maintenance, facilities, etc.)
    - priority (low, medium, high, urgent)
    - search (title, description)
    """

    serializer_class = ComplaintListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Admin sees all complaints
        if user.role == 'admin':
            queryset = Complaint.objects.all()
        else:
            # Tenant sees only own complaints
            if not hasattr(user, 'tenant_profile'):
                return Complaint.objects.none()
            queryset = Complaint.objects.filter(tenant=user.tenant_profile)

        # Apply filters
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        category_filter = self.request.query_params.get('category')
        if category_filter:
            queryset = queryset.filter(category=category_filter)

        priority_filter = self.request.query_params.get('priority')
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)

        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        return queryset.select_related('tenant__user', 'room')


class ComplaintCreateView(generics.CreateAPIView):
    """
    Create new complaint.

    Permissions:
    - Authenticated users with tenant profile only

    Auto-sets tenant from request.user.tenant_profile
    """

    serializer_class = ComplaintCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Ensure user has tenant profile
        if not hasattr(self.request.user, 'tenant_profile'):
            raise PermissionDenied("Hanya penghuni yang dapat membuat keluhan")

        # Save with tenant from request user
        serializer.save(tenant=self.request.user.tenant_profile)


class ComplaintDetailView(generics.RetrieveAPIView):
    """
    Get complaint detail.

    Permissions:
    - Admin: Can view any complaint
    - Tenant: Can view only own complaints
    """

    serializer_class = ComplaintDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    queryset = Complaint.objects.select_related(
        'tenant__user',
        'room',
        'resolved_by'
    ).prefetch_related('comments')


class ComplaintUpdateView(generics.UpdateAPIView):
    """
    Update complaint (admin only).

    Allows updating:
    - status
    - priority
    - category
    - resolution_notes
    """

    serializer_class = ComplaintUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    queryset = Complaint.objects.all()

    def perform_update(self, serializer):
        # Set resolved_by if marking as resolved
        if serializer.validated_data.get('status') == 'resolved':
            serializer.save(resolved_by=self.request.user)
        else:
            serializer.save()


class ComplaintDeleteView(generics.DestroyAPIView):
    """
    Delete complaint (admin only).

    Cascades to delete all comments.
    """

    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    queryset = Complaint.objects.all()


# ============================================================
# COMMENT VIEWS
# ============================================================

class CommentListView(generics.ListAPIView):
    """
    List comments for a specific complaint.

    Permissions:
    - Users can see comments if they have access to the complaint
    """

    serializer_class = ComplaintCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        complaint_id = self.kwargs['complaint_id']

        # Check if user has access to this complaint
        try:
            complaint = Complaint.objects.get(id=complaint_id)
        except Complaint.DoesNotExist:
            return ComplaintComment.objects.none()

        # Admin can access any complaint
        if self.request.user.role == 'admin':
            pass
        # Tenant can only access own complaints
        elif hasattr(self.request.user, 'tenant_profile'):
            if complaint.tenant != self.request.user.tenant_profile:
                raise PermissionDenied("Anda tidak memiliki akses ke keluhan ini")
        else:
            raise PermissionDenied("Anda tidak memiliki akses ke keluhan ini")

        return ComplaintComment.objects.filter(complaint_id=complaint_id).select_related('user')


class CommentCreateView(generics.CreateAPIView):
    """
    Add comment to complaint.

    Permissions:
    - Admin: Can comment on any complaint
    - Tenant: Can comment on own complaints
    """

    serializer_class = ComplaintCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        complaint_id = self.kwargs['complaint_id']

        # Get complaint
        try:
            complaint = Complaint.objects.get(id=complaint_id)
        except Complaint.DoesNotExist:
            raise DRFValidationError("Keluhan tidak ditemukan")

        # Check access
        if self.request.user.role != 'admin':
            if not hasattr(self.request.user, 'tenant_profile') or complaint.tenant != self.request.user.tenant_profile:
                raise PermissionDenied("Anda tidak memiliki akses ke keluhan ini")

        # Save comment
        serializer.save(
            complaint=complaint,
            user=self.request.user
        )


class CommentDeleteView(generics.DestroyAPIView):
    """
    Delete comment.

    Permissions:
    - Admin: Can delete any comment
    - User: Can delete own comments only
    """

    permission_classes = [permissions.IsAuthenticated]
    queryset = ComplaintComment.objects.all()

    def perform_destroy(self, instance):
        # Admin can delete any comment
        if self.request.user.role == 'admin':
            instance.delete()
        # User can only delete own comments
        elif instance.user == self.request.user:
            instance.delete()
        else:
            raise PermissionDenied("Anda hanya dapat menghapus komentar Anda sendiri")


# ============================================================
# STATISTICS VIEW
# ============================================================

class ComplaintStatsView(generics.GenericAPIView):
    """
    Get complaint statistics for dashboard.

    Permissions:
    - Admin only

    Returns:
    - Total complaints
    - Counts by status
    - Counts by category
    - Counts by priority
    - Average resolution time
    """

    serializer_class = ComplaintStatsSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Total counts
        total = Complaint.objects.count()

        # By status
        status_counts = Complaint.objects.values('status').annotate(count=Count('id'))
        open_count = next((item['count'] for item in status_counts if item['status'] == 'open'), 0)
        in_progress_count = next((item['count'] for item in status_counts if item['status'] == 'in_progress'), 0)
        resolved_count = next((item['count'] for item in status_counts if item['status'] == 'resolved'), 0)
        closed_count = next((item['count'] for item in status_counts if item['status'] == 'closed'), 0)

        # By category
        category_counts = Complaint.objects.values('category').annotate(count=Count('id'))
        by_category = {item['category']: item['count'] for item in category_counts}

        # By priority
        priority_counts = Complaint.objects.values('priority').annotate(count=Count('id'))
        by_priority = {item['priority']: item['count'] for item in priority_counts}

        # Average resolution time (for resolved complaints)
        resolved_complaints = Complaint.objects.filter(
            status__in=['resolved', 'closed'],
            resolved_at__isnull=False
        )

        avg_days = None
        if resolved_complaints.exists():
            total_days = sum([
                (c.resolved_at - c.created_at).days
                for c in resolved_complaints
            ])
            avg_days = total_days / resolved_complaints.count()

        # Prepare response
        data = {
            'total_complaints': total,
            'open_complaints': open_count,
            'in_progress_complaints': in_progress_count,
            'resolved_complaints': resolved_count,
            'closed_complaints': closed_count,
            'by_category': by_category,
            'by_priority': by_priority,
            'avg_resolution_time': round(avg_days, 1) if avg_days else None,
        }

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.data)
