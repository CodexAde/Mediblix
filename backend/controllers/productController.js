import Product from "../models/Product.js";
import ImportHistory from "../models/ImportHistory.js";
import Supplier from "../models/Supplier.js";
import Customer from "../models/Customer.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import { getTenantQuery, getTenantContext } from "../utils/tenantHelper.js";

const getProducts = async (req, res) => {
  try {
    const tenantQuery = await getTenantQuery(req);
    const products = await Product.find(tenantQuery);
    res.json(products);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const tenantQuery = await getTenantQuery(req);
    const product = await Product.findOne({ _id: req.params.id, ...tenantQuery });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const searchProducts = async (req, res) => {
  const { q } = req.query;
  try {
    const tenantQuery = await getTenantQuery(req);
    const keyword = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { sku: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const products = await Product.find({ ...keyword, ...tenantQuery });
    res.json(products);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  const { name, sku, category, price, quantity, status, expiryDate, mfgDate, hsn, packaging, tabletsPerStrip } = req.body;

  try {
    const orgId = await getTenantContext(req);
    const productExists = await Product.findOne({ sku, organization: orgId });

    if (productExists) {
      res.status(400);
      throw new Error("Product already exists with this SKU in this organization");
    }

    const product = await Product.create({
      organization: orgId,
      name,
      sku,
      category,
      price,
      quantity,
      status,
      expiryDate,
      mfgDate,
      hsn,
      packaging,
      tabletsPerStrip,
    });

    if (product) {
      const qty = Number(quantity) || 0;
      const unitPrice = Number(price) || 0;

      await ImportHistory.create({
        organization: orgId,
        fileName: "Manual Entry",
        totalProducts: 1,
        totalQuantity: qty,
        totalValue: qty * unitPrice,
        items: [
          {
            name: product.name,
            sku: product.sku,
            category: product.category,
            quantity: qty,
            price: unitPrice,
            status: "New",
          },
        ],
      });

      res.status(201).json(product);
    } else {
      res.status(400);
      throw new Error("Invalid product data");
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { name, sku, category, price, quantity, status, expiryDate, mfgDate, hsn, packaging, tabletsPerStrip } = req.body;

  try {
    const tenantQuery = await getTenantQuery(req);
    const product = await Product.findOne({ _id: req.params.id, ...tenantQuery });

    if (product) {
      product.name = name || product.name;
      product.sku = sku || product.sku;
      product.category = category || product.category;
      product.price = price || product.price;
      product.quantity = quantity !== undefined ? quantity : product.quantity;
      product.status = status || product.status;
      product.expiryDate = expiryDate || product.expiryDate;
      product.mfgDate = mfgDate || product.mfgDate;
      product.hsn = hsn || product.hsn;
      product.packaging = packaging || product.packaging;
      product.tabletsPerStrip = tabletsPerStrip !== undefined ? tabletsPerStrip : product.tabletsPerStrip;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const tenantQuery = await getTenantQuery(req);
    const product = await Product.findOne({ _id: req.params.id, ...tenantQuery });

    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const seedSampleProducts = async (req, res) => {
  try {
    const orgId = await getTenantContext(req);

    const sampleProducts = [
      {
        name: "Calpol 650",
        sku: "PHR-CAL650",
        category: "Analgesics",
        quantity: 250,
        price: 32,
        status: "In Stock",
        hsn: "300490",
        batchNumber: "BTH-2026-01",
        mfgDate: new Date("2026-01-10"),
        expiryDate: new Date("2028-12-31"),
        packaging: "15 Tablets / Strip",
        tabletsPerStrip: 15,
        organization: orgId,
      },
      {
        name: "Dolo 650",
        sku: "PHR-DOL650",
        category: "Analgesics",
        quantity: 300,
        price: 30,
        status: "In Stock",
        hsn: "300490",
        batchNumber: "BTH-2026-02",
        mfgDate: new Date("2026-02-15"),
        expiryDate: new Date("2028-11-30"),
        packaging: "15 Tablets / Strip",
        tabletsPerStrip: 15,
        organization: orgId,
      },
      {
        name: "Augmentin 625 Duo",
        sku: "PHR-AUG625",
        category: "Antibiotics",
        quantity: 120,
        price: 205,
        status: "In Stock",
        hsn: "300420",
        batchNumber: "BTH-2026-03",
        mfgDate: new Date("2026-01-20"),
        expiryDate: new Date("2027-10-31"),
        packaging: "10 Tablets / Strip",
        tabletsPerStrip: 10,
        organization: orgId,
      },
      {
        name: "Mox 500",
        sku: "PHR-MOX500",
        category: "Antibiotics",
        quantity: 150,
        price: 115,
        status: "In Stock",
        hsn: "300420",
        batchNumber: "BTH-2026-04",
        mfgDate: new Date("2026-03-01"),
        expiryDate: new Date("2028-02-28"),
        packaging: "10 Tablets / Strip",
        tabletsPerStrip: 10,
        organization: orgId,
      },
      {
        name: "Glycomet 500",
        sku: "PHR-GLY500",
        category: "Diabetes",
        quantity: 350,
        price: 85,
        status: "In Stock",
        hsn: "300490",
        batchNumber: "BTH-2026-05",
        mfgDate: new Date("2026-01-05"),
        expiryDate: new Date("2028-06-30"),
        packaging: "10 Tablets / Strip",
        tabletsPerStrip: 10,
        organization: orgId,
      },
      {
        name: "Limcee 500",
        sku: "PHR-LIM500",
        category: "Vitamins",
        quantity: 500,
        price: 42,
        status: "In Stock",
        hsn: "300450",
        batchNumber: "BTH-2026-06",
        mfgDate: new Date("2026-02-10"),
        expiryDate: new Date("2028-05-31"),
        packaging: "15 Tablets / Strip",
        tabletsPerStrip: 15,
        organization: orgId,
      },
      {
        name: "Pan-D",
        sku: "PHR-PAND",
        category: "Antacids",
        quantity: 220,
        price: 180,
        status: "In Stock",
        hsn: "300490",
        batchNumber: "BTH-2026-07",
        mfgDate: new Date("2026-03-12"),
        expiryDate: new Date("2027-12-31"),
        packaging: "10 Tablets / Strip",
        tabletsPerStrip: 10,
        organization: orgId,
      },
      {
        name: "Omez 20",
        sku: "PHR-OME20",
        category: "Antacids",
        quantity: 180,
        price: 65,
        status: "In Stock",
        hsn: "300490",
        batchNumber: "BTH-2026-08",
        mfgDate: new Date("2026-01-18"),
        expiryDate: new Date("2028-04-30"),
        packaging: "20 Tablets / Strip",
        tabletsPerStrip: 20,
        organization: orgId,
      },
      {
        name: "Telma 40",
        sku: "PHR-TEL40",
        category: "Cardiology",
        quantity: 190,
        price: 220,
        status: "In Stock",
        hsn: "300490",
        batchNumber: "BTH-2026-09",
        mfgDate: new Date("2026-02-22"),
        expiryDate: new Date("2028-09-30"),
        packaging: "15 Tablets / Strip",
        tabletsPerStrip: 15,
        organization: orgId,
      },
      {
        name: "Cetirizine 10",
        sku: "PHR-CET10",
        category: "Antihistamines",
        quantity: 400,
        price: 25,
        status: "In Stock",
        hsn: "300490",
        batchNumber: "BTH-2026-10",
        mfgDate: new Date("2026-03-05"),
        expiryDate: new Date("2028-08-31"),
        packaging: "10 Tablets / Strip",
        tabletsPerStrip: 10,
        organization: orgId,
      },
      {
        name: "Azee 500",
        sku: "PHR-AZE500",
        category: "Antibiotics",
        quantity: 140,
        price: 140,
        status: "In Stock",
        hsn: "300420",
        batchNumber: "BTH-2026-11",
        mfgDate: new Date("2026-01-25"),
        expiryDate: new Date("2027-11-30"),
        packaging: "5 Tablets / Strip",
        tabletsPerStrip: 5,
        organization: orgId,
      },
      {
        name: "Shelcal 500",
        sku: "PHR-SHE500",
        category: "Vitamins",
        quantity: 260,
        price: 110,
        status: "In Stock",
        hsn: "300450",
        batchNumber: "BTH-2026-12",
        mfgDate: new Date("2026-02-08"),
        expiryDate: new Date("2028-07-31"),
        packaging: "15 Tablets / Strip",
        tabletsPerStrip: 15,
        organization: orgId,
      },
    ];

    const inserted = await Product.insertMany(sampleProducts);

    const supCount = await Supplier.countDocuments({ organization: orgId });
    if (supCount === 0) {
      await Supplier.insertMany([
        {
          name: "Cipla Pharmaceuticals",
          email: "info@cipla.com",
          phone: "9876543210",
          address: "Peninsula Chambers, Lower Parel, Mumbai",
          organization: orgId,
        },
        {
          name: "Sun Pharma Industries",
          email: "contact@sunpharma.com",
          phone: "8765432109",
          address: "Goregaon East, Mumbai",
          organization: orgId,
        },
        {
          name: "Dr. Reddy's Laboratories",
          email: "support@drreddys.com",
          phone: "7654321098",
          address: "Banjara Hills, Hyderabad",
          organization: orgId,
        },
      ]);
    }

    const custCount = await Customer.countDocuments({ organization: orgId });
    if (custCount === 0) {
      await Customer.insertMany([
        {
          name: "Aarav Sharma",
          mobile: "9988776655",
          email: "aarav@gmail.com",
          organization: orgId,
        },
        {
          name: "Priya Patel",
          mobile: "8877665544",
          email: "priya@gmail.com",
          organization: orgId,
        },
        {
          name: "Amit Verma",
          mobile: "7766554433",
          email: "amit@gmail.com",
          organization: orgId,
        },
      ]);
    }

    const poCount = await PurchaseOrder.countDocuments({ organization: orgId });
    if (poCount === 0) {
      await PurchaseOrder.create({
        supplierName: "Cipla Pharmaceuticals",
        supplierEmail: "info@cipla.com",
        supplierPhone: "9876543210",
        deliveryAddress: "Main Pharmacy Store, Ground Floor",
        items: [
          {
            productName: "Calpol 650",
            sku: "PHR-CAL650",
            quantity: 100,
            price: 28,
          },
          {
            productName: "Augmentin 625 Duo",
            sku: "PHR-AUG625",
            quantity: 50,
            price: 180,
          },
        ],
        totalAmount: 11800,
        status: "Pending",
        organization: orgId,
      });
    }

    res.status(201).json({
      message: "Sample pharmacy stock loaded successfully",
      count: inserted.length,
      products: inserted,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export {
  getProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  seedSampleProducts,
};
