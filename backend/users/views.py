from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from .models import User
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
    EmailChangeSerializer,
    PasswordChangeSerializer,
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register new user.
    
    POST /api/auth/register/
    """
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Create token for user
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'token': token.key
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Login user and return token.
    
    POST /api/auth/login/
    """
    serializer = UserLoginSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Get or create token
        token, created = Token.objects.get_or_create(user=user)
        
        # Update last_login
        login(request, user)
        
        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
            },
            'token': token.key
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """
    Logout user by deleting token.
    
    POST /api/auth/logout/
    """
    try:
        # Delete user's token
        request.user.auth_token.delete()
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get current logged-in user info.
    
    GET /api/auth/me/
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    """
    List all active users (admin only).
    
    GET /api/users/
    """
    # Check if user is admin
    if not request.user.is_admin():
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    users = User.objects.filter(is_active=True)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request, pk):
    """
    Get specific user by ID (admin only).
    
    GET /api/users/{id}/
    """
    # Check if user is admin
    if not request.user.is_admin():
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(pk=pk, is_active=True)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request, pk):
    """
    Update user (admin only).
    
    PUT /api/users/{id}/
    """
    # Check if user is admin
    if not request.user.is_admin():
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(pk=pk)
        serializer = UserSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'User updated successfully',
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, pk):
    """
    Soft delete user (admin only).

    DELETE /api/users/{id}/
    """
    # Check if user is admin
    if not request.user.is_admin():
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(pk=pk)

        # Soft delete (set is_active to False)
        user.is_active = False
        user.save()

        return Response({
            'message': 'User deleted successfully'
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)


# =============================================================================
# Profile Management Endpoints
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    Get current user's profile with tenant data if applicable.

    GET /api/users/profile/
    """
    serializer = ProfileSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update current user's profile (name, phone).

    PUT/PATCH /api/users/profile/update/
    """
    serializer = ProfileUpdateSerializer(
        request.user,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profil berhasil diperbarui.',
            'user': ProfileSerializer(request.user).data
        }, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_email(request):
    """
    Change user's email with password confirmation.

    POST /api/users/profile/change-email/
    {
        "new_email": "newemail@example.com",
        "password": "currentpassword"
    }
    """
    serializer = EmailChangeSerializer(
        data=request.data,
        context={'request': request}
    )

    if serializer.is_valid():
        request.user.email = serializer.validated_data['new_email']
        request.user.save()
        return Response({
            'message': 'Email berhasil diubah.',
            'email': request.user.email
        }, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user's password.

    POST /api/users/profile/change-password/
    {
        "current_password": "oldpassword",
        "new_password": "newpassword123",
        "confirm_password": "newpassword123"
    }
    """
    serializer = PasswordChangeSerializer(
        data=request.data,
        context={'request': request}
    )

    if serializer.is_valid():
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({
            'message': 'Password berhasil diubah.'
        }, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =============================================================================
# Tenant History Endpoints (Phase 8.4)
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tenant_history(request, user_id=None):
    """
    Get tenant's 12-month history of payments and complaints.

    Admin can view any tenant's history.
    Tenant can only view own history.

    GET /api/users/profile/history/          - Own history
    GET /api/users/{user_id}/history/        - Specific tenant (admin only)
    """
    import calendar
    from datetime import datetime
    from dateutil.relativedelta import relativedelta

    # Determine which user's history to fetch
    if user_id:
        # Admin viewing specific tenant
        if not request.user.is_admin():
            return Response(
                {'error': 'Tidak memiliki izin.'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Pengguna tidak ditemukan.'},
                status=status.HTTP_404_NOT_FOUND
            )
    else:
        # User viewing own history
        target_user = request.user

    # Check if user has tenant profile
    if not hasattr(target_user, 'tenant_profile'):
        return Response(
            {'error': 'Pengguna bukan penghuni.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        tenant = target_user.tenant_profile
    except target_user.tenant_profile.RelatedObjectDoesNotExist:
        return Response(
            {'error': 'Pengguna bukan penghuni.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Calculate date range (last 12 months)
    today = datetime.now().date()
    twelve_months_ago = today - relativedelta(months=12)

    # Get payment history
    payment_data = _get_payment_history(tenant, twelve_months_ago, today)

    # Get complaint history
    complaint_data = _get_complaint_history(tenant, twelve_months_ago, today)

    return Response({
        'user_id': target_user.id,
        'user_name': target_user.get_full_name() or target_user.email,
        'payment_summary': payment_data['summary'],
        'payment_history': payment_data['history'],
        'complaint_summary': complaint_data['summary'],
        'complaint_history': complaint_data['history'],
    }, status=status.HTTP_200_OK)


def _get_payment_history(tenant, start_date, end_date):
    """
    Get payment history for tenant within date range.

    Returns dict with summary and history list.
    """
    import calendar
    from payments.models import Payment

    payments = Payment.objects.filter(
        tenant=tenant,
        due_date__gte=start_date,
        due_date__lte=end_date
    ).order_by('-payment_period_year', '-payment_period_month')

    history = []
    on_time_count = 0
    late_count = 0
    unpaid_count = 0

    for payment in payments:
        # Determine if payment was late
        is_late = False
        if payment.status == 'paid' and payment.payment_date:
            is_late = payment.payment_date > payment.due_date
        elif payment.status == 'pending':
            is_late = payment.is_overdue

        # Count by status
        if payment.status == 'paid':
            if is_late:
                late_count += 1
            else:
                on_time_count += 1
        elif payment.status == 'pending':
            unpaid_count += 1

        history.append({
            'month': payment.payment_period_month,
            'year': payment.payment_period_year,
            'month_name': calendar.month_name[payment.payment_period_month],
            'amount': str(payment.amount),
            'status': payment.status,
            'payment_date': payment.payment_date.isoformat() if payment.payment_date else None,
            'due_date': payment.due_date.isoformat(),
            'is_late': is_late,
        })

    return {
        'summary': {
            'total': len(history),
            'on_time': on_time_count,
            'late': late_count,
            'unpaid': unpaid_count,
        },
        'history': history,
    }


def _get_complaint_history(tenant, start_date, end_date):
    """
    Get complaint history for tenant within date range.

    Returns dict with summary and history list grouped by month.
    """
    import calendar
    from complaints.models import Complaint

    # Get complaints within date range
    complaints = Complaint.objects.filter(
        tenant=tenant,
        created_at__date__gte=start_date,
        created_at__date__lte=end_date
    ).order_by('-created_at')

    # Group by month
    monthly_data = {}
    for complaint in complaints:
        key = (complaint.created_at.year, complaint.created_at.month)
        if key not in monthly_data:
            monthly_data[key] = {
                'count': 0,
                'categories': set(),
                'statuses': {},
            }
        monthly_data[key]['count'] += 1
        monthly_data[key]['categories'].add(complaint.category)
        complaint_status = complaint.status
        monthly_data[key]['statuses'][complaint_status] = \
            monthly_data[key]['statuses'].get(complaint_status, 0) + 1

    # Format history
    history = []
    total_count = 0
    category_counts = {}

    for (year, month), data in sorted(monthly_data.items(), reverse=True):
        total_count += data['count']
        for cat in data['categories']:
            category_counts[cat] = category_counts.get(cat, 0) + 1

        history.append({
            'month': month,
            'year': year,
            'month_name': calendar.month_name[month],
            'count': data['count'],
            'categories': list(data['categories']),
            'statuses': data['statuses'],
        })

    return {
        'summary': {
            'total': total_count,
            'by_category': category_counts,
        },
        'history': history,
    }