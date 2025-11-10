// src/services/notificationService.js
import api from '../utils/api';

/**
 * 1. Lấy số lượng thông báo chưa đọc
 * API: GET /api/v1/notifications/unread-count
 */
export const getUnreadCount = () => {
  // API này trả về một đối tượng { "unreadCount": 5 } (ví dụ)
  // Sửa: API của bạn trả về { "additionalProp1": 0, ... }
  // Chúng ta sẽ giả định nó trả về một số trực tiếp, hoặc một object.
  // Nếu API trả về { "unreadCount": 5 }, dùng: return api.get('/notifications/unread-count');
  
  // Dựa trên tài liệu API của bạn (additionalProp1...), 
  // có vẻ nó đang trả về một Map<String, Long>. 
  // Hãy hỏi backend để làm rõ, nhưng tạm thời chúng ta sẽ dùng 1 key cố định
  // hoặc giả định nó trả về 1 object có key 'count' hoặc 'unreadCount'.
  
  // Giả định đơn giản nhất:
  return api.get('/notifications/unread-count');
};

/**
 * 2. Lấy danh sách thông báo (có phân trang)
 * API: GET /api/v1/notifications
 * @param {number} page - Số trang (bắt đầu từ 0)
 * @param {number} size - Kích thước trang
 */
export const getNotifications = (page = 0, size = 5) => {
  return api.get('/notifications', {
    params: {
      page,
      size,
      sort: 'createdAt,desc' // Sắp xếp theo mới nhất
    }
  });
};

/**
 * 3. Đánh dấu 1 thông báo là đã đọc
 * API: POST /api/v1/notifications/{id}/read
 * @param {number} id - ID của thông báo
 */
export const markAsRead = (id) => {
  return api.post(`/notifications/${id}/read`);
};

/**
 * 4. Đánh dấu tất cả thông báo là đã đọc
 * API: POST /api/v1/notifications/read-all
 */
export const markAllAsRead = () => {
  return api.post('/notifications/read-all');
};