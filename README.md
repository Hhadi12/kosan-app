# Kosan Management Application

**Web-based boarding house (kosan) management system**

Built with Django REST Framework + React as part of a final year thesis project.

---

## Project Overview

A complete management system for boarding house operations including:
- User authentication and role management
- Room inventory management
- Tenant management (upcoming)
- Payment tracking (upcoming)
- Complaint handling (upcoming)

**Target Users:**
- **Admin/Owner:** Full system access for management
- **Tenants:** Limited access to personal data and services

---

## Tech Stack

### Backend
- **Framework:** Django 5.2.7
- **API:** Django REST Framework
- **Database:** SQLite (development), PostgreSQL (production)
- **Authentication:** Token-based authentication

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v3
- **State Management:** React Context API
- **HTTP Client:** Axios with interceptors
- **UI Libraries:** react-hot-toast, jsPDF

---

## Current Status

### ✅ Completed Phases (Phase 1-4.5)

**Phase 1: Backend Authentication** ✅
- Custom User model with email login
- User registration and authentication
- Token-based API security
- Admin panel customization

**Phase 2: Frontend Authentication** ✅
- Login and registration pages
- Protected routes
- Auth context and state management
- Auto-redirect based on auth status

**Phase 3: Room Management Backend** ✅
- Room CRUD API endpoints
- Advanced filtering (status, type, floor, price)
- Permission controls (admin-only operations)
- Safety checks (cannot delete occupied rooms)
- Django admin integration

**Phase 4: Room Management Frontend** ✅
- Room list with filters and search
- Room detail pages
- Create/Edit room forms (admin only)
- Delete functionality with confirmation
- Role-based UI (admin vs tenant views)
- Status badges and visual indicators

**Phase 4.5: UI/UX Improvements** ✅
- Persistent navigation with mobile menu
- Search and sort functionality (6 options)
- Pagination (12 rooms per page)
- Statistics cards (clickable filtering)
- Export functions (Print, CSV, PDF) - admin only
- Toast notifications (modern feedback)
- Favorites system (tenants only)
- Loading skeletons
- Comprehensive testing documentation

### 🔄 Next Phase (Phase 5)

**Phase 5: Tenant Management** (Ready to begin)
- Tenant profile management
- Room assignment system
- Move-in/move-out tracking
- Assignment history
- Tenant search and filtering

---

## Features

### For Admins
✅ User management (create, edit, delete)
✅ Room management (full CRUD operations)
✅ Advanced filtering and search
✅ Export data (Print, CSV, PDF)
✅ Statistics dashboard
⏳ Tenant assignment management (Phase 5)
⏳ Payment tracking (Phase 6)
⏳ Complaint management (Phase 7)

### For Tenants
✅ View available rooms
✅ Room search and filtering
✅ Favorites system (bookmark rooms)
✅ Personal dashboard
⏳ View own profile and lease details (Phase 5)
⏳ Payment history (Phase 6)
⏳ Submit and track complaints (Phase 7)

---

## Project Structure

```
kosan-app/
├── backend/                 # Django REST Framework backend
│   ├── kosan_project/      # Main project settings
│   ├── users/              # User authentication app
│   ├── rooms/              # Room management app
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/           # API integration layer
│   │   ├── components/    # Reusable React components
│   │   ├── contexts/      # React Context providers
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── vite.config.js
│
│
└── README.md             # This file
```

---

## Getting Started

### Prerequisites
- Python 3.x
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser

# Create test data (optional)
python create_test_data.py

# Run development server
python manage.py runserver
# Backend will run on http://localhost:8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
# Frontend will run on http://localhost:5173
```

### Access the Application

1. **Frontend:** http://localhost:5173
2. **Backend API:** http://localhost:8000/api/
3. **Django Admin:** http://localhost:8000/admin/

### Test Credentials

After running `create_test_data.py`:

**Admin:**
- Email: `admin@kosan.com`
- Password: `admin123`

**Tenants:**
- Email: `budi@test.com` | Password: `budi123`
- Email: `siti@test.com` | Password: `siti123`
- Email: `andi@test.com` | Password: `andi123`
- Email: `dewi@test.com` | Password: `dewi123`

---

## API Documentation

### Authentication Endpoints
```
POST   /api/auth/register/     # Register new user
POST   /api/auth/login/        # Login (returns token)
POST   /api/auth/logout/       # Logout
```

### User Endpoints
```
GET    /api/users/             # List users (admin only)
POST   /api/users/             # Create user (admin only)
GET    /api/users/{id}/        # Get user detail
PUT    /api/users/{id}/        # Update user
DELETE /api/users/{id}/        # Delete user (admin only)
```

### Room Endpoints
```
GET    /api/rooms/             # List all rooms (with filters)
POST   /api/rooms/create/      # Create room (admin only)
GET    /api/rooms/{id}/        # Get room detail
PUT    /api/rooms/{id}/update/ # Update room (admin only)
DELETE /api/rooms/{id}/delete/ # Delete room (admin only)
```

**Query Parameters for Filtering:**
- `status` - available/occupied/maintenance
- `room_type` - single/double/shared
- `floor` - floor number
- `price_min` - minimum price
- `price_max` - maximum price

For complete API documentation, see `.claude/reference/API_QUICK_REFERENCE.md`

---

## Development Notes

### Language
- **All user-facing content:** Bahasa Indonesia
- **Code and documentation:** English

### Authentication
- **Important:** Backend uses EMAIL for login, not username
- Token-based authentication with Django REST Framework
- Tokens stored in localStorage (frontend)

### Role-Based Access
- **Admin:** Full CRUD operations, export functions
- **Tenant:** Read-only for rooms, favorites system

---

## Documentation

**For Development:**
- `PHASE_X_HANDOFF.md` - Technical specifications per phase
- `API_QUICK_REFERENCE.md` - API endpoint reference
- `TESTING_GUIDE.md` - Testing procedures

**For Research:**
- `RESEARCH_NOTES.md` - Development timeline, metrics, and analysis
- `PHASE_X_COMPLETION.txt` - Completion certificates with metrics

---


## License

This project is developed for academic research purposes.

---
