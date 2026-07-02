import ImportHistory from "../models/ImportHistory.js";
import Product from "../models/Product.js";

const getImportHistory = async (req, res) => {
  try {
    const history = await ImportHistory.find({}).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createImportRecord = async (req, res) => {
  const { fileName, items } = req.body;

  if (!fileName || !items || !Array.isArray(items)) {
    return res.status(400).json({ message: "File name and items array are required" });
  }

  try {
    let totalQuantity = 0;
    let totalValue = 0;
    const processedItems = [];

    for (const item of items) {
      let product = await Product.findOne({ sku: item.sku });
      let status = "Updated";

      if (product) {
        product.quantity += Number(item.quantity);
        product.price = Number(item.price);
        if (item.expiryDate) product.expiryDate = item.expiryDate;
        if (item.mfgDate) product.mfgDate = item.mfgDate;
        if (item.hsn) product.hsn = item.hsn;
        product.packaging = "1 Tablet";
        product.tabletsPerStrip = 1;
        await product.save();
      } else {
        status = "New";
        product = await Product.create({
          name: item.name,
          sku: item.sku,
          category: item.category || "General",
          quantity: Number(item.quantity),
          price: Number(item.price),
          expiryDate: item.expiryDate || new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000),
          mfgDate: item.mfgDate || null,
          hsn: item.hsn || null,
          packaging: "1 Tablet",
          tabletsPerStrip: 1,
        });
      }

      totalQuantity += Number(item.quantity);
      totalValue += Number(item.quantity) * Number(item.price);

      processedItems.push({
        name: product.name,
        sku: product.sku,
        category: product.category,
        quantity: Number(item.quantity),
        price: Number(item.price),
        status,
      });
    }

    const importRecord = await ImportHistory.create({
      fileName,
      totalProducts: items.length,
      totalQuantity,
      totalValue,
      items: processedItems,
    });

    res.status(201).json(importRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteImportRecord = async (req, res) => {
  try {
    const record = await ImportHistory.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Import record not found" });
    }
    await record.deleteOne();
    res.json({ message: "Import history record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getImportHistory, createImportRecord, deleteImportRecord };
