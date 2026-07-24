import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * Utility to process and generate styled PDF, Excel, or CSV reports.
 */

export const REPORT_TYPES = [
  { id: "stock_summary", name: "Stock Summary Report", category: "Inventory" },
  { id: "low_stock", name: "Low Stock & Out of Stock Alert", category: "Inventory" },
  { id: "product_valuation", name: "Product Valuation & Expiry Report", category: "Inventory" },
  { id: "financial_sales", name: "Financial Sales & Revenue Summary", category: "Financial" },
  { id: "gst_tax", name: "GST & Tax Breakdown Report", category: "Financial" },
  { id: "payment_settlement", name: "Payment Method Settlement Report", category: "Financial" },
  { id: "sales_returns", name: "Sales Returns & Refund Audit", category: "Financial" },
  { id: "customer_ledger", name: "Customer Sales & Ledger Report", category: "Analytics" },
  { id: "purchase_orders", name: "Purchase Orders & Supplier Summary", category: "Suppliers" },
];

/**
 * Filter data by date range if applicable
 */
const filterByDateRange = (data, dateField, dateFrom, dateTo) => {
  if (!dateFrom && !dateTo) return data;
  return data.filter((item) => {
    const rawDate = item[dateField] || item.createdAt || item.date;
    if (!rawDate) return true;
    const itemDate = new Date(rawDate);
    if (dateFrom && itemDate < new Date(dateFrom)) return false;
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      if (itemDate > endDate) return false;
    }
    return true;
  });
};

/**
 * Prepares column definitions, row data, and summary metrics for the selected report type
 */
