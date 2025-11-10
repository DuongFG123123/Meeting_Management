import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👁️ Trạng thái hiển thị mật khẩu

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Sai tài khoản hoặc mật khẩu. Vui lòng thử lại!";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Hình minh họa bên trái */}
      <div className="hidden md:flex w-1/2 items-center justify-center p-10">
        <img
          src="https://cdn.dribbble.com/users/1162077/screenshots/3848914/programmer.gif"
          alt="Meeting illustration"
          className="w-3/4 rounded-xl shadow-lg"
        />
      </div>

      {/* Form đăng nhập */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-2xl p-10 rounded-2xl w-full max-w-md"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">
            🗓️ Meeting Management
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Ô nhập username */}
            <input
              type="text"
              placeholder="Tên đăng nhập (email)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Ô nhập mật khẩu có icon 👁️ */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
              </button>
            </div>
          </div>

          {/* Nút đăng nhập */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 mt-6 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <div className="text-right mt-3">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <p className="text-sm text-gray-500 text-center mt-4">
            © 2025 CMC Global - Meeting Management
          </p>
        </form>
      </div>
    </div>
  );
}
