// src/pages/user/MyMeetingsPage.jsx
import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  getMyMeetings,
  getMeetingById,
  createMeeting,
  getRooms,
  getDevices,
} from "../../services/meetingService";
import { searchUsers } from "../../services/userService";
import {
  Modal,
  Spin,
  Descriptions,
  Tag,
  DatePicker,
  TimePicker,
  Select,
  Input,
  Button,
  Form,
  message,
  Card,
  Divider,
  Checkbox,
} from "antd";
import { FiCalendar, FiPlusCircle, FiUsers } from "react-icons/fi";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import utc from "dayjs/plugin/utc";
import { useAuth } from "../../context/AuthContext";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

dayjs.locale("vi");
dayjs.extend(utc);

// Helper functions để xử lý error messages
const parseErrorMessage = (error) => {
  const msg = error?.response?.data?.message || error?.message || "";
  const status = error?.response?.status;
  
  return {
    message: msg,
    status: status,
    data: error?.response?.data
  };
};

const getErrorToastConfig = (errorInfo) => {
  const { message: msg, status } = errorInfo;
  const lowerMsg = msg.toLowerCase();
  
  // Xử lý các trường hợp lỗi cụ thể
  const errorHandlers = [
    {
      condition: () => lowerMsg.includes("phòng") && (lowerMsg.includes("bảo trì") || lowerMsg.includes("maintenance")),
      toast: () => toast.error("🚫 Phòng họp đang bảo trì, vui lòng chọn phòng khác!", { autoClose: 4000 })
    },
    {
      condition: () => lowerMsg.includes("phòng") && (lowerMsg.includes("bận") || lowerMsg.includes("không khả dụng") || lowerMsg.includes("đã được đặt")),
      toast: () => toast.error("📅 Phòng họp đã có người đặt trong khung giờ này. Vui lòng chọn thời gian hoặc phòng khác!", { autoClose: 4000 })
    },
    {
      condition: () => lowerMsg.includes("thiết bị") && (lowerMsg.includes("bảo trì") || lowerMsg.includes("maintenance")),
      toast: () => toast.error("⚙️ Thiết bị đang bảo trì, vui lòng bỏ chọn hoặc chọn thiết bị khác!", { autoClose: 4000 })
    },
    {
      condition: () => lowerMsg.includes("thiết bị") && (lowerMsg.includes("bận") || lowerMsg.includes("không khả dụng") || lowerMsg.includes("đang được sử dụng")),
      toast: () => toast.error("⚙️ Thiết bị đang được sử dụng trong khung giờ này. Vui lòng chọn thiết bị khác!", { autoClose: 4000 })
    },
    {
      condition: () => lowerMsg.includes("người dùng") && lowerMsg.includes("bận"),
      toast: () => toast.warning("👥 Một hoặc nhiều người được mời đã có lịch họp trùng. Họ vẫn sẽ nhận được lời mời nhưng có thể từ chối.", { autoClose: 5000 })
    },
    {
      condition: () => lowerMsg.includes("người dùng") && (lowerMsg.includes("vô hiệu") || lowerMsg.includes("inactive") || lowerMsg.includes("không hoạt động")),
      toast: () => toast.warning("⚠️ Một hoặc nhiều người được mời có tài khoản đã bị vô hiệu hóa. Vui lòng kiểm tra lại danh sách!", { autoClose: 5000 })
    },
    {
      condition: () => lowerMsg.includes("thời gian") && (lowerMsg.includes("quá khứ") || lowerMsg.includes("past") || lowerMsg.includes("phải ở tương lai")),
      toast: () => toast.error("⏰ Thời gian họp phải là thời điểm trong tương lai!", { autoClose: 3500 })
    },
    {
      condition: () => lowerMsg.includes("thời gian") && (lowerMsg.includes("trùng") || lowerMsg.includes("conflict")),
      toast: () => toast.error("⏰ Khung giờ họp bị trùng với lịch khác. Vui lòng chọn thời gian khác!", { autoClose: 4000 })
    },
    {
      condition: () => lowerMsg.includes("quyền") || lowerMsg.includes("permission") || status === 403,
      toast: () => toast.error("🔒 Bạn không có quyền đặt phòng này hoặc tài nguyên không khả dụng!", { autoClose: 4000 })
    },
    {
      condition: () => lowerMsg.includes("email") && lowerMsg.includes("không hợp lệ"),
      toast: () => toast.error("✉️ Email khách mời không hợp lệ. Vui lòng kiểm tra lại!", { autoClose: 3500 })
    },
    {
      condition: () => status === 400,
      toast: () => toast.error(`❌ Dữ liệu không hợp lệ: ${msg}`, { autoClose: 4000 })
    },
    {
      condition: () => status === 404,
      toast: () => toast.error("❓ Không tìm thấy tài nguyên (phòng/thiết bị/người dùng)", { autoClose: 3500 })
    },
    {
      condition: () => status === 409,
      toast: () => toast.error("⚠️ Xung đột dữ liệu: " + msg, { autoClose: 4000 })
    }
  ];
  
  // Tìm handler phù hợp
  const handler = errorHandlers.find(h => h.condition());
  
  if (handler) {
    handler.toast();
  } else {
    // Fallback: hiển thị message gốc
    toast.error(msg || "❌ Không thể tạo cuộc họp. Vui lòng thử lại!", { autoClose: 3500 });
  }
};

