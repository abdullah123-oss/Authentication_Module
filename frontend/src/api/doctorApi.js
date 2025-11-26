import axios from "./axios"; // or wherever you keep axios setup

export const getAllDoctorsApi = async () => {
  const { data } = await axios.get("/doctors");
  return data;
};
// Fetch doctor’s current availability
export const getAvailabilityApi = async () => {
  const { data } = await axios.get("/doctor/availability");
  return data.availability || [];
};

// Save/update availability
export const setAvailabilityApi = async (slots) => {
  const { data } = await axios.post("/doctor/availability", { slots });
  return data;
};

// Fetch single doctor by ID (public)
export const getDoctorByIdApi = async (id) => {
  const { data } = await axios.get(`/doctors/${id}`);
  return data;
};

