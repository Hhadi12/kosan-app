from rest_framework import serializers
from django.utils import timezone
from decimal import Decimal
import calendar
from .models import Payment
from tenants.models import TenantProfile, RoomAssignment
from tenants.serializers import TenantProfileSerializer


class PaymentSerializer(serializers.ModelSerializer):
    """
    Detailed Payment serializer for read operations.

    Includes nested tenant and assignment information,
    computed fields like is_overdue, and human-readable displays.

    Used for: GET detail, GET list responses
    """

    # Nested relationships
    tenant_name = serializers.CharField(source='tenant.user.get_full_name', read_only=True)
    tenant_email = serializers.EmailField(source='tenant.user.email', read_only=True)
    tenant_phone = serializers.CharField(source='tenant.user.phone', read_only=True)

    room_number = serializers.CharField(source='assignment.room.room_number', read_only=True, allow_null=True)
    room_type = serializers.CharField(source='assignment.room.room_type', read_only=True, allow_null=True)
    room_floor = serializers.IntegerField(source='assignment.room.floor', read_only=True, allow_null=True)

    # Computed fields
    is_overdue = serializers.BooleanField(read_only=True)
    period_display = serializers.CharField(read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)

    # Status display
    status_display = serializers.SerializerMethodField()
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    # Month name display
    month_name = serializers.SerializerMethodField()

    # Paid by admin info
    paid_by_name = serializers.CharField(source='paid_by.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'tenant',
            'tenant_name',
            'tenant_email',
            'tenant_phone',
            'assignment',
            'room_number',
            'room_type',
            'room_floor',
            'payment_period_month',
            'payment_period_year',
            'month_name',
            'period_display',
            'amount',
            'due_date',
            'payment_date',
            'status',
            'status_display',
            'is_overdue',
            'days_overdue',
            'payment_method',
            'payment_method_display',
            'payment_reference',
            'bank_name',
            'bank_account_name',
            'bank_account_number',
            'proof_of_payment',
            'notes',
            'created_at',
            'updated_at',
            'paid_at',
            'paid_by',
            'paid_by_name',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'paid_at',
            'paid_by',
            'is_overdue',
            'days_overdue',
        ]

    def get_status_display(self, obj):
        """
        Return 'overdue' if payment is overdue, otherwise actual status.
        """
        if obj.is_overdue:
            return 'overdue'
        return obj.status

    def get_month_name(self, obj):
        """
        Return month name (e.g., 'November').
        """
        return calendar.month_name[obj.payment_period_month]


class PaymentListSerializer(serializers.ModelSerializer):
    """
    Lightweight Payment serializer for list operations.

    Contains essential fields for displaying payment cards/tables.
    Reduces payload size for list endpoints.

    Used for: GET list responses
    """

    tenant_name = serializers.CharField(source='tenant.user.get_full_name', read_only=True)
    room_number = serializers.CharField(source='assignment.room.room_number', read_only=True, allow_null=True)

    is_overdue = serializers.BooleanField(read_only=True)
    period_display = serializers.CharField(read_only=True)
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id',
            'tenant',
            'tenant_name',
            'room_number',
            'payment_period_month',
            'payment_period_year',
            'period_display',
            'amount',
            'due_date',
            'payment_date',
            'status',
            'status_display',
            'is_overdue',
            'payment_method',
            'created_at',
        ]

    def get_status_display(self, obj):
        """Return 'overdue' if payment is overdue."""
        if obj.is_overdue:
            return 'overdue'
        return obj.status


