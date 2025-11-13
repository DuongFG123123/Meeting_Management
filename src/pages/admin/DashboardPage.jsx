// src/pages/admin/DashboardPage.jsx
import { useEffect, useState, useRef } from "react";
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
  FiCheckSquare 
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
  { label: "Người tham gia (hôm nay)", value: "0", icon: <FiUsers /> }, // Đổi tên
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
  const [loading, setLoading] = useState(true);
  const tooltipRef = useRef(); // (Cho tooltip)
  const [roomColors, setRoomColors] = useState({});

// Hàm tạo nội dung tooltip (Giữ nguyên)
  const getEventTooltipContent = (event) => {
  // ... (code tooltip của bạn giữ nguyên)
  const startTime = dayjs(event.start).format('HH:mm');
  const endTime = dayjs(event.end).format('HH:mm');
  const dateDisplay = dayjs(event.start).format('DD/MM/YYYY');
  const duration = dayjs(event.end).diff(dayjs(event.start), 'minute');
  
  return `
    <div style="line-height: 1.6; min-width: 220px;">
      <div style="font-weight: 600; margin-bottom: 6px; font-size: 14px;">${event.title}</div>
      <div style="font-size: 12px; opacity: 0.9; margin-bottom: 3px;">
        <strong>Ngày:</strong> ${dateDisplay}
      </div>
      <div style="font-size: 12px; opacity: 0.9; margin-bottom: 3px;">
        <strong>Thời gian:</strong> ${startTime} - ${endTime} (${duration}m)
      </div>
    </div>
  `;
};

// Tooltip handlers (Giữ nguyên)
const handleEventMouseEnter = (info) => {
  handleEventMouseLeave();

  const tooltipHtml = getEventTooltipContent(info.event);
  let tooltip = document.createElement("div");
  // ... (toàn bộ code style của tooltip)
  tooltip.innerHTML = tooltipHtml;
  tooltip.style.position = "absolute";
  tooltip.style.zIndex = 9999;
  tooltip.style.background = "#222";
  tooltip.style.color = "#fff";
  tooltip.style.padding = "8px 14px";
  tooltip.style.borderRadius = "8px";
  tooltip.style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)";
  tooltip.style.fontSize = "13px";
  tooltip.style.pointerEvents = "none";
  tooltip.style.transition = "opacity 0.15s";
  tooltip.style.opacity = "0.93";
  if (document.documentElement.classList.contains("dark")) {
    tooltip.style.background = "#334155";
    tooltip.style.color = "#e0eafb";
  }
  document.body.appendChild(tooltip);
  tooltipRef.current = tooltip;

  const mouse = info.jsEvent;
  function positionTooltip(e) {
    tooltip.style.left = e.pageX + 16 + "px";
    tooltip.style.top = e.pageY + 9 + "px";
  }
  positionTooltip(mouse);

  function onMove(ev) {
    positionTooltip(ev);
  }
  document.addEventListener('mousemove', onMove);
  tooltip._removeMousemove = () => {
    document.removeEventListener('mousemove', onMove);
  };
};

const handleEventMouseLeave = () => {
  if (tooltipRef.current) {
    if (tooltipRef.current._removeMousemove) tooltipRef.current._removeMousemove();
    if (tooltipRef.current.parentNode) tooltipRef.current.parentNode.removeChild(tooltipRef.current);
    tooltipRef.current = null;
  }
};

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
    // ... (code CSS của bạn giữ nguyên)
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
  // === 3. useEffect TẢI VÀ XỬ LÝ TẤT CẢ DỮ LIỆU (ĐÃ SỬA) ===
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [roomsRes, meetingsRes] = await Promise.all([
          getAllRooms(),
          getAllMeetings() // Lấy 1000 cuộc họp
        ]);

        // === A. XỬ LÝ LỊCH (Timeline) ===
const roomColorMap = {};
const resources = (roomsRes.data || []).map(room => {
  roomColorMap[room.id] = roomColors[room.id] || getRandomColor();
  return {
    id: room.id.toString(),
    title: room.name,
  };
});
setCalendarResources(resources);
setRoomColors(roomColorMap);

// ✅ Lấy dữ liệu cuộc họp (có thể là mảng hoặc object.content)
const meetings = Array.isArray(meetingsRes.data)
  ? meetingsRes.data
  : meetingsRes.data?.content || [];

