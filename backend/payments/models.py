import calendar
from decimal import Decimal
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from tenants.models import TenantProfile, RoomAssignment
from users.models import User


def generate_payment_id():
    """
    Generate the next PAY-XXX ID for Payment.
    """
    from payments.models import Payment
    last_payment = Payment.objects.order_by('-id').first()

    if last_payment and last_payment.id.startswith('PAY-'):
        try:
            last_num = int(last_payment.id.split('-')[1])
            next_num = last_num + 1
        except (ValueError, IndexError):
            next_num = 1
    else:
        next_num = 1

    return f"PAY-{next_num:03d}"


class Payment(models.Model):
    """
    Payment model for tracking rent payments.

    Links tenants to their monthly rent payments with status tracking,
    proof of payment upload support, and complete audit trail.
    Uses custom ID format: PAY-XXX (e.g., PAY-001, PAY-002)

    Features:
    - Monthly billing automation
    - Proof of payment upload (Feature A)
    - Bank account details (Feature G)
    - PDF receipt generation (Feature C)
    - Overdue detection
    """

    # ============================================================
    # CUSTOM PRIMARY KEY
    # ============================================================

    id = models.CharField(
        max_length=20,
        primary_key=True,
        default=generate_payment_id,
        editable=False,
        help_text="Unique payment identifier (PAY-XXX format)"
    )

    # ============================================================
    # RELATIONSHIPS
    # ============================================================

    tenant = models.ForeignKey(
        TenantProfile,
        on_delete=models.CASCADE,
        related_name='payments',
        help_text="Tenant making this payment"
    )

    assignment = models.ForeignKey(
        RoomAssignment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
        help_text="Room assignment this payment is for (may be null if assignment deleted)"
    )

    # ============================================================
    # PAYMENT PERIOD (Unique together with tenant)
    # ============================================================

    payment_period_month = models.IntegerField(
        choices=[(i, calendar.month_name[i]) for i in range(1, 13)],
        help_text="Month this payment is for (1-12)"
    )

    payment_period_year = models.IntegerField(
        help_text="Year this payment is for (e.g., 2025)"
    )

    # ============================================================
    # AMOUNT
    # ============================================================

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Payment amount (usually monthly_rent from assignment)"
    )

    # ============================================================
    # DATES
    # ============================================================

    due_date = models.DateField(
        help_text="Date payment is due (e.g., 5th of month)"
    )

    payment_date = models.DateField(
        blank=True,
        null=True,
        help_text="Actual date payment was received (null if not paid)"
    )

    # ============================================================
    # STATUS
    # ============================================================

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Payment status"
    )

    # ============================================================
    # PAYMENT METHOD & DETAILS (Feature G)
    # ============================================================

    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('transfer', 'Bank Transfer'),
        ('other', 'Other'),
    ]

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        blank=True,
        null=True,
        help_text="Method of payment"
    )

    payment_reference = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Transfer reference number or receipt number"
    )

    bank_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        default='Bank BCA',
        help_text="Bank name if payment by transfer"
    )

    bank_account_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        default='Rahman Hadi',
        help_text="Bank account holder name"
    )

    bank_account_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Bank account number for transfers"
    )

    # ============================================================
    # PROOF OF PAYMENT (Feature A)
    # ============================================================

    proof_of_payment = models.FileField(
        upload_to='payment_proofs/%Y/%m/',
        blank=True,
        null=True,
        help_text="Receipt or proof of payment image/PDF"
    )

    # ============================================================
    # NOTES
    # ============================================================

    notes = models.TextField(
        blank=True,
        null=True,
        help_text="Additional notes about the payment"
    )

    # ============================================================
    # TIMESTAMPS (Audit Trail)
    # ============================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When this payment record was created"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Last update timestamp"
    )

    paid_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Timestamp when marked as paid"
    )

    paid_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments_processed',
        help_text="Admin who marked payment as paid"
    )

    # ============================================================
    # META
    # ============================================================

    class Meta:
        db_table = 'payments'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-payment_period_year', '-payment_period_month', '-due_date']

        # Prevent duplicate payments for same tenant/period
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'payment_period_month', 'payment_period_year'],
                name='unique_payment_per_period'
            )
        ]

        # Indexes for common queries
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['status', 'due_date']),
            models.Index(fields=['payment_period_year', 'payment_period_month']),
            models.Index(fields=['due_date']),
        ]

    # ============================================================
    # STRING REPRESENTATION
    # ============================================================

    def __str__(self):
        period = f"{calendar.month_name[self.payment_period_month]} {self.payment_period_year}"
        tenant_name = self.tenant.user.get_full_name() or self.tenant.user.email
        return f"{tenant_name} - {period} - {self.get_status_display()}"

    # ============================================================
    # PROPERTIES
    # ============================================================

    @property
    def is_overdue(self):
        """
        Check if payment is overdue.

        Payment is overdue if:
        - Status is 'pending'
        - due_date has passed (due_date < today)
        """
        if self.status == 'pending' and self.due_date < timezone.now().date():
            return True
        return False

    @property
    def period_display(self):
        """
        Human-readable period (e.g., 'November 2025').
        """
        return f"{calendar.month_name[self.payment_period_month]} {self.payment_period_year}"

    @property
    def tenant_name(self):
        """
        Get tenant's full name for convenience.
        """
        return self.tenant.user.get_full_name() or self.tenant.user.email

    @property
    def room_number(self):
        """
        Get room number if assignment exists.
        """
        if self.assignment and self.assignment.room:
            return self.assignment.room.room_number
        return None

    @property
    def days_overdue(self):
        """
        Calculate how many days payment is overdue.
        Returns 0 if not overdue.
        """
        if self.is_overdue:
            delta = timezone.now().date() - self.due_date
            return delta.days
        return 0

    # ============================================================
    # VALIDATION
    # ============================================================

    def clean(self):
        """
        Validate payment before saving.
        """
        # Amount must be positive
        if self.amount is not None and self.amount <= 0:
            raise ValidationError({
                'amount': 'Amount must be greater than 0'
            })

        # Payment date validation
        if self.status == 'paid':
            # Payment date required if paid
            if not self.payment_date:
                raise ValidationError({
                    'payment_date': 'Payment date is required when status is paid'
                })

            # Payment date should not be in the future
            if self.payment_date > timezone.now().date():
                raise ValidationError({
                    'payment_date': 'Payment date cannot be in the future'
                })

        # Period validation
        if self.payment_period_month < 1 or self.payment_period_month > 12:
            raise ValidationError({
                'payment_period_month': 'Month must be between 1 and 12'
            })

        if self.payment_period_year < 2000 or self.payment_period_year > 2100:
            raise ValidationError({
                'payment_period_year': 'Year must be between 2000 and 2100'
            })

    def save(self, *args, **kwargs):
        """
        Override save to run validation.
        """
        self.clean()
        super().save(*args, **kwargs)

    # ============================================================
    # HELPER METHODS
    # ============================================================

    def mark_as_paid(self, payment_date=None, payment_method=None, paid_by=None, notes=None):
        """
        Mark this payment as paid.

        Args:
            payment_date: Date payment received (defaults to today)
            payment_method: Method of payment ('cash', 'transfer', 'other')
            paid_by: User who processed the payment
            notes: Additional notes

        Returns:
            bool: True if successful
        """
        if self.status == 'paid':
            return False  # Already paid

        self.status = 'paid'
        self.payment_date = payment_date or timezone.now().date()
        self.paid_at = timezone.now()

        if payment_method:
            self.payment_method = payment_method

        if paid_by:
            self.paid_by = paid_by

        if notes:
            self.notes = notes

        self.save()
        return True

    def cancel(self, notes=None):
        """
        Cancel this payment.

        Args:
            notes: Reason for cancellation

        Returns:
            bool: True if successful
        """
        if self.status == 'paid':
            return False  # Cannot cancel paid payment

        self.status = 'cancelled'
        if notes:
            self.notes = notes
        self.save()
        return True
