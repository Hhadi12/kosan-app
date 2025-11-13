"""
Test Data Setup Script
Creates test users, rooms, and tenant assignments for Phase 5.1 testing
"""

import os
import django
from datetime import date, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kosan_project.settings')
django.setup()

from users.models import User
from rooms.models import Room
from tenants.models import TenantProfile, RoomAssignment
from payments.models import Payment

def create_test_users():
    """Create 5 test users (1 admin + 4 regular users)"""

    print("Creating test users...")

    # Check if admin already exists (by email or username)
    admin = User.objects.filter(email='admin@test.com').first() or User.objects.filter(username='admin').first()
    if not admin:
        admin = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='admin123',
            role='admin',
            first_name='Admin',
            last_name='Utama'
        )
        print(f"[OK] Created admin: {admin.email}")
    else:
        print(f"[OK] Admin already exists: {admin.email}")

    # Create 4 regular users (tenants)
    tenants_data = [
        {
            'username': 'budi',
            'email': 'budi@test.com',
            'password': 'budi123',
            'first_name': 'Budi',
            'last_name': 'Santoso',
            'phone': '081234567890'
        },
        {
            'username': 'siti',
            'email': 'siti@test.com',
            'password': 'siti123',
            'first_name': 'Siti',
            'last_name': 'Rahmawati',
            'phone': '081234567891'
        },
        {
            'username': 'andi',
            'email': 'andi@test.com',
            'password': 'andi123',
            'first_name': 'Andi',
            'last_name': 'Wijaya',
            'phone': '081234567892'
        },
        {
            'username': 'dewi',
            'email': 'dewi@test.com',
            'password': 'dewi123',
            'first_name': 'Dewi',
            'last_name': 'Lestari',
            'phone': '081234567893'
        }
    ]

    for tenant_data in tenants_data:
        tenant = User.objects.filter(email=tenant_data['email']).first()
        if not tenant:
            tenant = User.objects.create_user(**tenant_data)
            print(f"[OK] Created tenant: {tenant.email}")
        else:
            print(f"[OK] Tenant already exists: {tenant.email}")

    print(f"\nTotal users: {User.objects.count()}")

