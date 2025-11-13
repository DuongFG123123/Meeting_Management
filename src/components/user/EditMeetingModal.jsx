// src/components/user/EditMeetingModal.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Button,
  Card,
  Divider,
  Checkbox,
  Spin,
  message,
} from "antd";
import { FiEdit, FiUsers } from "react-icons/fi";
import dayjs from "dayjs";
import { getRooms, getDevices, updateMeeting, updateRecurringSeries } from "../../services/meetingService";
import { searchUsers } from "../../services/userService";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const { TextArea } = Input;
const { Option } = Select;

const EditMeetingModal = ({ open, onCancel, meetingDetail, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);
  const debounceTimer = useRef(null);
  const { user } = useAuth();

  // Load rooms và devices khi modal mở
  useEffect(() => {
    if (!open || !meetingDetail) return;

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
  }, [open, meetingDetail]);

  // Populate form với dữ liệu hiện tại
  useEffect(() => {
    if (!meetingDetail || !open) return;

    const startTime = dayjs(meetingDetail.startTime);
    const endTime = dayjs(meetingDetail.endTime);
    const duration = endTime.diff(startTime, "minute");

    // Kiểm tra xem có phải cuộc họp định kỳ không
    const hasRecurrence = !!meetingDetail.recurrenceRule;
    setIsRecurring(hasRecurrence);
    setShowRecurringOptions(hasRecurrence);

    form.setFieldsValue({
      title: meetingDetail.title,
      date: startTime,
      time: startTime,
      duration: duration,
      roomId: meetingDetail.room?.id,
      deviceIds: meetingDetail.devices?.map(d => d.id) || [],
      participantIds: meetingDetail.participants?.map(p => p.id).filter(id => id !== user?.id) || [],
      guestEmails: meetingDetail.guestEmails || [],
      description: meetingDetail.description || "",
      isRecurring: hasRecurrence,
      frequency: meetingDetail.recurrenceRule?.frequency || "DAILY",
      repeatUntil: meetingDetail.recurrenceRule?.repeatUntil ? dayjs(meetingDetail.recurrenceRule.repeatUntil) : undefined,
    });

    // Thêm participants hiện tại vào searchResults để hiển thị
    if (meetingDetail.participants) {
      setSearchResults(meetingDetail.participants.filter(p => p.id !== user?.id));
    }
  }, [meetingDetail, open, form, user]);

  // Tìm kiếm người dùng
  const handleSearchUsers = (query) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (query && query.trim().length > 0) {
      setIsSearching(true);
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
    }
  };

  // Xử lý cập nhật cuộc họp
  const handleUpdate = async (values) => {
    try {
      setLoading(true);

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

      // Backend yêu cầu gửi đầy đủ payload, không cho phép partial update
      // Chỉ kiểm tra xem có thay đổi gì không để thông báo cho user
      const hasChanges = 
        values.title !== meetingDetail.title ||
        (values.description || "") !== (meetingDetail.description || "") ||
        dayjs(startTime).format() !== dayjs(meetingDetail.startTime).format() ||
        dayjs(endTime).format() !== dayjs(meetingDetail.endTime).format() ||
        values.roomId !== meetingDetail.room?.id ||
        JSON.stringify((values.deviceIds || []).sort()) !== JSON.stringify((meetingDetail.devices || []).map(d => d.id).sort()) ||
        JSON.stringify(participantIds.sort()) !== JSON.stringify((meetingDetail.participants || []).map(p => p.id).sort()) ||
        JSON.stringify((values.guestEmails || []).sort()) !== JSON.stringify((meetingDetail.guestEmails || []).sort());

      if (!hasChanges) {
        toast.info("Không có thay đổi nào để cập nhật!");
        return;
      }

      // Gửi đầy đủ payload vì backend yêu cầu
      const payload = {
        title: values.title,
        description: values.description || "",
        startTime,
        endTime,
        roomId: values.roomId,
        participantIds,
        deviceIds: values.deviceIds || [],
        guestEmails: values.guestEmails || [],
      };

      // Nếu là cuộc họp định kỳ và chọn cập nhật toàn bộ chuỗi
      if (values.isRecurring && meetingDetail.recurrenceSeriesId) {
        payload.recurrenceRule = {
          frequency: values.frequency || "DAILY",
          interval: 1,
          repeatUntil: dayjs(values.repeatUntil || values.date).format("YYYY-MM-DD"),
        };
        payload.onBehalfOfUserId = null;
        
        await updateRecurringSeries(meetingDetail.recurrenceSeriesId, payload);
        toast.success("Cập nhật toàn bộ chuỗi cuộc họp định kỳ thành công!");
      } else {
        // Cuộc họp đơn lẻ
        await updateMeeting(meetingDetail.id, payload);
        toast.success("Cập nhật cuộc họp thành công!");
      }
      
      onSuccess();
      onCancel();
    } catch (err) {
      console.error("Lỗi cập nhật cuộc họp:", err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Không thể cập nhật cuộc họp!";
      
      // Xử lý trường hợp backend trả về object lỗi validation
      if (err?.response?.data && typeof err.response.data === 'object' && !err.response.data.error && !err.response.data.message) {
        const errors = Object.entries(err.response.data).map(([field, msg]) => `${field}: ${msg}`).join(', ');
        toast.error(`Lỗi validation: ${errors}`);
        return;
      }
      
      if (msg.toLowerCase().includes("bảo trì") && msg.toLowerCase().includes("phòng")) {
        toast.error("Phòng họp đang bảo trì, vui lòng chọn phòng khác!");
      } else if (msg.toLowerCase().includes("bảo trì") && msg.toLowerCase().includes("thiết bị")) {
        toast.error("Thiết bị đang bảo trì, vui lòng bỏ chọn thiết bị này!");
      } else if (msg.toLowerCase().includes("đã bị đặt") || (msg.toLowerCase().includes("phòng") && msg.toLowerCase().includes("lúc"))) {
        toast.error("Phòng họp đã được đặt trong khung giờ này. Vui lòng chọn phòng hoặc thời gian khác!");
      } else if (msg.toLowerCase().includes("trùng lịch") || msg.toLowerCase().includes("người tham dự")) {
        toast.warning("Một số người tham gia bị trùng lịch.");
      } else if (err.response?.status === 403) {
        toast.error("Không có quyền cập nhật cuộc họp này!");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={650}
      closable={!loading}
      maskClosable={!loading}
      title={
        <span className="flex items-center gap-2 dark:text-white text-lg font-semibold">
          <FiEdit /> Chỉnh sửa cuộc họp
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
          disabled={loading}
          onFinish={handleUpdate}
          onValuesChange={(vals) => {
            if (vals.isRecurring !== undefined) {
              setIsRecurring(vals.isRecurring);
              setShowRecurringOptions(vals.isRecurring);
            }
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

          {/* Ghi chú */}
          <Form.Item label="Ghi chú" name="description">
            <TextArea
              rows={3}
              placeholder="Ghi chú thêm cho cuộc họp..."
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </Form.Item>

          <Divider className="dark:border-gray-700" />

          {/* Lặp lại cuộc họp */}
          {meetingDetail?.recurrenceSeriesId && (
            <>
              <Form.Item name="isRecurring" valuePropName="checked" className="mb-1">
                <Checkbox className="dark:text-gray-200">
                  Cập nhật lặp lại cuộc họp (toàn bộ chuỗi)
                </Checkbox>
              </Form.Item>

              {showRecurringOptions && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Form.Item 
                    name="frequency" 
                    label="Tần suất lặp"
                    rules={[{ required: isRecurring, message: "Chọn tần suất" }]}
                  >
                    <Select
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      popupClassName="dark:bg-gray-700 dark:text-gray-100"
                    >
                      <Option value="DAILY">Hằng ngày</Option>
                      <Option value="WEEKLY">Hằng tuần</Option>
                      <Option value="MONTHLY">Hằng tháng</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item 
                    name="repeatUntil" 
                    label="Lặp đến ngày"
                    rules={[{ required: isRecurring, message: "Chọn ngày kết thúc" }]}
                  >
                    <DatePicker
                      className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      format="DD/MM/YYYY"
                      disabledDate={(current) => current && current < dayjs().startOf("day")}
                    />
                  </Form.Item>
                </div>
              )}
            </>
          )}

          {/* Nút hành động */}
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={onCancel} disabled={loading}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Cập nhật
            </Button>
          </div>
        </Form>
      </Card>
    </Modal>
  );
};

export default EditMeetingModal;