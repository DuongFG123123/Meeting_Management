// src/pages/admin/CreateMeetingPage.jsx
import React, { useEffect, useState } from "react";
import {
  DatePicker,
  TimePicker,
  Select,
  Input,
  Button,
  Form,
  message,
  Card,
  Divider,
} from "antd";
import { FiPlusCircle, FiMail } from "react-icons/fi";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import utc from "dayjs/plugin/utc";
import { useAuth } from "../../context/AuthContext";
import { createMeeting, getRooms, getDevices } from "../../services/meetingService";

dayjs.locale("vi");
dayjs.extend(utc); // 🕒 kích hoạt plugin UTC

const { TextArea } = Input;

const CreateMeetingPage = () => {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [form] = Form.useForm();
  const { user } = useAuth();

  // 🌙 Style dropdown (AntD v5)
  const getDropdownStyle = () => {
    const isDark = document.documentElement.classList.contains("dark");
    return {
      popup: {
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        color: isDark ? "#f8fafc" : "#000000",
      },
    };
  };

  // 🟢 Lấy danh sách phòng & thiết bị
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomRes, deviceRes] = await Promise.all([getRooms(), getDevices()]);
        setRooms(roomRes.data || []);
        setDevices(deviceRes.data || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách:", err);
        message.error("Không thể tải dữ liệu phòng họp hoặc thiết bị!");
      }
    };
    fetchData();
  }, []);

  // 🧩 CSS dark mode (giữ nguyên style)
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
      .ant-input:focus, .ant-select-focused .ant-select-selector, .ant-picker-focused {
        border-color: #6366f1 !important;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // 🟢 Gửi API tạo cuộc họp
  const handleCreateMeeting = async (values) => {
    try {
      setLoading(true);

      if (!user?.id) {
        message.error("Không lấy được thông tin người dùng hiện tại!");
        return;
      }

      // ⚡ FIX: convert sang UTC+7 trước khi gửi (để backend hiểu đúng giờ VN)
      const startTime = dayjs(values.date)
        .hour(values.time.hour())
        .minute(values.time.minute())
        .second(0)
        .utcOffset(7, true) // ✅ quan trọng nhất
        .toISOString();

      const endTime = dayjs(values.date)
        .hour(values.time.hour() + 1)
        .minute(values.time.minute())
        .second(0)
        .utcOffset(7, true) // ✅ quan trọng nhất
        .toISOString();

      const payload = {
        title: values.title,
        description: values.description || "",
        startTime,
        endTime,
        roomId: values.roomId,
        participantIds: [user.id],
        deviceIds: values.deviceIds || [],
        recurrenceRule: {
          frequency: values.frequency || "DAILY",
          interval: 1,
          repeatUntil: dayjs(values.repeatUntil || values.date).format("YYYY-MM-DD"),
        },
        onBehalfOfUserId: 0,
        guestEmails: values.guestEmails ? [values.guestEmails] : [],
      };

      console.log("📦 Payload gửi đi:", payload);
      await createMeeting(payload);

      message.success("✅ Tạo cuộc họp thành công!");
      form.resetFields();
    } catch (err) {
      console.error("❌ Lỗi tạo cuộc họp:", err);
      message.error(err.response?.data || "Không thể tạo cuộc họp!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-[#0f172a] transition-all duration-500">
      {/* 🌟 Header */}
      <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md">
          <FiPlusCircle className="text-white text-2xl" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Tạo lịch họp mới
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Nhập thông tin cuộc họp và lưu vào hệ thống
          </p>
        </div>
      </div>

      {/* 📋 Form */}
      <div className="max-w-4xl mx-auto">
        <Card
          className="shadow-lg bg-white dark:bg-[#1e293b] dark:text-gray-100 border dark:border-gray-700"
          variant="borderless"
        >
          <Form layout="vertical" form={form} onFinish={handleCreateMeeting}>
            <Form.Item
              label="Tên cuộc họp"
              name="title"
              rules={[{ required: true, message: "Vui lòng nhập tên cuộc họp" }]}
            >
              <Input placeholder="Nhập tên cuộc họp..." />
            </Form.Item>

            {/* Ngày + Giờ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                label="Ngày họp"
                name="date"
                rules={[{ required: true, message: "Vui lòng chọn ngày họp" }]}
              >
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item
                label="Giờ họp"
                name="time"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ họp" },
                  () => ({
                    validator(_, value) {
                      const date = form.getFieldValue("date");
                      if (!date || !value) return Promise.resolve();
                      const selected = dayjs(date).hour(value.hour()).minute(value.minute());
                      if (selected.isBefore(dayjs())) {
                        return Promise.reject("⏰ Thời gian họp phải ở tương lai!");
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <TimePicker format="HH:mm" className="w-full" />
              </Form.Item>
            </div>

            {/* Phòng họp */}
            <Form.Item
              label="Phòng họp"
              name="roomId"
              rules={[{ required: true, message: "Vui lòng chọn phòng họp" }]}
            >
              <Select
                placeholder="-- Chọn phòng họp --"
                options={rooms.map((r) => ({
                  label: `${r.name} (${r.location || "Không rõ"})`,
                  value: r.id,
                }))}
                styles={getDropdownStyle()}
              />
            </Form.Item>

            {/* Thiết bị */}
            <Form.Item label="Thiết bị sử dụng" name="deviceIds">
              <Select
                mode="multiple"
                placeholder="-- Chọn thiết bị --"
                options={devices.map((d) => ({
                  label: d.name,
                  value: d.id,
                }))}
                styles={getDropdownStyle()}
              />
            </Form.Item>

            <Divider />

            {/* Tần suất */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item label="Tần suất" name="frequency" initialValue="DAILY">
                <Select
                  options={[
                    { label: "Hằng ngày", value: "DAILY" },
                    { label: "Hằng tuần", value: "WEEKLY" },
                    { label: "Hằng tháng", value: "MONTHLY" },
                  ]}
                  styles={getDropdownStyle()}
                />
              </Form.Item>

              <Form.Item label="Lặp lại đến" name="repeatUntil">
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </div>

            <Form.Item label="Email khách mời" name="guestEmails">
              <Input prefix={<FiMail />} placeholder="Nhập email khách mời (tùy chọn)" />
            </Form.Item>

            <Form.Item label="Mô tả" name="description">
              <TextArea rows={4} placeholder="Nhập nội dung mô tả..." />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                Tạo cuộc họp
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default CreateMeetingPage;
