
import api from "../utils/api";

export const getRoomUsageReport = (from, to) =>
  api.get("/reports/room-usage", { params: { from, to } });

export const getCancelStats = (from, to) =>
  api.get("/reports/cancelation-stats", { params: { from, to } });
