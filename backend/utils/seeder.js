import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Supplier from "../models/Supplier.js";
import Customer from "../models/Customer.js";
import Sale from "../models/Sale.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import ImportHistory from "../models/ImportHistory.js";
import connectDB from "../config/db.js";

dotenv.config();

const users = [
  {
    name: "Admin User",
    email: "admin@Mediblix.com",
    password: "MediblixPassword123",
    isAdmin: true,
  },
];

const suppliers = [
  {
    name: "Cipla Pharmaceuticals",
    email: "info@cipla.com",
    phone: "9876543210",
    address: "Peninsula Chambers, Ganpatrao Kadam Marg, Lower Parel, Mumbai, Maharashtra 400013",
  },
  {
    name: "Sun Pharma Industries",
    email: "contact@sunpharma.com",
    phone: "8765432109",
    address: "Sun House, CTS No. 201 B/1, Western Express Highway, Goregaon East, Mumbai, Maharashtra 400063",
  },
  {
    name: "Dr. Reddy's Laboratories",
    email: "support@drreddys.com",
    phone: "7654321098",
    address: "8-2-337, Road No. 3, Banjara Hills, Hyderabad, Telangana 500034",
  },
  {
    name: "Lupin Ltd.",
    email: "contact@lupin.com",
    phone: "6543210987",
    address: "Kalpataru Inspire, Off Western Express Highway, Santacruz East, Mumbai, Maharashtra 400055",
  },
];

const customers = [
  {
    name: "Aarav Sharma",
    mobile: "9988776655",
    email: "aarav@gmail.com",
  },
  {
    name: "Priya Patel",
    mobile: "8877665544",
    email: "priya@gmail.com",
  },
  {
    name: "Amit Verma",
    mobile: "7766554433",
    email: "amit@gmail.com",
  },
];

const products = [
  {
    name: "Calpol 650",
    sku: "PHR-CAL650",
    category: "Analgesics",
    quantity: 240,
    price: 32,
    status: "In Stock",
    expiryDate: new Date("2027-12-31"),
    packaging: "15 Tablets / Strip",
    tabletsPerStrip: 15,
  },
  {
    name: "Mox 500",
    sku: "PHR-MOX500",
    category: "Antibiotics",
    quantity: 120,
    price: 115,
    status: "In Stock",
    expiryDate: new Date("2027-08-31"),
    packaging: "10 Tablets / Strip",
    tabletsPerStrip: 10,
  },
  {
    name: "Glycomet 500",
    sku: "PHR-GLY500",
    category: "Diabetes",
    quantity: 350,
    price: 85,
    status: "In Stock",
    expiryDate: new Date("2028-03-31"),
    packaging: "10 Tablets / Strip",
    tabletsPerStrip: 10,
  },
  {
    name: "Limcee 500",
    sku: "PHR-LIMC500",
    category: "Vitamins",
    quantity: 500,
    price: 42,
    status: "In Stock",
    expiryDate: new Date("2029-01-31"),
    packaging: "15 Tablets / Strip",
    tabletsPerStrip: 15,
  },
  {
    name: "Lipivas 10",
    sku: "PHR-LIP10",
    category: "Cardiology",
    quantity: 180,
    price: 145,
    status: "In Stock",
    expiryDate: new Date("2027-10-31"),
    packaging: "10 Tablets / Strip",
    tabletsPerStrip: 10,
  },
  {
    name: "Alerid 10",
    sku: "PHR-ALR10",
    category: "Antihistamines",
    quantity: 400,
    price: 26,
    status: "In Stock",
    expiryDate: new Date("2028-06-30"),
    packaging: "10 Tablets / Strip",
    tabletsPerStrip: 10,
  },
  {
    name: "Combiflam",
    sku: "PHR-CMB",
    category: "Analgesics",
    quantity: 600,
    price: 48,
    status: "In Stock",
    expiryDate: new Date("2028-05-31"),
    packaging: "15 Tablets / Strip",
    tabletsPerStrip: 15,
  },
  {
    name: "Pan 40",
    sku: "PHR-PAN40",
    category: "Antacids",
    quantity: 300,
    price: 122,
    status: "In Stock",
    expiryDate: new Date("2028-11-30"),
    packaging: "10 Tablets / Strip",
    tabletsPerStrip: 10,
  },
  {
    name: "Antiflu 75",
    sku: "PHR-AFLU75",
    category: "Antivirals",
    quantity: 9,
    price: 480,
    status: "Low Stock",
    expiryDate: new Date("2027-04-30"),
    packaging: "10 Tablets / Strip",
    tabletsPerStrip: 10,
  },
  {
    name: "Digene Gel",
    sku: "PHR-DIG200",
    category: "Antacids",
    quantity: 0,
    price: 155,
    status: "Out of Stock",
    expiryDate: new Date("2028-02-28"),
    packaging: "Bottle of 200ml",
    tabletsPerStrip: 1,
  },
];

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Product.deleteMany();
    await Supplier.deleteMany();
    await Customer.deleteMany();
    await Sale.deleteMany();
    await PurchaseOrder.deleteMany();
    await ImportHistory.deleteMany();

    await User.create(users);
    await Supplier.create(suppliers);
    await Customer.create(customers);
    await Product.insertMany(products);

    console.log("Data Imported!");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

seedData();
