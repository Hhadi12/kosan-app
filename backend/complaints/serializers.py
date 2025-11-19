from rest_framework import serializers
from django.utils import timezone
from .models import Complaint, ComplaintComment


class ComplaintListSerializer(serializers.ModelSerializer):
    """
    Serializer for complaint list view.

    Includes:
    - Basic complaint info
    - Tenant name
    - Room number (if linked)
    - Comment count
    - Display labels for category, priority, status
    """

    tenant_name = serializers.CharField(source='tenant.user.get_full_name', read_only=True)
    tenant_email = serializers.EmailField(source='tenant.user.email', read_only=True)
    room_number = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()

    # Display labels in Indonesian
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id',
            'title',
            'category',
            'category_display',
            'priority',
            'priority_display',
            'status',
            'status_display',
            'tenant_name',
            'tenant_email',
            'room_number',
            'comment_count',
            'created_at',
            'updated_at',
        ]

    def get_room_number(self, obj):
        """Get room number if complaint is linked to room."""
        return obj.room.room_number if obj.room else None

    def get_comment_count(self, obj):
        """Count number of comments on this complaint."""
        return obj.comments.count()


class ComplaintDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for complaint detail view.

    Includes:
    - All complaint fields
    - Tenant information
    - Room information
    - Resolution details
    - Comment count
    """

    tenant_name = serializers.CharField(source='tenant.user.get_full_name', read_only=True)
    tenant_email = serializers.EmailField(source='tenant.user.email', read_only=True)
    tenant_phone = serializers.CharField(source='tenant.user.phone', read_only=True)

    room_number = serializers.SerializerMethodField()
    room_info = serializers.SerializerMethodField()

    resolved_by_name = serializers.CharField(
        source='resolved_by.get_full_name',
        read_only=True,
        allow_null=True
    )

    comment_count = serializers.SerializerMethodField()

    # Display labels
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    # Properties
    days_open = serializers.IntegerField(read_only=True)
    is_resolved = serializers.BooleanField(read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id',
            'tenant',
            'tenant_name',
            'tenant_email',
            'tenant_phone',
            'room',
            'room_number',
            'room_info',
            'title',
            'description',
            'category',
            'category_display',
            'priority',
            'priority_display',
            'status',
            'status_display',
            'attachment',
            'resolution_notes',
            'resolved_at',
            'resolved_by',
            'resolved_by_name',
            'comment_count',
            'days_open',
            'is_resolved',
            'created_at',
            'updated_at',
        ]

    def get_room_number(self, obj):
        return obj.room.room_number if obj.room else None

    def get_room_info(self, obj):
        """Return room details if linked."""
        if obj.room:
            return {
                'id': obj.room.id,
                'room_number': obj.room.room_number,
                'room_type': obj.room.get_room_type_display(),
                'floor': obj.room.floor,
            }
        return None

    def get_comment_count(self, obj):
        return obj.comments.count()


class ComplaintCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new complaints (tenant only).

    Tenant is determined from request.user, not provided in payload.
    """

    class Meta:
        model = Complaint
        fields = [
            'id',  # Include id in response
            'title',
            'description',
            'category',
            'priority',
            'room',
            'attachment',
        ]
        read_only_fields = ['id']

    def validate_title(self, value):
        """Ensure title is not empty or too short."""
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Judul harus minimal 5 karakter")
        return value.strip()

    def validate_description(self, value):
        """Ensure description is not empty or too short."""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Deskripsi harus minimal 10 karakter")
        return value.strip()

    def validate_attachment(self, value):
        """Validate file size and type."""
        if value:
            # Max file size: 5MB
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Ukuran file maksimal 5MB")

            # Allowed extensions: jpg, jpeg, png
            allowed_extensions = ['jpg', 'jpeg', 'png']
            ext = value.name.split('.')[-1].lower()
            if ext not in allowed_extensions:
                raise serializers.ValidationError("Hanya file JPG, JPEG, PNG yang diperbolehkan")

        return value

    def create(self, validated_data):
        """Create complaint with tenant from request context."""
        # Tenant comes from view (request.user.tenantprofile)
        return Complaint.objects.create(**validated_data)


class ComplaintUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating complaints (admin only).

    Allows updating:
    - status
    - priority
    - category
    - resolution_notes

    Does NOT allow changing tenant, title, description after creation.
    """

    class Meta:
        model = Complaint
        fields = [
            'status',
            'priority',
            'category',
            'resolution_notes',
        ]

    def validate(self, data):
        """Validate status transitions."""
        instance = self.instance
        new_status = data.get('status', instance.status)

        # If marking as resolved, require resolution_notes
        if new_status == 'resolved' and not data.get('resolution_notes') and not instance.resolution_notes:
            raise serializers.ValidationError({
                'resolution_notes': 'Catatan penyelesaian diperlukan saat menandai sebagai selesai'
            })

        return data

    def update(self, instance, validated_data):
        """Update complaint and set resolved timestamp if needed."""
        new_status = validated_data.get('status', instance.status)

        # Auto-set resolved_at and resolved_by when status changes to resolved
        if new_status == 'resolved' and instance.status != 'resolved':
            instance.resolved_at = timezone.now()
            # resolved_by will be set in the view

        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class ComplaintCommentSerializer(serializers.ModelSerializer):
    """
    Serializer for complaint comments.

    Used for both listing and creating comments.
    """

    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = ComplaintComment
        fields = [
            'id',
            'complaint',
            'user',
            'user_name',
            'user_email',
            'is_admin',
            'comment',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user', 'complaint']

    def get_is_admin(self, obj):
        """Check if commenter is admin."""
        return obj.user.role == 'admin'

    def validate_comment(self, value):
        """Ensure comment is not empty."""
        if len(value.strip()) < 1:
            raise serializers.ValidationError("Komentar tidak boleh kosong")
        return value.strip()


class ComplaintStatsSerializer(serializers.Serializer):
    """
    Serializer for complaint statistics (dashboard).

    Read-only serializer for aggregated data.
    """

    total_complaints = serializers.IntegerField()
    open_complaints = serializers.IntegerField()
    in_progress_complaints = serializers.IntegerField()
    resolved_complaints = serializers.IntegerField()
    closed_complaints = serializers.IntegerField()

    # By category
    by_category = serializers.DictField()

    # By priority
    by_priority = serializers.DictField()

    # Average resolution time (in days)
    avg_resolution_time = serializers.FloatField(allow_null=True)
