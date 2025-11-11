// src/pages/user/UserDashboard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FiCalendar, FiClock, FiUsers, FiCheckSquare } from "react-icons/fi"; // <-- Đã đổi icon
import { useNavigate } from "react-router-dom";
import { Spin, message } from "antd"; // <-- THÊM
import { getMyMeetings } from "../../services/meetingService"; // <-- THÊM
import dayjs from "dayjs"; // <-- THÊM
import "dayjs/locale/vi";
import isToday from 'dayjs/plugin/isToday'; // <-- THÊM plugin
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'; // <-- THÊM plugin
import isoWeek from 'dayjs/plugin/isoWeek'; // <-- THÊM plugin

// Cài đặt Day.js
dayjs.locale("vi");
dayjs.extend(isToday);
dayjs.extend(isSameOrAfter);
dayjs.extend(isoWeek);

// === 1. TẠO TEMPLATE CHO THẺ STATS (ĐÃ SỬA) ===
// Chúng ta sẽ cập nhật 'value' sau khi gọi API
const statTemplates = [
  {
    title: "Lịch họp hôm nay",
    value: "0",
    icon: <FiCalendar size={24} />,
    textColor: "text-blue-600",
    bgLight: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "Lịch họp tuần này",
    value: "0",
    icon: <FiClock size={24} />,
    textColor: "text-green-600",
    bgLight: "bg-green-50 dark:bg-green-900/20",
  },
  {
    title: "Cuộc họp sắp tới",
    value: "0",
    icon: <FiUsers size={24} />, // (Giữ icon, đổi tiêu đề)
    textColor: "text-purple-600",
    bgLight: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    title: "Tổng số cuộc họp", // (Đổi từ 'Tỷ lệ tham dự')
    value: "0",
    icon: <FiCheckSquare size={24} />, // (Đổi icon)
    textColor: "text-orange-600",
    bgLight: "bg-orange-50 dark:bg-orange-900/20",
  },
];


export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // === 2. THÊM STATE MỚI ===
  const [stats, setStats] = useState(statTemplates);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  // === 3. GỌI API KHI MỞ TRANG ===
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Gọi API lấy 100 cuộc họp gần nhất
        const res = await getMyMeetings(0, 100);
        const allMeetings = res.data?.content || [];
        const now = dayjs();

        // Lọc các cuộc họp chưa bị hủy
        const activeMeetings = allMeetings.filter(m => m.status !== 'CANCELLED');

        // --- A. Xử lý Lịch họp sắp tới ---
        const upcoming = activeMeetings
          .filter(m => dayjs(m.startTime).isSameOrAfter(now))
          .sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf()); // Sắp xếp
        
        // Chỉ lấy 3 cuộc họp sắp tới gần nhất
        setUpcomingMeetings(upcoming.slice(0, 3)); 

        // --- B. Xử lý Thống kê ---
        const meetingsToday = activeMeetings.filter(m => 
          dayjs(m.startTime).isToday()
        ).length;
        
        const meetingsThisWeek = activeMeetings.filter(m => 
          dayjs(m.startTime).isSame(now, 'week')
        ).length;

        const totalUpcoming = upcoming.length;
        const totalActive = activeMeetings.length;

        // Cập nhật state của stats
        setStats([
          { ...statTemplates[0], value: meetingsToday.toString() },
          { ...statTemplates[1], value: meetingsThisWeek.toString() },
          { ...statTemplates[2], value: totalUpcoming.toString() },
          { ...statTemplates[3], value: totalActive.toString() },
        ]);

      } catch (err) {
        console.error("Lỗi tải dashboard:", err);
        message.error("Không thể tải dữ liệu dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Chạy 1 lần


  // Handler functions for navigation (Giữ nguyên)
  const handleCreateMeeting = () => {
    navigate("/user/create-meeting");
  };

  const handleViewRooms = () => {
    navigate("/user/rooms");
  };

  return (
    <div className="space-y-6">
      {/* Header (Giữ nguyên) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            👋 Xin chào, {user?.username || "User"}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Chào mừng bạn đến với hệ thống quản lý lịch họp
          </p>
        </div>
      </div>

      {/* === 4. WRAPPER CHO SPINNER === */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Stats Cards (Dùng state) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-slate-800 transition-transform hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold ${stat.textColor} dark:text-gray-100`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgLight} p-3 rounded-lg`}>
                    <div className={`${stat.textColor}`}>{stat.icon}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* === 5. UPCOMING MEETINGS (ĐÃ CẬP NHẬT) === */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              📅 Lịch họp sắp tới
            </h2>

            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                      {meeting.title}
                    </h3>
                    {/* SỬA: Dùng dữ liệu API và dayjs */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {dayjs(meeting.startTime).format("HH:mm")} - {dayjs(meeting.endTime).format("HH:mm")}
                       · {meeting.room?.name || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiUsers size={16} />
                    {/* SỬA: Dùng dữ liệu API */}
                    <span>{meeting.participants?.length || 0} người</span>
                  </div>
                </div>
              ))}
            </div>

            {/* SỬA: Thêm điều kiện !loading */}
            {upcomingMeetings.length === 0 && !loading && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Không có lịch họp nào sắp tới
              </p>
            )}
          </div>
        </>
      )}


      {/* Quick Actions (Giữ nguyên) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          className="bg-blue-600 text-white rounded-xl p-6 text-left hover:bg-blue-700 transition shadow-md"
          onClick={handleCreateMeeting}
        >
          <h3 className="font-semibold text-lg mb-2">➕ Tạo lịch họp mới</h3>
          <p className="text-sm text-blue-100">
            Đặt phòng và thiết bị cho cuộc họp
          </p>
        </button>

        <button
          className="bg-green-600 text-white rounded-xl p-6 text-left hover:bg-green-700 transition shadow-md"
          onClick={handleViewRooms}
        >
          <h3 className="font-semibold text-lg mb-2">🏢 Xem phòng trống</h3>
          <p className="text-sm text-green-100">
            Tìm phòng họp phù hợp với nhu cầu
          </p>
        </button>
      </div>
    </div>
  );
}