def create_test_rooms():
    """Create 18 test rooms with variety of types, statuses, and prices"""

    print("\nCreating test rooms...")

    rooms_data = [
        # Floor 1 - Single rooms
        {'room_number': 'A101', 'room_type': 'single', 'floor': 1, 'capacity': 1, 'price': 1000000, 'status': 'available', 'facilities': 'AC, WiFi, Kamar Mandi Dalam, Lemari', 'description': 'Kamar single nyaman di lantai 1'},
        {'room_number': 'A102', 'room_type': 'single', 'floor': 1, 'capacity': 1, 'price': 1000000, 'status': 'occupied', 'facilities': 'AC, WiFi, Kamar Mandi Dalam, Lemari', 'description': 'Kamar single lantai 1'},
        {'room_number': 'A103', 'room_type': 'single', 'floor': 1, 'capacity': 1, 'price': 1000000, 'status': 'available', 'facilities': 'AC, WiFi, Kamar Mandi Dalam, Lemari', 'description': 'Kamar single lantai 1'},

        # Floor 1 - Double rooms
        {'room_number': 'A104', 'room_type': 'double', 'floor': 1, 'capacity': 2, 'price': 1500000, 'status': 'available', 'facilities': 'AC, WiFi, Kamar Mandi Dalam, 2 Lemari, 2 Kasur', 'description': 'Kamar double luas di lantai 1'},
        {'room_number': 'A105', 'room_type': 'double', 'floor': 1, 'capacity': 2, 'price': 1500000, 'status': 'occupied', 'facilities': 'AC, WiFi, Kamar Mandi Dalam, 2 Lemari, 2 Kasur', 'description': 'Kamar double lantai 1'},

        # Floor 2 - Single rooms
        {'room_number': 'B201', 'room_type': 'single', 'floor': 2, 'capacity': 1, 'price': 1200000, 'status': 'available', 'facilities': 'AC, WiFi, Kamar Mandi Dalam, Lemari, Balkon', 'description': 'Kamar single dengan balkon di lantai 2'},
        {'room_number': 'B202', 'room_type': 'single', 'floor': 2, 'capacity': 1, 'price': 1200000, 'status': 'maintenance', 'facilities': 'AC, WiFi, Kamar Mandi Dalam, Lemari, Balkon', 'description': 'Sedang perbaikan AC'},
        {'room_number': 'B203', 'room_type': 'single', 'floor': 2, 'capacity': 1, 'price': 1200000, 'status': 'available', 'facilities': 'AC, WiFi, Kamar Mandi Dalam, Lemari, Balkon', 'description': 'Kamar single lantai 2'},

        # Floor 2 - Double rooms
        {'room_number': 'B204', 'room_type': 'double', 'floor': 2, 'capacity': 2, 'price': 1800000, 'status': 'available', 'facilities': 'AC, WiFi, Kamar Mandi Dalam, 2 Lemari, 2 Kasur, Balkon', 'description': 'Kamar double premium dengan balkon'},
        {'room_number': 'B205', 'room_type': 'double', 'floor': 2, 'capacity': 2, 'price': 1800000, 'status': 'occupied', 'facilities': 'AC, WiFi, Kamar Mandi Dalam, 2 Lemari, 2 Kasur, Balkon', 'description': 'Kamar double premium'},

        # Floor 2 - Shared rooms
        {'room_number': 'B206', 'room_type': 'shared', 'floor': 2, 'capacity': 4, 'price': 2500000, 'status': 'available', 'facilities': 'AC, WiFi, Kamar Mandi Dalam, 4 Lemari, 4 Kasur Single', 'description': 'Kamar bersama untuk 4 orang'},

        # Floor 3 - Single rooms (premium)
        {'room_number': 'C301', 'room_type': 'single', 'floor': 3, 'capacity': 1, 'price': 1500000, 'status': 'available', 'facilities': 'AC, WiFi, Kamar Mandi Dalam, Lemari, Meja Kerja, Balkon Luas', 'description': 'Kamar single premium lantai atas'},
        {'room_number': 'C302', 'room_type': 'single', 'floor': 3, 'capacity': 1, 'price': 1500000, 'status': 'available', 'facilities': 'AC, WiFi, Kamar Mandi Dalam, Lemari, Meja Kerja, Balkon Luas', 'description': 'Kamar single premium'},
        {'room_number': 'C303', 'room_type': 'single', 'floor': 3, 'capacity': 1, 'price': 1500000, 'status': 'maintenance', 'facilities': 'AC, WiFi, Kamar Mandi Dalam, Lemari, Meja Kerja, Balkon Luas', 'description': 'Sedang renovasi'},

        # Floor 3 - Double rooms (premium)
        {'room_number': 'C304', 'room_type': 'double', 'floor': 3, 'capacity': 2, 'price': 2000000, 'status': 'available', 'facilities': 'AC, WiFi, Kamar Mandi Dalam, 2 Lemari, 2 Kasur, Balkon Luas, View Kota', 'description': 'Kamar double premium dengan view kota'},
        {'room_number': 'C305', 'room_type': 'double', 'floor': 3, 'capacity': 2, 'price': 2000000, 'status': 'available', 'facilities': 'AC, WiFi, Kamar Mandi Dalam, 2 Lemari, 2 Kasur, Balkon Luas, View Kota', 'description': 'Kamar double premium'},

        # Floor 3 - Shared rooms
        {'room_number': 'C306', 'room_type': 'shared', 'floor': 3, 'capacity': 4, 'price': 3000000, 'status': 'available', 'facilities': 'AC, WiFi, Kamar Mandi Dalam, 4 Lemari, 4 Kasur, Balkon, View Kota', 'description': 'Kamar bersama premium untuk 4 orang'},
        {'room_number': 'C307', 'room_type': 'shared', 'floor': 3, 'capacity': 6, 'price': 4000000, 'status': 'occupied', 'facilities': 'AC, WiFi, 2 Kamar Mandi, 6 Lemari, 6 Kasur, Ruang Tamu', 'description': 'Kamar bersama besar untuk 6 orang'},
    ]

    created_count = 0
    for room_data in rooms_data:
        room = Room.objects.filter(room_number=room_data['room_number']).first()
        if not room:
            room = Room.objects.create(**room_data)
            created_count += 1
            print(f"[OK] Created room: {room.room_number} ({room.get_room_type_display()}, {room.get_status_display()})")
        else:
            print(f"[OK] Room already exists: {room.room_number}")

    print(f"\nCreated {created_count} new rooms")
    print(f"Total rooms: {Room.objects.count()}")

    # Show statistics
    print("\n=== Room Statistics ===")
    print(f"Available: {Room.objects.filter(status='available').count()}")
    print(f"Occupied: {Room.objects.filter(status='occupied').count()}")
    print(f"Maintenance: {Room.objects.filter(status='maintenance').count()}")
    print(f"\nSingle: {Room.objects.filter(room_type='single').count()}")
    print(f"Double: {Room.objects.filter(room_type='double').count()}")
    print(f"Shared: {Room.objects.filter(room_type='shared').count()}")

