// src/components/user/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiCalendar,
  FiPlusCircle,
  FiBriefcase,
  FiClock,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../ThemeToggle";

const userMenu = [
  {
    to: "/user",
    label: "Dashboard",
    icon: <FiHome size={18} />,
  },
  {
    to: "/user/my-meetings",
    label: "Lịch họp của tôi",
    icon: <FiCalendar size={18} />,
  },
  {
    to: "/user/create-meeting",
    label: "Tạo cuộc họp",
    icon: <FiPlusCircle size={18} />,
  },
  {
    to: "/user/rooms",
    label: "Phòng họp trống",
    icon: <FiBriefcase size={18} />,
  },
  {
    to: "/user/history",
    label: "Lịch sử họp",
    icon: <FiClock size={18} />,
  },
  {
    to: "/user/profile",
    label: "Thông tin cá nhân",
    icon: <FiUser size={18} />,
  },
];

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { logout } = useAuth();

  return (
    <aside
      className={`fixed md:static top-14 md:top-0 left-0 bg-white dark:bg-slate-900 
        border-r dark:border-slate-800 shadow-md w-64 h-[calc(100%-56px)] md:h-auto 
        transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-64"} 
        transition-transform duration-300 ease-in-out z-20`}
    >
      <div className="flex flex-col items-center py-5 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl">
            🗓️
          </div>
          <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">MeetFlow</span>
        </div>
        <div className="text-center mt-3">
          <p className="font-semibold text-gray-700 dark:text-gray-100 text-base">
            MeetFlow User
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Quản lý lịch họp cá nhân
          </p>
        </div>
      </div>
      <nav className="mt-3 px-2 flex-1 w-full">
        {userMenu.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl mb-1 text-[15px] transition w-full ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500 shadow-sm dark:bg-slate-800 dark:text-blue-300"
                  : "text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
              }`
            }
            onClick={() => {
              // Close sidebar on mobile after click
              if (setIsSidebarOpen) setIsSidebarOpen(false);
            }}
          >
            {m.icon}
            <span>{m.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto w-full px-5 py-4 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[15px] transition w-full text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
        >
          <FiLogOut />
          Đăng xuất
        </button>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Phiên bản 1.0</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;