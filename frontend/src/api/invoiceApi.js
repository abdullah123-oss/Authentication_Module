import API from "./axios";
import fileDownload from "js-file-download";

// 🧾 Medicine Order Invoice
export const downloadOrderInvoiceApi = async (orderId, invoiceNumber) => {
  const res = await API.get(`/invoices/order/${orderId}`, {
    responseType: "blob",
  });
  fileDownload(res.data, `Invoice-${invoiceNumber}.pdf`);
};

// 🧾 Appointment Invoice
export const downloadAppointmentInvoiceApi = async (appointmentId, invoiceNumber) => {
  const res = await API.get(`/invoices/appointment/${appointmentId}`, {
    responseType: "blob",
  });
  return res;
};