// ✅ Map dữ liệu thành sự kiện
const events = meetings.map(meeting => ({
  id: meeting.id.toString(),
  title: `${meeting.title} - ${meeting.room?.name || "Không rõ phòng"}`,
  start: meeting.startTime,
  end: meeting.endTime,
  resourceId: meeting.room?.id?.toString(),
  backgroundColor: roomColorMap[meeting.room?.id] || "#94A3B8",
  borderColor: roomColorMap[meeting.room?.id] || "#94A3B8",
  textColor: "#fff",
}));
setCalendarEvents(events);
        
        // === B. XỬ LÝ THỐNG KÊ (Cards & Charts) (ĐÃ SỬA) ===
        const now = dayjs();
        // Chỉ tính các cuộc họp đã xác nhận (không bị hủy)
        const activeMeetings = meetings.filter(m => m.status === 'CONFIRMED');

        // 1. Tính K-Cards
        const meetingsToday = activeMeetings.filter(m => dayjs(m.startTime).isToday());
        
        // 🎯 SỬA LỖI: Chỉ đếm người 'ACCEPTED'
        const participantsToday = meetingsToday.reduce((acc, m) => {
          const acceptedCount = m.participants?.filter(p => p.status === 'ACCEPTED').length || 0;
          return acc + acceptedCount;
        }, 0);
        
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

        // 2. Tính Bar Chart (Giữ nguyên, vì chỉ đếm số cuộc họp)
        const weekDays = [
          { name: "T2", count: 0 }, { name: "T3", count: 0 },
          { name: "T4", count: 0 }, { name: "T5", count: 0 },
          { name: "T6", count: 0 }
        ];
        const startOfWeek = now.startOf('isoWeek');
        const endOfWeek = now.endOf('isoWeek');
        
        activeMeetings
          .filter(m => dayjs(m.startTime).isBetween(startOfWeek, endOfWeek))
          .forEach(m => {
            const dayIndex = dayjs(m.startTime).isoWeekday() - 1;
            if (dayIndex >= 0 && dayIndex < 5) {
              weekDays[dayIndex].count++;
            }
          });
        setMeetingsPerDayData(weekDays);

        // 3. Tính Pie Chart (Giữ nguyên, vì chỉ đếm số cuộc họp)
        const roomUsage = {};
        activeMeetings.forEach(m => {
          const roomName = m.room?.name || "Không có phòng";
          roomUsage[roomName] = (roomUsage[roomName] || 0) + 1;
        });
        const pieData = Object.keys(roomUsage).map(name => {
        const room = (roomsRes.data || []).find(r => r.name === name);
        return {
          name,
          value: roomUsage[name],
          roomId: room?.id, // thêm ID để tiện dùng màu
        };
      });
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
            {stats.map((card, i) => ( 
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
    borderRadius: "8px",
    border: "none",
  }}
  itemStyle={{
    color: isDarkMode ? "#f8fafc" : "#1e293b", // Đồng bộ màu chữ tooltip
  }}
  formatter={(value) => {
    const total = roomUsageData.reduce((acc, entry) => acc + entry.value, 0);
    const percent = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
    return `${value} (${percent}%)`;
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
                  <Pie data={roomUsageData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
  {roomUsageData.map((entry, index) => (
    <Cell 
      key={`cell-${index}`} 
      fill={roomColors[entry.roomId] || COLORS[index % COLORS.length]} 
    />
  ))}
</Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                      color: isDarkMode ? "#f8fafc" : "#1e293b",
                      borderRadius: "8px",
                      border: "none",
                    }}
                    itemStyle={{
                      color: isDarkMode ? "#f8fafc" : "#1e293b",
                    }}
                    formatter={(value, name) => {
                      const total = roomUsageData.reduce((acc, entry) => acc + entry.value, 0);
                      const percent = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
                      return [`${value} (${percent}%)`, name];
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
            
            <FullCalendar
              key={calendarEvents.length} // ép render lại mỗi khi đổi dữ liệu
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
              eventMouseEnter={handleEventMouseEnter} 
              eventMouseLeave={handleEventMouseLeave}
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
              /* Bổ sung phần này để fix hiển thị 0:00 ở chế độ month */
              views={{
                resourceTimelineDay: {
                  slotDuration: { hours: 1 },
                  slotLabelFormat: [{ hour: "2-digit", minute: "2-digit", hour12: false }],
                },
                resourceTimelineWeek: {
                  slotDuration: { days: 1 },
                  slotLabelFormat: [{ weekday: "short", day: "numeric" }],
                },
                resourceTimelineMonth: {
                  slotDuration: { days: 1 },
                  slotLabelFormat: [{ day: "numeric" }], // ✅ Hiển thị ngày 1, 2, 3, ...
                },
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}