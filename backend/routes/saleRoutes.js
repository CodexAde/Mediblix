import express from "express";
import {
  createSale,
  getSales,
  generateInvoice,
} from "../controllers/saleController.js";

const router = express.Router();

router.route("/").post(createSale).get(getSales);
router.route("/:id/invoice").get(generateInvoice);

export default router;
