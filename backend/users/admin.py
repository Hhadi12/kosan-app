from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom admin interface for User model
    """
    
    # Fields to display in list view
    list_display = [
        'email',
        'username',
        'first_name',
        'last_name',
        'role',
        'is_active',
        'is_staff',
        'date_joined'
    ]
    
    # Filters in sidebar
    list_filter = [
        'role',
        'is_active',
        'is_staff',
        'is_superuser',
        'date_joined'
    ]
    
    # Search functionality
    search_fields = [
        'email',
        'username',
        'first_name',
        'last_name',
        'phone'
    ]
    
    # Ordering (newest first)
    ordering = ['-date_joined']
    
    # Fields in detail/edit view
    fieldsets = (
        ('Authentication', {
            'fields': ('username', 'email', 'password')
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'phone')
        }),
        ('Permissions', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )
    
    # Fields when adding new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username',
                'email',
                'password1',
                'password2',
                'first_name',
                'last_name',
                'phone',
                'role',
                'is_active',
                'is_staff'
            )
        }),
    )