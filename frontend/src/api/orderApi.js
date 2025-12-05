import API from "./axios";

export const createPaymentIntentApi = async () =>
  (await API.post("/orders/create-payment-intent")).data;

export const getMyOrdersApi = async () =>
  (await API.get("/orders/my")).data;
