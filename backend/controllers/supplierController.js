import Supplier from "../models/Supplier.js";

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({}).sort({ name: 1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSupplier = async (req, res) => {
  const { name, email, phone, address } = req.body;

  if (!name || !email || !phone || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const exists = await Supplier.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Supplier already exists" });
    }

    const supplier = await Supplier.create({
      name,
      email,
      phone,
      address,
    });

    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    await supplier.deleteOne();
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getSuppliers, createSupplier, deleteSupplier };
