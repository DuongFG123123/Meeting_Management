// src/pages/user/UserDashboard.jsx
import { useAuth } from "../../context/AuthContext";
import { FiCalendar, FiClock, FiUsers, FiTrendingUp } from "react-icons/fi";

export default function UserDashboard() {
  const { user } = useAuth();

  // Mock data - Sau này sẽ fetch từ API
  const stats = [
    {
      title: "Lịch họp hôm nay",
      value: "3",
      icon: <FiCalendar size={24} />,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgLight: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Lịch họp tuần này",
      value: "12",
      icon: <FiClock size={24} />,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgLight: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Phòng đã đặt",
      value: "8",
      icon: <FiUsers size={24} />,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgLight: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Tỷ lệ tham dự",
      value: "95%",
      icon: <FiTrendingUp size={24} />,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgLight: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  const upcomingMeetings = [
    {
      id: 1,
      title: "Họp Kickoff Dự án X",
      time: "09:00 - 10:30",
      room: "Phòng 301",
      attendees: 8,
    },
    {
      id: 2,
      title: "Daily Standup",
      time: "14:00 - 14:30",
      room: "Phòng 102",
      attendees: 5,
    },
    {
      id: 3,
      title: "Training React Advanced",
      time: "16:00 - 17:30",
      room: "Phòng 205",
      attendees: 15,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats Cards */}
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

      {/* Upcoming Meetings */}
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
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {meeting.time} · {meeting.room}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FiUsers size={16} />
                <span>{meeting.attendees} người</span>
              </div>
            </div>
          ))}
        </div>

        {upcomingMeetings.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Không có lịch họp nào sắp tới
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="bg-blue-600 text-white rounded-xl p-6 text-left hover:bg-blue-700 transition shadow-md">
          <h3 className="font-semibold text-lg mb-2">➕ Tạo lịch họp mới</h3>
          <p className="text-sm text-blue-100">
            Đặt phòng và thiết bị cho cuộc họp
          </p>
        </button>

        <button className="bg-green-600 text-white rounded-xl p-6 text-left hover:bg-green-700 transition shadow-md">
          <h3 className="font-semibold text-lg mb-2">🏢 Xem phòng trống</h3>
          <p className="text-sm text-green-100">
            Tìm phòng họp phù hợp với nhu cầu
          </p>
        </button>
      </div>
    </div>
  );
}