from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import TenantProfile, RoomAssignment
from users.serializers import UserSerializer
from rooms.serializers import RoomSerializer


class TenantProfileListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing tenant profiles.
    Returns essential information for list views.
    """

    # Include user information
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)

    # Current assignment info
    current_room_number = serializers.SerializerMethodField()
    has_active_assignment = serializers.SerializerMethodField()

    class Meta:
        model = TenantProfile
        fields = [
            'id',
            'user_email',
            'user_username',
            'user_full_name',
            'user_phone',
            'occupation',
            'is_active',
            'current_room_number',
            'has_active_assignment',
            'created_at',
        ]

    def get_current_room_number(self, obj):
        """Get current room number if tenant has active assignment"""
        current_room = obj.get_current_room()
        return current_room.room_number if current_room else None

    def get_has_active_assignment(self, obj):
        """Check if tenant has active room assignment"""
        return obj.has_active_assignment()


class RoomAssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer for RoomAssignment with nested tenant and room data.
    Used for displaying assignment information.
    """

    # Nested data
    tenant_name = serializers.CharField(source='tenant.user.get_full_name', read_only=True)
    tenant_email = serializers.CharField(source='tenant.user.email', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    room_type = serializers.CharField(source='room.get_room_type_display', read_only=True)

    # Calculated fields
    duration_days = serializers.IntegerField(source='get_duration_days', read_only=True)
    duration_months = serializers.FloatField(source='get_duration_months', read_only=True)

    class Meta:
        model = RoomAssignment
        fields = [
            'id',
            'tenant',
            'tenant_name',
            'tenant_email',
            'room',
            'room_number',
            'room_type',
            'move_in_date',
            'lease_end_date',
            'move_out_date',
            'is_current',
            'monthly_rent',
            'duration_days',
            'duration_months',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TenantProfileSerializer(serializers.ModelSerializer):
    """
    Complete serializer for TenantProfile detail view.
    Includes full user data and assignment history.
    """

    # Full user data
    user = UserSerializer(read_only=True)

    # Current assignment
    current_assignment = serializers.SerializerMethodField()
    current_room = serializers.SerializerMethodField()

    # Assignment history
    assignment_history = serializers.SerializerMethodField()

    class Meta:
        model = TenantProfile
        fields = [
            'id',
            'user',
            'id_number',
            'emergency_contact_name',
            'emergency_contact_phone',
            'occupation',
            'is_active',
            'current_assignment',
            'current_room',
            'assignment_history',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_current_assignment(self, obj):
        """Get current active assignment"""
        current = obj.get_current_assignment()
        if current:
            return RoomAssignmentSerializer(current).data
        return None

    def get_current_room(self, obj):
        """Get current room details"""
        room = obj.get_current_room()
        if room:
            return RoomSerializer(room).data
        return None

    def get_assignment_history(self, obj):
        """Get past assignments (not current)"""
        history = obj.get_assignment_history()
        return RoomAssignmentSerializer(history, many=True).data


class TenantProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating tenant profile information.
    Validates tenant data before saving.
    """

    class Meta:
        model = TenantProfile
        fields = [
            'id_number',
            'emergency_contact_name',
            'emergency_contact_phone',
            'occupation',
            'is_active',
        ]

    def validate_id_number(self, value):
        """
        Validate ID number is not empty if provided.
        """
        if value and not value.strip():
            raise serializers.ValidationError("ID number cannot be empty")
        return value.strip() if value else value

    def validate_emergency_contact_phone(self, value):
        """
        Validate phone number format if provided.
        """
        if value and not value.strip():
            raise serializers.ValidationError("Phone number cannot be empty")

        # Basic validation: must contain only numbers, spaces, +, -, ()
        if value:
            import re
            if not re.match(r'^[\d\s\+\-\(\)]+$', value):
                raise serializers.ValidationError(
                    "Phone number can only contain numbers, spaces, +, -, and ()"
                )

        return value.strip() if value else value

    def validate_emergency_contact_name(self, value):
        """
        Validate emergency contact name if provided.
        """
        if value and not value.strip():
            raise serializers.ValidationError("Emergency contact name cannot be empty")

        if value and len(value.strip()) < 2:
            raise serializers.ValidationError("Emergency contact name must be at least 2 characters")

        return value.strip() if value else value


class RoomAssignmentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new room assignments.
    Includes validation to prevent double-booking.
    """

    class Meta:
        model = RoomAssignment
        fields = [
            'tenant',
            'room',
            'move_in_date',
            'lease_end_date',
            'monthly_rent',
        ]

    def validate(self, data):
        """
        Validate assignment data.
        Prevents double-booking and validates dates.
        """
        tenant = data.get('tenant')
        room = data.get('room')
        move_in_date = data.get('move_in_date')
        lease_end_date = data.get('lease_end_date')

        # Check if room is already occupied
        existing_assignment = RoomAssignment.objects.filter(
            room=room,
            is_current=True
        ).first()

        if existing_assignment:
            raise serializers.ValidationError({
                'room': f'Room {room.room_number} is already occupied by {existing_assignment.tenant.user.get_full_name()}'
            })

        # Check if tenant already has an active assignment
        tenant_current = RoomAssignment.objects.filter(
            tenant=tenant,
            is_current=True
        ).first()

        if tenant_current:
            raise serializers.ValidationError({
                'tenant': f'Tenant already has an active assignment in room {tenant_current.room.room_number}'
            })

        # Validate lease_end_date is after move_in_date
        if lease_end_date and lease_end_date < move_in_date:
            raise serializers.ValidationError({
                'lease_end_date': 'Lease end date must be after move in date'
            })

        # Check if room is available
        if room.status != 'available':
            raise serializers.ValidationError({
                'room': f'Room {room.room_number} is not available (status: {room.get_status_display()})'
            })

        return data

    def create(self, validated_data):
        """
        Create assignment and update room status to occupied.
        """
        # Create the assignment (is_current defaults to True)
        assignment = RoomAssignment.objects.create(**validated_data)

        # Update room status to occupied
        assignment.room.status = 'occupied'
        assignment.room.save()

        return assignment


class RoomAssignmentEndSerializer(serializers.Serializer):
    """
    Serializer for ending a room assignment (move out).
    """
    move_out_date = serializers.DateField(
        required=False,
        help_text="Date tenant moved out (defaults to today)"
    )

    def validate_move_out_date(self, value):
        """Validate move out date is not in the future"""
        from datetime import date

        if value and value > date.today():
            raise serializers.ValidationError("Move out date cannot be in the future")

        return value
