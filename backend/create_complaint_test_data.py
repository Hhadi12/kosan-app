"""
Create test complaint data for Phase 7.2 testing
"""

import os
import django
from datetime import datetime, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kosan_project.settings')
django.setup()

from users.models import User
from rooms.models import Room
from tenants.models import TenantProfile
from complaints.models import Complaint, ComplaintComment


def create_test_complaints():
    """Create test complaints with various statuses and priorities"""

    print("\n=== Creating Test Complaints ===\n")

    # Get admin user
    admin = User.objects.filter(role='admin').first()
    if not admin:
        print("[ERROR] No admin user found!")
        return

    # Get tenant users with profiles
    tenants = TenantProfile.objects.filter(user__role='user', is_active=True)
    if not tenants:
        print("[ERROR] No tenant profiles found!")
        return

    # Get some rooms
    rooms = Room.objects.all()[:5]

    complaints_data = [
        # OPEN complaints (new)
        {
            'tenant_index': 0,  # Budi
            'title': 'Lampu kamar tidak menyala',
            'description': 'Lampu di kamar saya sudah tidak menyala sejak kemarin malam. Sudah saya coba ganti bohlam tapi tetap tidak bisa. Sepertinya ada masalah dengan instalasi listriknya.',
            'category': 'maintenance',
            'priority': 'high',
            'status': 'open',
            'room_index': 0,
            'days_ago': 0,  # Today
        },
        {
            'tenant_index': 1,  # Siti
            'title': 'AC rusak tidak dingin',
            'description': 'AC di kamar tidak dingin lagi. Sudah saya coba bersihkan filternya tapi tetap tidak ada perubahan. Mohon diperbaiki karena cuaca sedang panas.',
            'category': 'maintenance',
            'priority': 'urgent',
            'status': 'open',
            'room_index': 1,
            'days_ago': 1,  # Yesterday
        },
        {
            'tenant_index': 2,  # Andi
            'title': 'Kamar mandi kotor dan bau',
            'description': 'Kamar mandi bersama di lantai 2 sangat kotor dan berbau tidak sedap. Mohon untuk dibersihkan secara rutin.',
            'category': 'cleanliness',
            'priority': 'medium',
            'status': 'open',
            'room_index': 2,
            'days_ago': 2,
        },

        # IN_PROGRESS complaints
        {
            'tenant_index': 0,  # Budi
            'title': 'Pintu lemari rusak tidak bisa ditutup',
            'description': 'Engsel pintu lemari kamar patah sehingga pintu tidak bisa ditutup dengan baik. Mohon diperbaiki.',
            'category': 'facilities',
            'priority': 'low',
            'status': 'in_progress',
            'room_index': 0,
            'days_ago': 5,
        },
        {
            'tenant_index': 3,  # Dewi
            'title': 'Kebisingan dari konstruksi tetangga',
            'description': 'Ada proyek konstruksi di sebelah kosan yang sangat berisik sejak pagi hingga sore. Sulit untuk istirahat dan bekerja dari rumah.',
            'category': 'noise',
            'priority': 'medium',
            'status': 'in_progress',
            'room_index': None,  # No specific room
            'days_ago': 7,
        },
        {
            'tenant_index': 1,  # Siti
            'title': 'Kunci kamar susah dibuka',
            'description': 'Kunci kamar saya mulai susah diputar dan kadang macet. Takut nanti tidak bisa masuk kamar.',
            'category': 'security',
            'priority': 'high',
            'status': 'in_progress',
            'room_index': 1,
            'days_ago': 4,
        },

        # RESOLVED complaints
        {
            'tenant_index': 2,  # Andi
            'title': 'Air kran tidak keluar',
            'description': 'Air di kamar mandi tidak keluar sama sekali sejak pagi tadi.',
            'category': 'maintenance',
            'priority': 'urgent',
            'status': 'resolved',
            'room_index': 2,
            'days_ago': 10,
            'resolution_notes': 'Sudah diperbaiki. Masalah pada pipa yang tersumbat. Pipa sudah dibersihkan dan air sudah normal kembali.',
        },
        {
            'tenant_index': 0,  # Budi
            'title': 'Wifi lemot dan sering putus',
            'description': 'Koneksi internet sangat lambat dan sering terputus-putus. Sangat mengganggu untuk kerja dan kuliah online.',
            'category': 'facilities',
            'priority': 'high',
            'status': 'resolved',
            'room_index': None,
            'days_ago': 15,
            'resolution_notes': 'Sudah upgrade paket internet dan tambah access point. Koneksi sekarang sudah stabil dan lebih cepat.',
        },
        {
            'tenant_index': 1,  # Siti
            'title': 'Tempat sampah penuh',
            'description': 'Tempat sampah di depan kosan sudah penuh dan mulai berbau.',
            'category': 'cleanliness',
            'priority': 'medium',
            'status': 'resolved',
            'room_index': None,
            'days_ago': 8,
            'resolution_notes': 'Sudah diangkut oleh petugas sampah. Akan dijadwalkan pengangkutan rutin 2x seminggu.',
        },

        # CLOSED complaints
        {
            'tenant_index': 3,  # Dewi
            'title': 'Parkir motor saya dipindah',
            'description': 'Motor saya yang parkir di depan dipindahkan oleh orang lain tanpa izin.',
            'category': 'other',
            'priority': 'low',
            'status': 'closed',
            'room_index': None,
            'days_ago': 20,
            'resolution_notes': 'Sudah dikonfirmasi dengan penghuni lain. Motor dipindah karena menghalangi akses. Sudah ditambah aturan parkir di papan pengumuman.',
        },
    ]

    created_count = 0
    skipped_count = 0

    for data in complaints_data:
        # Get tenant
        if data['tenant_index'] >= len(tenants):
            continue
        tenant = tenants[data['tenant_index']]

        # Check if complaint already exists
        existing = Complaint.objects.filter(
            tenant=tenant,
            title=data['title']
        ).first()

        if existing:
            print(f"[SKIP] Complaint already exists: {data['title']}")
            skipped_count += 1
            continue

        # Get room if specified
        room = None
        if data['room_index'] is not None and data['room_index'] < len(rooms):
            room = rooms[data['room_index']]

        # Calculate created_at (days ago)
        created_at = datetime.now() - timedelta(days=data['days_ago'])

        # Create complaint
        complaint = Complaint.objects.create(
            tenant=tenant,
            room=room,
            title=data['title'],
            description=data['description'],
            category=data['category'],
            priority=data['priority'],
            status=data['status'],
        )

        # Update created_at manually
        complaint.created_at = created_at

        # If resolved or closed, set resolution data
        if data['status'] in ['resolved', 'closed']:
            complaint.resolution_notes = data.get('resolution_notes', '')
            complaint.resolved_at = created_at + timedelta(days=2)  # Resolved 2 days after creation
            complaint.resolved_by = admin

        complaint.save()

        created_count += 1
        status_label = {
            'open': 'BARU',
            'in_progress': 'DALAM PROSES',
            'resolved': 'SELESAI',
            'closed': 'DITUTUP'
        }[data['status']]

        print(f"[OK] Created {status_label}: {data['title']} ({tenant.user.get_full_name()})")

    print(f"\nCreated {created_count} complaints")
    print(f"Skipped {skipped_count} existing complaints")


