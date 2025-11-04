// src/components/Navbar.jsx
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user } = useAuth(); // Lấy thông tin user (nếu cần)

  return (
    <header className="fixed left-64 right-0 top-0 z-0 h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-end px-6 transition-colors">
      {/* (Bạn có thể thêm nút Search, Nút thông báo, hoặc Avatar ở đây) */}
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Chào mừng,{" "}
        <span className="font-semibold">{user?.username || "Admin"}</span>
      </div>
    </header>
  );
};

export default Navbar;