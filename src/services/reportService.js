import api from "../utils/api";

// Thống kê khách mời
export const getVisitorReport = () => api.get("/reports/visitors");

// Báo cáo tần suất sử dụng phòng
export const getRoomUsageReport = () => api.get("/reports/room-usage");

// Thống kê lý do hủy họp
export const getCancelStats = () => api.get("/reports/cancelation-stats");