def create_tenant_assignments():
    """Create sample tenant assignments for testing"""

    print("\nCreating tenant assignments...")

    # Get tenants and rooms
    try:
        budi_profile = TenantProfile.objects.get(user__email='budi@test.com')
        siti_profile = TenantProfile.objects.get(user__email='siti@test.com')
        andi_profile = TenantProfile.objects.get(user__email='andi@test.com')
    except TenantProfile.DoesNotExist:
        print("[ERROR] Tenant profiles not found. Please run create_tenant_profiles command first.")
        return

    # Assignment data
    assignments_data = [
        {
            'tenant_email': 'budi@test.com',
            'room_number': 'A102',
            'move_in_date': date.today() - timedelta(days=180),  # 6 months ago
            'lease_end_date': date.today() + timedelta(days=185),  # 6 months from now
            'monthly_rent': 1000000,
            'description': 'Long-term tenant'
        },
        {
            'tenant_email': 'siti@test.com',
            'room_number': 'A105',
            'move_in_date': date.today() - timedelta(days=90),  # 3 months ago
            'lease_end_date': date.today() + timedelta(days=275),  # 9 months from now
            'monthly_rent': 1500000,
            'description': 'New tenant'
        },
        {
            'tenant_email': 'andi@test.com',
            'room_number': 'B205',
            'move_in_date': date.today() - timedelta(days=365),  # 1 year ago
            'lease_end_date': date.today() + timedelta(days=365),  # 1 year from now
            'monthly_rent': 1800000,
            'description': 'Renewed lease'
        },
    ]

    created_count = 0
    for assignment_data in assignments_data:
        # Get tenant and room
        try:
            tenant = TenantProfile.objects.get(user__email=assignment_data['tenant_email'])
            room = Room.objects.get(room_number=assignment_data['room_number'])

            # Check if assignment already exists
            existing = RoomAssignment.objects.filter(
                tenant=tenant,
                room=room,
                is_current=True
            ).first()

            if not existing:
                assignment = RoomAssignment.objects.create(
                    tenant=tenant,
                    room=room,
                    move_in_date=assignment_data['move_in_date'],
                    lease_end_date=assignment_data['lease_end_date'],
                    monthly_rent=assignment_data['monthly_rent'],
                    is_current=True
                )

                # Update room status to occupied
                room.status = 'occupied'
                room.save()

                created_count += 1
                print(f"[OK] Assigned {tenant.user.get_full_name()} to room {room.room_number}")
            else:
                print(f"[OK] Assignment already exists: {tenant.user.get_full_name()} in {room.room_number}")

        except (TenantProfile.DoesNotExist, Room.DoesNotExist) as e:
            print(f"[ERROR] {e}")
            continue

    print(f"\nCreated {created_count} new assignments")
    print(f"Total active assignments: {RoomAssignment.objects.filter(is_current=True).count()}")

    # Show assignment statistics
    print("\n=== Assignment Statistics ===")
    print(f"Active assignments: {RoomAssignment.objects.filter(is_current=True).count()}")
    print(f"Past assignments: {RoomAssignment.objects.filter(is_current=False).count()}")
    print(f"Tenants with rooms: {TenantProfile.objects.filter(assignments__is_current=True).distinct().count()}")
    print(f"Tenants without rooms: {TenantProfile.objects.exclude(assignments__is_current=True).distinct().count()}")


