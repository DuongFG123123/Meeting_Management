//deviceSevice.js
import api from "../utils/api";

export const getDevices = () => api.get("/devices");
export const createDevice = (data) => api.post("/devices", data);
export const updateDevice = (id, data) => api.put(`/devices/${id}`, data);
export const deleteDevice = (id) => api.delete(`/devices/${id}`);
