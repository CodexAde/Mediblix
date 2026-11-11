import Supplier from "../models/Supplier.js";
import { getTenantQuery, getTenantContext } from "../utils/tenantHelper.js";

const getSuppliers = async (req, res) => {
  try {
    const tenantQuery = await getTenantQuery(req);
    const suppliers = await Supplier.find(tenantQuery).sort({ name: 1 });
    res.json(suppliers);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const createSupplier = async (req, res) => {
  const { name, email, phone, address } = req.body;

  if (!name || !email || !phone || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const orgId = await getTenantContext(req);
    const exists = await Supplier.findOne({ name, organization: orgId });
    if (exists) {
      return res.status(400).json({ message: "Supplier already exists in this organization" });
    }

    const supplier = await Supplier.create({
      organization: orgId,
      name,
      email,
      phone,
      address,
    });

    res.status(201).json(supplier);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const tenantQuery = await getTenantQuery(req);
    const supplier = await Supplier.findOne({ _id: req.params.id, ...tenantQuery });
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    await supplier.deleteOne();
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export { getSuppliers, createSupplier, deleteSupplier };
