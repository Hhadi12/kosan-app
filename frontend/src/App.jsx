import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RoomList from './pages/RoomList';
import RoomDetail from './pages/RoomDetail';
import CreateRoom from './pages/CreateRoom';
import EditRoom from './pages/EditRoom';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
              color: '#fff',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#EF4444',
              color: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Room Routes - Protected */}
        <Route path="/rooms" element={<ProtectedRoute><RoomList /></ProtectedRoute>} />
        <Route path="/rooms/:id" element={<ProtectedRoute><RoomDetail /></ProtectedRoute>} />

        {/* Room Routes - Admin Only */}
        {/* IMPORTANT: /rooms/create MUST come before /rooms/:id to avoid "create" being treated as an ID */}
        <Route path="/rooms/create" element={<AdminRoute><CreateRoom /></AdminRoute>} />
        <Route path="/rooms/:id/edit" element={<AdminRoute><EditRoom /></AdminRoute>} />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Admin Route Component
// Only allows access to users with admin role
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    // Redirect non-admin users to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default App;
