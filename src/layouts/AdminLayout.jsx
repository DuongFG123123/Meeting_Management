// src/layouts/AdminLayout.jsx
import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom"; // <-- THÊM useNavigate
import { useAuth } from "../context/AuthContext";
// --- Service mới ---
import * as notificationService from '../services/notificationService'; 
import {
  FiMenu, FiUsers, FiBarChart2, FiBriefcase, FiBell, FiSettings,
  FiLock, FiLogOut, FiCheckSquare, FiLoader, FiInbox
} from "react-icons/fi";
import { BsCalendar4Week } from "react-icons/bs";
import { HiOutlineDeviceMobile } from "react-icons/hi";
import ThemeToggle from "../components/ThemeToggle";
// (Bỏ import Navbar cũ nếu còn)

const adminMenu = [
  // (menu của bạn giữ nguyên)
  { to: "/admin", label: "Dashboard", icon: <BsCalendar4Week size={18} /> },
  { to: "/admin/users", label: "Quản lý người dùng", icon: <FiUsers size={18} /> },
  { to: "/admin/rooms", label: "Quản lý phòng họp", icon: <FiBriefcase size={18} /> },
  { to: "/admin/devices", label: "Quản lý thiết bị", icon: <HiOutlineDeviceMobile size={18} /> },
  { to: "/admin/reports", label: "Thống kê & báo cáo", icon: <FiBarChart2 size={18} /> },
];

// === COMPONENT CON CHO THÔNG BÁO (để code sạch hơn) ===
const NotificationItem = ({ notification, onMarkRead }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // 1. Đánh dấu đã đọc
    if (!notification.read) {
      onMarkRead(notification.id);
    }
    // 2. Điều hướng đến chi tiết cuộc họp (nếu có)
    if (notification.meetingId) {
      // (Bạn cần có route cho chi tiết cuộc họp, ví dụ: /user/meetings/1)
      // navigate(`/user/meetings/${notification.meetingId}`);
      console.log("Điều hướng đến meeting: ", notification.meetingId);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`p-3 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer ${notification.read ? 'opacity-60' : 'font-semibold'}`}
    >
      <p className="text-sm text-gray-800 dark:text-gray-100">{notification.message}</p>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {new Date(notification.createdAt).toLocaleString()}
      </span>
    </div>
  );
}


