import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@spren.com',
    password: 'admin@crix',
    isAdmin: true,
  },
];

const products = [
  {
    name: "iPhone 15 Pro Max",
    sku: "APL-IP15PM-256",
    category: "Electronics",
    quantity: 145,
    price: 1199,
    status: "In Stock",
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    sku: "SAM-GS24U-512",
    category: "Electronics",
    quantity: 89,
    price: 1299,
    status: "In Stock",
  },
  {
    name: 'MacBook Pro 14" M3',
    sku: "APL-MBP14-M3",
    category: "Electronics",
    quantity: 52,
    price: 1999,
    status: "In Stock",
  },
  {
    name: "AirPods Pro 2nd Gen",
    sku: "APL-APP2-WHT",
    category: "Electronics",
    quantity: 234,
    price: 249,
    status: "In Stock",
  },
  {
    name: "Nike Air Max 90",
    sku: "NK-AM90-BLK",
    category: "Clothing",
    quantity: 67,
    price: 130,
    status: "In Stock",
  },
  {
    name: "Dyson V15 Detect",
    sku: "DYS-V15-DET",
    category: "Home & Garden",
    quantity: 8,
    price: 749,
    status: "Low Stock",
  },
  {
    name: "Sony WH-1000XM5",
    sku: "SNY-WH1KXM5",
    category: "Electronics",
    quantity: 0,
    price: 399,
    status: "Out of Stock",
  },
  {
    name: "iPad Air 5th Gen",
    sku: "APL-IPA5-64",
    category: "Electronics",
    quantity: 112,
    price: 599,
    status: "In Stock",
  },
  {
    name: "Adidas Ultraboost 23",
    sku: "ADI-UB23-WHT",
    category: "Clothing",
    quantity: 23,
    price: 190,
    status: "Low Stock",
  },
  {
    name: "Apple Watch Series 9",
    sku: "APL-AWS9-45",
    category: "Electronics",
    quantity: 78,
    price: 429,
    status: "In Stock",
  },
];

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Product.deleteMany();

    // Use create to trigger pre-save hooks (password hashing)
    await User.create(users);
    await Product.insertMany(products);

    console.log("Data Imported!");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

seedData();

