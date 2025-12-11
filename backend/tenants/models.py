from django.db import models
from django.core.exceptions import ValidationError
from users.models import User
from rooms.models import Room


def generate_assignment_id():
    """
    Generate the next ASN-XXX ID for RoomAssignment.
    """
    from tenants.models import RoomAssignment
    last_assignment = RoomAssignment.objects.order_by('-id').first()

    if last_assignment and last_assignment.id.startswith('ASN-'):
        try:
            last_num = int(last_assignment.id.split('-')[1])
            next_num = last_num + 1
        except (ValueError, IndexError):
            next_num = 1
    else:
        next_num = 1

    return f"ASN-{next_num:03d}"


class TenantProfile(models.Model):
    """
    Tenant Profile model extending User with additional tenant-specific information.

    OneToOne relationship with User model. Auto-created for users with role='user'.
    Contains additional information needed for tenant management.
    """

    # OneToOne relationship with User
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='tenant_profile',
        help_text="User account associated with this tenant profile"
    )

    # Tenant Information
    id_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="National ID or identification number"
    )

    emergency_contact_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Emergency contact person name"
    )

    emergency_contact_phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Emergency contact phone number"
    )

    occupation = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Tenant's occupation or job"
    )

    # Status
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this tenant profile is active"
    )

    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when tenant profile was created"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when tenant profile was last updated"
    )

    class Meta:
        db_table = 'tenant_profiles'
        verbose_name = 'Tenant Profile'
        verbose_name_plural = 'Tenant Profiles'
        ordering = ['-created_at']

    def __str__(self):
        """String representation of the tenant profile"""
        return f"{self.user.get_full_name() or self.user.username} - Tenant Profile"

    def get_current_assignment(self):
        """
        Get current active room assignment for this tenant.
        Returns RoomAssignment object or None.
        """
        return self.assignments.filter(is_current=True).first()

    def get_current_room(self):
        """
        Get current room for this tenant.
        Returns Room object or None.
        """
        current_assignment = self.get_current_assignment()
        return current_assignment.room if current_assignment else None

    def has_active_assignment(self):
        """Check if tenant currently has an active room assignment"""
        return self.assignments.filter(is_current=True).exists()

    def get_assignment_history(self):
        """
        Get all past assignments for this tenant.
        Returns QuerySet of RoomAssignment objects ordered by move_in_date (newest first).
        """
        return self.assignments.filter(is_current=False).order_by('-move_in_date')


class RoomAssignment(models.Model):
    """
    Room Assignment model tracking tenant-room relationships over time.

    Links tenants to rooms with assignment dates and lease information.
    Maintains history of all assignments (past and current).
    Uses custom ID format: ASN-XXX (e.g., ASN-001, ASN-002)
    """

    # Custom primary key
    id = models.CharField(
        max_length=20,
        primary_key=True,
        default=generate_assignment_id,
        editable=False,
        help_text="Unique assignment identifier (ASN-XXX format)"
    )

    # Relationships
    tenant = models.ForeignKey(
        TenantProfile,
        on_delete=models.CASCADE,
        related_name='assignments',
        help_text="Tenant assigned to the room"
    )

    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name='assignments',
        help_text="Room being assigned"
    )

    # Assignment Dates
    move_in_date = models.DateField(
        help_text="Date when tenant moved into the room"
    )

    lease_end_date = models.DateField(
        blank=True,
        null=True,
        help_text="Expected lease end date (can be extended)"
    )

    move_out_date = models.DateField(
        blank=True,
        null=True,
        help_text="Actual date when tenant moved out (null if still occupying)"
    )

    # Status
    is_current = models.BooleanField(
        default=True,
        help_text="Whether this is the current active assignment"
    )

    # Pricing
    monthly_rent = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Monthly rent amount (can differ from room's base price)"
    )

    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when assignment was created"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when assignment was last updated"
    )

    class Meta:
        db_table = 'room_assignments'
        verbose_name = 'Room Assignment'
        verbose_name_plural = 'Room Assignments'
        ordering = ['-move_in_date']

        # Index for common queries
        indexes = [
            models.Index(fields=['tenant', 'is_current']),
            models.Index(fields=['room', 'is_current']),
        ]

    def __str__(self):
        """String representation of the room assignment"""
        status = "Current" if self.is_current else "Past"
        return f"{self.tenant.user.get_full_name()} - Room {self.room.room_number} ({status})"

    def clean(self):
        """
        Validate room assignment before saving.
        Prevents double-booking and validates dates.
        """
        # Check if room already has a current assignment (prevent double-booking)
        if self.is_current:
            existing_assignment = RoomAssignment.objects.filter(
                room=self.room,
                is_current=True
            ).exclude(pk=self.pk).first()

            if existing_assignment:
                raise ValidationError({
                    'room': f'Room {self.room.room_number} is already occupied by {existing_assignment.tenant.user.get_full_name()}'
                })

            # Check if tenant already has a current assignment (can't be in two rooms)
            tenant_current = RoomAssignment.objects.filter(
                tenant=self.tenant,
                is_current=True
            ).exclude(pk=self.pk).first()

            if tenant_current:
                raise ValidationError({
                    'tenant': f'Tenant already has an active assignment in room {tenant_current.room.room_number}'
                })

        # Validate move_out_date is after move_in_date
        if self.move_out_date and self.move_out_date < self.move_in_date:
            raise ValidationError({
                'move_out_date': 'Move out date must be after move in date'
            })

        # Validate lease_end_date is after move_in_date
        if self.lease_end_date and self.lease_end_date < self.move_in_date:
            raise ValidationError({
                'lease_end_date': 'Lease end date must be after move in date'
            })

    def save(self, *args, **kwargs):
        """Override save to run validation"""
        self.clean()
        super().save(*args, **kwargs)

    def get_duration_days(self):
        """
        Calculate assignment duration in days.
        Returns number of days between move_in and move_out (or today if still current).
        """
        from datetime import date
        end_date = self.move_out_date if self.move_out_date else date.today()
        return (end_date - self.move_in_date).days

    def get_duration_months(self):
        """
        Calculate assignment duration in months (approximate).
        Returns approximate number of months.
        """
        return round(self.get_duration_days() / 30, 1)

    def end_assignment(self, move_out_date=None):
        """
        End this assignment and update room status.

        Args:
            move_out_date: Date tenant moved out (defaults to today)
        """
        from datetime import date

        self.is_current = False
        self.move_out_date = move_out_date or date.today()
        self.save()

        # Update room status to available
        self.room.status = 'available'
        self.room.save()
