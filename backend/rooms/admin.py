from django.contrib import admin
from .models import Room


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    """
    Custom admin interface for Room model.
    """

    # Fields to display in list view
    list_display = [
        'room_number',
        'room_type',
        'floor',
        'capacity',
        'price',
        'status',
        'created_at',
    ]

    # Filters in sidebar
    list_filter = [
        'status',
        'room_type',
        'floor',
        'created_at',
    ]

    # Search functionality
    search_fields = [
        'room_number',
        'description',
        'facilities',
    ]

    # Ordering (by room number)
    ordering = ['room_number']

    # Fields to display in detail/edit view
    fieldsets = (
        ('Basic Information', {
            'fields': ('room_number', 'room_type', 'floor', 'capacity')
        }),
        ('Pricing & Status', {
            'fields': ('price', 'status')
        }),
        ('Additional Details', {
            'fields': ('facilities', 'description'),
            'classes': ('collapse',)  # Collapsible section
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    # Read-only fields (cannot be edited in admin)
    readonly_fields = ['created_at', 'updated_at']

    # Enable actions
    actions = ['mark_as_available', 'mark_as_occupied', 'mark_as_maintenance']

    def mark_as_available(self, request, queryset):
        """Action to mark selected rooms as available"""
        updated = queryset.update(status='available')
        self.message_user(request, f'{updated} room(s) marked as available.')
    mark_as_available.short_description = 'Mark selected rooms as Available'

    def mark_as_occupied(self, request, queryset):
        """Action to mark selected rooms as occupied"""
        updated = queryset.update(status='occupied')
        self.message_user(request, f'{updated} room(s) marked as occupied.')
    mark_as_occupied.short_description = 'Mark selected rooms as Occupied'

    def mark_as_maintenance(self, request, queryset):
        """Action to mark selected rooms as under maintenance"""
        updated = queryset.update(status='maintenance')
        self.message_user(request, f'{updated} room(s) marked as under maintenance.')
    mark_as_maintenance.short_description = 'Mark selected rooms as Maintenance'