export const prepareReportData = ({
  reportType,
  products = [],
  sales = [],
  customers = [],
  purchaseOrders = [],
  suppliers = [],
  dateFrom = "",
  dateTo = "",
  options = {},
}) => {
  let title = "Spren Business Report";
  let columns = [];
  let rows = [];
  let summaryMetrics = [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  switch (reportType) {
    case "stock_summary": {
      title = "Stock Summary Report";
      columns = [
        { header: "Batch/SKU", key: "sku" },
        { header: "Product Name", key: "name" },
        { header: "Category", key: "category" },
        { header: "HSN Code", key: "hsn" },
        { header: "Quantity", key: "quantity" },
        { header: "Unit Price", key: "price" },
        { header: "Stock Value", key: "totalValue" },
        { header: "Status", key: "status" },
      ];

      let totalQty = 0;
      let totalValue = 0;

      rows = products.map((p) => {
        const qty = p.quantity || 0;
        const price = p.price || 0;
        const val = qty * price;
        totalQty += qty;
        totalValue += val;

        return {
          sku: p.sku || "N/A",
          name: p.name || "Unknown Product",
          category: p.category || "General",
          hsn: p.hsn || "N/A",
          quantity: `${qty} Tablets`,
          price: formatCurrency(price),
          totalValue: formatCurrency(val),
          status: p.status || (qty > 10 ? "In Stock" : qty > 0 ? "Low Stock" : "Out of Stock"),
        };
      });

      summaryMetrics = [
        { label: "Total Unique Products", value: products.length },
        { label: "Total Units in Stock", value: `${totalQty} Units` },
        { label: "Total Inventory Valuation", value: formatCurrency(totalValue) },
      ];
      break;
    }

    case "low_stock": {
      title = "Low Stock & Out of Stock Alert Report";
      columns = [
        { header: "Batch/SKU", key: "sku" },
        { header: "Product Name", key: "name" },
        { header: "Category", key: "category" },
        { header: "HSN Code", key: "hsn" },
        { header: "Current Stock", key: "quantity" },
        { header: "Unit Price", key: "price" },
        { header: "Status", key: "status" },
        { header: "Reorder Recommendation", key: "reorder" },
      ];

      const lowStockItems = products.filter(
        (p) => (p.quantity || 0) <= 15 || p.status === "Low Stock" || p.status === "Out of Stock"
      );

      let outOfStockCount = 0;
      let criticalCount = 0;

      rows = lowStockItems.map((p) => {
        const qty = p.quantity || 0;
        if (qty === 0) outOfStockCount++;
        else criticalCount++;

        return {
          sku: p.sku || "N/A",
          name: p.name || "Unknown",
          category: p.category || "General",
          hsn: p.hsn || "N/A",
          quantity: `${qty} Tablets`,
          price: formatCurrency(p.price || 0),
          status: qty === 0 ? "Out of Stock" : "Low Stock Alert",
          reorder: qty === 0 ? "Urgent Reorder (+100)" : `Reorder (+${50 - qty})`,
        };
      });

      summaryMetrics = [
        { label: "Low Stock Items", value: criticalCount },
        { label: "Out of Stock Items", value: outOfStockCount },
        { label: "Action Required", value: `${criticalCount + outOfStockCount} Items` },
      ];
      break;
    }

    case "product_valuation": {
      title = "Product Valuation & Expiry Risk Report";
      columns = [
        { header: "SKU", key: "sku" },
        { header: "Product Name", key: "name" },
        { header: "Category", key: "category" },
        { header: "Mfg Date", key: "mfgDate" },
        { header: "Expiry Date", key: "expiryDate" },
        { header: "Quantity", key: "quantity" },
        { header: "Unit Price", key: "price" },
        { header: "Valuation", key: "valuation" },
        { header: "Expiry Status", key: "expiryStatus" },
      ];

      const today = new Date();
      let totalVal = 0;
      let expiringSoonCount = 0;

      rows = products.map((p) => {
        const qty = p.quantity || 0;
        const price = p.price || 0;
        const val = qty * price;
        totalVal += val;

        let expStatus = "Healthy";
        if (p.expiryDate) {
          const exp = new Date(p.expiryDate);
          const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
          if (diffDays < 0) expStatus = "EXPIRED";
          else if (diffDays <= 90) {
            expStatus = `Expiring (${diffDays}d)`;
            expiringSoonCount++;
          }
        }

        return {
          sku: p.sku || "N/A",
          name: p.name || "Unknown",
          category: p.category || "General",
          mfgDate: formatDate(p.mfgDate),
          expiryDate: formatDate(p.expiryDate),
          quantity: `${qty} Tablets`,
          price: formatCurrency(price),
          valuation: formatCurrency(val),
          expiryStatus: expStatus,
        };
      });

      summaryMetrics = [
        { label: "Total Stock Valuation", value: formatCurrency(totalVal) },
        { label: "Expiring within 90 Days", value: `${expiringSoonCount} Products` },
        { label: "Total Catalog Items", value: products.length },
      ];
      break;
    }

    case "financial_sales": {
      title = "Financial Sales & Revenue Summary";
      columns = [
        { header: "Invoice #", key: "invoiceNumber" },
        { header: "Date", key: "date" },
        { header: "Customer Name", key: "customer" },
        { header: "Items Count", key: "itemsCount" },
        { header: "Payment Method", key: "paymentMethod" },
        { header: "Total Amount", key: "totalAmount" },
        { header: "Status", key: "status" },
      ];

      const filteredSales = filterByDateRange(sales, "createdAt", dateFrom, dateTo);

      let totalRev = 0;
      let totalItemsSold = 0;

      rows = filteredSales.map((s) => {
        const amt = s.totalAmount || 0;
        totalRev += amt;
        const itemsCount = (s.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
        totalItemsSold += itemsCount;

        const customerName = s.customer ? (typeof s.customer === "object" ? s.customer.name : "Registered Customer") : "Walk-in Customer";

        return {
          invoiceNumber: s.invoiceNumber || `INV-${s._id?.substring(0, 6)}`,
          date: formatDate(s.createdAt),
          customer: customerName,
          itemsCount: `${itemsCount} Units`,
          paymentMethod: s.paymentMethod || "Cash",
          totalAmount: formatCurrency(amt),
          status: "Paid",
        };
      });

      const avgOrderValue = filteredSales.length ? totalRev / filteredSales.length : 0;

      summaryMetrics = [
        { label: "Total Net Revenue", value: formatCurrency(totalRev) },
        { label: "Total Completed Sales", value: filteredSales.length },
        { label: "Average Order Value", value: formatCurrency(avgOrderValue) },
        { label: "Total Units Sold", value: `${totalItemsSold} Units` },
      ];
      break;
    }

    case "gst_tax": {
      title = "GST & Tax Breakdown Report";
      columns = [
        { header: "Invoice #", key: "invoiceNumber" },
        { header: "Date", key: "date" },
        { header: "Customer", key: "customer" },
        { header: "Taxable Value", key: "taxableValue" },
        { header: "CGST (6%)", key: "cgst" },
        { header: "SGST (6%)", key: "sgst" },
        { header: "Total GST (12%)", key: "totalTax" },
        { header: "Grand Total", key: "grandTotal" },
      ];

      const filteredSales = filterByDateRange(sales, "createdAt", dateFrom, dateTo);

      let totalTaxable = 0;
      let totalGstAmt = 0;
      let grandTotalSum = 0;

      rows = filteredSales.map((s) => {
        const total = s.totalAmount || 0;
        // Standard pharma GST calculation assumption: 12% GST inclusive
        const taxable = total / 1.12;
        const gst = total - taxable;
        const halfGst = gst / 2;

        totalTaxable += taxable;
        totalGstAmt += gst;
        grandTotalSum += total;

        const customerName = s.customer ? (typeof s.customer === "object" ? s.customer.name : "Customer") : "Walk-in Customer";

        return {
          invoiceNumber: s.invoiceNumber || `INV-${s._id?.substring(0, 6)}`,
          date: formatDate(s.createdAt),
          customer: customerName,
          taxableValue: formatCurrency(taxable),
          cgst: formatCurrency(halfGst),
          sgst: formatCurrency(halfGst),
          totalTax: formatCurrency(gst),
          grandTotal: formatCurrency(total),
        };
      });

      summaryMetrics = [
        { label: "Total Taxable Sales", value: formatCurrency(totalTaxable) },
        { label: "Total GST Collected", value: formatCurrency(totalGstAmt) },
        { label: "Gross Invoice Value", value: formatCurrency(grandTotalSum) },
      ];
      break;
    }

    case "payment_settlement": {
      title = "Payment Method Settlement Report";
      columns = [
        { header: "Payment Mode", key: "mode" },
        { header: "Total Invoices", key: "count" },
        { header: "Collected Amount", key: "amount" },
        { header: "% Share of Revenue", key: "share" },
      ];

      const filteredSales = filterByDateRange(sales, "createdAt", dateFrom, dateTo);

      const modeStats = { Cash: { count: 0, total: 0 }, Card: { count: 0, total: 0 }, UPI: { count: 0, total: 0 }, NetBanking: { count: 0, total: 0 } };
      let grandTotal = 0;

      filteredSales.forEach((s) => {
        const mode = s.paymentMethod || "Cash";
        const amt = s.totalAmount || 0;
        grandTotal += amt;
        if (!modeStats[mode]) modeStats[mode] = { count: 0, total: 0 };
        modeStats[mode].count += 1;
        modeStats[mode].total += amt;
      });

      rows = Object.keys(modeStats).map((mode) => {
        const stat = modeStats[mode];
        const share = grandTotal > 0 ? ((stat.total / grandTotal) * 100).toFixed(1) : "0";
        return {
          mode,
          count: stat.count,
          amount: formatCurrency(stat.total),
          share: `${share}%`,
        };
      });

      summaryMetrics = [
        { label: "Total Settled Amount", value: formatCurrency(grandTotal) },
        { label: "Total Transactions", value: filteredSales.length },
      ];
      break;
    }

    case "sales_returns": {
      title = "Sales Returns & Refund Audit Report";
      columns = [
        { header: "Sale Invoice #", key: "invoiceNumber" },
        { header: "Date", key: "date" },
        { header: "Returned Product", key: "product" },
        { header: "Returned Qty", key: "returnedQty" },
        { header: "Refund Value", key: "refundValue" },
        { header: "Status", key: "status" },
      ];

      let totalReturnedQty = 0;
      let totalRefundAmt = 0;

      sales.forEach((s) => {
        (s.items || []).forEach((item) => {
          if (item.returnedQuantity && item.returnedQuantity > 0) {
            const refund = (item.price || 0) * item.returnedQuantity;
            totalReturnedQty += item.returnedQuantity;
            totalRefundAmt += refund;

            rows.push({
              invoiceNumber: s.invoiceNumber || `INV-${s._id?.substring(0, 6)}`,
              date: formatDate(s.createdAt),
              product: item.product?.name || "Product Item",
              returnedQty: `${item.returnedQuantity} Tablets`,
              refundValue: formatCurrency(refund),
              status: "Restocked / Refunded",
            });
          }
        });
      });

      summaryMetrics = [
        { label: "Total Refund Claims", value: rows.length },
        { label: "Total Returned Units", value: `${totalReturnedQty} Units` },
        { label: "Total Refunded Value", value: formatCurrency(totalRefundAmt) },
      ];
      break;
    }

    case "customer_ledger": {
      title = "Customer Sales & Ledger Report";
      columns = [
        { header: "Customer Name", key: "name" },
        { header: "Mobile Number", key: "mobile" },
        { header: "Email Address", key: "email" },
        { header: "Total Orders", key: "orders" },
        { header: "Lifetime Spend", key: "spend" },
        { header: "Average Basket", key: "avgBasket" },
      ];

      let totalCustomersCount = customers.length;
      let totalLifetimeSpend = 0;

      rows = customers.map((c) => {
        const custSales = sales.filter((s) => (s.customer?._id || s.customer) === c._id);
        const spend = custSales.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
        totalLifetimeSpend += spend;
        const avg = custSales.length ? spend / custSales.length : 0;

        return {
          name: c.name || "Customer",
          mobile: c.mobile ? `+91 ${c.mobile}` : "N/A",
          email: c.email || "N/A",
          orders: custSales.length,
          spend: formatCurrency(spend),
          avgBasket: formatCurrency(avg),
        };
      });

      summaryMetrics = [
        { label: "Total Customers", value: totalCustomersCount },
        { label: "Cumulative Customer Spend", value: formatCurrency(totalLifetimeSpend) },
        { label: "Avg Spend per Customer", value: formatCurrency(totalCustomersCount ? totalLifetimeSpend / totalCustomersCount : 0) },
      ];
      break;
    }

    case "purchase_orders": {
      title = "Purchase Orders & Supplier Summary";
      columns = [
        { header: "PO Number", key: "poNumber" },
        { header: "Supplier Name", key: "supplier" },
        { header: "Order Date", key: "orderDate" },
        { header: "Status", key: "status" },
        { header: "Total Items", key: "itemsCount" },
        { header: "Total Order Value", key: "totalValue" },
      ];

      let totalPoCost = 0;

      rows = purchaseOrders.map((po) => {
        const cost = po.totalAmount || po.totalCost || 0;
        totalPoCost += cost;
        const itemCount = po.items ? po.items.length : 0;

        return {
          poNumber: po.poNumber || `PO-${po._id?.substring(0, 6)}`,
          supplier: po.supplierName || po.supplier?.name || "Supplier Partner",
          orderDate: formatDate(po.createdAt || po.orderDate),
          status: po.status || "Pending",
          itemsCount: `${itemCount} Items`,
          totalValue: formatCurrency(cost),
        };
      });

      summaryMetrics = [
        { label: "Total Purchase Orders", value: purchaseOrders.length },
        { label: "Total Order Expenses", value: formatCurrency(totalPoCost) },
      ];
      break;
    }

    default:
      break;
  }

  return { title, columns, rows, summaryMetrics };
};

/**
 * Downloads report in PDF format
 */
export const downloadPDFReport = ({ title, columns, rows, summaryMetrics, dateFrom, dateTo }) => {
  const doc = new jsPDF("landscape", "mm", "a4");

  // Header Banner
  doc.setFillColor(22, 101, 52); // Green #166534
  doc.rect(0, 0, 297, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("SPREN PHARMACY MANAGEMENT", 14, 15);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Official Business Intelligence Report", 283, 15, { align: "right" });

  // Title & Metadata
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 35);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);

  const dateFilterStr = dateFrom || dateTo ? `Period: ${dateFrom || "Start"} to ${dateTo || "Present"}` : "Period: All Time";
  doc.text(`${dateFilterStr} | Generated on: ${new Date().toLocaleString("en-IN")}`, 14, 42);

  let startY = 48;

  // Render Metric Cards
  if (summaryMetrics && summaryMetrics.length > 0) {
    const cardWidth = 80;
    const cardHeight = 16;
    summaryMetrics.forEach((metric, index) => {
      const xPos = 14 + index * (cardWidth + 10);
      if (xPos + cardWidth <= 283) {
        doc.setFillColor(243, 244, 246);
        doc.roundedRect(xPos, startY, cardWidth, cardHeight, 3, 3, "F");

        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(metric.label.toUpperCase(), xPos + 6, startY + 6);

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 101, 52);
        doc.text(String(metric.value), xPos + 6, startY + 13);
      }
    });
    startY += cardHeight + 8;
  }

  // Render Table
  const tableHeaders = [columns.map((c) => c.header)];
  const tableRows = rows.map((r) => columns.map((c) => r[c.key] || ""));

  autoTable(doc, {
    head: tableHeaders,
    body: tableRows,
    startY,
    theme: "grid",
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      valign: "middle",
      textColor: [31, 41, 55],
    },
    headStyles: {
      fillColor: [22, 101, 52],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer page numbering
      const str = `Page ${doc.internal.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(str, 283, 203, { align: "right" });
    },
  });

  const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `Spren_${sanitizedTitle}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};

/**
 * Downloads report in Excel (.xlsx) format
 */
export const downloadExcelReport = ({ title, columns, rows, summaryMetrics }) => {
  const exportData = [];

  // Title Block
  exportData.push([title.toUpperCase()]);
  exportData.push([`Generated on: ${new Date().toLocaleString("en-IN")}`]);
  exportData.push([]);

  // Metrics Block
  if (summaryMetrics && summaryMetrics.length > 0) {
    exportData.push(["SUMMARY METRICS"]);
    summaryMetrics.forEach((m) => {
      exportData.push([m.label, m.value]);
    });
    exportData.push([]);
  }

  // Table Headers
  const headerRow = columns.map((c) => c.header);
  exportData.push(headerRow);

  // Table Rows
  rows.forEach((r) => {
    const rowValues = columns.map((c) => r[c.key] || "");
    exportData.push(rowValues);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Spren Report");

  const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `Spren_${sanitizedTitle}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

/**
 * Downloads report in CSV format
 */
export const downloadCSVReport = ({ title, columns, rows }) => {
  const csvRows = [];

  // Header row
  csvRows.push(columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(","));

  // Data rows
  rows.forEach((r) => {
    const rowStr = columns
      .map((c) => {
        const val = r[c.key] !== undefined && r[c.key] !== null ? String(r[c.key]) : "";
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(",");
    csvRows.push(rowStr);
  });

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);

  const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, "_");
  link.setAttribute("download", `Spren_${sanitizedTitle}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
