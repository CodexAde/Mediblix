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
import Supplier from "./models/Supplier.js";
import PurchaseOrder from "./models/PurchaseOrder.js";

dotenv.config();

connectDB().then(async () => {
  try {
    const count = await Supplier.countDocuments();
    if (count === 0) {
      await Supplier.create({
        name: "Apple Inc.",
        email: "sales@apple.com",
        phone: "+1 (555) 234-5678",
        address: "One Apple Park Way, Cupertino, CA 95014"
      });
      await Supplier.create({
        name: "Samsung Electronics",
        email: "sales@samsung.com",
        phone: "+1 (555) 345-6789",
        address: "Samsung Highway, Electronics District, KR 12345"
      });
      await Supplier.create({
        name: "Tech Supplies Inc.",
        email: "contact@techsupplies.com",
        phone: "+1 (555) 123-4567",
        address: "123 Supplier Street, Tech City, NY 10001"
      });
      await Supplier.create({
        name: "Sony Corporation",
        email: "sales@sony.com",
        phone: "+1 (555) 456-7890",
        address: "1-7-1 Konan, Minato-ku, Tokyo 108-0075"
      });
      await Supplier.create({
        name: "Audio World",
        email: "sales@audioworld.com",
        phone: "+1 (555) 567-8901",
        address: "456 Sound Boulevard, Audio Valley, CA 90210"
      });
      await Supplier.create({
        name: "Screen Guard Co.",
        email: "orders@screenguard.com",
        phone: "+1 (555) 678-9012",
        address: "789 Protection Street, Screen City, TX 75001"
      });
      await Supplier.create({
        name: "Case Pro Ltd.",
        email: "sales@casepro.com",
        phone: "+1 (555) 789-0123",
        address: "101 Protection Lane, Shield Town, WA 98001"
      });

      const orderCount = await PurchaseOrder.countDocuments();
      if (orderCount === 0) {
        await PurchaseOrder.create({
          supplierName: "Tech Supplies Inc.",
          supplierEmail: "contact@techsupplies.com",
          supplierPhone: "+1 (555) 123-4567",
          deliveryAddress: "123 Supplier Street, Tech City, NY 10001",
          items: [
            { productName: "USB-C Cables", sku: "CBL-USBC", quantity: 200, price: 50 },
            { productName: "Power Adapters", sku: "PWR-ADPT", quantity: 100, price: 150 },
            { productName: "Phone Cases", sku: "CASE-PHN", quantity: 300, price: 50 }
          ],
          totalAmount: 45000,
          status: "Delivered"
        });
        await PurchaseOrder.create({
          supplierName: "Apple Inc.",
          supplierEmail: "sales@apple.com",
          supplierPhone: "+1 (555) 234-5678",
          deliveryAddress: "One Apple Park Way, Cupertino, CA 95014",
          items: [
            { productName: "iPhone 15 Pro", sku: "APL-IP15", quantity: 100, price: 999 },
            { productName: "AirPods Pro", sku: "APL-APP", quantity: 200, price: 249 }
          ],
          totalAmount: 149700,
          status: "In Transit"
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
});

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/users", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/import-history", importHistoryRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/suppliers", supplierRoutes);

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
