import React, { useEffect, useState } from "react";
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiX } from "react-icons/fi";

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState("joined"); // joined | cancelled
  const [joinedMeetings, setJoinedMeetings] = useState([]);
  const [cancelledMeetings, setCancelledMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  useEffect(() => {
    // ✅ Giả lập dữ liệu từ API
    setTimeout(() => {
      setJoinedMeetings([
        {
          id: 1,
          title: "Họp quý 3 - Đánh giá hiệu suất",
          date: "2025-09-21",
          time: "09:00 - 11:00",
          room: "Phòng A1",
          participants: [
            { name: "Nguyễn Văn A", email: "a@company.com" },
            { name: "Trần Thị B", email: "b@guest.com" },
          ],
          notes: "Tổng kết hiệu suất quý và kế hoạch quý tới.",
        },
        {
          id: 2,
          title: "Họp dự án - Tiến độ Sprint 5",
          date: "2025-10-10",
          time: "14:00 - 15:30",
          room: "Phòng B2",
          participants: [
            { name: "Phạm Văn C", email: "c@company.com" },
            { name: "Lê Thị D", email: "d@guest.com" },
          ],
          notes: "Thảo luận về deadline và demo chức năng mới.",
        },
      ]);

      setCancelledMeetings([
        {
          id: 3,
          title: "Họp nội bộ tháng 11",
          date: "2025-11-02",
          time: "10:00 - 11:00",
          room: "Phòng C1",
          reason: "Trưởng nhóm bận công tác đột xuất.",
        },
      ]);
    }, 400);
  }, []);

  const handleMeetingClick = (meeting) => {
    setSelectedMeeting(meeting);
  };

  const closeModal = () => {
    setSelectedMeeting(null);
  };

  const meetings = activeTab === "joined" ? joinedMeetings : cancelledMeetings;

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
        📖 Lịch sử họp
      </h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === "joined"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
          }`}
          onClick={() => setActiveTab("joined")}
        >
          Đã tham gia
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === "cancelled"
              ? "bg-red-600 text-white"
              : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
          }`}
          onClick={() => setActiveTab("cancelled")}
        >
          Đã hủy
        </button>
      </div>

      {/* Danh sách cuộc họp */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-5 transition-colors duration-300">
        {meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <FiCalendar size={32} className="mb-3" />
            <p>Không có cuộc họp nào trong danh sách này.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-slate-700">
            {meetings.map((item) => (
              <li
                key={item.id}
                className="py-4 px-2 hover:bg-gray-50 dark:hover:bg-slate-700/40 rounded-xl transition-colors duration-200 cursor-pointer"
                onClick={() => handleMeetingClick(item)}
              >
                <p
                  className={`font-semibold mb-1 ${
                    activeTab === "cancelled"
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-800 dark:text-gray-100"
                  }`}
                >
                  {item.title}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1">
                    <FiCalendar size={14} /> {item.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock size={14} /> {item.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiMapPin size={14} /> {item.room}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal Chi tiết */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-lg relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <FiX size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              {selectedMeeting.title}
            </h2>

            <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
              <p className="flex items-center gap-2">
                <FiCalendar size={14} /> <strong>Ngày:</strong> {selectedMeeting.date}
              </p>
              <p className="flex items-center gap-2">
                <FiClock size={14} /> <strong>Giờ:</strong> {selectedMeeting.time}
              </p>
              <p className="flex items-center gap-2">
                <FiMapPin size={14} /> <strong>Phòng:</strong> {selectedMeeting.room}
              </p>

              {activeTab === "joined" && selectedMeeting.participants && (
                <div className="mt-3">
                  <p className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-100">
                    <FiUsers size={14} /> Người tham gia:
                  </p>
                  <ul className="mt-2 ml-6 list-disc space-y-1">
                    {selectedMeeting.participants.map((p, i) => (
                      <li key={i}>
                        {p.name} —{" "}
                        <span className="text-blue-600 dark:text-blue-400">
                          {p.email}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "cancelled" && selectedMeeting.reason && (
                <p className="mt-3 text-red-600 dark:text-red-400">
                  <strong>Lý do hủy:</strong> {selectedMeeting.reason}
                </p>
              )}

              {selectedMeeting.notes && (
                <p className="mt-3 italic text-gray-500 dark:text-gray-400">
                  Ghi chú: {selectedMeeting.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
