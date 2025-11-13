// src/pages/user/CreateMeetingPage.jsx
import React, { useEffect, useState, useRef } from "react";
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
  Checkbox,
  Spin,
} from "antd";
import { FiPlusCircle, FiUsers } from "react-icons/fi";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import utc from "dayjs/plugin/utc";
import { useAuth } from "../../context/AuthContext";

// === 1. THAY ĐỔI IMPORT (THEO YÊU CẦU BACKEND) ===
import {
  createMeeting,
  getRooms,
  // BỎ: getDevices,
} from "../../services/meetingService";
import { searchUsers } from "../../services/userService";
import { getAvailableDevices } from "../../services/deviceService"; // <-- IMPORT API MỚI

// 🧁 Toast thông báo
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

dayjs.locale("vi");
dayjs.extend(utc);

const { TextArea } = Input;
const { Option } = Select;

const CreateMeetingPage = () => {
  const [loading, setLoading] = useState(false); // Loading khi submit form
  const [rooms, setRooms] = useState([]);
  
  // === 2. STATE MỚI CHO THIẾT BỊ ===
  const [availableDevices, setAvailableDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(false);

  // State tìm kiếm (giữ nguyên)
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef(null);

  const [form] = Form.useForm();
  const { user } = useAuth();
  const [isRecurring, setIsRecurring] = useState(false);
  
  // === DÙNG Form.useWatch ĐỂ THEO DÕI THỜI GIAN ===
  const watchedDate = Form.useWatch('date', form);
  const watchedTime = Form.useWatch('time', form);
  const watchedDuration = Form.useWatch('duration', form);
  // ===========================================

  // Style cho dropdown AntD (giữ nguyên)
  const getDropdownStyle = () => {
    const isDark = document.documentElement.classList.contains("dark");
    return {
      popup: {
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        color: isDark ? "#f8fafc" : "#000000",
      },
    };
  };

  // === 3. SỬA useEffect TẢI DỮ LIỆU BAN ĐẦU ===
  // (Chỉ tải Phòng, không tải Thiết bị nữa)
  useEffect(() => {
    const fetchRoomsData = async () => {
      try {
        const roomRes = await getRooms();
        setRooms(roomRes.data || []);
      } catch (err) {
        console.error("❌ Lỗi tải phòng họp:", err);
        message.error("Không thể tải danh sách phòng họp!");
      }
    };
    fetchRoomsData();
  }, []); // Chạy 1 lần khi trang mở
  
  // === 4. useEffect MỚI ĐỂ THEO DÕI THỜI GIAN VÀ TẢI THIẾT BỊ ===
  useEffect(() => {
    const fetchDevices = async () => {
      // Nếu 1 trong 3 giá trị chưa có, không gọi API
      if (!watchedDate || !watchedTime || !watchedDuration) {
        setAvailableDevices([]); // Xóa danh sách
        return;
      }
      
      setDevicesLoading(true);
      // Xóa các thiết bị đã chọn (vì thời gian thay đổi)
      form.setFieldsValue({ deviceIds: [] });

      try {
        // Tính toán startTime và endTime (logic UTC đã sửa)
        const startTimeUTC = dayjs.utc()
          .year(watchedDate.year())
          .month(watchedDate.month())
          .date(watchedDate.date())
          .hour(watchedTime.hour())
          .minute(watchedTime.minute())
          .second(0)
          .millisecond(0);
        
        const startTime = startTimeUTC.toISOString();
        const endTime = startTimeUTC.add(watchedDuration, 'minute').toISOString();

        // Gọi API mới
        const res = await getAvailableDevices(startTime, endTime);
        setAvailableDevices(res.data || []);

      } catch (err) {
        console.error("Lỗi tải thiết bị khả dụng:", err);
        message.error("Không thể tải danh sách thiết bị khả dụng.");
        setAvailableDevices([]); // Đặt lại nếu lỗi
      } finally {
        setDevicesLoading(false);
      }
    };

    // Dùng debounce để tránh gọi API liên tục khi người dùng thay đổi
    const timer = setTimeout(() => {
      fetchDevices();
    }, 500); // Trễ 500ms

    return () => clearTimeout(timer); // Dọn dẹp

  }, [watchedDate, watchedTime, watchedDuration, form]); // Chạy lại khi thời gian thay đổi

  // CSS cho dark mode (giữ nguyên)
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
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Tìm kiếm người dùng (giữ nguyên)
  const handleSearchUsers = (query) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (query && query.trim().length > 0) {
      setIsSearching(true);
      setSearchResults([]);

      debounceTimer.current = setTimeout(async () => {
        try {
          const res = await searchUsers(query);
          const filteredResults = (res.data || []).filter(
            (u) => u.id !== user?.id
          );
          setSearchResults(filteredResults);
        } catch (err) {
          console.error("Lỗi tìm kiếm người dùng:", err);
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

  // Gửi form (giữ nguyên logic UTC)
  const handleCreateMeeting = async (values) => {
    try {
      setLoading(true);
      if (!user?.id) {
        message.error("Không lấy được thông tin người dùng hiện tại!");
        setLoading(false);
        return;
      }

      const datePart = values.date;
      const timePart = values.time;

      const startTimeUTC = dayjs
        .utc()
        .year(datePart.year())
        .month(datePart.month())
        .date(datePart.date())
        .hour(timePart.hour())
        .minute(timePart.minute())
        .second(0)
        .millisecond(0);

      const startTime = startTimeUTC.toISOString();
      const duration = values.duration || 60;
      const endTime = startTimeUTC.add(duration, "minute").toISOString();

      const participantIds = Array.from(
        new Set([user.id, ...(values.participantIds || [])])
      );
      const payload = {
        title: values.title,
        description: values.description || "",
        startTime,
        endTime,
        roomId: values.roomId,
        participantIds,
        deviceIds: values.deviceIds || [], // Dữ liệu đã được lọc
        recurrenceRule: values.isRecurring
          ? {
              frequency: values.frequency || "DAILY",
              interval: 1,
              repeatUntil: dayjs(values.repeatUntil || values.date).format(
                "YYYY-MM-DD"
              ),
            }
          : null,
        onBehalfOfUserId: null,
        guestEmails: values.guestEmails || [],
      };

      console.log("📦 Payload gửi đi:", payload);
      await createMeeting(payload);

      // ✅ Toast thành công
      toast.success("🎉 Tạo cuộc họp thành công!");
      form.resetFields();
      setAvailableDevices([]); // Xóa ds thiết bị
    } catch (err) {
      console.error("❌ Lỗi tạo cuộc họp:", err);
      const msg = err?.response?.data?.message || "Không thể tạo cuộc họp!";

      // ⚠️ Hiển thị thông báo toast phù hợp
      if (msg.toLowerCase().includes("bảo trì") && msg.toLowerCase().includes("phòng")) {
        toast.error("🚫 Phòng họp đang bảo trì, vui lòng chọn phòng khác!");
      } else if (
        msg.toLowerCase().includes("bảo trì") &&
        msg.toLowerCase().includes("thiết bị")
      ) {
        toast.error("⚙️ Thiết bị đang bảo trì, vui lòng bỏ chọn thiết bị này!");
      } else if (err.response?.status === 409) {
         toast.error(`🚫 Xung đột: ${msg}`); // "Một trong các thiết bị bạn chọn đã bị đặt..."
      } else if (err.response?.status === 403) {
         toast.error("❌ Không thể tạo cuộc họp: Phòng hoặc thiết bị không khả dụng!");
      } else {
         toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-[#0f172a] transition-all duration-500">
      {/* 🧁 Toast thông báo */}
      <ToastContainer position="top-right" autoClose={2500} />

      {/* Header */}
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

      {/* Form */}
      <div className="max-w-4xl mx-auto">
        <Card
          className="shadow-lg bg-white dark:bg-[#1e293b] dark:text-gray-100 border dark:border-gray-700"
          variant="borderless"
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={handleCreateMeeting}
            onValuesChange={(changedValues) => {
              if (changedValues.isRecurring !== undefined) {
                setIsRecurring(changedValues.isRecurring);
              }
            }}
          >
            <Form.Item
              label="Tên cuộc họp"
              name="title"
              rules={[{ required: true, message: "Vui lòng nhập tên cuộc họp" }]}
            >
              <Input placeholder="Nhập tên cuộc họp..." />
            </Form.Item>

            {/* Thời gian (Đã fix validator) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Form.Item
                label="Ngày họp"
                name="date"
                rules={[{ required: true, message: "Vui lòng chọn ngày họp" }]}
              >
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  disabledDate={(current) => current && current < dayjs().startOf("day")}
                />
              </Form.Item>

              <Form.Item
                label="Giờ bắt đầu"
                name="time"
                dependencies={["date"]}
                rules={[
                  { required: true, message: "Vui lòng chọn giờ họp" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const date = getFieldValue("date");
                      if (!date || !value) return Promise.resolve();
                      
                      // Logic validator UTC (Đã sửa)
                      const selectedUTC = dayjs.utc()
                        .year(date.year())
                        .month(date.month())
                        .date(date.date())
                        .hour(value.hour())
                        .minute(value.minute())
                        .second(0);
                      
                      if (selectedUTC.isBefore(dayjs.utc().add(1, "minute"))) {
                        return Promise.reject("⏰ Thời gian họp phải ở tương lai!");
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <TimePicker
                  className="w-full"
                  use12Hours
                  format="hh:mm A"
                  minuteStep={5}
                />
              </Form.Item>

              <Form.Item label="Thời lượng" name="duration" initialValue={60} rules={[{ required: true, message: "Vui lòng chọn thời lượng" }]}>
                <Select styles={getDropdownStyle()}>
                  <Option value={15}>15 phút</Option>
                  <Option value={30}>30 phút</Option>
                  <Option value={45}>45 phút</Option>
                  <Option value={60}>1 giờ</Option>
                  <Option value={90}>1 giờ 30 phút</Option>
                  <Option value={120}>2 giờ</Option>
                </Select>
              </Form.Item>
            </div>

            {/* Phòng họp (giữ nguyên) */}
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

            {/* === 5. CẬP NHẬT JSX CHO THIẾT BỊ === */}
            <Form.Item label="Thiết bị sử dụng" name="deviceIds">
              <Select
                mode="multiple"
                placeholder={
                  !watchedDate || !watchedTime ? "Vui lòng chọn ngày và giờ trước" : "Chọn thiết bị khả dụng"
                }
                // Vô hiệu hóa nếu chưa chọn thời gian
                disabled={!watchedDate || !watchedTime || devicesLoading} 
                loading={devicesLoading} // Hiển thị spinner
                options={availableDevices.map((d) => ({ // <-- Dùng state mới
                  label: d.name,
                  value: d.id,
                }))}
                styles={getDropdownStyle()}
              />
            </Form.Item>
            {/* === KẾT THÚC CẬP NHẬT JSX === */}

            <Divider />

            {/* Người tham gia (giữ nguyên) */}
            <Form.Item
              label={
                <span>
                  <FiUsers className="inline mr-2" />
                  Người tham gia (Nội bộ)
                </span>
              }
              name="participantIds"
              tooltip="Gõ tên hoặc email để tìm đồng nghiệp. Bạn (người tạo) sẽ tự động được thêm."
            >
              <Select
                showSearch
                mode="multiple"
                placeholder="-- Gõ tên hoặc email để tìm người tham gia --"
                options={searchResults.map((u) => ({
                  label: `${u.fullName} (${u.username})`,
                  value: u.id,
                }))}
                onSearch={handleSearchUsers}
                loading={isSearching}
                filterOption={false}
                notFoundContent={
                  isSearching ? <Spin size="small" /> : "Không tìm thấy người dùng"
                }
                styles={getDropdownStyle()}
              />
            </Form.Item>

            {/* Email khách mời (giữ nguyên) */}
            <Form.Item
              label="Email khách mời (Bên ngoài)"
              name="guestEmails"
              tooltip="Nhập email của khách bên ngoài, nhấn Enter hoặc dấu phẩy (,) để thêm."
              rules={[
                {
                  type: "array",
                  validator: (rule, value) => {
                    if (!value || value.length === 0) return Promise.resolve();
                    const invalidEmails = value.filter(
                      (email) =>
                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                    );
                    if (invalidEmails.length > 0) {
                      return Promise.reject(
                        `Email không hợp lệ: ${invalidEmails.join(", ")}`
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                mode="tags"
                tokenSeparators={[",", ";", " "]}
                placeholder="Ví dụ: guest1@email.com, guest2@email.com, ..."
                styles={getDropdownStyle()}
              />
            </Form.Item>

            <Divider />

            {/* Lặp lại (giữ nguyên) */}
            <Form.Item name="isRecurring" valuePropName="checked">
              <Checkbox>Lặp lại cuộc họp này</Checkbox>
            </Form.Item>

            {isRecurring && (
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
                  <DatePicker 
                    className="w-full" 
                    format="DD/MM/YYYY" 
                    disabledDate={(current) => current && current < dayjs().startOf("day")}
                  />
                </Form.Item>
              </div>
            )}

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