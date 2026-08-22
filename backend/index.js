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
import Supplier from "./models/Supplier.js";
import PurchaseOrder from "./models/PurchaseOrder.js";

dotenv.config();

connectDB().then(async () => {
  try {
    const count = await Supplier.countDocuments();
    if (count === 0) {
      await Supplier.create({
        name: "Cipla Pharmaceuticals",
        email: "info@cipla.com",
        phone: "9876543210",
        address: "Peninsula Chambers, Ganpatrao Kadam Marg, Lower Parel, Mumbai, Maharashtra 400013"
      });
      await Supplier.create({
        name: "Sun Pharma Industries",
        email: "contact@sunpharma.com",
        phone: "8765432109",
        address: "Sun House, CTS No. 201 B/1, Western Express Highway, Goregaon East, Mumbai, Maharashtra 400063"
      });
      await Supplier.create({
        name: "Dr. Reddy's Laboratories",
        email: "support@drreddys.com",
        phone: "7654321098",
        address: "8-2-337, Road No. 3, Banjara Hills, Hyderabad, Telangana 500034"
      });
      await Supplier.create({
        name: "Lupin Ltd.",
        email: "contact@lupin.com",
        phone: "6543210987",
        address: "Kalpataru Inspire, Off Western Express Highway, Santacruz East, Mumbai, Maharashtra 400055"
      });
      await Supplier.create({
        name: "Torrent Pharmaceuticals",
        email: "info@torrentpharma.com",
        phone: "5432109876",
        address: "Torrent House, Off Ashram Road, Ahmedabad, Gujarat 380009"
      });
      await Supplier.create({
        name: "Zydus Lifesciences",
        email: "contact@zyduslife.com",
        phone: "4321098765",
        address: "Zydus Corporate Park, Scheme No. 63, Khoraj, Gandhinagar, Gujarat 382210"
      });
      await Supplier.create({
        name: "Alkem Laboratories",
        email: "contact@alkem.com",
        phone: "3210987654",
        address: "Alkem House, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013"
      });
    }

    const orderCount = await PurchaseOrder.countDocuments();
    if (orderCount === 0) {
      await PurchaseOrder.create({
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
      await PurchaseOrder.create({
        supplierName: "Sun Pharma Industries",
        supplierEmail: "contact@sunpharma.com",
        supplierPhone: "8765432109",
        deliveryAddress: "Sun House, CTS No. 201 B/1, Western Express Highway, Goregaon East, Mumbai, Maharashtra 400063",
        items: [
          { productName: "Mox 500", sku: "PHR-MOX500", quantity: 200, price: 115 },
          { productName: "Pan 40", sku: "PHR-PAN40", quantity: 150, price: 122 }
        ],
        totalAmount: 41300,
        status: "In Transit"
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

app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/users", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/import-history", importHistoryRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/medagent", medAgentRoutes);

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
