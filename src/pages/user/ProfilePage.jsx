// src/pages/user/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Card, Spin } from "antd";
import { FiUser, FiSave } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { getMyProfile, updateMyProfile } from "../../services/userService";

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true); // Bắt đầu là true để tải
  const [saving, setSaving] = useState(false); // Loading cho nút Lưu
  const { user } = useAuth(); // Chỉ dùng để kiểm tra đã đăng nhập

  // 1. Tải thông tin profile (fullName) khi trang mở
  useEffect(() => {
    // Chỉ tải nếu đã đăng nhập
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Gọi API GET /api/v1/users/profile
        const res = await getMyProfile(); 
        
        // Gán fullName vào form
        form.setFieldsValue({
          fullName: res.data.fullName,
        });
      } catch (err) {
        console.error("Lỗi tải thông tin cá nhân:", err);
        message.error("Không thể tải thông tin cá nhân.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, form]); // Chạy lại nếu user thay đổi

  // 2. Xử lý khi nhấn nút Lưu
  const handleSave = async (values) => {
    setSaving(true);
    try {
      // Chỉ gửi đi fullName theo yêu cầu của API
      const payload = {
        fullName: values.fullName,
      };

      // Gọi API PUT /api/v1/users/profile
      await updateMyProfile(payload);
      message.success("Cập nhật thông tin thành công!");

    } catch (err) {
      console.error("Lỗi cập nhật thông tin:", err);
      message.error("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <FiUser />
        Thông tin cá nhân
      </h1>
      
      <Card 
        className="shadow-lg bg-white dark:bg-[#1e293b] border dark:border-gray-700"
        variant="borderless"
      >
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spin size="large" />
          </div>
        ) : (
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleSave}
            className="dark:text-gray-100"
          >
            {/* === BỎ: Trường Email === */}

            {/* Họ và tên (Cho phép sửa) */}
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
              className="dark:[&_.ant-form-item-label>label]:text-gray-300"
            >
              <Input 
                placeholder="Nhập họ và tên đầy đủ của bạn"
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
              />
            </Form.Item>

            {/* Nút Lưu */}
            <Form.Item className="mt-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                icon={<FiSave />}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;