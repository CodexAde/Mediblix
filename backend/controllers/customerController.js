import Customer from "../models/Customer.js";

// @desc    Get all customers
// @route   GET /api/customers
// @access  Public
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a customer
// @route   POST /api/customers
// @access  Public
const createCustomer = async (req, res) => {
  const { name, mobile, email } = req.body;

  try {
    const customerExists = await Customer.findOne({ mobile });

    if (customerExists) {
      // Update existing customer info if needed, or just return existing
      customerExists.name = name || customerExists.name;
      customerExists.email = email || customerExists.email;
      const updatedCustomer = await customerExists.save();
      return res.status(200).json(updatedCustomer);
    }

    const customer = await Customer.create({
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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search customers
// @route   GET /api/customers/search?q=query
// @access  Public
const searchCustomers = async (req, res) => {
  const { q } = req.query;
  try {
    const keyword = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { mobile: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const customers = await Customer.find({ ...keyword });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getCustomers, createCustomer, searchCustomers };
