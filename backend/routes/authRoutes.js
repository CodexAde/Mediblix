import express from "express";
import { authUser, getMe } from "../controllers/authController.js";
import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/login", authUser);
router.get("/me", protect, getMe);

export default router;