class PaymentCreateSerializer(serializers.ModelSerializer):
    """
    Payment serializer for create operations.

    Validates:
    - Tenant exists and is active
    - Assignment exists (optional)
    - No duplicate payment for same tenant/period
    - Amount is positive
    - Period is valid

    Auto-sets due_date if not provided (5th of month).

    Used for: POST create
    """

    class Meta:
        model = Payment
        fields = [
            'tenant',
            'assignment',
            'payment_period_month',
            'payment_period_year',
            'amount',
            'due_date',
            'payment_date',
            'status',
            'payment_method',
            'payment_reference',
            'bank_name',
            'bank_account_name',
            'bank_account_number',
            'notes',
        ]

    def validate_tenant(self, value):
        """Validate tenant exists and is active."""
        if not value.user.is_active:
            raise serializers.ValidationError("Tenant user account is not active")
        return value

    def validate_amount(self, value):
        """Validate amount is positive."""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value

    def validate_payment_period_month(self, value):
        """Validate month is between 1-12."""
        if value < 1 or value > 12:
            raise serializers.ValidationError("Month must be between 1 and 12")
        return value

    def validate_payment_period_year(self, value):
        """Validate year is reasonable."""
        if value < 2000 or value > 2100:
            raise serializers.ValidationError("Year must be between 2000 and 2100")
        return value

    def validate(self, data):
        """
        Cross-field validation:
        - Check for duplicate payment (tenant + period)
        - If status is paid, require payment_date
        - Auto-set due_date if not provided
        """
        # Check for duplicate payment
        tenant = data.get('tenant')
        month = data.get('payment_period_month')
        year = data.get('payment_period_year')

        if tenant and month and year:
            existing = Payment.objects.filter(
                tenant=tenant,
                payment_period_month=month,
                payment_period_year=year
            ).exists()

            if existing:
                raise serializers.ValidationError({
                    'non_field_errors': [f"Payment for {calendar.month_name[month]} {year} already exists for this tenant"]
                })

        # Validate paid status
        if data.get('status') == 'paid' and not data.get('payment_date'):
            raise serializers.ValidationError({
                'payment_date': 'Payment date is required when status is paid'
            })

        # Auto-set due_date if not provided (5th of month)
        if not data.get('due_date') and month and year:
            from datetime import date
            data['due_date'] = date(year, month, 5)

        return data

    def create(self, validated_data):
        """
        Create payment.

        If no assignment provided, try to get tenant's current assignment.
        """
        if not validated_data.get('assignment'):
            tenant = validated_data['tenant']
            current_assignment = tenant.get_current_assignment()
            if current_assignment:
                validated_data['assignment'] = current_assignment
                # Auto-set amount from assignment if not provided
                if not validated_data.get('amount'):
                    validated_data['amount'] = current_assignment.monthly_rent

        return super().create(validated_data)


class PaymentUpdateSerializer(serializers.ModelSerializer):
    """
    Payment serializer for update operations.

    Allows updating:
    - payment_date
    - status
    - payment_method
    - payment_reference
    - bank details
    - notes
    - proof_of_payment

    Does NOT allow changing:
    - tenant
    - period (month/year)
    - amount

    Used for: PUT/PATCH update
    """

    class Meta:
        model = Payment
        fields = [
            'payment_date',
            'status',
            'payment_method',
            'payment_reference',
            'bank_name',
            'bank_account_name',
            'bank_account_number',
            'proof_of_payment',
            'notes',
        ]

    def validate(self, data):
        """
        Validate status transitions and payment_date requirements.
        """
        instance = self.instance
        new_status = data.get('status', instance.status)

        # Cannot change from paid to pending
        if instance.status == 'paid' and new_status == 'pending':
            raise serializers.ValidationError({
                'status': 'Cannot change paid payment back to pending'
            })

        # If changing to paid, require payment_date
        if new_status == 'paid' and not data.get('payment_date') and not instance.payment_date:
            raise serializers.ValidationError({
                'payment_date': 'Payment date is required when marking as paid'
            })

        return data


class PaymentStatsSerializer(serializers.Serializer):
    """
    Serializer for payment statistics.

    Returns aggregated payment data for dashboard/charts.

    Used for: GET statistics endpoint
    """

    # Total counts
    total_payments = serializers.IntegerField()
    paid_count = serializers.IntegerField()
    pending_count = serializers.IntegerField()
    overdue_count = serializers.IntegerField()
    cancelled_count = serializers.IntegerField()

    # Total amounts
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    overdue_amount = serializers.DecimalField(max_digits=12, decimal_places=2)

    # Monthly revenue (for charts - Feature J)
    monthly_revenue = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )

    # This month stats
    this_month_paid = serializers.IntegerField(required=False)
    this_month_pending = serializers.IntegerField(required=False)
    this_month_revenue = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
