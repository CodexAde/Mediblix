import express from "express";
import {
  getCustomers,
  createCustomer,
  searchCustomers,
} from "../controllers/customerController.js";

const router = express.Router();

router.route("/").get(getCustomers).post(createCustomer);
router.route("/search").get(searchCustomers);

export default router;
