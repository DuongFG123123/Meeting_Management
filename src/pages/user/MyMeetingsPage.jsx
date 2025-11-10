// src/pages/user/MyMeetingsPage.jsx
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getMyMeetings, getMeetingById } from "../../services/meetingService";
import { Modal, Spin, Descriptions, Tag } from "antd"; // <-- Thêm Tag
import { FiCalendar } from "react-icons/fi";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import "dayjs/locale/vi";
dayjs.locale("vi");

const MyMeetingPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetingDetail, setMeetingDetail] = useState(null);

  // 🟢 Lấy danh sách lịch họp (ĐÃ SỬA)
  const fetchMeetings = async () => {
    setLoading(true);
    try {
      // API của bạn trả về { content: [...] }
      const res = await getMyMeetings();
      const data = res.data?.content || [];
      
      // === SỬA LỖI 1: SỬA LOGIC MAP ===
      const mappedEvents = data.map((m) => ({
        id: m.id,
        title: m.title || "Cuộc họp",
        start: m.startTime, // <-- SỬA: Dùng startTime
        end: m.endTime,     // <-- SỬA: Thêm endTime
        backgroundColor: m.status === 'CONFIRMED' ? "#3b82f6" : "#f59e0b", // Xanh cho Confirmed, Vàng cho PENDING
        borderColor: m.status === 'CONFIRMED' ? "#2563eb" : "#d97706",
        extendedProps: {
          status: m.status // Thêm các thuộc tính khác nếu cần
        }
      }));
      setEvents(mappedEvents);
    } catch (err) {
      console.error("❌ Lỗi tải lịch họp:", err);
      toast.error("Không thể tải danh sách lịch họp!");
    } finally {
      setLoading(false);
    }
  };

  // 🟠 Khi click vào 1 cuộc họp -> hiển thị chi tiết (ĐÃ SỬA)
  const handleEventClick = async (info) => {
    try {
      const id = info.event.id;
      setMeetingDetail(null); // Xóa chi tiết cũ
      setIsModalOpen(true);
      
      const res = await getMeetingById(id);
      setMeetingDetail(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi lấy chi tiết:", err);
      toast.error("Không thể tải chi tiết cuộc họp!");
      setIsModalOpen(false); // Đóng modal nếu lỗi
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // Hàm render chi tiết người tham gia
  const renderParticipants = (participants) => {
    if (!participants || participants.length === 0) {
      return "Không có người tham gia.";
    }
    // API trả về mảng object, cần map qua
    return participants.map(p => p.fullName).join(", ");
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-500">
      {/* (Header giữ nguyên) */}
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

      {/* 📅 Lịch họp (Giữ nguyên) */}
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
            slotMinTime="00:00:00" // <-- SỬA: Bắt đầu từ 0 giờ
            slotMaxTime="24:00:00" // <-- SỬA: Kết thúc lúc 24 giờ
            events={events}
            eventClick={handleEventClick}
            height="75vh"
            locale="vi"
          />
        </div>
      )}

      {/* 🧾 Modal chi tiết cuộc họp (ĐÃ SỬA HOÀN TOÀN) */}
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
            {/* === SỬA LỖI 2: ĐỌC ĐÚNG TRƯỜNG DỮ LIỆU === */}
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
            <Descriptions.Item label="Người tổ chức">
              {meetingDetail.organizer?.fullName || "Không rõ"}
            </Descriptions.Item>
            <Descriptions.Item label="Người tham gia">
              {renderParticipants(meetingDetail.participants)}
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
    </div>
  );
};

export default MyMeetingPage;