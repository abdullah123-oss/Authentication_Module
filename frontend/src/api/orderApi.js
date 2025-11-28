import API from "./axios";

export const createPaymentIntentApi = async (cart) =>
  (await API.post("/orders/create-payment-intent", { cart })).data;

export const createOrderApi = async (orderPayload) =>
  (await API.post("/orders", orderPayload)).data;

export const getMyOrdersApi = async () =>
  (await API.get("/orders/my")).data;
