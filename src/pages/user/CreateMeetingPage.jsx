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
  Spin, // Spinner khi tìm kiếm
} from "antd";
import { FiPlusCircle, FiUsers } from "react-icons/fi";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import utc from "dayjs/plugin/utc"; // <-- Đã import plugin
import { useAuth } from "../../context/AuthContext";

// Import các service cần thiết
import {
  createMeeting,
  getRooms,
  getDevices,
} from "../../services/meetingService";
import { searchUsers } from "../../services/userService";

dayjs.locale("vi");
dayjs.extend(utc); // <-- Kích hoạt plugin

const { TextArea } = Input;
const { Option } = Select;

const CreateMeetingPage = () => {
  const [loading, setLoading] = useState(false); // Loading khi submit form
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);

  // State cho việc tìm kiếm người dùng
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false); // Loading khi gõ tìm
  const debounceTimer = useRef(null); // Bộ đếm thời gian (debounce)

  const [form] = Form.useForm();
  const { user } = useAuth(); // Lấy user hiện tại

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

  // Tải dữ liệu ban đầu (Phòng & Thiết bị)
  useEffect(() => {
    const fetchDropdownData = async () => {
      // 1. Tải Phòng họp
      try {
        const roomRes = await getRooms();
        setRooms(roomRes.data || []);
      } catch (err) {
        console.error("❌ Lỗi tải phòng họp:", err);
        message.error("Không thể tải danh sách phòng họp!");
      }

      // 2. Tải Thiết bị
      try {
        const deviceRes = await getDevices();
        setDevices(deviceRes.data || []);
      } catch (err) {
        console.error("❌ Lỗi tải thiết bị:", err);
        message.error("Không thể tải danh sách thiết bị!");
      }
    };

    fetchDropdownData();
  }, []); // Chạy 1 lần khi trang mở

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

  // Hàm Tìm kiếm Người dùng (giữ nguyên)
  const handleSearchUsers = (query) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query && query.trim().length > 0) {
      setIsSearching(true);
      setSearchResults([]);

      debounceTimer.current = setTimeout(async () => {
        try {
          const res = await searchUsers(query);
          const filteredResults = (res.data || []).filter(u => u.id !== user?.id);
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

  // Hàm Gửi Form (Đã fix logic UTC)
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

      // Xây dựng thời gian UTC TỪ CÁC CON SỐ
      const startTimeUTC = dayjs.utc() // Bắt đầu ở UTC
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

      // (Logic payload giữ nguyên)
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

      console.log("📦 Payload gửi đi:", payload);
      await createMeeting(payload);
      message.success("✅ Tạo cuộc họp thành công!");
      form.resetFields();
    } catch (err) {
      console.error("❌ Lỗi tạo cuộc họp:", err);
      message.error(err.response?.data?.message || "Không thể tạo cuộc họp!");
    } finally {
      setLoading(false);
    }
  };
  
  const [isRecurring, setIsRecurring] = useState(false);

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-[#0f172a] transition-all duration-500">
      {/* Header (giữ nguyên) */}
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
            {/* Tên cuộc họp */}
            <Form.Item label="Tên cuộc họp" name="title" rules={[{ required: true, message: "Vui lòng nhập tên cuộc họp" }]}>
              <Input placeholder="Nhập tên cuộc họp..." />
            </Form.Item>

            {/* Thời gian */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Form.Item label="Ngày họp" name="date" rules={[{ required: true, message: "Vui lòng chọn ngày họp" }]}>
                <DatePicker className="w-full" format="DD/MM/YYYY" 
                disabledDate={(current) => current && current < dayjs().startOf("day")}
                />
              </Form.Item>
              
              {/* === VALIDATOR ĐÃ SỬA (FIX LỖI MÚI GIỜ) === */}
              <Form.Item
  label="Giờ bắt đầu"
  name="time"
  dependencies={['date']}
  rules={[
    { required: true, message: "Vui lòng chọn giờ họp" },
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
          .second(0)
          .millisecond(0);

        if (selectedUTC.isBefore(dayjs.utc().add(1, 'minute'))) {
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
    onSelect={(value) => {
      // Khi chọn giờ trực tiếp trong popup -> cập nhật ngay vào form
      if (value) form.setFieldValue('time', value);
    }}
    onOpenChange={(openStatus) => {
      // Khi popup đóng (click ra ngoài)
      const value = form.getFieldValue('time');
      if (value) form.setFieldValue('time', value);
    }}
  />
</Form.Item>
              {/* === KẾT THÚC SỬA LỖI === */}

              <Form.Item label="Thời lượng" name="duration" initialValue={60}>
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

            {/* Phòng họp */}
            <Form.Item label="Phòng họp" name="roomId" rules={[{ required: true, message: "Vui lòng chọn phòng họp" }]}>
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

            {/* Người tham gia (Nội bộ) */}
            <Form.Item 
              label={<span><FiUsers className="inline mr-2" />Người tham gia (Nội bộ)</span>}
              name="participantIds"
              tooltip="Gõ tên hoặc email để tìm đồng nghiệp. Bạn (người tạo) sẽ tự động được thêm."
            >
              <Select
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

            {/* Email khách mời (Bên ngoài) */}
            <Form.Item 
              label="Email khách mời (Bên ngoài)" 
              name="guestEmails"
              tooltip="Nhập email của khách bên ngoài, nhấn Enter hoặc dấu phẩy (,) để thêm."
              rules={[{ 
                type: 'array', 
                validator: (rule, value) => {
                  if (!value || value.length === 0) return Promise.resolve();
                  const invalidEmails = value.filter(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
                  if (invalidEmails.length > 0) {
                    return Promise.reject(`Email không hợp lệ: ${invalidEmails.join(', ')}`);
                  }
                  return Promise.resolve();
                }
              }]}
            >
              <Select
                mode="tags" 
                tokenSeparators={[',', ';', ' ']} 
                placeholder="Ví dụ: guest1@email.com, guest2@email.com, ..."
                styles={getDropdownStyle()}
              />
            </Form.Item>

            <Divider />
            
            {/* Logic lặp lại */}
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
                  <DatePicker className="w-full" format="DD/MM/YYYY" />
                </Form.Item>
              </div>
            )}
            
            {/* Mô tả */}
            <Form.Item label="Mô tả" name="description">
              <TextArea rows={4} placeholder="Nhập nội dung mô tả..." />
            </Form.Item>
            
            {/* Nút Submit */}
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
