from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """
    Admin configuration for Payment model.
    """

    list_display = [
        'id',
        'receipt_number',
        'tenant_link',
        'room_display',
        'period_display_admin',
        'amount_display',
        'due_date',
        'payment_date',
        'status_badge',
        'payment_method',
    ]

    list_filter = [
        'status',
        'payment_method',
        'payment_period_year',
        'payment_period_month',
        'due_date',
        'payment_date',
    ]

    search_fields = [
        'tenant__user__first_name',
        'tenant__user__last_name',
        'tenant__user__email',
        'payment_reference',
        'notes',
    ]

    readonly_fields = [
        'created_at',
        'updated_at',
        'paid_at',
        'paid_by',
        'is_overdue',
        'days_overdue',
    ]

    fieldsets = (
        ('Payment Information', {
            'fields': (
                'tenant',
                'assignment',
                'payment_period_month',
                'payment_period_year',
                'amount',
            )
        }),
        ('Dates', {
            'fields': (
                'due_date',
                'payment_date',
            )
        }),
        ('Status & Method', {
            'fields': (
                'status',
                'payment_method',
                'payment_reference',
            )
        }),
        ('Bank Details (Feature G)', {
            'fields': (
                'bank_name',
                'bank_account_name',
                'bank_account_number',
            ),
            'classes': ('collapse',),
        }),
        ('Proof of Payment (Feature A)', {
            'fields': (
                'proof_of_payment',
            ),
            'classes': ('collapse',),
        }),
        ('Notes', {
            'fields': (
                'notes',
            ),
            'classes': ('collapse',),
        }),
        ('Audit Trail', {
            'fields': (
                'created_at',
                'updated_at',
                'paid_at',
                'paid_by',
                'is_overdue',
                'days_overdue',
            ),
            'classes': ('collapse',),
        }),
    )

    actions = [
        'mark_as_paid_action',
        'mark_as_cancelled_action',
    ]

    ordering = ['-payment_period_year', '-payment_period_month', '-due_date']

    list_per_page = 25

    # Custom display methods

    def receipt_number(self, obj):
        """Display formatted receipt number."""
        return f"#{obj.id:06d}"
    receipt_number.short_description = 'Receipt No'

    def tenant_link(self, obj):
        """Display tenant name with link to tenant admin."""
        url = reverse('admin:tenants_tenantprofile_change', args=[obj.tenant.id])
        return format_html('<a href="{}">{}</a>', url, obj.tenant.user.get_full_name() or obj.tenant.user.email)
    tenant_link.short_description = 'Tenant'

    def room_display(self, obj):
        """Display room number with link to room admin."""
        if obj.assignment and obj.assignment.room:
            url = reverse('admin:rooms_room_change', args=[obj.assignment.room.room_number])
            return format_html('<a href="{}">{}</a>', url, obj.assignment.room.room_number)
        return '-'
    room_display.short_description = 'Room'

    def period_display_admin(self, obj):
        """Display payment period."""
        return obj.period_display
    period_display_admin.short_description = 'Period'

    def amount_display(self, obj):
        """Display formatted amount."""
        return f"Rp {obj.amount:,.2f}"
    amount_display.short_description = 'Amount'

    def status_badge(self, obj):
        """Display status with colored badge."""
        colors = {
            'paid': '#10b981',      # green
            'pending': '#f59e0b',   # yellow
            'cancelled': '#6b7280', # gray
        }

        # Check if overdue
        if obj.is_overdue:
            color = '#ef4444'  # red
            text = 'OVERDUE'
        else:
            color = colors.get(obj.status, '#6b7280')
            text = obj.get_status_display().upper()

        return format_html(
            '<span style="background-color: {}; color: white; padding: 4px 8px; '
            'border-radius: 4px; font-weight: bold; font-size: 11px;">{}</span>',
            color, text
        )
    status_badge.short_description = 'Status'

    # Custom actions

    def mark_as_paid_action(self, request, queryset):
        """Bulk action to mark payments as paid."""
        from django.utils import timezone

        updated = 0
        for payment in queryset:
            if payment.status == 'pending':
                payment.mark_as_paid(
                    payment_date=timezone.now().date(),
                    paid_by=request.user
                )
                updated += 1

        self.message_user(request, f'{updated} payment(s) marked as paid.')
    mark_as_paid_action.short_description = 'Mark selected as PAID'

    def mark_as_cancelled_action(self, request, queryset):
        """Bulk action to cancel payments."""
        updated = queryset.exclude(status='paid').update(status='cancelled')
        self.message_user(request, f'{updated} payment(s) cancelled.')
    mark_as_cancelled_action.short_description = 'Cancel selected payments'

    # Override get_queryset for performance
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        qs = super().get_queryset(request)
        return qs.select_related('tenant__user', 'assignment__room', 'paid_by')