def create_test_comments():
    """Add some test comments to complaints"""

    print("\n=== Creating Test Comments ===\n")

    # Get admin
    admin = User.objects.filter(role='admin').first()

    # Get some complaints
    complaints = Complaint.objects.all()[:5]

    if not complaints:
        print("[ERROR] No complaints found!")
        return

    comments_data = [
        # Comments on first complaint
        {
            'complaint_index': 0,
            'user_type': 'admin',
            'comment': 'Baik, sudah kami catat. Teknisi akan segera dikirim untuk memeriksa instalasi listrik di kamar Anda.',
        },
        {
            'complaint_index': 0,
            'user_type': 'tenant',
            'comment': 'Terima kasih. Kira-kira kapan teknisi bisa datang?',
        },

        # Comments on second complaint
        {
            'complaint_index': 1,
            'user_type': 'admin',
            'comment': 'Keluhan sudah kami terima. Kami akan kirim teknisi AC dalam 24 jam.',
        },

        # Comments on in_progress complaint
        {
            'complaint_index': 3,
            'user_type': 'admin',
            'comment': 'Sedang menunggu spare part engsel lemari. Diperkirakan tiba minggu depan.',
        },
        {
            'complaint_index': 3,
            'user_type': 'tenant',
            'comment': 'Baik, saya tunggu kabarnya. Terima kasih.',
        },
    ]

    created_count = 0

    for data in comments_data:
        if data['complaint_index'] >= len(complaints):
            continue

        complaint = complaints[data['complaint_index']]

        # Determine user
        if data['user_type'] == 'admin':
            user = admin
        else:
            user = complaint.tenant.user

        # Check if comment already exists
        existing = ComplaintComment.objects.filter(
            complaint=complaint,
            user=user,
            comment=data['comment']
        ).first()

        if existing:
            continue

        # Create comment
        ComplaintComment.objects.create(
            complaint=complaint,
            user=user,
            comment=data['comment']
        )

        created_count += 1
        user_label = "Admin" if data['user_type'] == 'admin' else complaint.tenant.user.get_full_name()
        print(f"[OK] Added comment by {user_label} on: {complaint.title[:50]}")

    print(f"\nCreated {created_count} comments")