// === COMPONENT LAYOUT CHÍNH ===
export default function AdminLayout() {
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // --- State cho Dropdowns ---
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const notificationRef = useRef(null);
  const settingsRef = useRef(null);

  // === 🎯 STATE MỚI CHO THÔNG BÁO ===
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationPage, setNotificationPage] = useState(0); // Cho phân trang
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true);

  // === 1. HÀM TẢI SỐ LƯỢNG CHƯA ĐỌC ===
  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      // Xử lý response { "additionalProp1": 5, ... }
      // Giả định số lượng chưa đọc nằm ở giá trị đầu tiên của object
      const count = Object.values(res.data)[0] || 0; 
      setUnreadCount(count);
    } catch (error) {
      console.error("Lỗi lấy số thông báo chưa đọc:", error);
    }
  };

  // === 2. HÀM TẢI DANH SÁCH THÔNG BÁO ===
  const fetchNotifications = async (page) => {
    if (notificationLoading) return;
    setNotificationLoading(true);
    try {
      const res = await notificationService.getNotifications(page, 5); // Lấy 5 cái một
      const data = res.data; // API trả về Page<NotificationDTO>
      
      setNotifications(prev => page === 0 ? data.content : [...prev, ...data.content]);
      setHasMoreNotifications(!data.last); // 'last' = true nghĩa là đã hết trang
      setNotificationPage(page);

    } catch (error) {
      console.error("Lỗi lấy danh sách thông báo:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  // === 3. HÀM ĐÁNH DẤU ĐÃ ĐỌC (1 CÁI) ===
  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      // Cập nhật UI:
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      // Tải lại số lượng chưa đọc
      fetchUnreadCount();
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  };

  // === 4. HÀM ĐÁNH DẤU ĐÃ ĐỌC (TẤT CẢ) ===
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Cập nhật UI:
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0); // Set về 0 luôn
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", error);
    }
  };


  // --- Xử lý click-outside (giữ nguyên) ---
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

  // --- Tải số lượng chưa đọc KHI VÀO TRANG ---
  useEffect(() => {
    fetchUnreadCount();
    
    // (Tùy chọn): Tự động cập nhật số lượng sau mỗi 1 phút
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);


  // --- Xử lý click Dropdown ---
  const handleNotificationClick = () => {
    const opening = !isNotificationOpen;
    setIsNotificationOpen(opening);
    setIsSettingsOpen(false);
    
    // Nếu vừa MỞ dropdown, tải trang đầu tiên
    if (opening) {
      setNotificationPage(0); // Reset về trang 0
      fetchNotifications(0); // Tải 5 thông báo đầu tiên
    }
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen((prev) => !prev);
    setIsNotificationOpen(false);
  };


  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="h-14 bg-[#0b132b] text-white dark:bg-slate-900 flex items-center justify-between px-5 shadow-md transition-colors z-30 relative">
        {/* (Phần trái header giữ nguyên) */}
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

        {/* --- HEADER BÊN PHẢI (ĐÃ CẬP NHẬT CHUÔNG) --- */}
        <div className="flex items-center gap-3">
          <span className="text-sm bg-blue-500 px-3 py-1 rounded-full shadow-md hidden sm:block">
            {user?.username || "Admin"}
          </span>

          {/* === NÚT CHUÔNG (ĐÃ CẬP NHẬT) === */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={handleNotificationClick}
              className="w-9 h-9 rounded-lg bg-[#1c2541] flex items-center justify-center hover:bg-[#3a506b] transition relative" // Thêm 'relative'
            >
              <FiBell size={20} />
              {/* Badge số lượng chưa đọc */}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center border-2 border-[#0b132b] transform translate-x-1/3 -translate-y-1/3">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* === DROPDOWN THÔNG BÁO (ĐÃ CẬP NHẬT) === */}
            {isNotificationOpen && (
              <div className="absolute top-12 right-0 w-80 max-h-[70vh] flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700">
                
                {/* Header của Dropdown */}
                <div className="p-3 border-b dark:border-slate-700 flex justify-between items-center">
                  <h4 className="font-semibold text-gray-800 dark:text-white">Thông báo</h4>
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-500 hover:underline disabled:opacity-50"
                    disabled={notifications.every(n => n.read) || notificationLoading}
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                </div>

                {/* Danh sách thông báo (có thể cuộn) */}
                <div className="flex-1 overflow-y-auto">
                  {notificationLoading && notifications.length === 0 && (
                    <div className="p-10 flex justify-center items-center">
                      <FiLoader className="animate-spin text-gray-500" size={24} />
                    </div>
                  )}

                  {!notificationLoading && notifications.length === 0 && (
                    <div className="p-10 flex flex-col justify-center items-center text-center text-gray-500 dark:text-gray-400">
                      <FiInbox size={30} />
                      <p className="mt-2 text-sm">Không có thông báo mới.</p>
                    </div>
                  )}

                  {notifications.length > 0 && notifications.map((noti) => (
                    <NotificationItem 
                      key={noti.id} 
                      notification={noti} 
                      onMarkRead={handleMarkAsRead} 
                    />
                  ))}
                </div>

                {/* Footer (Nút Xem thêm) */}
                {hasMoreNotifications && (
                  <div className="p-2 border-t dark:border-slate-700 text-center">
                    <button 
                      onClick={() => fetchNotifications(notificationPage + 1)}
                      disabled={notificationLoading}
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {notificationLoading ? 'Đang tải...' : 'Xem thêm'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* === KẾT THÚC PHẦN CHUÔNG === */}

          {/* Nút Cài Đặt (Bánh răng) - (Giữ nguyên) */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={handleSettingsClick}
              className="w-9 h-9 rounded-lg bg-[#1c2541] flex items-center justify-center hover:bg-[#3a506b] transition"
            >
              <FiSettings size={20} />
            </button>
            {isSettingsOpen && (
              <div className="absolute top-12 right-0 w-52 bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 py-2">
                <NavLink
                  to="/admin/change-password"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  onClick={() => setIsSettingsOpen(false)} 
                >
                  <FiLock size={16} />
                  <span>Đổi mật khẩu</span>
                </NavLink>
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

      {/* Body (Giữ nguyên) */}
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

        {/* Main content (Giữ nguyên) */}
        <div className="flex-1">
          <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}