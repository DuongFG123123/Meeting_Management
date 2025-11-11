// src/pages/admin/DashboardPage.jsx
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
import { 
  FiUsers, 
  FiClock, 
  FiCalendar, 
  FiCheckSquare // Đổi icon
} from "react-icons/fi";

// === 1. IMPORTS ĐẦY ĐỦ ===
import { Spin, message } from "antd"; 
import { getAllRooms } from "../../services/roomService";
import { getAllMeetings } from "../../services/reportService";
import dayjs from "dayjs";
import isToday from 'dayjs/plugin/isToday';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isoWeek from 'dayjs/plugin/isoWeek';
import duration from 'dayjs/plugin/duration';
import isBetween from 'dayjs/plugin/isBetween';

// Cài đặt Day.js
dayjs.extend(isToday);
dayjs.extend(isSameOrAfter);
dayjs.extend(isoWeek);
dayjs.extend(duration);
dayjs.extend(isBetween);
// === KẾT THÚC IMPORT ===

// Template cho các thẻ (sẽ được cập nhật)
const cardTemplates = [
  { label: "Cuộc họp hôm nay", value: "0", icon: <FiCalendar /> },
  { label: "Tổng người tham gia (hôm nay)", value: "0", icon: <FiUsers /> },
  { label: "Thời lượng họp TB", value: "0", icon: <FiClock /> },
  { label: "Cuộc họp sắp tới", value: "0", icon: <FiCheckSquare /> },
];

const COLORS = ["#60A5FA", "#A78BFA", "#F472B6", "#34D399", "#FBBF24"];

