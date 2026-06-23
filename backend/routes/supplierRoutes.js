import express from "express";
import { getSuppliers, createSupplier, deleteSupplier } from "../controllers/supplierController.js";

const router = express.Router();

router.route("/").get(getSuppliers).post(createSupplier);
router.route("/:id").delete(deleteSupplier);

export default router;
