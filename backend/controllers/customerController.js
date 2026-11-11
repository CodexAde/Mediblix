import Customer from "../models/Customer.js";
import { getTenantQuery, getTenantContext } from "../utils/tenantHelper.js";

const getCustomers = async (req, res) => {
  try {
    const tenantQuery = await getTenantQuery(req);
    const customers = await Customer.find(tenantQuery).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const createCustomer = async (req, res) => {
  const { name, mobile, email } = req.body;

  try {
    const orgId = await getTenantContext(req);
    const customerExists = await Customer.findOne({ mobile, organization: orgId });

    if (customerExists) {
      customerExists.name = name || customerExists.name;
      customerExists.email = email || customerExists.email;
      const updatedCustomer = await customerExists.save();
      return res.status(200).json(updatedCustomer);
    }

    const customer = await Customer.create({
      organization: orgId,
      name,
      mobile,
      email,
    });

    if (customer) {
      res.status(201).json(customer);
    } else {
      res.status(400);
      throw new Error("Invalid customer data");
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const searchCustomers = async (req, res) => {
  const { q } = req.query;
  try {
    const tenantQuery = await getTenantQuery(req);
    const keyword = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { mobile: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const customers = await Customer.find({ ...keyword, ...tenantQuery });
    res.json(customers);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const tenantQuery = await getTenantQuery(req);
    const customer = await Customer.findOne({ _id: req.params.id, ...tenantQuery }).populate({
      path: "purchaseHistory",
      populate: {
        path: "items.product",
        select: "name price",
      },
    });
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ message: "Customer not found" });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export { getCustomers, createCustomer, searchCustomers, getCustomerById };
