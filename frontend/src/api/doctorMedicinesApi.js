// src/api/doctorMedicinesApi.js
import axios from "./axios"; 

// Public: get all medicines (for doctor & patient)
export const getAllMedicinesPublic = async () => {
  const { data } = await axios.get("/medicines");
  return data.medicines;
};

// Public: get one medicine (for doctor & patient)
export const getMedicineByIdPublic = async (id) => {
  const { data } = await axios.get(`/medicines/${id}`);
  return data.medicine;
};

// (Optional: keep old doctor names — but they reuse the same)
export const getAllMedicinesForDoctor = getAllMedicinesPublic;
export const getMedicineByIdForDoctor = getMedicineByIdPublic;
