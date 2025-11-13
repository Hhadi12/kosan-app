import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { getAllRooms } from '../api/roomApi';
import { getAllTenants, getMyProfile } from '../api/tenantApi';
import { getPaymentStats } from '../api/paymentApi';
import Navbar from '../components/Navbar';
import RoomCard from '../components/RoomCard';
import PaymentStats from '../components/PaymentStats';
import RevenueChart from '../components/RevenueChart';
import { getFavorites } from '../utils/favoritesUtils';
import { formatDate } from '../utils/formatters';

function Dashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [roomCount, setRoomCount] = useState(0);
  const [tenantCount, setTenantCount] = useState(0);
  const [paymentStats, setPaymentStats] = useState(null);
  const [myTenantProfile, setMyTenantProfile] = useState(null);
  const [favoriteRooms, setFavoriteRooms] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [loadingTenant, setLoadingTenant] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Fetch counts on mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch room count
        const roomData = await getAllRooms();
        setRoomCount(roomData.count);

        // Fetch tenant count (admin only)
        if (isAdmin()) {
          const tenantData = await getAllTenants();
          setTenantCount(tenantData.count || 0);
        }
      } catch (err) {
        console.error('Error fetching counts:', err);
      }
    };

    fetchCounts();
  }, [isAdmin]);

  // Fetch payment statistics (admin only)
  useEffect(() => {
    const fetchPaymentStats = async () => {
      if (!isAdmin()) return;

      setLoadingPayments(true);
      try {
        const currentYear = new Date().getFullYear();
        const stats = await getPaymentStats({ year: currentYear });
        setPaymentStats(stats);
      } catch (err) {
        console.error('Error fetching payment stats:', err);
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchPaymentStats();
  }, [isAdmin]);

  // Fetch tenant profile and favorites for regular users
  useEffect(() => {
    const fetchTenantData = async () => {
      if (isAdmin()) return; // Skip for admins

      // Fetch tenant profile
      setLoadingTenant(true);
      try {
        const profile = await getMyProfile();
        setMyTenantProfile(profile);
      } catch (err) {
        console.error('Error fetching tenant profile:', err);
        // Profile might not exist yet, that's okay
      } finally {
        setLoadingTenant(false);
      }

      // Fetch favorite rooms
      const favoriteIds = getFavorites();
      if (favoriteIds.length === 0) {
        setFavoriteRooms([]);
        return;
      }

      setLoadingFavorites(true);
      try {
        const data = await getAllRooms();
        const favorites = data.rooms.filter((room) => favoriteIds.includes(room.id));
        setFavoriteRooms(favorites);
      } catch (err) {
        console.error('Error fetching favorite rooms:', err);
      } finally {
        setLoadingFavorites(false);
      }
    };

    fetchTenantData();
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Selamat Datang, {user?.username}! 👋
          </h2>
          <p className="text-gray-600">
            Anda login sebagai: <span className="font-semibold">{user?.role}</span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card 1 - Total Kamar */}
          <Link
            to="/rooms"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer block"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Kamar</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{roomCount}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
            <p className="text-blue-600 text-sm mt-2 flex items-center">
              Lihat semua kamar
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </p>
          </Link>

          {/* Card 2 - Total Penghuni (Admin only) */}
          {isAdmin() && (
            <Link
              to="/penghuni"
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Penghuni</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{tenantCount}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-green-600 text-sm mt-2 flex items-center">
                Lihat semua penghuni
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </p>
            </Link>
          )}

          {/* Card 2 Alternate - Status (Tenant only) */}
          {!isAdmin() && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">
                    {myTenantProfile?.is_active ? 'Aktif' : 'Tidak Aktif'}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-2">Status keanggotaan</p>
            </div>
          )}

          {/* Card 3 - Total Pembayaran (Admin only) */}
          {isAdmin() && (
            <Link
              to="/pembayaran"
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Pembayaran</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">
                    {paymentStats?.total_payments || 0}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-yellow-600 text-sm mt-2 flex items-center">
                Lihat semua pembayaran
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </p>
            </Link>
          )}
        </div>

        {/* Payment Statistics - Admin Only */}
        {isAdmin() && !loadingPayments && paymentStats && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Statistik Pembayaran</h3>
            <PaymentStats
              stats={paymentStats}
              onStatClick={(statId) => {
                if (statId !== 'total') {
                  navigate(`/pembayaran?status=${statId}`);
                } else {
                  navigate('/pembayaran');
                }
              }}
            />
          </div>
        )}

        {/* Revenue Chart - Admin Only */}
        {isAdmin() && !loadingPayments && paymentStats?.monthly_revenue && (
          <div className="mb-6">
            <RevenueChart monthlyData={paymentStats.monthly_revenue} />
          </div>
        )}

        {/* Tenant Profile Section - Tenants Only */}
        {!isAdmin() && myTenantProfile && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Profil Saya</h3>
              {myTenantProfile.id && (
                <Link
                  to={`/penghuni/${myTenantProfile.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Lihat Detail →
                </Link>
              )}
            </div>

            {loadingTenant ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Memuat...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Room Assignment */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-3">Kamar Saat Ini</h4>
                  {myTenantProfile.current_assignment ? (
                    <div>
                      <Link
                        to={`/rooms/${myTenantProfile.current_assignment.room}`}
                        className="text-2xl font-bold text-blue-700 hover:text-blue-800 block"
                      >
                        Kamar {myTenantProfile.current_assignment.room_number}
                      </Link>
                      <p className="text-sm text-blue-600 mt-2">
                        Masuk: {formatDate(myTenantProfile.current_assignment.move_in_date)}
                      </p>
                      <p className="text-sm text-blue-600">
                        Sewa: Rp{' '}
                        {Number(myTenantProfile.current_assignment.monthly_rent).toLocaleString('id-ID')}/bulan
                      </p>
                    </div>
                  ) : (
                    <div className="text-blue-600">
                      <p>Belum ada kamar</p>
                      <Link to="/rooms" className="text-sm hover:underline mt-2 inline-block">
                        Lihat kamar tersedia
                      </Link>
                    </div>
                  )}
                </div>

                {/* Tenant Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Informasi Pribadi</h4>
                  <dl className="space-y-2">
                    {myTenantProfile.occupation && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Pekerjaan:</dt>
                        <dd className="text-sm font-medium text-gray-900">{myTenantProfile.occupation}</dd>
                      </div>
                    )}
                    {myTenantProfile.emergency_contact_name && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Kontak Darurat:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {myTenantProfile.emergency_contact_name}
                        </dd>
                      </div>
                    )}
                    {myTenantProfile.emergency_contact_phone && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Telepon Darurat:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {myTenantProfile.emergency_contact_phone}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Favorite Rooms Section - Tenants Only */}
        {!isAdmin() && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Kamar Favorit</h3>
              <Link
                to="/rooms"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Lihat Semua Kamar →
              </Link>
            </div>

            {loadingFavorites ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Memuat...</p>
              </div>
            ) : favoriteRooms.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <p className="text-gray-600 mb-2">Belum ada kamar favorit</p>
                <p className="text-sm text-gray-500">Klik ikon hati pada kamar untuk menambahkan favorit</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Info Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Informasi Profil</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Username</p>
              <p className="text-gray-800 font-semibold">{user?.username}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="text-gray-800 font-semibold">{user?.email || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">No. Telepon</p>
              <p className="text-gray-800 font-semibold">{user?.phone || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">No. Kamar</p>
              <p className="text-gray-800 font-semibold">{user?.room_number || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;