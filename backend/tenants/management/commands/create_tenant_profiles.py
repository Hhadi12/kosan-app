from django.core.management.base import BaseCommand
from users.models import User
from tenants.models import TenantProfile


class Command(BaseCommand):
    help = 'Create TenantProfile for all existing users with role=user who dont have one'

    def handle(self, *args, **options):
        """
        Create TenantProfile for existing users.

        Goes through all users with role='user' and creates a TenantProfile if they don't have one.
        """
        # Get all users with role='user'
        regular_users = User.objects.filter(role='user')

        created_count = 0
        skipped_count = 0

        self.stdout.write(f'\nFound {regular_users.count()} users with role="user"')

        for user in regular_users:
            # Check if user already has a tenant profile
            if hasattr(user, 'tenant_profile'):
                self.stdout.write(f'  - Skipped: {user.email} (already has tenant profile)')
                skipped_count += 1
            else:
                # Create tenant profile
                TenantProfile.objects.create(user=user)
                self.stdout.write(self.style.SUCCESS(f'  + Created tenant profile for: {user.email}'))
                created_count += 1

        # Summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS(f'SUCCESS: Created {created_count} new tenant profiles'))
        self.stdout.write(f'  Skipped {skipped_count} users (already had profiles)')
        self.stdout.write('='*50 + '\n')
