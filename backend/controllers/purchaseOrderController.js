import PurchaseOrder from "../models/PurchaseOrder.js";

const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPurchaseOrder = async (req, res) => {
  const { supplierName, supplierEmail, supplierPhone, deliveryAddress, items, expectedDeliveryDate } = req.body;

  if (!supplierName || !items || !Array.isArray(items)) {
    return res.status(400).json({ message: "Supplier name and items array are required" });
  }

  try {
    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += Number(item.quantity) * Number(item.price);
    });

    const order = await PurchaseOrder.create({
      supplierName,
      supplierEmail,
      supplierPhone,
      deliveryAddress,
      items,
      totalAmount,
      status: "Pending",
      expectedDeliveryDate,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    await order.deleteOne();
    res.json({ message: "Purchase order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePurchaseOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({ message: "Cannot change status of a delivered purchase order" });
    }


    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPurchaseOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getPurchaseOrders, createPurchaseOrder, deletePurchaseOrder, updatePurchaseOrderStatus, getPurchaseOrderById };
