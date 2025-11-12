from django.db.models.signals import post_save
from django.dispatch import receiver
from users.models import User
from .models import TenantProfile


@receiver(post_save, sender=User)
def create_tenant_profile(sender, instance, created, **kwargs):
    """
    Signal to automatically create TenantProfile when a User is created.

    Only creates TenantProfile for users with role='user' (not for admins).
    This ensures all regular users automatically get a tenant profile.
    """
    if created and instance.role == 'user':
        TenantProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_tenant_profile(sender, instance, **kwargs):
    """
    Signal to save TenantProfile when User is saved.

    Only applies if the user has a tenant profile (role='user').
    """
    if instance.role == 'user' and hasattr(instance, 'tenant_profile'):
        instance.tenant_profile.save()
