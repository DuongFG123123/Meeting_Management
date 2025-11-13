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

import { Spin, message } from "antd";
import { getAllRooms } from "../../services/roomService";
import { getAllMeetings } from "../../services/reportService";

import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isoWeek from "dayjs/plugin/isoWeek";
import duration from "dayjs/plugin/duration";
import isBetween from "dayjs/plugin/isBetween";

// ===============================================
// 🎨 BẢNG MÀU CỐ ĐỊNH THEO ROOM.ID
// ===============================================
const FIXED_ROOM_COLORS = [
  "#6366F1", // Indigo 500
  "#3B82F6", // Blue 500
  "#06B6D4", // Cyan 500
  "#10B981", // Emerald 500
  "#F59E0B", // Amber 500
  "#EF4444", // Red 500
  "#8B5CF6", // Violet 500
  "#EC4899", // Pink 500
  "#14B8A6", // Teal 500
  "#F97316", // Orange 500
];

// 🎯 Màu cố định dựa theo roomId
function getColorByRoomId(roomId) {
  if (!roomId) return "#94A3B8";
  return FIXED_ROOM_COLORS[roomId % FIXED_ROOM_COLORS.length];
}
// ===============================================


// Day.js setup
dayjs.extend(isToday);
dayjs.extend(isSameOrAfter);
dayjs.extend(isoWeek);
dayjs.extend(duration);
dayjs.extend(isBetween);

const cardTemplates = [
  { label: "Cuộc họp hôm nay", value: "0", icon: <FiCalendar /> },
  { label: "Người tham gia (hôm nay)", value: "0", icon: <FiUsers /> },
  { label: "Thời lượng họp TB", value: "0", icon: <FiClock /> },
  { label: "Cuộc họp sắp tới", value: "0", icon: <FiCheckSquare /> },
];

