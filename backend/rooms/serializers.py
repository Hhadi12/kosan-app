from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    """
    Serializer for Room model.
    Used for displaying room data in API responses.
    """

    # Add display names for choice fields
    room_type_display = serializers.CharField(
        source='get_room_type_display',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )

    class Meta:
        model = Room
        fields = [
            'room_number',
            'room_type',
            'room_type_display',
            'floor',
            'capacity',
            'price',
            'status',
            'status_display',
            'facilities',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class RoomCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating rooms.
    Includes validation for room data.
    """

    class Meta:
        model = Room
        fields = [
            'room_number',
            'room_type',
            'floor',
            'capacity',
            'price',
            'status',
            'facilities',
            'description',
        ]

    def validate_room_number(self, value):
        """
        Validate room_number is not empty and follows a format.
        """
        if not value or not value.strip():
            raise serializers.ValidationError("Room number cannot be empty.")

        # Check for uniqueness on update
        if self.instance:  # If updating
            if Room.objects.exclude(pk=self.instance.pk).filter(room_number=value).exists():
                raise serializers.ValidationError("Room with this room number already exists.")

        return value.strip().upper()  # Convert to uppercase for consistency

    def validate_floor(self, value):
        """
        Validate floor number is positive.
        """
        if value < 1:
            raise serializers.ValidationError("Floor number must be at least 1.")
        return value

    def validate_capacity(self, value):
        """
        Validate capacity is positive and reasonable.
        """
        if value < 1:
            raise serializers.ValidationError("Capacity must be at least 1.")
        if value > 10:
            raise serializers.ValidationError("Capacity cannot exceed 10 people.")
        return value

    def validate_price(self, value):
        """
        Validate price is positive.
        """
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value

    def validate(self, data):
        """
        Cross-field validation.
        Ensure capacity matches room type expectations.
        """
        room_type = data.get('room_type', self.instance.room_type if self.instance else None)
        capacity = data.get('capacity', self.instance.capacity if self.instance else None)

        if room_type and capacity:
            if room_type == 'single' and capacity > 1:
                raise serializers.ValidationError({
                    'capacity': 'Single room should have capacity of 1.'
                })
            elif room_type == 'double' and capacity > 2:
                raise serializers.ValidationError({
                    'capacity': 'Double room should have capacity of maximum 2.'
                })

        return data


class RoomListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing rooms.
    Returns only essential information for list views.
    """

    room_type_display = serializers.CharField(
        source='get_room_type_display',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )

    class Meta:
        model = Room
        fields = [
            'room_number',
            'room_type',
            'room_type_display',
            'floor',
            'capacity',
            'price',
            'status',
            'status_display',
        ]
