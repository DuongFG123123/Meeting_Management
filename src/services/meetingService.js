// src/services/meetingService.js
import api from '../utils/api';

/**
 * Phản hồi một lời mời họp (Chấp nhận / Từ chối)
 * API: POST /api/v1/meetings/{id}/respond
 * @param {number} meetingId - ID của cuộc họp
 * @param {'ACCEPTED' | 'DECLINED'} status - Trạng thái phản hồi
 */
export const respondToMeeting = (meetingId, status) => {
  return api.post(`/meetings/${meetingId}/respond`, {
    status: status 
  });
};

// ... (Bạn có thể thêm các hàm API meeting khác vào đây sau)
// ví dụ:
// export const getMyMeetings = (page = 0, size = 10) => {
//   return api.get('/meetings/my-meetings', { params: { page, size } });
// };
//
// export const createMeeting = (meetingData) => {
//   return api.post('/meetings', meetingData);
// };