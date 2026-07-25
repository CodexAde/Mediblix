import Product from "../models/Product.js";
import ImportHistory from "../models/ImportHistory.js";

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID or SKU
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search products
// @route   GET /api/products/search?q=query
// @access  Public
const searchProducts = async (req, res) => {
  const { q } = req.query;
  try {
    const keyword = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { sku: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const products = await Product.find({ ...keyword });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Public
const createProduct = async (req, res) => {
  const { name, sku, category, price, quantity, status, expiryDate, mfgDate, hsn, packaging, tabletsPerStrip } = req.body;

  try {
    const productExists = await Product.findOne({ sku });

    if (productExists) {
      res.status(400);
      throw new Error("Product already exists");
    }

    const product = await Product.create({
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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Public
const updateProduct = async (req, res) => {
  const { name, sku, category, price, quantity, status, expiryDate, mfgDate, hsn, packaging, tabletsPerStrip } = req.body;

  try {
    const product = await Product.findById(req.params.id);

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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Public
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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
