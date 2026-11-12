import express from "express";
import { authUser, logoutUser, getMe } from "../controllers/authController.js";
import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/login", authUser);
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);

export default router;
