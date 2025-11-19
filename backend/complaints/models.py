from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from tenants.models import TenantProfile
from rooms.models import Room
from users.models import User


class Complaint(models.Model):
    """
    Complaint model for tracking tenant issues and complaints.

    Features:
    - Link to tenant who submitted complaint
    - Optional link to room (if complaint is about specific room)
    - Category and priority classification
    - Status workflow tracking
    - Single file attachment support
    - Complete audit trail

    Status Workflow:
    - open (Baru) -> in_progress (Dalam Proses) -> resolved (Selesai) -> closed (Ditutup)
    """

    # ============================================================
    # RELATIONSHIPS
    # ============================================================

    tenant = models.ForeignKey(
        TenantProfile,
        on_delete=models.CASCADE,
        related_name='complaints',
        help_text="Tenant who submitted this complaint"
    )

    room = models.ForeignKey(
        Room,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='complaints',
        help_text="Room this complaint is about (optional)"
    )

    # ============================================================
    # BASIC INFORMATION
    # ============================================================

    title = models.CharField(
        max_length=200,
        help_text="Brief description of the complaint"
    )

    description = models.TextField(
        help_text="Detailed description of the issue"
    )

    # ============================================================
    # CATEGORIZATION
    # ============================================================

    CATEGORY_CHOICES = [
        ('maintenance', 'Pemeliharaan/Perbaikan'),  # Repairs, fixes
        ('facilities', 'Fasilitas'),                 # Amenities, facilities
        ('cleanliness', 'Kebersihan'),               # Cleanliness issues
        ('noise', 'Kebisingan'),                     # Noise complaints
        ('security', 'Keamanan'),                    # Security concerns
        ('other', 'Lainnya'),                        # Other issues
    ]

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='other',
        help_text="Type of complaint"
    )

    # ============================================================
    # PRIORITY
    # ============================================================

    PRIORITY_CHOICES = [
        ('low', 'Rendah'),       # Low priority
        ('medium', 'Sedang'),    # Medium priority (default)
        ('high', 'Tinggi'),      # High priority
        ('urgent', 'Mendesak'),  # Urgent
    ]

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='medium',
        help_text="Priority level of this complaint"
    )

    # ============================================================
    # STATUS
    # ============================================================

    STATUS_CHOICES = [
        ('open', 'Baru'),                    # Newly created
        ('in_progress', 'Dalam Proses'),     # Being worked on
        ('resolved', 'Selesai'),             # Issue resolved
        ('closed', 'Ditutup'),               # Closed/archived
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open',
        help_text="Current status of complaint"
    )

    # ============================================================
    # FILE ATTACHMENT
    # ============================================================

    attachment = models.ImageField(
        upload_to='complaint_attachments/%Y/%m/',
        blank=True,
        null=True,
        help_text="Photo evidence of the issue (optional)"
    )

    # ============================================================
    # RESOLUTION
    # ============================================================

    resolution_notes = models.TextField(
        blank=True,
        null=True,
        help_text="Admin notes on how complaint was resolved"
    )

    resolved_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When complaint was marked as resolved"
    )

    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_complaints',
        help_text="Admin who resolved the complaint"
    )

    # ============================================================
    # TIMESTAMPS (Audit Trail)
    # ============================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When complaint was created"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Last update timestamp"
    )

    # ============================================================
    # META
    # ============================================================

    class Meta:
        db_table = 'complaints'
        verbose_name = 'Complaint'
        verbose_name_plural = 'Complaints'
        ordering = ['-created_at']  # Newest first

        # Indexes for common queries
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['created_at']),
        ]

    # ============================================================
    # STRING REPRESENTATION
    # ============================================================

    def __str__(self):
        tenant_name = self.tenant.user.get_full_name() or self.tenant.user.email
        return f"#{self.id} - {self.title} ({tenant_name})"

    # ============================================================
    # PROPERTIES
    # ============================================================

    @property
    def tenant_name(self):
        """Get tenant's full name for convenience."""
        return self.tenant.user.get_full_name() or self.tenant.user.email

    @property
    def room_number(self):
        """Get room number if linked to room."""
        return self.room.room_number if self.room else None

    @property
    def is_resolved(self):
        """Check if complaint is resolved or closed."""
        return self.status in ['resolved', 'closed']

    @property
    def days_open(self):
        """Calculate how many days complaint has been open."""
        if self.resolved_at:
            delta = self.resolved_at - self.created_at
        else:
            delta = timezone.now() - self.created_at
        return delta.days

    # ============================================================
    # HELPER METHODS
    # ============================================================

    def mark_as_resolved(self, resolution_notes=None, resolved_by=None):
        """
        Mark complaint as resolved.

        Args:
            resolution_notes: Notes on how issue was resolved
            resolved_by: User who resolved the complaint

        Returns:
            bool: True if successful
        """
        if self.status in ['resolved', 'closed']:
            return False  # Already resolved/closed

        self.status = 'resolved'
        self.resolved_at = timezone.now()

        if resolution_notes:
            self.resolution_notes = resolution_notes

        if resolved_by:
            self.resolved_by = resolved_by

        self.save()
        return True

    def close(self):
        """
        Close the complaint.

        Returns:
            bool: True if successful
        """
        if self.status == 'closed':
            return False  # Already closed

        self.status = 'closed'
        if not self.resolved_at:
            self.resolved_at = timezone.now()

        self.save()
        return True


class ComplaintComment(models.Model):
    """
    Comment model for complaint discussion thread.

    Features:
    - Link to parent complaint
    - User who posted the comment
    - Simple flat comment structure (no threading/nesting)
    - Timestamps for audit trail

    Permissions:
    - Any user can comment on complaints they have access to
    - Users can only delete their own comments
    """

    # ============================================================
    # RELATIONSHIPS
    # ============================================================

    complaint = models.ForeignKey(
        Complaint,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="Complaint this comment belongs to"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='complaint_comments',
        help_text="User who posted this comment"
    )

    # ============================================================
    # CONTENT
    # ============================================================

    comment = models.TextField(
        help_text="Comment text"
    )

    # ============================================================
    # TIMESTAMPS
    # ============================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When comment was posted"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Last edit timestamp"
    )

    # ============================================================
    # META
    # ============================================================

    class Meta:
        db_table = 'complaint_comments'
        verbose_name = 'Complaint Comment'
        verbose_name_plural = 'Complaint Comments'
        ordering = ['created_at']  # Oldest first (chronological)

        # Index for complaint lookup
        indexes = [
            models.Index(fields=['complaint', 'created_at']),
        ]

    # ============================================================
    # STRING REPRESENTATION
    # ============================================================

    def __str__(self):
        user_name = self.user.get_full_name() or self.user.email
        comment_preview = self.comment[:50] + '...' if len(self.comment) > 50 else self.comment
        return f"{user_name}: {comment_preview}"

    # ============================================================
    # PROPERTIES
    # ============================================================

    @property
    def user_name(self):
        """Get commenter's full name."""
        return self.user.get_full_name() or self.user.email

    @property
    def is_admin_comment(self):
        """Check if comment is from admin."""
        return self.user.role == 'admin'
