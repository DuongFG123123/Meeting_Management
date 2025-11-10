import api from "../utils/api";

export const getRoomUsageReport = (from, to, format) =>
  api.get("/reports/room-usage", { params: { from, to, format } });

export const getCancelStats = (from, to, format) =>
  api.get("/reports/cancelation-stats", { params: { from, to, format } });