// Hàm trợ giúp format thời lượng (ví dụ: 125 -> "2h 5m")
const formatDuration = (minutes) => {
  if (isNaN(minutes) || minutes <= 0) return "0m";
  const d = dayjs.duration(minutes, 'minutes');
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(d.asHours())}h ${d.minutes()}m`;
};

export default function DashboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // === 2. STATE CHO TẤT CẢ DỮ LIỆU ===
  const [stats, setStats] = useState(cardTemplates);
  const [meetingsPerDayData, setMeetingsPerDayData] = useState([]);
  const [roomUsageData, setRoomUsageData] = useState([]);
  const [calendarResources, setCalendarResources] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true); // 1 state loading duy nhất

  // Theo dõi dark mode (giữ nguyên)
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

  // === 3. useEffect TẢI VÀ XỬ LÝ TẤT CẢ DỮ LIỆU ===
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [roomsRes, meetingsRes] = await Promise.all([
          getAllRooms(),
          getAllMeetings() // Lấy 1000 cuộc họp
        ]);

        // === A. XỬ LÝ LỊCH (Timeline) ===
        const resources = (roomsRes.data || []).map(room => ({
          id: room.id.toString(),
          title: room.name
        }));
        setCalendarResources(resources);

        const meetings = meetingsRes.data?.content || [];
        const events = meetings.map(meeting => ({
          id: meeting.id.toString(),
          title: meeting.title,
          start: meeting.startTime,
          end: meeting.endTime,
          resourceId: meeting.room?.id?.toString(),
          backgroundColor: meeting.status === 'CONFIRMED' ? "#3B82F6" : "#F59E0B",
          borderColor: meeting.status === 'CONFIRMED' ? "#2563EB" : "#D97706",
        }));
        setCalendarEvents(events);
        
        // === B. XỬ LÝ THỐNG KÊ (Cards & Charts) ===
        const now = dayjs();
        // Chỉ tính các cuộc họp đã xác nhận (không bị hủy)
        const activeMeetings = meetings.filter(m => m.status === 'CONFIRMED');

        // 1. Tính K-Cards
        const meetingsToday = activeMeetings.filter(m => dayjs(m.startTime).isToday());
        const participantsToday = meetingsToday.reduce((acc, m) => acc + (m.participants?.length || 0), 0);
        
        const totalDuration = activeMeetings.reduce((acc, m) => {
          const start = dayjs(m.startTime);
          const end = dayjs(m.endTime);
          return acc + end.diff(start, 'minute');
        }, 0);
        const avgDuration = activeMeetings.length > 0 ? (totalDuration / activeMeetings.length) : 0;
        
        const upcomingMeetings = activeMeetings.filter(m => dayjs(m.startTime).isSameOrAfter(now)).length;

        setStats([
          { ...cardTemplates[0], value: meetingsToday.length.toString() },
          { ...cardTemplates[1], value: participantsToday.toString() },
          { ...cardTemplates[2], value: formatDuration(avgDuration) },
          { ...cardTemplates[3], value: upcomingMeetings.toString() },
        ]);

        // 2. Tính Bar Chart (Cuộc họp theo T2-T6 tuần này)
        const weekDays = [
          { name: "T2", count: 0 }, { name: "T3", count: 0 },
          { name: "T4", count: 0 }, { name: "T5", count: 0 },
          { name: "T6", count: 0 }
        ];
        const startOfWeek = now.startOf('isoWeek'); // Bắt đầu từ T2
        const endOfWeek = now.endOf('isoWeek');     // Kết thúc ở CN
        
        activeMeetings
          .filter(m => dayjs(m.startTime).isBetween(startOfWeek, endOfWeek))
          .forEach(m => {
            const dayIndex = dayjs(m.startTime).isoWeekday() - 1; // 1(T2) -> 0
            if (dayIndex >= 0 && dayIndex < 5) { // Chỉ lấy T2-T6
              weekDays[dayIndex].count++;
            }
          });
        setMeetingsPerDayData(weekDays);

        // 3. Tính Pie Chart (Phân bổ theo phòng)
        const roomUsage = {};
        activeMeetings.forEach(m => {
          const roomName = m.room?.name || "Không có phòng";
          roomUsage[roomName] = (roomUsage[roomName] || 0) + 1;
        });
        const pieData = Object.keys(roomUsage).map(name => ({
          name: name,
          value: roomUsage[name]
        }));
        setRoomUsageData(pieData);

      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu Dashboard:", err);
        message.error("Không thể tải dữ liệu dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Chạy 1 lần khi trang mở

  /* -------------------------------------------------------------------------- */
  /* Giao diện Dashboard (Đã cập nhật)                                           */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="p-6 space-y-6 transition-all duration-500">
      {/* 🏷️ Header (Giữ nguyên) */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Meeting Overview
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Tổng quan hệ thống cuộc họp và hoạt động
        </p>
      </div>
      
      {/* === 4. SPINNER CHO TOÀN BỘ DỮ LIỆU === */}
      {loading ? (
        <div className="flex justify-center items-center h-[70vh]">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Cards tổng quan (Dùng state) */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map((card, i) => ( // <-- DÙNG STATE
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
            {/* Biểu đồ số lượng họp theo ngày (Dùng state) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow border border-gray-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">📅 Cuộc họp (Tuần này)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={meetingsPerDayData}> {/* <-- DÙNG STATE */}
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={isDarkMode ? "#cbd5e1" : "#475569"} />
                  <YAxis stroke={isDarkMode ? "#cbd5e1" : "#475569"} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                      color: isDarkMode ? "#f8fafc" : "#1e293b",
                      borderRadius: "8px", border: "none",
                    }}
                  />
                  <Bar dataKey="count" fill={isDarkMode ? "#818cf8" : "#60A5FA"} radius={[8, 8, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Biểu đồ phân bổ theo phòng (Dùng state) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow border border-gray-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">👥 Phân bổ theo phòng họp</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={roomUsageData} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value"> {/* <-- DÙNG STATE */}
                    {roomUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                      color: isDarkMode ? "#f8fafc" : "#1e293b",
                      borderRadius: "8px", border: "none",
                    }}
                    // Hiển thị tên và %
                    formatter={(value) => {
                      const total = roomUsageData.reduce((acc, entry) => acc + entry.value, 0);
                      const percent = ((value / total) * 100).toFixed(0);
                      return `${value} (${percent}%)`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lịch timeline (Đã có dữ liệu thật) */}
          <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              🗓️ Lịch họp tổng hợp trong ngày
            </h3>
            {/* FullCalendar không nằm trong spinner chính vì nó có logic loading riêng (calendarLoading) */}
            {/* SỬA: Đã gộp chung 1 loading state */}
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
              resources={calendarResources}
              events={calendarEvents}
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
          </div>
        </>
      )}
    </div>
  );
}