const { TextArea } = Input;
const { Option } = Select;

// Tooltip tối giản: Tên cuộc họp, Thời gian, Địa điểm
function getEventTooltipContent(event) {
  const { title, start, end, extendedProps } = event;
  const time = `${dayjs(start).format("HH:mm")} - ${dayjs(end).format("HH:mm, DD/MM/YYYY")}`;
  const room = extendedProps?.roomName || "Chưa xác định";
  return `
    <div>
      <div><b>${title}</b></div>
      <div>Thời gian: ${time}</div>
      <div>Phòng: ${room}</div>
    </div>
  `;
}

const MyMeetingPage = () => {
  // State quản lý lịch họp
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // State modal chi tiết
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetingDetail, setMeetingDetail] = useState(null);

  // State modal đặt lịch nhanh
  const [quickBooking, setQuickBooking] = useState({ open: false, start: null, end: null });
  const [creating, setCreating] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  // State form data
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const debounceTimer = useRef(null);
  const [form] = Form.useForm();
  const { user } = useAuth();

  const tooltipRef = useRef(); // (Cho tooltip)

  // Tải danh sách phòng và thiết bị khi mở form đặt lịch
  useEffect(() => {
    if (!quickBooking.open) return;

    const fetchData = async () => {
      try {
        const [roomRes, deviceRes] = await Promise.all([getRooms(), getDevices()]);
        setRooms(roomRes.data || []);
        setDevices(deviceRes.data || []);
      } catch (e) {
        message.error("Không thể tải phòng họp/thiết bị");
      }
    };
    fetchData();
  }, [quickBooking.open]);

  // === TẢI LỊCH HỌP (ĐÃ SỬA LỖI LOGIC LỌC) ===
  const fetchMeetings = async () => {
    if (!user) return; // Đảm bảo user đã tải xong

    setLoading(true);
    try {
      const res = await getMyMeetings();
      const data = res.data?.content || [];

      const filteredData = data.filter(m => {
        // 1. Bỏ qua nếu cuộc họp bị HỦY (toàn bộ)
        if (m.status === 'CANCELLED') {
          return false;
        }
        // 2. Kiểm tra xem user có phải người tổ chức không
        const isOrganizer = m.organizer?.id === user.id;
        // 3. Tìm trạng thái của user (nếu là người tham gia)
        const userParticipant = m.participants?.find(p => p.id === user.id);
        // 4. LOGIC QUYẾT ĐỊNH:

        // NẾU TÔI LÀ NGƯỜI TỔ CHỨC:
        if (isOrganizer) {
          return true; // Luôn hiển thị
        }
        // NẾU TÔI CHỈ LÀ NGƯỜI THAM GIA:
        if (userParticipant) {
          return userParticipant.status !== 'DECLINED';
        }

        // Nếu không phải organizer và không có trong participants → Ẩn
        return false;
      });

      // Map từ dữ liệu ĐÃ LỌC
      const mappedEvents = filteredData.map((m) => ({
        id: m.id,
        title: m.title || "Cuộc họp",
        start: m.startTime,
        end: m.endTime,
        backgroundColor: m.status === 'CONFIRMED' ? "#3b82f6" : "#f59e0b",
        borderColor: m.status === 'CONFIRMED' ? "#2563eb" : "#d97706",
        extendedProps: {
          roomName: m.room?.name || "Chưa xác định",
        }
      }));
      setEvents(mappedEvents);
    } catch (err) {
      console.error("Lỗi tải lịch họp:", err);
      toast.error("Không thể tải danh sách lịch họp!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý click vào cuộc họp để xem chi tiết
  const handleEventClick = async (info) => {
    try {
      const id = info.event.id;
      setMeetingDetail(null);
      setIsModalOpen(true);
      const res = await getMeetingById(id);
      setMeetingDetail(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết:", err);
      toast.error("Không thể tải chi tiết cuộc họp!");
      setIsModalOpen(false);
    }
  };

  // Xử lý hover cuộc họp để hiển thị tooltip tối giản
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

  // Xử lý click vào khoảng trống trên calendar để đặt lịch nhanh
  const handleDateSelect = (selection) => {
    let start = selection?.startStr ? dayjs(selection.startStr) : null;
    let end = selection?.endStr ? dayjs(selection.endStr) : null;
    if (!start || !end) return;

    let duration = end.diff(start, "minute");
    if (duration <= 0) duration = 60;

    setQuickBooking({
      open: true,
      start: start,
      end: start.add(duration, "minute"),
    });

    setIsRecurring(false);
    setTimeout(() => {
      form.setFieldsValue({
        title: "",
        date: start,
        time: start,
        duration: duration <= 0 ? 60 : duration,
        roomId: undefined,
        deviceIds: [],
        participantIds: [],
        guestEmails: [],
        isRecurring: false,
        frequency: "DAILY",
        repeatUntil: undefined,
        description: "",
      });
    }, 100);
    setSearchResults([]);
  };

  // Tìm kiếm người dùng với debounce
  const handleSearchUsers = (query) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (query && query.trim().length > 0) {
      setIsSearching(true);
      setSearchResults([]);
      debounceTimer.current = setTimeout(async () => {
        try {
          const res = await searchUsers(query);
          const filteredResults = (res.data || []).filter(u => u.id !== user?.id);
          setSearchResults(filteredResults);
        } catch (err) {
          message.error("Không thể tìm kiếm người dùng.");
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 500);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  // Tạo cuộc họp mới
  const handleCreateMeeting = async (values) => {
    try {
      setCreating(true);
      if (!user?.id) {
        message.error("Không lấy được thông tin người dùng hiện tại!");
        return;
      }

      const datePart = values.date;
      const timePart = values.time;
      const startTimeUTC = dayjs.utc()
        .year(datePart.year())
        .month(datePart.month())
        .date(datePart.date())
        .hour(timePart.hour())
        .minute(timePart.minute())
        .second(0)
        .millisecond(0);
      const startTime = startTimeUTC.toISOString();
      const duration = values.duration || 60;
      const endTime = startTimeUTC.add(duration, 'minute').toISOString();

      const participantIds = Array.from(new Set([user.id, ...(values.participantIds || [])]));

      const payload = {
        title: values.title,
        description: values.description || "",
        startTime,
        endTime,
        roomId: values.roomId,
        participantIds,
        deviceIds: values.deviceIds || [],
        recurrenceRule: values.isRecurring ? {
          frequency: values.frequency || "DAILY",
          interval: 1,
          repeatUntil: dayjs(values.repeatUntil || values.date).format("YYYY-MM-DD"),
        } : null,
        onBehalfOfUserId: null,
        guestEmails: values.guestEmails || [],
      };

      await createMeeting(payload);
      toast.success("Tạo cuộc họp thành công!");
      setQuickBooking({ open: false, start: null, end: null });
      fetchMeetings();
    } catch (err) {
      console.error("Lỗi tạo cuộc họp:", err);
      const msg = err?.response?.data?.message || "Không thể tạo cuộc họp!";

      if (msg.toLowerCase().includes("bảo trì") && msg.toLowerCase().includes("phòng")) {
        toast.error("Phòng họp đang bảo trì, vui lòng chọn phòng khác!");
      } else if (
        msg.toLowerCase().includes("bảo trì") &&
        msg.toLowerCase().includes("thiết bị")
      ) {
        toast.error("Thiết bị đang bảo trì, vui lòng bỏ chọn thiết bị này!");
      } else if (err.response?.status === 403) {
        toast.error("Không thể tạo cuộc họp: Phòng hoặc thiết bị không khả dụng!");
      } else {
        toast.error(msg);
      }
    } finally {
      setCreating(false);
    }
  };

  // === HÀM RENDER NGƯỜI THAM GIA (ĐÃ CẬP NHẬT) ===
  const renderParticipants = (organizer, participants) => {
    if (!participants && !organizer) {
      return <span className="text-gray-500 dark:text-gray-400">Không có người tham gia.</span>;
    }

    const getTag = (status) => {
      switch (status) {
        case 'ACCEPTED':
          return <Tag color="success" className="ml-2">Đã chấp nhận</Tag>;
        case 'DECLINED':
          return <Tag color="error" className="ml-2">Đã từ chối</Tag>;
        case 'PENDING':
          return <Tag color="warning" className="ml-2">Chờ phản hồi</Tag>;
        default:
          return null;
      }
    };

    const allAttendees = [
      organizer,
      ...(participants || [])
    ].filter(Boolean);

    const uniqueAttendees = allAttendees.filter((p, index, self) =>
      p.id && index === self.findIndex((t) => t.id === p.id)
    );

    return (
      <ul className="list-none p-0 m-0">
        {uniqueAttendees.map(p => (
          <li key={p.id} className="flex justify-between items-center py-1">
            <span className="text-gray-800 dark:text-gray-100">
              {p.fullName}
              {p.id === organizer?.id && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Tổ chức)</span>
              )}
            </span>
            {getTag(p.status)}
          </li>
        ))}
      </ul>
    );
  };

  // Load lịch họp khi component mount
  useEffect(() => {
    if (user) {
      fetchMeetings();
    }
  }, [user]);

  // Thêm CSS cho dark mode
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      html.dark .ant-form-item-label > label { color: #f1f5f9 !important; }
      html.dark .ant-input, html.dark .ant-picker, html.dark .ant-select-selector {
        background-color: #1e293b !important;
        color: #f8fafc !important;
        border-color: #334155 !important;
      }
      html.dark .ant-input::placeholder, html.dark textarea.ant-input::placeholder {
        color: #94a3b8 !important;
      }
      .dark ::placeholder,
      .dark .ant-select-selection-placeholder,
      .dark .ant-input::placeholder,
      .dark textarea::placeholder {
        color: #b5b5b5 !important;
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-500">
      <ToastContainer position="top-right" autoClose={2500} />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 shadow-md">
          <FiCalendar className="text-white text-2xl" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            Lịch họp của tôi
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Theo dõi và quản lý các cuộc họp của bạn
          </p>
        </div>
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 transition-colors duration-500">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            allDaySlot={false}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            events={events}
            eventClick={handleEventClick}
            eventMouseEnter={handleEventMouseEnter}
            eventMouseLeave={handleEventMouseLeave}
            height="75vh"
            locale="vi"
            selectable={true}
            selectMirror={true}
            select={handleDateSelect}
          />
        </div>
      )}

      {/* Modal chi tiết cuộc họp */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        title={<span className="dark:text-white">Chi tiết cuộc họp</span>}
        width={600}
        className="dark:[&_.ant-modal-content]:bg-gray-800 dark:[&_.ant-modal-content]:text-gray-200"
      >
        {meetingDetail ? (
          <Descriptions
            bordered
            column={1}
            className="dark:[&_.ant-descriptions-item-label]:text-gray-300 dark:[&_.ant-descriptions-item-content]:text-gray-100"
          >
            <Descriptions.Item label="Tên cuộc họp">
              {meetingDetail.title}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              {`${dayjs(meetingDetail.startTime).format("HH:mm")} - ${dayjs(meetingDetail.endTime).format("HH:mm, DD/MM/YYYY")}`}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={meetingDetail.status === 'CONFIRMED' ? 'blue' : 'warning'}>
                {meetingDetail.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Phòng họp">
              {meetingDetail.room?.name || "Chưa xác định"}
            </Descriptions.Item>
            <Descriptions.Item label="Người tham gia">
              {renderParticipants(meetingDetail.organizer, meetingDetail.participants)}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {meetingDetail.description || "Không có"}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div className="flex justify-center py-6">
            <Spin size="large" />
          </div>
        )}
      </Modal>

      {/* Modal đặt lịch nhanh */}
      <Modal
        open={quickBooking.open}
        onCancel={() => setQuickBooking({ open: false, start: null, end: null })}
        footer={null}
        width={650}
        closable={!creating}
        maskClosable={!creating}
        title={
          <span className="flex items-center gap-2 dark:text-white text-lg font-semibold">
            <FiPlusCircle /> Đặt lịch phòng họp nhanh
          </span>
        }
        className="dark:[&_.ant-modal-content]:bg-gray-800 dark:[&_.ant-modal-content]:text-gray-100 
                   dark:[&_.ant-modal-header]:bg-gray-800 dark:[&_.ant-modal-header]:border-b-gray-700"
        bodyStyle={{ paddingTop: 18, paddingBottom: 10 }}
      >
        <Card
          className="shadow-none bg-white dark:bg-[#1e293b] border-none dark:text-gray-100"
          bodyStyle={{ padding: 0 }}
        >
          <Form
            layout="vertical"
            form={form}
            disabled={creating}
            onFinish={handleCreateMeeting}
            onValuesChange={(vals) => {
              if (vals.isRecurring !== undefined) setIsRecurring(vals.isRecurring);
            }}
          >
            {/* Ngày, giờ và thời lượng */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
              <Form.Item
                label="Ngày họp"
                name="date"
                rules={[{ required: true, message: "Chọn ngày họp" }]}
              >
                <DatePicker
                  className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  format="DD/MM/YYYY"
                  disabledDate={(current) => current && current < dayjs().startOf("day")}
                />
              </Form.Item>

              <Form.Item
                label="Giờ bắt đầu"
                name="time"
                dependencies={["date"]}
                rules={[
                  { required: true, message: "Chọn giờ họp" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const date = getFieldValue("date");
                      if (!date || !value) return Promise.resolve();
                      const selectedUTC = dayjs.utc()
                        .year(date.year())
                        .month(date.month())
                        .date(date.date())
                        .hour(value.hour())
                        .minute(value.minute())
                        .second(0);
                      if (selectedUTC.isBefore(dayjs.utc().add(1, "minute"))) {
                        return Promise.reject("Thời gian họp phải ở tương lai!");
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <TimePicker
                  className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  use12Hours
                  format="hh:mm A"
                  minuteStep={5}
                  onSelect={(value) => {
                    if (value) form.setFieldValue("time", value);
                  }}
                  onOpenChange={(openStatus) => {
                    const value = form.getFieldValue("time");
                    if (value) form.setFieldValue("time", value);
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Thời lượng"
                name="duration"
                rules={[{ required: true, message: "Chọn thời lượng" }]}
              >
                <Select
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  popupClassName="dark:bg-gray-700 dark:text-gray-100"
                >
                  <Option value={15}>15 phút</Option>
                  <Option value={30}>30 phút</Option>
                  <Option value={45}>45 phút</Option>
                  <Option value={60}>1 giờ</Option>
                  <Option value={90}>1 giờ 30 phút</Option>
                  <Option value={120}>2 giờ</Option>
                </Select>
              </Form.Item>
            </div>

            {/* Tên cuộc họp */}
            <Form.Item
              label="Tên cuộc họp"
              name="title"
              rules={[{ required: true, message: "Nhập tên cuộc họp" }]}
            >
              <Input
                placeholder="Nhập tên cuộc họp..."
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </Form.Item>

            {/* Phòng họp */}
            <Form.Item
              label="Phòng họp"
              name="roomId"
              rules={[{ required: true, message: "Chọn phòng họp" }]}
            >
              <Select
                placeholder="-- Chọn phòng họp --"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                popupClassName="dark:bg-gray-700 dark:text-gray-100"
                options={rooms.map((r) => ({
                  label: `${r.name} (${r.location || "Không rõ"})`,
                  value: r.id,
                }))}
              />
            </Form.Item>

            {/* Thiết bị */}
            <Form.Item label="Thiết bị sử dụng" name="deviceIds">
              <Select
                mode="multiple"
                placeholder="-- Chọn thiết bị --"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                popupClassName="dark:bg-gray-700 dark:text-gray-100"
                options={devices.map((d) => ({
                  label: d.name,
                  value: d.id,
                }))}
              />
            </Form.Item>

            <Divider className="dark:border-gray-700" />

            {/* Người tham gia nội bộ */}
            <Form.Item
              label={<span><FiUsers className="inline mr-2" />Người tham gia (nội bộ)</span>}
              name="participantIds"
              tooltip="Gõ tên hoặc email để tìm đồng nghiệp. Bạn (người tạo) sẽ tự động được thêm."
            >
              <Select
                mode="multiple"
                placeholder="-- Gõ tên hoặc email để tìm người tham gia --"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                popupClassName="dark:bg-gray-700 dark:text-gray-100"
                options={searchResults.map((u) => ({
                  label: `${u.fullName} (${u.username})`,
                  value: u.id,
                }))}
                onSearch={handleSearchUsers}
                loading={isSearching}
                filterOption={false}
                notFoundContent={isSearching ? <Spin size="small" /> : "Không tìm thấy người dùng"}
              />
            </Form.Item>

            {/* Email khách mời */}
            <Form.Item
              label="Email khách mời (bên ngoài)"
              name="guestEmails"
              tooltip="Nhập email, nhấn Enter hoặc dấu phẩy để thêm."
              rules={[
                {
                  type: "array",
                  validator: (_, value) => {
                    if (!value || value.length === 0) return Promise.resolve();
                    const invalidEmails = value.filter(
                      (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                    );
                    if (invalidEmails.length > 0)
                      return Promise.reject(`Email không hợp lệ: ${invalidEmails.join(", ")}`);
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                mode="tags"
                tokenSeparators={[",", ";", " "]}
                placeholder="Ví dụ: guest@email.com"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                popupClassName="dark:bg-gray-700 dark:text-gray-100"
              />
            </Form.Item>

            <Divider className="dark:border-gray-700" />

            {/* Lặp lại cuộc họp */}
            <Form.Item name="isRecurring" valuePropName="checked" className="mb-1">
              <Checkbox className="dark:text-gray-200">Lặp lại cuộc họp</Checkbox>
            </Form.Item>

            {isRecurring && (
              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="frequency" label="Tần suất lặp">
                  <Select
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    popupClassName="dark:bg-gray-700 dark:text-gray-100"
                  >
                    <Option value="DAILY">Hằng ngày</Option>
                    <Option value="WEEKLY">Hằng tuần</Option>
                    <Option value="MONTHLY">Hằng tháng</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="repeatUntil" label="Lặp đến ngày">
                  <DatePicker
                    className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    format="DD/MM/YYYY"
                    disabledDate={(current) => current && current < dayjs().startOf("day")}
                  />
                </Form.Item>
              </div>
            )}

            {/* Ghi chú */}
            <Form.Item label="Ghi chú" name="description">
              <TextArea
                rows={3}
                placeholder="Ghi chú thêm cho cuộc họp..."
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </Form.Item>

            {/* Nút hành động */}
            <div className="flex justify-end gap-3 mt-6">
              <Button onClick={() => setQuickBooking({ open: false })}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={creating}
                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Tạo cuộc họp
              </Button>
            </div>
          </Form>
        </Card>
      </Modal>
    </div>
  );
};

export default MyMeetingPage;