import express from "express";
import {
  createSale,
  getSales,
  generateInvoice,
  processReturn,
} from "../controllers/saleController.js";

const router = express.Router();

router.route("/").post(createSale).get(getSales);
router.route("/:id/invoice").get(generateInvoice);
router.route("/:id/return").post(processReturn);

export default router;