const formatDuration = (minutes) => {
  if (isNaN(minutes) || minutes <= 0) return "0m";
  const d = dayjs.duration(minutes, "minutes");
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(d.asHours())}h ${d.minutes()}m`;
};

export default function DashboardPage() {

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [stats, setStats] = useState(cardTemplates);
  const [meetingsPerDayData, setMeetingsPerDayData] = useState([]);
  const [roomUsageData, setRoomUsageData] = useState([]);
  const [calendarResources, setCalendarResources] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const tooltipRef = useRef();
  const [roomColors, setRoomColors] = useState({});

  // Tooltip giữ nguyên
  const getEventTooltipContent = (event) => {
    const startTime = dayjs(event.start).format("HH:mm");
    const endTime = dayjs(event.end).format("HH:mm");
    const dateDisplay = dayjs(event.start).format("DD/MM/YYYY");
    const duration = dayjs(event.end).diff(dayjs(event.start), "minute");
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

  const handleEventMouseEnter = (info) => {
    handleEventMouseLeave();
    const tooltipHtml = getEventTooltipContent(info.event);
    let tooltip = document.createElement("div");
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

    function onMove(ev) { positionTooltip(ev); }
    document.addEventListener("mousemove", onMove);
    tooltip._removeMousemove = () => {
      document.removeEventListener("mousemove", onMove);
    };
  };

  const handleEventMouseLeave = () => {
    if (tooltipRef.current) {
      if (tooltipRef.current._removeMousemove) tooltipRef.current._removeMousemove();
      if (tooltipRef.current.parentNode) tooltipRef.current.parentNode.removeChild(tooltipRef.current);
      tooltipRef.current = null;
    }
  };

  // Dark mode detect
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Calendar CSS giữ nguyên
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

  // =====================================================
  // FETCH DATA — including fixed colors
  // =====================================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {

        const [roomsRes, meetingsRes] = await Promise.all([
          getAllRooms(),
          getAllMeetings()
        ]);

        // ======= ROOM COLORS (CỐ ĐỊNH THEO ROOM ID) =======
        const roomColorMap = {};
        const resources = (roomsRes.data || []).map((room) => {
          roomColorMap[room.id] = getColorByRoomId(room.id);
          return { id: room.id.toString(), title: room.name };
        });

        setCalendarResources(resources);
        setRoomColors(roomColorMap);

        // ======= MEETINGS =======
        const meetings = Array.isArray(meetingsRes.data)
          ? meetingsRes.data
          : meetingsRes.data?.content || [];

        const events = meetings.map(m => {
          const color = roomColorMap[m.room?.id] || getColorByRoomId(m.room?.id);
          return {
            id: m.id.toString(),
            title: `${m.title} - ${m.room?.name || "Không rõ phòng"}`,
            start: m.startTime,
            end: m.endTime,
            resourceId: m.room?.id?.toString(),
            backgroundColor: color,
            borderColor: color,
            textColor: "#fff",
          };
        });

        setCalendarEvents(events);

        // ======= Stats =======
        const now = dayjs();
        const activeMeetings = meetings.filter(m => m.status === "CONFIRMED");

        const meetingsToday = activeMeetings.filter(m =>
          dayjs(m.startTime).isToday()
        );

        const participantsToday = meetingsToday.reduce(
          (acc, m) => acc + (m.participants?.filter(p => p.status === "ACCEPTED").length || 0),
          0
        );

        const totalDuration = activeMeetings.reduce(
          (acc, m) => acc + dayjs(m.endTime).diff(dayjs(m.startTime), "minute"),
          0
        );

        const avgDurationMinutes =
          activeMeetings.length ? totalDuration / activeMeetings.length : 0;

        const upcomingMeetings = activeMeetings.filter(m =>
          dayjs(m.startTime).isSameOrAfter(now)
        ).length;

        setStats([
          { ...cardTemplates[0], value: meetingsToday.length.toString() },
          { ...cardTemplates[1], value: participantsToday.toString() },
          { ...cardTemplates[2], value: formatDuration(avgDurationMinutes) },
          { ...cardTemplates[3], value: upcomingMeetings.toString() },
        ]);

        // ======= Bar chart =======
        const weekDays = [
          { name: "T2", count: 0 },
          { name: "T3", count: 0 },
          { name: "T4", count: 0 },
          { name: "T5", count: 0 },
          { name: "T6", count: 0 },
        ];

        const startOfWeek = now.startOf("isoWeek");
        const endOfWeek = now.endOf("isoWeek");

        activeMeetings
          .filter(m => dayjs(m.startTime).isBetween(startOfWeek, endOfWeek))
          .forEach(m => {
            const idx = dayjs(m.startTime).isoWeekday() - 1;
            if (idx >= 0 && idx < 5) weekDays[idx].count++;
          });

        setMeetingsPerDayData(weekDays);

        // ======= Pie chart =======
        const roomUsage = {};
        activeMeetings.forEach(m => {
          const name = m.room?.name || "Không có phòng";
          roomUsage[name] = (roomUsage[name] || 0) + 1;
        });

        const pieData = Object.keys(roomUsage).map(name => {
          const room = (roomsRes.data || []).find(r => r.name === name);
          return {
            name,
            value: roomUsage[name],
            roomId: room?.id,
          };
        });

        setRoomUsageData(pieData);

      } catch (err) {
        console.error("❌ Lỗi tải dashboard:", err);
        message.error("Không thể tải dữ liệu dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // =====================================================
  // UI Render
  // =====================================================
  return (
    <div className="p-6 space-y-6 transition-all duration-500">

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Meeting Overview
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Tổng quan hệ thống cuộc họp và hoạt động
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[70vh]">
          <Spin size="large" />
        </div>
      ) : (
        <>

          {/* ----------- CARDS ----------- */}
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
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {card.value}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* ----------- CHARTS ----------- */}
          <div className="grid grid-cols-2 gap-6">

            {/* Bar Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow border border-gray-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                📅 Cuộc họp (Tuần này)
              </h3>

              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={meetingsPerDayData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}
                    stroke={isDarkMode ? "#334155" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={isDarkMode ? "#cbd5e1" : "#475569"} />
                  <YAxis stroke={isDarkMode ? "#cbd5e1" : "#475569"} />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                      color: isDarkMode ? "#f8fafc" : "#1e293b",
                      borderRadius: "8px",
                      border: "none"
                    }}
                  />

                  <Bar dataKey="count"
                    fill={isDarkMode ? "#818cf8" : "#60A5FA"}
                    radius={[8, 8, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow border border-gray-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                👥 Phân bổ theo phòng họp
              </h3>

              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={roomUsageData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                    {roomUsageData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={roomColors[entry.roomId] || getColorByRoomId(entry.roomId)}
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
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* ----------- CALENDAR ----------- */}
          <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              🗓️ Lịch họp tổng hợp trong ngày
            </h3>

            <FullCalendar
              key={calendarEvents.length}
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
              nowIndicator
              locale="vi"
              eventMouseEnter={handleEventMouseEnter}
              eventMouseLeave={handleEventMouseLeave}
              
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
                  slotLabelFormat: [{ day: "numeric" }]
                }
              }}
            />
          </div>

        </>
      )}
    </div>
  );
}
