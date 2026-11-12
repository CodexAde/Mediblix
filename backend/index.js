import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import importHistoryRoutes from "./routes/importHistoryRoutes.js";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import medAgentRoutes from "./routes/medAgentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import Supplier from "./models/Supplier.js";
import PurchaseOrder from "./models/PurchaseOrder.js";
import Organization from "./models/Organization.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Customer from "./models/Customer.js";
import Sale from "./models/Sale.js";
import ImportHistory from "./models/ImportHistory.js";

dotenv.config();

connectDB().then(async () => {
  try {
    let defaultOrg = await Organization.findOne({ code: "DEFAULT" });
    if (!defaultOrg) {
      defaultOrg = await Organization.create({
        name: "Mediblix Master Pharmacy",
        code: "DEFAULT",
        contactPerson: "Adarsh Pandey",
        contactEmail: "adarshrpandey10@gmail.com",
        contactPhone: "9876543210",
        address: "Master Pharmacy Hub",
        status: "Active",
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL || "adarshrpandey10@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@Mediblix2026";

    const superadmin = await User.findOne({ email: adminEmail });
    if (!superadmin) {
      await User.create({
        name: "Super Admin",
        email: adminEmail,
        password: adminPassword,
        role: "superadmin",
        isAdmin: true,
        organization: null,
      });
    } else {
      let needsSave = false;
      if (superadmin.role !== "superadmin") {
        superadmin.role = "superadmin";
        needsSave = true;
      }
      if (!superadmin.isAdmin) {
        superadmin.isAdmin = true;
        needsSave = true;
      }
      if (needsSave) {
        await superadmin.save();
      }
    }

    if (defaultOrg) {
      await Product.updateMany({ organization: { $exists: false } }, { organization: defaultOrg._id });
      await Customer.updateMany({ organization: { $exists: false } }, { organization: defaultOrg._id });
      await Sale.updateMany({ organization: { $exists: false } }, { organization: defaultOrg._id });
      await Supplier.updateMany({ organization: { $exists: false } }, { organization: defaultOrg._id });
      await PurchaseOrder.updateMany({ organization: { $exists: false } }, { organization: defaultOrg._id });
      await ImportHistory.updateMany({ organization: { $exists: false } }, { organization: defaultOrg._id });
    }

    const count = await Supplier.countDocuments();
    if (count === 0 && defaultOrg) {
      await Supplier.create({
        organization: defaultOrg._id,
        name: "Cipla Pharmaceuticals",
        email: "info@cipla.com",
        phone: "9876543210",
        address: "Peninsula Chambers, Ganpatrao Kadam Marg, Lower Parel, Mumbai, Maharashtra 400013"
      });
      await Supplier.create({
        organization: defaultOrg._id,
        name: "Sun Pharma Industries",
        email: "contact@sunpharma.com",
        phone: "8765432109",
        address: "Sun House, CTS No. 201 B/1, Western Express Highway, Goregaon East, Mumbai, Maharashtra 400063"
      });
      await Supplier.create({
        organization: defaultOrg._id,
        name: "Dr. Reddy's Laboratories",
        email: "support@drreddys.com",
        phone: "7654321098",
        address: "8-2-337, Road No. 3, Banjara Hills, Hyderabad, Telangana 500034"
      });
    }

    const orderCount = await PurchaseOrder.countDocuments();
    if (orderCount === 0 && defaultOrg) {
      await PurchaseOrder.create({
        organization: defaultOrg._id,
        supplierName: "Cipla Pharmaceuticals",
        supplierEmail: "info@cipla.com",
        supplierPhone: "9876543210",
        deliveryAddress: "Peninsula Chambers, Ganpatrao Kadam Marg, Lower Parel, Mumbai, Maharashtra 400013",
        items: [
          { productName: "Calpol 650", sku: "PHR-CAL650", quantity: 500, price: 32 },
          { productName: "Limcee 500", sku: "PHR-LIMC500", quantity: 300, price: 42 }
        ],
        totalAmount: 28600,
        status: "Delivered"
      });
    }
  } catch (err) {
    console.error(err);
  }
});

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/users", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/import-history", importHistoryRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/medagent", medAgentRoutes);

app.use((err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const msg = err.message || "An unexpected error occurred";
  res.status(statusCode).json({
    message: msg,
    isFrozen: msg.toLowerCase().includes("frozen"),
    isSessionRevoked:
      msg.toLowerCase().includes("session") &&
      (msg.toLowerCase().includes("revoked") ||
        msg.toLowerCase().includes("reset") ||
        msg.toLowerCase().includes("expired") ||
        msg.toLowerCase().includes("another device")),
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get(/.*/, (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running....");
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
