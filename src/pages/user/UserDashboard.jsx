import { useAuth } from "../../context/AuthContext";

export default function UserDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          👋 Xin chào, {user?.email}
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Đăng xuất
        </button>
      </header>

      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Trang dành cho nhân viên
        </h2>
        <p className="text-gray-600">
          Đây là dashboard của người dùng role <b>{user?.role}</b>.
        </p>
      </div>
    </div>
  );
}
