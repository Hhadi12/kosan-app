from django.contrib import admin
from .models import TenantProfile, RoomAssignment


@admin.register(TenantProfile)
class TenantProfileAdmin(admin.ModelAdmin):
    """
    Admin configuration for TenantProfile model.
    """

    list_display = [
        'id',
        'get_user_email',
        'get_user_full_name',
        'occupation',
        'get_current_room',
        'is_active',
        'created_at',
    ]

    list_filter = [
        'is_active',
        'created_at',
    ]

    search_fields = [
        'user__email',
        'user__username',
        'user__first_name',
        'user__last_name',
        'id_number',
        'occupation',
    ]

    readonly_fields = [
        'created_at',
        'updated_at',
    ]

    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Tenant Details', {
            'fields': (
                'id_number',
                'emergency_contact_name',
                'emergency_contact_phone',
                'occupation',
            )
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def get_user_email(self, obj):
        """Display user's email"""
        return obj.user.email
    get_user_email.short_description = 'Email'
    get_user_email.admin_order_field = 'user__email'

    def get_user_full_name(self, obj):
        """Display user's full name"""
        return obj.user.get_full_name() or obj.user.username
    get_user_full_name.short_description = 'Full Name'

    def get_current_room(self, obj):
        """Display current room assignment"""
        room = obj.get_current_room()
        return room.room_number if room else '(No assignment)'
    get_current_room.short_description = 'Current Room'

    # Actions
    actions = ['activate_tenants', 'deactivate_tenants']

    def activate_tenants(self, request, queryset):
        """Bulk activate tenant profiles"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} tenant(s) activated successfully.')
    activate_tenants.short_description = 'Activate selected tenants'

    def deactivate_tenants(self, request, queryset):
        """Bulk deactivate tenant profiles"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} tenant(s) deactivated successfully.')
    deactivate_tenants.short_description = 'Deactivate selected tenants'


@admin.register(RoomAssignment)
class RoomAssignmentAdmin(admin.ModelAdmin):
    """
    Admin configuration for RoomAssignment model.
    """

    list_display = [
        'id',
        'get_tenant_name',
        'get_room_number',
        'move_in_date',
        'move_out_date',
        'is_current',
        'monthly_rent',
        'get_duration',
    ]

    list_filter = [
        'is_current',
        'move_in_date',
        'move_out_date',
        'created_at',
    ]

    search_fields = [
        'tenant__user__email',
        'tenant__user__username',
        'tenant__user__first_name',
        'tenant__user__last_name',
        'room__room_number',
    ]

    readonly_fields = [
        'created_at',
        'updated_at',
        'get_duration',
    ]

    fieldsets = (
        ('Assignment Information', {
            'fields': ('tenant', 'room', 'is_current')
        }),
        ('Dates', {
            'fields': (
                'move_in_date',
                'lease_end_date',
                'move_out_date',
            )
        }),
        ('Financial', {
            'fields': ('monthly_rent',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'get_duration'),
            'classes': ('collapse',),
        }),
    )

    date_hierarchy = 'move_in_date'

    def get_tenant_name(self, obj):
        """Display tenant's full name"""
        return obj.tenant.user.get_full_name() or obj.tenant.user.username
    get_tenant_name.short_description = 'Tenant'
    get_tenant_name.admin_order_field = 'tenant__user__first_name'

    def get_room_number(self, obj):
        """Display room number"""
        return obj.room.room_number
    get_room_number.short_description = 'Room'
    get_room_number.admin_order_field = 'room__room_number'

    def get_duration(self, obj):
        """Display assignment duration"""
        if obj.is_current:
            return f'{obj.get_duration_months()} months (ongoing)'
        else:
            return f'{obj.get_duration_months()} months (ended)'
    get_duration.short_description = 'Duration'

    # Actions
    actions = ['end_assignments']

    def end_assignments(self, request, queryset):
        """Bulk end assignments"""
        from datetime import date
        count = 0
        for assignment in queryset.filter(is_current=True):
            assignment.end_assignment(date.today())
            count += 1
        self.message_user(request, f'{count} assignment(s) ended successfully.')
    end_assignments.short_description = 'End selected assignments'
