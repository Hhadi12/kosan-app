import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kosan_project.settings')
django.setup()

from users.models import User
from tenants.models import TenantProfile

print("Checking tenant profiles...")
print()

tenants = User.objects.filter(role='user')
print(f"Total tenant users: {tenants.count()}")

profiles = TenantProfile.objects.all()
print(f"Total tenant profiles: {profiles.count()}")
print()

for u in tenants:
    has_attr = hasattr(u, 'tenantprofile')
    profile = TenantProfile.objects.filter(user=u).first()

    status = "[OK]" if has_attr and profile else "[ISSUE]"
    print(f"{status} - {u.email}: hasattr={has_attr}, profile_exists={profile is not None}")

    if profile and not has_attr:
        print(f"   → Profile exists but hasattr is False! Profile ID: {profile.id}")
