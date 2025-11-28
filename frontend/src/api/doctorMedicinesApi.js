import axios from "./axios";

// Get all medicines (public)
export const getAllMedicinesForDoctor = async () => {
  const { data } = await axios.get("/medicines");
  return data.medicines;
};

// Get single medicine (public)
export const getMedicineByIdForDoctor = async (id) => {
  const { data } = await axios.get(`/medicines/${id}`);
  return data.medicine;
};
