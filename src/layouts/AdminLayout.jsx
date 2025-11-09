// src/layouts/AdminLayout.jsx
import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiMenu,
  FiUsers,
  FiBarChart2,
  FiBriefcase,
  FiBell,
  FiSettings,
  FiLock,
  FiLogOut,
} from "react-icons/fi";
import { BsCalendar4Week } from "react-icons/bs";
import { HiOutlineDeviceMobile } from "react-icons/hi";
import ThemeToggle from "../components/ThemeToggle";
// BỎ: import Navbar from "../components/admin/Navbar"; // <-- ĐÃ XÓA

const adminMenu = [
  { to: "/admin", label: "Dashboard", icon: <BsCalendar4Week size={18} /> },
  { to: "/admin/users", label: "Quản lý người dùng", icon: <FiUsers size={18} /> },
  { to: "/admin/rooms", label: "Quản lý phòng họp", icon: <FiBriefcase size={18} /> },
  { to: "/admin/devices", label: "Quản lý thiết bị", icon: <HiOutlineDeviceMobile size={18} /> },
  { to: "/admin/reports", label: "Thống kê & báo cáo", icon: <FiBarChart2 size={18} /> },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const notificationRef = useRef(null);
  const settingsRef = useRef(null);

  const handleNotificationClick = () => {
    setIsNotificationOpen((prev) => !prev);
    setIsSettingsOpen(false);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen((prev) => !prev);
    setIsNotificationOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="h-14 bg-[#0b132b] text-white dark:bg-slate-900 flex items-center justify-between px-5 shadow-md transition-colors z-30 relative">
        {/* (Phần bên trái header giữ nguyên) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="w-9 h-9 rounded-lg bg-[#1c2541] flex items-center justify-center hover:bg-[#3a506b] transition"
          >
            <FiMenu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              🗓️
            </div>
            <span className="font-semibold text-lg">MeetFlow</span>
          </div>
        </div>
        
        {/* (Phần bên phải header đã sửa link) */}
        <div className="flex items-center gap-3">
          <span className="text-sm bg-blue-500 px-3 py-1 rounded-full shadow-md hidden sm:block">
            {user?.username || "Admin"}
          </span>

          {/* Nút Chuông Thông Báo */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={handleNotificationClick}
              className="w-9 h-9 rounded-lg bg-[#1c2541] flex items-center justify-center hover:bg-[#3a506b] transition"
            >
              <FiBell size={20} />
            </button>
            {isNotificationOpen && (
              <div className="absolute top-12 right-0 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700">
                <div className="p-3 border-b dark:border-slate-700">
                  <h4 className="font-semibold text-gray-800 dark:text-white">Thông báo</h4>
                </div>
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <p>Không có thông báo mới.</p>
                </div>
              </div>
            )}
          </div>

          {/* Nút Cài Đặt (Bánh răng) */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={handleSettingsClick}
              className="w-9 h-9 rounded-lg bg-[#1c2541] flex items-center justify-center hover:bg-[#3a506b] transition"
            >
              <FiSettings size={20} />
            </button>

            {/* Dropdown Cài Đặt */}
            {isSettingsOpen && (
              <div className="absolute top-12 right-0 w-52 bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 py-2">
                
                {/* === 🎯 THAY ĐỔI QUAN TRỌNG === */}
                <NavLink
                  to="/admin/change-password" // <-- ĐÃ SỬA
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  onClick={() => setIsSettingsOpen(false)} 
                >
                  <FiLock size={16} />
                  <span>Đổi mật khẩu</span>
                </NavLink>

                {/* Nút Đăng xuất */}
                <button
                  onClick={() => {
                    logout();
                    setIsSettingsOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <FiLogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 relative">
        {/* Sidebar (Giữ nguyên) */}
        <aside
          className={`fixed md:static top-14 md:top-0 left-0 bg-white dark:bg-slate-900 
                     border-r dark:border-slate-800 shadow-md w-64 h-[calc(100%-56px)] md:h-auto 
                     transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-64"} 
                     transition-transform duration-300 ease-in-out z-20`}
        >
          {/* (Nội dung Sidebar giữ nguyên... ) */}
          <div className="flex flex-col items-center py-5 border-b border-gray-100 dark:border-slate-800">
            <div className="text-center">
              <p className="font-semibold text-gray-700 dark:text-gray-100 text-base">
                MeetFlow Admin
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Quản lý cuộc họp
              </p>
            </div>
          </div>
          <nav className="mt-3 px-2">
            {adminMenu.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl mb-1 text-[15px] transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500 shadow-sm dark:bg-slate-800 dark:text-blue-300"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                  }`
                }
              >
                {m.icon}
                <span>{m.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto px-5 py-4 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Phiên bản 1.0</span>
              <ThemeToggle />
            </div>
          </div>
        </aside>
        
        {/* Overlay cho mobile (Giữ nguyên) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 md:hidden z-10"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Main content */}
        <div className="flex-1">
          {/* BỎ: <Navbar /> */} {/* <-- ĐÃ XÓA NAVABR BỊ TRÙNG */}
          <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}