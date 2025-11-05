// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiHardDrive,
  FiBarChart2,
  FiLogOut,
  FiBriefcase, // 🆕 icon phòng họp
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { logout } = useAuth();

  const commonLinkClass =
    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors";
  const activeLinkClass =
    "bg-blue-100 text-blue-700 dark:bg-slate-700 dark:text-white";
  const inactiveLinkClass =
    "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800";

  return (
    <aside className="fixed left-0 top-0 z-10 h-screen w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b dark:border-slate-800">
          <span className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
            🗓️ MeetFlow
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          {/* Dashboard */}
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `${commonLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            <FiHome />
            Dashboard
          </NavLink>

          {/* Người dùng & quyền hạn */}
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `${commonLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            <FiUsers />
            Người dùng & quyền hạn
          </NavLink>

          {/* 🏢 Quản lý phòng họp */}
          <NavLink
            to="/admin/rooms"
            className={({ isActive }) =>
              `${commonLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            <FiBriefcase />
            Quản lý phòng họp
          </NavLink>

          {/* Quản lý thiết bị */}
          <NavLink
            to="/admin/devices"
            className={({ isActive }) =>
              `${commonLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            <FiHardDrive />
            Quản lý thiết bị
          </NavLink>

          {/* Thống kê & báo cáo */}
          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              `${commonLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            <FiBarChart2 />
            Thống kê & báo cáo
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t dark:border-slate-800">
          <button
            onClick={logout}
            className={`${commonLinkClass} ${inactiveLinkClass} w-full`}
          >
            <FiLogOut />
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
