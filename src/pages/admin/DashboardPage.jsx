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
import isToday from 'dayjs/plugin/isToday';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isoWeek from 'dayjs/plugin/isoWeek';
import duration from 'dayjs/plugin/duration';
import isBetween from 'dayjs/plugin/isBetween';

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

const COLORS = ["#60A5FA", "#A78BFA", "#F472B6", "#34D399", "#FBBF24"];

const formatDuration = (minutes) => {
  if (!minutes || isNaN(minutes) || minutes <= 0) return "0m";
  const d = dayjs.duration(minutes, "minutes");
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(d.asHours())}h ${d.minutes()}m`;
};

const roundToTwo = (num) => {
  if (!num || isNaN(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
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
  const [activeMeetingsState, setActiveMeetingsState] = useState([]); // Lưu active meetings
  const tooltipRef = useRef();

  // === STATE CHO MODAL CUỘC HỌP HÔM NAY ===
  const [todayMeetingsModalVisible, setTodayMeetingsModalVisible] = useState(false);
  const [todayMeetingsList, setTodayMeetingsList] = useState([]);

  // === 3. HÀM MỞ MODAL ===
  const handleTodayMeetingsClick = () => {
    const meetingsToday = activeMeetingsState.filter(m => dayjs(m.startTime).isToday());
    setTodayMeetingsList(meetingsToday);
    setTodayMeetingsModalVisible(true);
  };

  // === 4. TOOLTIP ===
  const getEventTooltipContent = (event) => {
    const startTime = dayjs(event.start).format('HH:mm');
    const endTime = dayjs(event.end).format('HH:mm');
    const dateDisplay = dayjs(event.start).format('DD/MM/YYYY');
    const durationMins = dayjs(event.end).diff(dayjs(event.start), 'minute');
    return `
      <div style="line-height: 1.6; min-width: 220px;">
        <div style="font-weight: 600; margin-bottom: 6px; font-size: 14px;">${event.title}</div>
        <div style="font-size: 12px; opacity: 0.9; margin-bottom: 3px;">
          <strong>Ngày:</strong> ${dateDisplay}
        </div>
        <div style="font-size: 12px; opacity: 0.9; margin-bottom: 3px;">
          <strong>Thời gian:</strong> ${startTime} - ${endTime} (${durationMins}m)
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
    tooltip.style.background = info.event.backgroundColor; // lấy màu event
    tooltip.style.color = "#fff"; // chữ trắng cho dễ đọc
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

  // === 5. DARK MODE OBSERVER ===
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // === 6. CSS FULLCALENDAR ===
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

  // === 7. FETCH DATA DASHBOARD ===
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [roomsRes, meetingsRes] = await Promise.all([
          getAllRooms(),
          getAllMeetings()
        ]);

        const resources = (roomsRes.data || []).map(room => ({
          id: room.id.toString(),
          title: room.name
        }));
        setCalendarResources(resources);
        // Gán màu cho từng phòng họp theo thứ tự COLORS
