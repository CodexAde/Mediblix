import mongoose from "mongoose";

const purchaseOrderSchema = mongoose.Schema(
  {
    supplierName: {
      type: String,
      required: true,
    },
    supplierEmail: {
      type: String,
    },
    supplierPhone: {
      type: String,
    },
    deliveryAddress: {
      type: String,
    },
    items: [
      {
        productName: {
          type: String,
          required: true,
        },
        sku: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Transit", "Delivered"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);

export default PurchaseOrder;
