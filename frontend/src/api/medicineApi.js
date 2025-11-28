import API from "./axios";

export const getAllMedicinesApi = async () => {
  const { data } = await API.get("/admin/medicines");
  return data;
};

export const createMedicineApi = async (formData) => {
  const { data } = await API.post("/admin/medicines", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateMedicineApi = async ({ id, data: formData }) => {
  const { data: res } = await API.put(`/admin/medicines/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
};

export const deleteMedicineApi = async (id) => {
  const { data } = await API.delete(`/admin/medicines/${id}`);
  return data;
};

export const getMedicineByIdApi = async (id) => {
  const { data } = await API.get(`/admin/medicines/${id}`);
  return data;
};
