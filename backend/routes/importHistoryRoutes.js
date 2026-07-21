import express from "express";
import { getImportHistory, createImportRecord, deleteImportRecord } from "../controllers/importHistoryController.js";

const router = express.Router();

router.route("/").get(getImportHistory).post(createImportRecord);
router.route("/:id").delete(deleteImportRecord);

export default router;
