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
    let totalAmount = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.product}` });
      }

      const orderQty = item.quantity;

      if (product.quantity < orderQty) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}` });
      }

      product.quantity -= orderQty;
      await product.save();

      const itemPrice = item.price || product.price;
      const itemDiscount = Number(item.discount) || 0;
      const itemSubtotal = itemPrice * item.quantity * (1 - itemDiscount / 100);

      saleItems.push({
        product: product._id,
        quantity: item.quantity,
        price: itemPrice,
        unit: "Tablet",
        discount: itemDiscount,
      });

      totalAmount += itemSubtotal;
    }

    let invoiceNumber = req.body.invoiceNumber;
    if (invoiceNumber) {
      const existingSale = await Sale.findOne({ invoiceNumber });
      if (existingSale) {
        return res.status(400).json({ message: "Invoice number already exists" });
      }
    } else {
      const lastSale = await Sale.findOne().sort({ invoiceNumber: -1 });
      let nextNum = 1;
      if (lastSale && lastSale.invoiceNumber) {
        const match = lastSale.invoiceNumber.match(/Inv-(\d+)/i);
        if (match) {
          nextNum = parseInt(match[1], 10) + 1;
        }
      }
      invoiceNumber = `Inv-${String(nextNum).padStart(4, '0')}`;
    }

    const sale = await Sale.create({
      customer: customerId,
      items: saleItems,
      totalAmount,
      paymentMethod,
      invoiceNumber,
    });

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
      .populate("items.product", "name price packaging tabletsPerStrip")
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

    doc.lineWidth(1.5).strokeColor('#166534').roundedRect(50, 45, 36, 36, 6).stroke();
    doc.fillColor('#166534').font('Helvetica-Bold').fontSize(16).text('Rx', 50, 55, { width: 36, align: 'center' });

    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(16).text('Spren Pharmacy', 98, 45);
    doc.fillColor('#6b7280').font('Helvetica').fontSize(8.5)
      .text('123 Main Street, New York, NY 10025', 98, 63)
      .text('Phone: +91 99999 88888 | support@spren.com', 98, 73);

    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(20).text('INVOICE', 400, 43, { align: 'right', width: 145 });
    doc.fillColor('#4b5563').font('Helvetica').fontSize(9)
      .text(`Invoice No: ${sale.invoiceNumber}`, 400, 65, { align: 'right', width: 145 })
      .text(`Date: ${new Date(sale.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 400, 77, { align: 'right', width: 145 });

    doc.moveTo(50, 100).lineTo(545, 100).lineWidth(1).strokeColor('#e5e7eb').stroke();

    doc.fillColor('#166534').font('Helvetica-Bold').fontSize(9.5).text('BILL TO', 50, 115);
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11.5).text(sale.customer.name, 50, 130);
    doc.fillColor('#4b5563').font('Helvetica').fontSize(9)
      .text(`Phone: +91 ${sale.customer.mobile}`, 50, 146)
      .text(`Email: ${sale.customer.email || 'Walk-in customer'}`, 50, 158);

    doc.fillColor('#166534').font('Helvetica-Bold').fontSize(9.5).text('PAYMENT DETAILS', 320, 115);
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11.5).text('Paid', 320, 130);
    doc.fillColor('#4b5563').font('Helvetica').fontSize(9)
      .text(`Method: ${sale.paymentMethod}`, 320, 146)
      .text(`Ref ID: #${sale._id.toString().slice(-8).toUpperCase()}`, 320, 158);

    doc.moveTo(50, 180).lineTo(545, 180).lineWidth(1).strokeColor('#e5e7eb').stroke();

    const tableHeaderY = 195;
    
    doc.fillColor('#6b7280').font('Helvetica-Bold').fontSize(8.5);
    doc.text("ITEMS & DESCRIPTION", 50, tableHeaderY);
    doc.text("PRICE", 270, tableHeaderY, { width: 80, align: "right" });
    doc.text("QTY", 360, tableHeaderY, { width: 60, align: "right" });
    doc.text("TOTAL", 440, tableHeaderY, { width: 100, align: "right" });

    doc.moveTo(50, tableHeaderY + 12).lineTo(545, tableHeaderY + 12).lineWidth(1).strokeColor('#111827').stroke();

    doc.font("Helvetica").fillColor('#1f2937');
    let position = tableHeaderY + 22;

    sale.items.forEach((item) => {
      const positionY = position;
      const unitLabel = item.unit === "Tablet" ? " Tab" : " Strip";
      
      doc
        .fontSize(9.5)
        .font('Helvetica-Bold').fillColor('#111827')
        .text(item.product.name, 50, positionY)
        .font('Helvetica').fontSize(8.5).fillColor('#6b7280')
        .text(`Unit packaging: ${item.unit || "Strip"}`, 50, positionY + 13);
        
      doc
        .font('Helvetica').fontSize(9.5).fillColor('#374151')
        .text(`Rs. ${item.price}`, 270, positionY + 4, { width: 80, align: "right" })
        .text(`${item.quantity}${unitLabel}`, 360, positionY + 4, { width: 60, align: "right" })
        .font('Helvetica-Bold').fillColor('#111827')
        .text(`Rs. ${item.price * item.quantity}`, 440, positionY + 4, { width: 100, align: "right" });

      doc.moveTo(50, positionY + 28).lineTo(545, positionY + 28).lineWidth(0.5).strokeColor('#f3f4f6').stroke();

      position += 38;
    });

    const summaryY = position + 10;
    const taxableValue = (sale.totalAmount / 1.18).toFixed(2);
    const cgst = ((sale.totalAmount - taxableValue) / 2).toFixed(2);
    const sgst = cgst;

    doc.font("Helvetica").fontSize(9).fillColor('#4b5563')
      .text("Taxable Value", 350, summaryY, { width: 80, align: "right" })
      .text("CGST @ 9%", 350, summaryY + 14, { width: 80, align: "right" })
      .text("SGST @ 9%", 350, summaryY + 28, { width: 80, align: "right" });

    doc.font("Helvetica-Bold").fontSize(9).fillColor('#111827')
      .text(`Rs. ${taxableValue}`, 440, summaryY, { width: 100, align: "right" })
      .text(`Rs. ${cgst}`, 440, summaryY + 14, { width: 100, align: "right" })
      .text(`Rs. ${sgst}`, 440, summaryY + 28, { width: 100, align: "right" });

    const totalBannerY = summaryY + 46;
    doc.fillColor('#eaf5ed').rect(350, totalBannerY, 195, 28).fill();
    
    doc.fillColor('#166534').font('Helvetica-Bold').fontSize(10.5)
      .text("Grand Total", 365, totalBannerY + 9)
      .text(`Rs. ${sale.totalAmount}`, 440, totalBannerY + 9, { width: 100, align: "right" });

    const footerY = totalBannerY + 80;

    doc.moveTo(50, footerY - 15).lineTo(545, footerY - 15).lineWidth(1).strokeColor('#e5e7eb').stroke();

    doc.font("Helvetica-Bold").fontSize(8.5).fillColor('#374151')
      .text("Terms & Conditions:", 50, footerY);
    doc.font("Helvetica").fontSize(8).fillColor('#6b7280')
      .text("1. Medicines once sold cannot be returned without a valid batch verification.", 50, footerY + 14)
      .text("2. Please store medicines as per directed guidelines. Keep out of reach of children.", 50, footerY + 24);

    doc.font("Helvetica-Oblique").fontSize(9.5).fillColor('#166534')
      .text("Thank you for choosing Spren Pharmacy. Get well soon!", 50, footerY + 50, { align: "center", width: 495 });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createSale, getSales, generateInvoice };
