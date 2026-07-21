import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";

dotenv.config();

const createSampleReturns = async () => {
  try {
    await connectDB();

    console.log("Connected to DB, finding customers and products...");
    const customers = await Customer.find({});
    const products = await Product.find({});

    if (customers.length === 0 || products.length === 0) {
      console.log("No customers or products found. Please seed the database first.");
      process.exit(1);
    }

    const calpol = products.find((p) => p.name.includes("Calpol")) || products[0];
    const mox = products.find((p) => p.name.includes("Mox")) || products[1] || products[0];
    const limcee = products.find((p) => p.name.includes("Limcee")) || products[2] || products[0];
    const combiflam = products.find((p) => p.name.includes("Combiflam")) || products[3] || products[0];

    // Clear existing sales to avoid duplicate invoice number conflicts
    await Sale.deleteMany({});
    for (const c of customers) {
      c.purchaseHistory = [];
      await c.save();
    }

    console.log("Cleared old sales.");

    // Customer 1: Aarav Sharma
    const aarav = customers.find((c) => c.mobile === "9988776655") || customers[0];
    const sale1Items = [
      {
        product: calpol._id,
        quantity: 10,
        price: calpol.price,
        unit: "Tablet",
        discount: 0,
        returnedQuantity: 3, // 3 returned
      },
      {
        product: mox._id,
        quantity: 5,
        price: mox.price,
        unit: "Tablet",
        discount: 0,
        returnedQuantity: 0,
      },
    ];
    const calcRefund = (items) => items.reduce((sum, i) => sum + (i.returnedQuantity || 0) * i.price * (1 - (i.discount || 0) / 100), 0);

    const totalAmount1 = (10 * calpol.price) + (5 * mox.price);
    const sale1 = await Sale.create({
      customer: aarav._id,
      items: sale1Items,
      totalAmount: totalAmount1,
      refundAmount: calcRefund(sale1Items),
      paymentMethod: "UPI",
      invoiceNumber: "Inv-0001",
    });
    await Customer.findByIdAndUpdate(aarav._id, { $push: { purchaseHistory: sale1._id } });
    console.log(`Created sale Inv-0001 for ${aarav.name} with return`);

    // Customer 2: Priya Patel
    const priya = customers.find((c) => c.mobile === "8877665544") || customers[1] || customers[0];
    const sale2Items = [
      {
        product: limcee._id,
        quantity: 15,
        price: limcee.price,
        unit: "Tablet",
        discount: 5,
        returnedQuantity: 5, // 5 returned
      },
    ];
    const totalAmount2 = 15 * limcee.price * 0.95;
    const sale2 = await Sale.create({
      customer: priya._id,
      items: sale2Items,
      totalAmount: totalAmount2,
      refundAmount: calcRefund(sale2Items),
      paymentMethod: "Card",
      invoiceNumber: "Inv-0002",
    });
    await Customer.findByIdAndUpdate(priya._id, { $push: { purchaseHistory: sale2._id } });
    console.log(`Created sale Inv-0002 for ${priya.name} with return`);

    // Customer 3: Amit Verma
    const amit = customers.find((c) => c.mobile === "7766554433") || customers[2] || customers[0];
    const sale3Items = [
      {
        product: combiflam._id,
        quantity: 20,
        price: combiflam.price,
        unit: "Tablet",
        discount: 0,
        returnedQuantity: 7, // 7 returned matching user's screen
      },
    ];
    const totalAmount3 = 20 * combiflam.price;
    const sale3 = await Sale.create({
      customer: amit._id,
      items: sale3Items,
      totalAmount: totalAmount3,
      refundAmount: calcRefund(sale3Items),
      paymentMethod: "Cash",
      invoiceNumber: "Inv-0003",
    });
    await Customer.findByIdAndUpdate(amit._id, { $push: { purchaseHistory: sale3._id } });
    console.log(`Created sale Inv-0003 for ${amit.name} with return`);

    console.log("Successfully created sample sales with return orders for all 3 customers!");
    process.exit(0);
  } catch (err) {
    console.error("Error creating sample returns:", err);
    process.exit(1);
  }
};

createSampleReturns();