def show_statistics():
    """Show complaint statistics"""

    print("\n=== Complaint Statistics ===")
    print(f"Total complaints: {Complaint.objects.count()}")
    print(f"Open (Baru): {Complaint.objects.filter(status='open').count()}")
    print(f"In Progress (Dalam Proses): {Complaint.objects.filter(status='in_progress').count()}")
    print(f"Resolved (Selesai): {Complaint.objects.filter(status='resolved').count()}")
    print(f"Closed (Ditutup): {Complaint.objects.filter(status='closed').count()}")

    print("\n=== By Category ===")
    print(f"Maintenance: {Complaint.objects.filter(category='maintenance').count()}")
    print(f"Facilities: {Complaint.objects.filter(category='facilities').count()}")
    print(f"Cleanliness: {Complaint.objects.filter(category='cleanliness').count()}")
    print(f"Noise: {Complaint.objects.filter(category='noise').count()}")
    print(f"Security: {Complaint.objects.filter(category='security').count()}")
    print(f"Other: {Complaint.objects.filter(category='other').count()}")

    print("\n=== By Priority ===")
    print(f"Low: {Complaint.objects.filter(priority='low').count()}")
    print(f"Medium: {Complaint.objects.filter(priority='medium').count()}")
    print(f"High: {Complaint.objects.filter(priority='high').count()}")
    print(f"Urgent: {Complaint.objects.filter(priority='urgent').count()}")

    print(f"\nTotal comments: {ComplaintComment.objects.count()}")


if __name__ == '__main__':
    print("=" * 60)
    print("KOSAN APP - COMPLAINT TEST DATA SETUP")
    print("=" * 60)

    create_test_complaints()
    create_test_comments()
    show_statistics()

    print("\n" + "=" * 60)
    print("COMPLAINT TEST DATA SETUP COMPLETE!")
    print("=" * 60)
    print("\nYou can now test the complaint system with:")
    print("\n** Correct Login Credentials **")
    print("Admin: admin@kosan.com / admin123")
    print("Tenants:")
    print("  - budi@test.com / budi123")
    print("  - siti@test.com / siti123")
    print("  - andi@test.com / andi123")
    print("  - dewi@test.com / dewi123")
