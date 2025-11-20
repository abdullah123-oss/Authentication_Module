import axios from "./axios";

// Get doctor appointments (optionally filtered by doctorId + date)
export const getDoctorAppointmentsApi = async (doctorId, date) => {
  const params = {};
  if (doctorId) params.doctorId = doctorId;
  if (date) params.date = date;
  const { data } = await axios.get("/appointments/doctor", { params });
  return data;
};

// Approve appointment
// Approve appointment
export const approveAppointmentApi = async (id) => {
  const { data } = await axios.put(`/appointments/approve/${id}`);
  return data;
};

// Reject appointment
export const rejectAppointmentApi = async (id) => {
  const { data } = await axios.put(`/appointments/reject/${id}`);
  return data;
};



// Cancel appointment
export const cancelAppointmentApi = async (appointmentId) => {
  const { data } = await axios.put(`/appointments/cancel/${appointmentId}`);
  return data;
};