const roomColors = {};
resources.forEach((res, index) => {
  roomColors[res.id] = COLORS[index % COLORS.length];
});
        
        const meetings = meetingsRes.data?.content || [];
        const events = meetings.map(meeting => ({
          id: meeting.id.toString(),
          title: meeting.title,
          start: meeting.startTime,
          end: meeting.endTime,
          resourceId: meeting.room?.id?.toString(),
          backgroundColor: roomColors[meeting.room?.id?.toString()] || "#60A5FA",
          borderColor: roomColors[meeting.room?.id?.toString()] || "#2563EB",
          extendedProps: {
            organizer: meeting.organizer?.fullName || "Không rõ",
            roomName: meeting.room?.name || "Không có phòng",
            location: meeting.room?.location || "Không có địa điểm"
          }
        }));
        setCalendarEvents(events);

        const now = dayjs();
        const activeMeetings = meetings.filter(m => m.status === 'CONFIRMED');
        setActiveMeetingsState(activeMeetings);

        const meetingsToday = activeMeetings.filter(m => dayjs(m.startTime).isToday());
        const participantsToday = meetingsToday.reduce((acc, m) => {
          const acceptedCount = m.participants?.filter(p => p.status === 'ACCEPTED').length || 0;
          return acc + acceptedCount;
        }, 0);
        const totalDuration = activeMeetings.reduce((acc, m) => {
          return acc + dayjs(m.endTime).diff(dayjs(m.startTime), 'minute');
        }, 0);
        const avgDuration = activeMeetings.length > 0 ? roundToTwo(totalDuration / activeMeetings.length) : 0;
        const upcomingMeetings = activeMeetings.filter(m => dayjs(m.startTime).isSameOrAfter(now)).length;

        setStats([
          { ...cardTemplates[0], value: meetingsToday.length.toString() },
          { ...cardTemplates[1], value: participantsToday.toString() },
          { ...cardTemplates[2], value: formatDuration(avgDuration) },
          { ...cardTemplates[3], value: upcomingMeetings.toString() },
        ]);

        // Bar Chart
        const weekDays = [{ name: "T2", count: 0 }, { name: "T3", count: 0 }, { name: "T4", count: 0 }, { name: "T5", count: 0 }, { name: "T6", count: 0 }];
        const startOfWeek = now.startOf('isoWeek');
        const endOfWeek = now.endOf('isoWeek');
        activeMeetings
          .filter(m => dayjs(m.startTime).isBetween(startOfWeek, endOfWeek))
          .forEach(m => {
            const dayIndex = dayjs(m.startTime).isoWeekday() - 1;
            if (dayIndex >= 0 && dayIndex < 5) weekDays[dayIndex].count++;
          });
        setMeetingsPerDayData(weekDays);

        // Pie Chart
        const roomUsage = {};
        activeMeetings.forEach(m => {
          const roomName = m.room?.name || "Không có phòng";
          roomUsage[roomName] = (roomUsage[roomName] || 0) + 1;
        });
        const pieData = Object.keys(roomUsage).map(name => ({ name, value: roomUsage[name] }));
        setRoomUsageData(pieData);

      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu Dashboard:", err);
        message.error("Không thể tải dữ liệu dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // === 8. RENDER DASHBOARD ===
  return (
  <div className="p-6 space-y-6 transition-all duration-500">
    {/* Header */}
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Meeting Overview</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm">Tổng quan hệ thống cuộc họp và hoạt động</p>
    </div>

    {loading ? (
      <div className="flex justify-center items-center h-[70vh]">
        <Spin size="large" />
      </div>
    ) : (
      <>
        {/* Cards */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((card, i) => (
            <div
              key={i}
              onClick={card.label === "Cuộc họp hôm nay" ? handleTodayMeetingsClick : undefined}
              className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
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

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow border border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">📅 Cuộc họp (Tuần này)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={meetingsPerDayData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e5e7eb"} />
                <XAxis dataKey="name" stroke={isDarkMode ? "#cbd5e1" : "#475569"} />
                <YAxis stroke={isDarkMode ? "#cbd5e1" : "#475569"} />
                <Tooltip contentStyle={{
                  backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                  color: isDarkMode ? "#f8fafc" : "#1e293b",
                  borderRadius: "8px",
                  border: "none"
                }} />
                <Bar dataKey="count" fill={isDarkMode ? "#818cf8" : "#60A5FA"} radius={[8, 8, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow border border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">👥 Phân bổ theo phòng họp</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={roomUsageData} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value">
                  {roomUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                    color: isDarkMode ? "#f8fafc" : "#1e293b",
                    borderRadius: "8px",
                    border: "none"
                  }}
                  formatter={(value) => {
                    const total = roomUsageData.reduce((acc, entry) => acc + entry.value, 0);
                    const percent = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
                    return `${value} (${percent}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FullCalendar */}
        <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">🗓️ Lịch họp tổng hợp trong ngày</h3>
          <FullCalendar
            plugins={[resourceTimelinePlugin]}
            schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
            initialView="resourceTimelineDay"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth"
            }}
            titleFormat={{ month: "long", year: "numeric", day: "numeric" }}
            resourceAreaHeaderContent="Phòng họp"
            resources={calendarResources}
            events={calendarEvents}
            height="auto"
            slotMinTime="06:00:00"
            slotMaxTime="20:00:00"
            nowIndicator
            eventMinWidth={80}
            locale="vi"
            slotLabelFormat={{ hour: "numeric", minute: "2-digit", hour12: false }}
            eventMouseEnter={handleEventMouseEnter}
            eventMouseLeave={handleEventMouseLeave}
            resourceLabelContent={(arg) => (
              <span className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                {arg.resource.title}
              </span>
            )}
            eventContent={(arg) => (
              <div style={{
                background: arg.event.backgroundColor,
                color: "white",
                borderRadius: 6,
                padding: "2px 6px",
                fontSize: 12,
                fontWeight: 500,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis"
              }}>
                {arg.event.title}
              </div>
            )}
            views={{
              resourceTimelineDay: { slotDuration: { hours: 1 }, slotLabelFormat: [{ hour: "2-digit", minute: "2-digit", hour12: false }] },
              resourceTimelineWeek: { slotDuration: { days: 1 }, slotLabelFormat: [{ weekday: "short", day: "numeric" }] },
              resourceTimelineMonth: { slotDuration: { days: 1 }, slotLabelFormat: [{ day: "numeric" }] },
            }}
          />
        </div>

        {/* Modal cuộc họp hôm nay */}
        {todayMeetingsModalVisible && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setTodayMeetingsModalVisible(false)} // click background
          >
            <div
              className="bg-white dark:bg-slate-800 p-6 rounded-xl max-w-xl w-full space-y-4"
              onClick={(e) => e.stopPropagation()} // ngăn click vào modal bị bubble ra background
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">📋 Cuộc họp hôm nay</h3>
              <div className="max-h-96 overflow-y-auto space-y-4">
                {todayMeetingsList.length > 0 ? (
                  todayMeetingsList.map(m => (
                    <div key={m.id} className="p-3 border border-gray-200 dark:border-slate-700 rounded-lg">
                      <p className="font-semibold text-gray-700 dark:text-gray-200 text-md">{m.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {dayjs(m.startTime).format("HH:mm")} - {dayjs(m.endTime).format("HH:mm")}
                      </p>

                      {m.room && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <strong>Phòng họp:</strong> {m.room?.name || "Chưa xác định"} {m.room?.location ? `(${m.room.location})` : ""}
                        </p>
                      )}

                      {m.equipment?.length > 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <strong>Thiết bị:</strong> {m.equipment.map(eq => eq.name).join(", ")}
                        </p>
                      )}

                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <strong>Người tham gia:</strong>
                        <ul className="list-disc ml-5 mt-1">
                          {m.participants && m.participants.length > 0 ? (
                            m.participants.map((p, index) => (
                              <li key={p.id || index}>
                                {p.fullName || "Chưa có tên"} - {p.status || "Chưa xác nhận"}
                              </li>
                            ))
                          ) : (
                            <li>Chưa có người tham gia</li>
                          )}
                        </ul>
                      </div>


                      {m.organizer && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <strong>Người tổ chức:</strong> {m.organizer.fullName}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Không có cuộc họp hôm nay.</p>
                )}
              </div>
              <button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setTodayMeetingsModalVisible(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </>
    )}
  </div>
);
}