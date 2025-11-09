"""
Test Data Setup Script
Creates test users and rooms for Phase 4.5 testing
"""

import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kosan_project.settings')
django.setup()

from users.models import User
from rooms.models import Room

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

if __name__ == '__main__':
    print("=" * 50)
    print("KOSAN APP - TEST DATA SETUP")
    print("=" * 50)

    create_test_users()
    create_test_rooms()

    print("\n" + "=" * 50)
    print("TEST DATA SETUP COMPLETE!")
    print("=" * 50)
    print("\nYou can now test the application with:")
    print("- Admin: admin@test.com / admin123")
    print("- Tenants: budi@test.com / budi123")
    print("           siti@test.com / siti123")
    print("           andi@test.com / andi123")
    print("           dewi@test.com / dewi123")