def create_test_payments():
    """Create sample payments for Phase 6 testing"""

    print("\n=== Creating Test Payments ===")

    from decimal import Decimal

    # Get admin user
    admin = User.objects.filter(role='admin').first()
    if not admin:
        print("[ERROR] Admin user not found. Cannot create test payments.")
        return

    # Get active assignments
    active_assignments = RoomAssignment.objects.filter(is_current=True)
    if not active_assignments.exists():
        print("[ERROR] No active assignments found. Cannot create test payments.")
        return

    created_count = 0
    skipped_count = 0

    # Create payments for June - December 2025 to populate chart
    months_data = [
        (6, 2025, date(2025, 6, 5), 3),  # June - all paid
        (7, 2025, date(2025, 7, 5), 3),  # July - all paid
        (8, 2025, date(2025, 8, 5), 2),  # August - 2 paid, 1 pending
        (9, 2025, date(2025, 9, 5), 2),  # September - 2 paid, 1 pending
        (10, 2025, date(2025, 10, 5), 1),  # October - 1 paid, 2 pending
        (11, 2025, date(2025, 11, 5), 2),  # November - 2 paid, 1 pending
        (12, 2025, date(2025, 12, 5), 0),  # December - all pending/overdue
    ]

    for month, year, due_date, num_paid in months_data:
        print(f"\nCreating {date(year, month, 1).strftime('%B %Y')} payments...")
        payment_num = 0

        for assignment in active_assignments:
            tenant = assignment.tenant

            # Check if payment already exists
            if Payment.objects.filter(
                tenant=tenant,
                payment_period_month=month,
                payment_period_year=year
            ).exists():
                skipped_count += 1
                print(f"[OK] {date(year, month, 1).strftime('%B')} payment already exists for {tenant.user.get_full_name()}")
                continue

            # Create payment
            payment = Payment.objects.create(
                tenant=tenant,
                assignment=assignment,
                payment_period_month=month,
                payment_period_year=year,
                amount=assignment.monthly_rent,
                due_date=due_date,
                status='pending'
            )

            # Mark as paid based on num_paid
            if payment_num < num_paid:
                payment.mark_as_paid(
                    payment_date=due_date - timedelta(days=2),
                    payment_method='transfer' if payment_num % 2 == 0 else 'cash',
                    paid_by=admin
                )
                payment.payment_reference = f"TRF{payment.id:06d}"
                payment.save()
                status_str = "PAID"
            else:
                status_str = "PENDING"

            payment_num += 1
            created_count += 1
            print(f"[OK] Created {date(year, month, 1).strftime('%B')} payment for {tenant.user.get_full_name()} - {status_str}")


    print(f"\nCreated {created_count} new payments")
    print(f"Skipped {skipped_count} existing payments")

    # Payment statistics
    print("\n=== Payment Statistics ===")
    print(f"Total payments: {Payment.objects.count()}")
    print(f"Paid: {Payment.objects.filter(status='paid').count()}")
    print(f"Pending: {Payment.objects.filter(status='pending').count()}")
    print(f"Cancelled: {Payment.objects.filter(status='cancelled').count()}")

    # Calculate overdue
    today = date.today()
    overdue_count = Payment.objects.filter(status='pending', due_date__lt=today).count()
    print(f"Overdue: {overdue_count}")


if __name__ == '__main__':
    print("=" * 50)
    print("KOSAN APP - TEST DATA SETUP")
    print("=" * 50)

    create_test_users()
    create_test_rooms()
    create_tenant_assignments()
    create_test_payments()

    print("\n" + "=" * 50)
    print("TEST DATA SETUP COMPLETE!")
    print("=" * 50)
    print("\nYou can now test the application with:")
    print("\n** Admin Account **")
    print("- Email: admin@test.com")
    print("- Password: admin123")
    print("\n** Tenant Accounts (with room assignments) **")
    print("- Budi (Room A102): budi@test.com / budi123")
    print("- Siti (Room A105): siti@test.com / siti123")
    print("- Andi (Room B205): andi@test.com / andi123")
    print("\n** Tenant Accounts (no room yet) **")
    print("- Dewi (No room): dewi@test.com / dewi123")
    print("\nNote: Run 'python manage.py create_tenant_profiles' if tenant profiles don't exist.")
