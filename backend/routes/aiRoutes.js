import express from "express";
import { parseInvoice } from "../controllers/aiController.js";

const router = express.Router();

router.post("/parse-invoice", parseInvoice);

export default router;
