// src/api/adminOrdersApi.js
import API from "./axios";

// Get all orders (admin)
export const adminGetAllOrdersApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const { data } = await API.get(`/admin/orders?${query}`);
  return data.orders;
};

// Get single order
export const adminGetOrderByIdApi = async (id) => {
  const { data } = await API.get(`/admin/orders/${id}`);
  return data.order;
};

// Update order status
export const adminUpdateOrderStatusApi = async (id, status) => {
  const { data } = await API.put(`/admin/orders/${id}/status`, {
    orderStatus: status,
  });
  return data.order;
};

// Delete order
export const adminDeleteOrderApi = async (id) => {
  const { data } = await API.delete(`/admin/orders/${id}`);
  return data;
};
