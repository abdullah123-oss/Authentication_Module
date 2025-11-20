import axios from "./axios";

export const bookAppointmentApi = async (payload) => {
  const { data } = await axios.post("/appointments/book", payload);
  return data;
};

export const getPatientAppointmentsApi = async () => {
  const { data } = await axios.get("/appointments/patient");
  return data;
};

export const cancelAppointmentApi = async (appointmentId) => {
  const { data } = await axios.put(`/appointments/cancel/${appointmentId}`);
  return data;
};
