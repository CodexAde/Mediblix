import express from "express";
import {
  authUser,
  logoutUser,
  getMe,
  updateUserProfile,
  changePassword,
} from "../controllers/authController.js";
import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/login", authUser);
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);

export default router;
