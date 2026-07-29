import express from "express";
import { handleChat, getAlternatives, getCategories } from "../controllers/medAgentController.js";

const router = express.Router();

router.post("/chat", handleChat);
router.post("/alternatives", getAlternatives);
router.get("/categories", getCategories);

export default router;
