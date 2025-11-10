import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FiUsers, FiClock, FiCalendar, FiTrendingUp } from "react-icons/fi";

// === 🎯 SỬA LỖI: THÊM CÁC IMPORT CÒN THIẾU ===
import { Spin, message } from "antd"; 
import { getAllRooms } from "../../services/roomService";
import { getAllMeetings } from "../../services/reportService";
// === KẾT THÚC SỬA LỖI ===

export default function DashboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // State cho dữ liệu API
  const [calendarResources, setCalendarResources] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);

  // Theo dõi dark mode khi người dùng bật/tắt
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // CSS cho FullCalendar (giữ nguyên)
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .fc .fc-col-header-cell-cushion,
      .fc .fc-timeline-slot-cushion,
      .fc .fc-datagrid-cell-main,
      .fc .fc-resource-timeline-divider,
      .fc .fc-scrollgrid-sync-inner,
      .fc .fc-timeline-header-row-chrono th,
      .fc .fc-timeline-slot-label-cushion {
        color: #000 !important;
      }
      .fc .fc-timeline-header-row,
      .fc .fc-datagrid-header,
      .fc .fc-timeline-header {
        background-color: #ffffff !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  
  // useEffect để tải dữ liệu Lịch (đã có)
  useEffect(() => {
    const fetchCalendarData = async () => {
      setCalendarLoading(true);
      try {
        // Gọi đồng thời cả hai API
        const [roomsRes, meetingsRes] = await Promise.all([
          getAllRooms(),
          getAllMeetings() // Lấy trang đầu tiên (1000 cuộc họp)
        ]);

        // A. Xử lý Phòng (Resources)
        const resources = (roomsRes.data || []).map(room => ({
          id: room.id.toString(), // ID phải là chuỗi
          title: room.name
        }));
        setCalendarResources(resources);

        // B. Xử lý Lịch họp (Events)
        const meetings = meetingsRes.data?.content || [];
        const events = meetings.map(meeting => ({
          id: meeting.id.toString(),
          title: meeting.title,
          start: meeting.startTime, // API đã cung cấp định dạng ISO
          end: meeting.endTime,
          resourceId: meeting.room?.id?.toString(), // <-- Quan trọng: Kết nối với Phòng
          backgroundColor: meeting.status === 'CONFIRMED' ? "#3B82F6" : "#F59E0B",
          borderColor: meeting.status === 'CONFIRMED' ? "#2563EB" : "#D97706",
        }));
        setCalendarEvents(events);

      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu Dashboard:", err);
        message.error("Không thể tải dữ liệu lịch họp."); // <-- 'message' đã được import
      } finally {
        setCalendarLoading(false);
      }
    };

    fetchCalendarData();
  }, []); // Chạy 1 lần khi trang mở

  /* -------------------------------------------------------------------------- */
  /* Mock dữ liệu thống kê (Giữ nguyên)                                         */
  /* -------------------------------------------------------------------------- */
  const meetingsPerDay = [
    { name: "T2", count: 4 },
    { name: "T3", count: 6 },
    { name: "T4", count: 3 },
    { name: "T5", count: 7 },
    { name: "T6", count: 2 },
  ];

  const participantsDistribution = [
    { name: "Phòng A", value: 30 },
    { name: "Phòng B", value: 20 },
    { name: "Phòng C", value: 25 },
    { name: "Phòng D", value: 25 },
  ];

  const COLORS = ["#60A5FA", "#A78BFA", "#F472B6", "#34D399"];

  /* -------------------------------------------------------------------------- */
  /* Giao diện Dashboard tổng hợp                                               */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="p-6 space-y-6 transition-all duration-500">
      {/* 🏷️ Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Meeting Overview
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Tổng quan hệ thống cuộc họp và hoạt động
        </p>
      </div>

      {/* Cards tổng quan */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Cuộc họp hôm nay", value: "5", icon: <FiCalendar /> },
          { label: "Tổng số người tham gia", value: "24", icon: <FiUsers /> },
          { label: "Thời lượng họp trung bình", value: "1h 20m", icon: <FiClock /> },
          { label: "Tăng trưởng tuần", value: "+12%", icon: <FiTrendingUp /> },
        ].map((card, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-white dark:bg-slate-800 
                       border border-gray-100 dark:border-slate-700 
                       rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg">
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Biểu đồ nhỏ */}
      <div className="grid grid-cols-2 gap-6">
        {/* Biểu đồ số lượng họp theo ngày */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow border border-gray-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">📅 Cuộc họp theo ngày</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={meetingsPerDay}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e5e7eb"} />
              <XAxis dataKey="name" stroke={isDarkMode ? "#cbd5e1" : "#475569"} />
              <YAxis stroke={isDarkMode ? "#cbd5e1" : "#475569"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                  color: isDarkMode ? "#f8fafc" : "#1e293b",
                  borderRadius: "8px",
                  border: "none",
                }}
              />
              <Bar dataKey="count" fill={isDarkMode ? "#818cf8" : "#60A5FA"} radius={[8, 8, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ phân bổ người tham gia */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow border border-gray-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">👥 Phân bổ theo phòng họp</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={participantsDistribution} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value">
                {participantsDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                  color: isDarkMode ? "#f8fafc" : "#1e293b",
                  borderRadius: "8px",
                  border: "none",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lịch timeline */}
      <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
          🗓️ Lịch họp tổng hợp trong ngày
        </h3>
        
        {/* Thêm Spinner khi đang tải */}
        {calendarLoading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <Spin size="large" /> {/* <-- 'Spin' đã được import */}
          </div>
        ) : (
          <FullCalendar
            plugins={[resourceTimelinePlugin]}
            schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
            initialView="resourceTimelineDay"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth",
            }}
            titleFormat={{ month: "long", year: "numeric", day: "numeric" }}
            resourceAreaHeaderContent="Phòng họp"
            
            resources={calendarResources} // <-- ĐÃ SỬA
            events={calendarEvents}       // <-- ĐÃ SỬA
            
            height="auto"
            slotMinTime="06:00:00"
            slotMaxTime="20:00:00"
            nowIndicator={true}
            eventMinWidth={80}
            locale="vi"
            slotLabelFormat={{ hour: "numeric", minute: "2-digit", hour12: false }}
            resourceLabelContent={(arg) => ({
              html: `<span class='text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}'>${arg.resource.title}</span>`,
            })}
            eventContent={(arg) => ({
              html: `
                <div style="
                  background:${arg.event.backgroundColor};
                  color:white;
                  border-radius:6px;
                  padding:2px 6px;
                  font-size:12px;
                  font-weight:500;
                  overflow:hidden;
                  white-space:nowrap;
                  text-overflow:ellipsis;">
                  ${arg.event.title}
                </div>
              `,
            })}
          />
        )}
      </div>
    </div>
  );
}