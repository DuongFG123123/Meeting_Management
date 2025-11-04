// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api'; // Import Axios

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Gọi API Backend
      const response = await api.post('/auth/login', {
        username: email,
        password: password,
      });

      // 2. Lấy accessToken từ response
      const accessToken = response.data.accessToken;

      // 3. Gọi hàm login của Context để lưu token
      login(accessToken); 
      
      // 4. Chuyển hướng
      navigate('/'); // Chuyển đến trang Dashboard
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 404)) {
        setError('Sai tên đăng nhập hoặc mật khẩu.');
      } else {
        setError('Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-6">
          Đăng nhập
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2"
            />
          </div>

          {/* XÓA BỎ Ô CHỌN VAI TRÒ (ROLE) */}

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 text-white px-3 py-3 font-semibold"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
          
          <div className="text-sm text-center">
            <Link 
              to="/forgot-password" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}