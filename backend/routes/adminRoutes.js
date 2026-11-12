import express from "express";
import {
  adminLogin,
  getAdminStats,
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  updateOrgSubscription,
  resetOrgDeviceSession,
  toggleOrganizationStatus,
  resetOrgPassword,
} from "../controllers/adminController.js";
import { protect, superAdminOnly } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/stats", protect, superAdminOnly, getAdminStats);
router.get("/organizations", protect, superAdminOnly, getOrganizations);
router.post("/organizations", protect, superAdminOnly, createOrganization);
router.get("/organizations/:id", protect, superAdminOnly, getOrganizationById);
router.put("/organizations/:id", protect, superAdminOnly, updateOrganization);
router.patch("/organizations/:id/status", protect, superAdminOnly, toggleOrganizationStatus);
router.patch("/organizations/:id/subscription", protect, superAdminOnly, updateOrgSubscription);
router.post("/organizations/:id/reset-device-session", protect, superAdminOnly, resetOrgDeviceSession);
router.post("/organizations/:id/reset-password", protect, superAdminOnly, resetOrgPassword);

export default router;
