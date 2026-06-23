import api from "./api";

const getPurchaseOrders = async () => {
  const response = await api.get("/purchase-orders");
  return response.data;
};

const createPurchaseOrder = async (orderData) => {
  const response = await api.post("/purchase-orders", orderData);
  return response.data;
};

const deletePurchaseOrder = async (id) => {
  const response = await api.delete(`/purchase-orders/${id}`);
  return response.data;
};

const updatePurchaseOrderStatus = async (id, status) => {
  const response = await api.patch(`/purchase-orders/${id}/status`, { status });
  return response.data;
};

const getPurchaseOrderById = async (id) => {
  const response = await api.get(`/purchase-orders/${id}`);
  return response.data;
};

export default {
  getPurchaseOrders,
  createPurchaseOrder,
  deletePurchaseOrder,
  updatePurchaseOrderStatus,
  getPurchaseOrderById,
};
