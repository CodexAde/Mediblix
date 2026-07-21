import express from "express";
import {
  getPurchaseOrders,
  createPurchaseOrder,
  deletePurchaseOrder,
  updatePurchaseOrderStatus,
  getPurchaseOrderById,
} from "../controllers/purchaseOrderController.js";

const router = express.Router();

router.route("/").get(getPurchaseOrders).post(createPurchaseOrder);
router.route("/:id").get(getPurchaseOrderById).delete(deletePurchaseOrder);
router.route("/:id/status").patch(updatePurchaseOrderStatus);

export default router;
