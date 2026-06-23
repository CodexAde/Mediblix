import express from "express";
import { parseInvoice, parseBill } from "../controllers/aiController.js";

const router = express.Router();

router.post("/parse-invoice", parseInvoice);
router.post("/parse-bill", parseBill);

export default router;
