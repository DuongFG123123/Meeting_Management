import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getMyMeetings, getMeetingById } from "../../services/meetingService";
import { Modal, Spin, Descriptions } from "antd";
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

  // 🟢 Lấy danh sách lịch họp
  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await getMyMeetings();
      const data = res.data?.content || res.data || [];
      const mappedEvents = data.map((m) => ({
        id: m.id,
        title: m.title || "Cuộc họp",
        start: `${m.date}T${m.time}`,
        backgroundColor: "#3b82f6",
        borderColor: "#2563eb",
      }));
      setEvents(mappedEvents);
    } catch (err) {
      console.error("❌ Lỗi tải lịch họp:", err);
      toast.error("Không thể tải danh sách lịch họp!");
    } finally {
      setLoading(false);
    }
  };

  // 🟠 Khi click vào 1 cuộc họp -> hiển thị chi tiết
  const handleEventClick = async (info) => {
    try {
      const id = info.event.id;
      const res = await getMeetingById(id);
      setMeetingDetail(res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error("❌ Lỗi khi lấy chi tiết:", err);
      toast.error("Không thể tải chi tiết cuộc họp!");
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-500">
      {/* 🌟 Header đẹp hỗ trợ dark mode */}
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

      {/* 📅 Lịch họp */}
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
            slotMinTime="07:00:00"
            slotMaxTime="20:00:00"
            events={events}
            eventClick={handleEventClick}
            height="75vh"
            locale="vi"
          />
        </div>
      )}

      {/* 🧾 Modal chi tiết cuộc họp */}
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
            <Descriptions.Item label="Ngày họp">
              {dayjs(meetingDetail.date).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              {dayjs(meetingDetail.time, "HH:mm:ss").format("HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Phòng họp">
              {meetingDetail.roomName || "Chưa xác định"}
            </Descriptions.Item>
            <Descriptions.Item label="Người tổ chức">
              {meetingDetail.organizerName || "Không rõ"}
            </Descriptions.Item>
            <Descriptions.Item label="Người tham gia">
              {meetingDetail.participants?.join(", ") || "Không có dữ liệu"}
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
