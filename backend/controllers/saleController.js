import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// @desc    Create a new sale
// @route   POST /api/sales
// @access  Public
const createSale = async (req, res) => {
  const { customerId, items, paymentMethod } = req.body;

  try {
    // 1. Calculate total and verify stock
    let totalAmount = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.product}` });
      }

      if (product.quantity < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}` });
      }

      // Update product stock
      product.quantity -= item.quantity;
      await product.save();

      saleItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      totalAmount += product.price * item.quantity;
    }

    const invoiceNumber = req.body.invoiceNumber || `INV-${Date.now()}`;
    const sale = await Sale.create({
      customer: customerId,
      items: saleItems,
      totalAmount,
      paymentMethod,
      invoiceNumber,
    });

    // 3. Update Customer Purchase History
    await Customer.findByIdAndUpdate(customerId, {
      $push: { purchaseHistory: sale._id },
    });

    res.status(201).json(sale);
  } catch (error) {
    console.error("Error creating sale:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Public
const getSales = async (req, res) => {
  try {
    const query = {};
    if (req.query.customer) {
      query.customer = req.query.customer;
    }
    const sales = await Sale.find(query)
      .populate("customer", "name email mobile")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate Invoice PDF
// @route   GET /api/sales/:id/invoice
// @access  Public
const generateInvoice = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("customer")
      .populate("items.product");

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${sale.invoiceNumber}.pdf`
    );

    doc.pipe(res);

    // Header
    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("Spren", 50, 57)
      .fontSize(10)
      .text("123 Main Street", 200, 65, { align: "right" })
      .text("New York, NY, 10025", 200, 80, { align: "right" })
      .moveDown();

    // Invoice Info
    doc.fillColor("#000000").fontSize(20).text("Invoice", 50, 160);

    doc
      .fontSize(10)
      .text(`Invoice Number: ${sale.invoiceNumber}`, 50, 200)
      .text(
        `Invoice Date: ${new Date(sale.createdAt).toLocaleDateString()}`,
        50,
        215
      )
      .text(`Balance Due: $${sale.totalAmount}`, 50, 130, { align: "right" });

    // Customer Info
    doc
      .text(`Bill To: ${sale.customer.name}`, 300, 200)
      .text(`Mobile: ${sale.customer.mobile}`, 300, 215)
      .text(`Email: ${sale.customer.email || "N/A"}`, 300, 230)
      .moveDown();

    // Table Header
    let i,
      invoiceTableTop = 330;
    doc.font("Helvetica-Bold");

    doc
      .fontSize(10)
      .text("Item", 50, invoiceTableTop)
      .text("Unit Cost", 280, invoiceTableTop, { width: 90, align: "right" })
      .text("Quantity", 370, invoiceTableTop, { width: 90, align: "right" })
      .text("Line Total", 0, invoiceTableTop, { align: "right" });

    doc
      .moveTo(50, invoiceTableTop + 20)
      .lineTo(550, invoiceTableTop + 20)
      .stroke();

    // Table Rows
    doc.font("Helvetica");
    let position = invoiceTableTop + 30;

    sale.items.forEach((item) => {
      const positionY = position;
      doc
        .fontSize(10)
        .text(item.product.name, 50, positionY)
        .text(`$${item.price}`, 280, positionY, { width: 90, align: "right" })
        .text(item.quantity, 370, positionY, { width: 90, align: "right" })
        .text(`$${item.price * item.quantity}`, 0, positionY, {
          align: "right",
        });

      position += 20;
    });

    // Total
    const subtotalPosition = position + 20;
    doc.font("Helvetica-Bold");
    doc
      .text("Subtotal", 370, subtotalPosition, { width: 90, align: "right" })
      .text(`$${sale.totalAmount}`, 0, subtotalPosition, { align: "right" });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createSale, getSales, generateInvoice };
