from django.contrib import admin
from .models import Complaint, ComplaintComment


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    """
    Admin interface for Complaint model.
    """

    list_display = [
        'id',
        'title',
        'tenant',
        'category',
        'priority',
        'status',
        'room',
        'created_at',
    ]

    list_filter = [
        'status',
        'category',
        'priority',
        'created_at',
    ]

    search_fields = [
        'title',
        'description',
        'tenant__user__first_name',
        'tenant__user__last_name',
        'tenant__user__email',
    ]

    readonly_fields = [
        'created_at',
        'updated_at',
        'resolved_at',
    ]

    fieldsets = (
        ('Informasi Dasar', {
            'fields': ('title', 'description', 'attachment')
        }),
        ('Klasifikasi', {
            'fields': ('category', 'priority', 'status')
        }),
        ('Relasi', {
            'fields': ('tenant', 'room')
        }),
        ('Penyelesaian', {
            'fields': ('resolution_notes', 'resolved_by', 'resolved_at')
        }),
        ('Audit', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    # Bulk actions
    actions = ['mark_in_progress', 'mark_resolved', 'mark_closed']

    def mark_in_progress(self, request, queryset):
        """Bulk action to mark complaints as in progress."""
        updated = queryset.update(status='in_progress')
        self.message_user(request, f"{updated} keluhan ditandai sebagai dalam proses")
    mark_in_progress.short_description = "Tandai sebagai Dalam Proses"

    def mark_resolved(self, request, queryset):
        """Bulk action to mark complaints as resolved."""
        from django.utils import timezone
        updated = queryset.update(
            status='resolved',
            resolved_at=timezone.now(),
            resolved_by=request.user
        )
        self.message_user(request, f"{updated} keluhan ditandai sebagai selesai")
    mark_resolved.short_description = "Tandai sebagai Selesai"

    def mark_closed(self, request, queryset):
        """Bulk action to mark complaints as closed."""
        from django.utils import timezone
        for complaint in queryset:
            if not complaint.resolved_at:
                complaint.resolved_at = timezone.now()
            complaint.status = 'closed'
            complaint.save()
        self.message_user(request, f"{queryset.count()} keluhan ditutup")
    mark_closed.short_description = "Tutup Keluhan"


@admin.register(ComplaintComment)
class ComplaintCommentAdmin(admin.ModelAdmin):
    """
    Admin interface for ComplaintComment model.
    """

    list_display = [
        'id',
        'complaint',
        'user',
        'comment_preview',
        'created_at',
    ]

    list_filter = [
        'created_at',
    ]

    search_fields = [
        'comment',
        'user__first_name',
        'user__last_name',
        'user__email',
        'complaint__title',
    ]

    readonly_fields = [
        'created_at',
        'updated_at',
    ]

    def comment_preview(self, obj):
        """Show preview of comment."""
        return obj.comment[:50] + '...' if len(obj.comment) > 50 else obj.comment
    comment_preview.short_description = 'Komentar'
