import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../api/authApi';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',      // ← Add this
    last_name: '',       // ← Add this
    phone: '',           // ← Changed from phone_number
    room_number: '',
    role: 'user', // default role
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation: Check if passwords match
    if (formData.password !== formData.password_confirm) {
      setError('Password tidak cocok!');
      return;
    }

    // Validation: Password minimum length
    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter!');
      return;
    }

    setLoading(true);

    try {
      // Remove password_confirm before sending to API
        const dataToSend = { ...formData };

        console.log('Data yang dikirim:', dataToSend);
        
        await authApi.register(dataToSend);
      
      // Success - redirect to login
      alert('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      // Handle different error types
      if (err.response?.data) {
        const errorData = err.response.data;
        // If error is an object with field-specific errors
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          setError(errorMessages);
        } else {
          setError(errorData.detail || 'Registrasi gagal. Silakan coba lagi.');
        }
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-600 py-8">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Daftar Akun</h1>
          <p className="text-gray-600 mt-2">Buat akun baru untuk melanjutkan</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 whitespace-pre-line">
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-semibold mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Pilih username"
              required
            />
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="first_name" className="block text-gray-700 font-semibold mb-2">
                Nama Depan
            </label>
            <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nama depan"
            />
            </div>

        <div className="mb-4">
            <label htmlFor="last_name" className="block text-gray-700 font-semibold mb-2">
                Nama Belakang
            </label>
            <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nama belakang"
            />
        </div>

          {/* Password Field */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Minimal 6 karakter"
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label htmlFor="password_confirm" className="block text-gray-700 font-semibold mb-2">
              Konfirmasi Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password_confirm"
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ketik ulang password"
              required
            />
          </div>

          {/* Phone Field */}
        <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">
                Nomor Telepon
            </label>
            <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="08123456789"
            />
        </div>

          {/* Room Number Field */}
          <div className="mb-6">
            <label htmlFor="room_number" className="block text-gray-700 font-semibold mb-2">
              Nomor Kamar
            </label>
            <input
              type="text"
              id="room_number"
              name="room_number"
              value={formData.room_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Contoh: A101"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600 mt-6">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-green-600 hover:text-green-800 font-semibold">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;