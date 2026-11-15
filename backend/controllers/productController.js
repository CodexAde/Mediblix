import Product from "../models/Product.js";
import ImportHistory from "../models/ImportHistory.js";
import { getTenantQuery, getTenantContext } from "../utils/tenantHelper.js";

const getProducts = async (req, res) => {
  try {
    const tenantQuery = await getTenantQuery(req);
    const products = await Product.find(tenantQuery);
    res.json(products);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const tenantQuery = await getTenantQuery(req);
    const product = await Product.findOne({ _id: req.params.id, ...tenantQuery });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const searchProducts = async (req, res) => {
  const { q } = req.query;
  try {
    const tenantQuery = await getTenantQuery(req);
    const keyword = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { sku: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const products = await Product.find({ ...keyword, ...tenantQuery });
    res.json(products);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  const { name, sku, category, price, quantity, status, expiryDate, mfgDate, hsn, packaging, tabletsPerStrip } = req.body;

  try {
    const orgId = await getTenantContext(req);
    const productExists = await Product.findOne({ sku, organization: orgId });

    if (productExists) {
      res.status(400);
      throw new Error("Product already exists with this SKU in this organization");
    }

    const product = await Product.create({
      organization: orgId,
      name,
      sku,
      category,
      price,
      quantity,
      status,
      expiryDate,
      mfgDate,
      hsn,
      packaging,
      tabletsPerStrip,
    });

    if (product) {
      const qty = Number(quantity) || 0;
      const unitPrice = Number(price) || 0;

      await ImportHistory.create({
        organization: orgId,
        fileName: "Manual Entry",
        totalProducts: 1,
        totalQuantity: qty,
        totalValue: qty * unitPrice,
        items: [
          {
            name: product.name,
            sku: product.sku,
            category: product.category,
            quantity: qty,
            price: unitPrice,
            status: "New",
          },
        ],
      });

      res.status(201).json(product);
    } else {
      res.status(400);
      throw new Error("Invalid product data");
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { name, sku, category, price, quantity, status, expiryDate, mfgDate, hsn, packaging, tabletsPerStrip } = req.body;

  try {
    const tenantQuery = await getTenantQuery(req);
    const product = await Product.findOne({ _id: req.params.id, ...tenantQuery });

    if (product) {
      product.name = name || product.name;
      product.sku = sku || product.sku;
      product.category = category || product.category;
      product.price = price || product.price;
      product.quantity = quantity !== undefined ? quantity : product.quantity;
      product.status = status || product.status;
      product.expiryDate = expiryDate || product.expiryDate;
      product.mfgDate = mfgDate || product.mfgDate;
      product.hsn = hsn || product.hsn;
      product.packaging = packaging || product.packaging;
      product.tabletsPerStrip = tabletsPerStrip !== undefined ? tabletsPerStrip : product.tabletsPerStrip;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const tenantQuery = await getTenantQuery(req);
    const product = await Product.findOne({ _id: req.params.id, ...tenantQuery });

    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export {
  getProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
