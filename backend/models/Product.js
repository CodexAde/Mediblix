import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },
    expiryDate: {
      type: Date,
      required: false,
    },
    mfgDate: {
      type: Date,
      required: false,
    },
    hsn: {
      type: String,
      required: false,
    },
    packaging: {
      type: String,
      default: "10 Tablets / Strip",
    },
    tabletsPerStrip: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre("save", async function () {
  if (this.quantity === 0) {
    this.status = "Out of Stock";
  } else if (this.quantity < 10) {
    this.status = "Low Stock";
  } else {
    this.status = "In Stock";
  }
});

const Product = mongoose.model("Product", productSchema);

export default Product;
