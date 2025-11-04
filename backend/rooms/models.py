from django.db import models


class Room(models.Model):
    """
    Room model for managing boarding house rooms.

    Represents individual rooms with their details, pricing, and availability status.
    """

    # Room Type Choices
    ROOM_TYPE_CHOICES = [
        ('single', 'Single'),
        ('double', 'Double'),
        ('shared', 'Shared'),
    ]

    # Status Choices
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('maintenance', 'Maintenance'),
    ]

    # Basic Information
    room_number = models.CharField(
        max_length=20,
        unique=True,
        help_text="Unique room identifier (e.g., A101, B205)"
    )

    room_type = models.CharField(
        max_length=20,
        choices=ROOM_TYPE_CHOICES,
        help_text="Type of room: single, double, or shared"
    )

    floor = models.IntegerField(
        help_text="Floor number where the room is located"
    )

    capacity = models.IntegerField(
        help_text="Maximum number of occupants allowed"
    )

    # Pricing
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Monthly rent price"
    )

    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='available',
        help_text="Current status of the room"
    )

    # Additional Information
    facilities = models.TextField(
        blank=True,
        help_text="List of facilities/amenities (e.g., AC, WiFi, Bathroom)"
    )

    description = models.TextField(
        blank=True,
        help_text="Additional description or notes about the room"
    )

    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when room was created"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when room was last updated"
    )

    class Meta:
        db_table = 'rooms'
        verbose_name = 'Room'
        verbose_name_plural = 'Rooms'
        ordering = ['room_number']

    def __str__(self):
        """String representation of the room"""
        return f"Room {self.room_number} - {self.get_room_type_display()}"

    def is_available(self):
        """Check if room is available for rent"""
        return self.status == 'available'

    def is_occupied(self):
        """Check if room is currently occupied"""
        return self.status == 'occupied'
