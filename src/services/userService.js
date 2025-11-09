import api from "../utils/api";

export const getAllUsers = () => api.get("/admin/users");

export const getUserById = (id) => api.get(`/admin/users/${id}`);

export const createUser = (data) => api.post("/auth/register", data);

export const updateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data);

export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

export const searchUsers = (query) => {
  return api.get('/users/search', {
    params: { 
      query: query 
    }
  });
};