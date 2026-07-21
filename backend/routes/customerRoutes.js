import express from "express";
import {
  getCustomers,
  createCustomer,
  searchCustomers,
  getCustomerById,
} from "../controllers/customerController.js";

const router = express.Router();

router.route("/").get(getCustomers).post(createCustomer);
router.route("/search").get(searchCustomers);
router.route("/:id").get(getCustomerById);

export default router;
