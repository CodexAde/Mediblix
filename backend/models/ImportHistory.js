import mongoose from "mongoose";

const importHistorySchema = mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    totalProducts: {
      type: Number,
      required: true,
    },
    totalQuantity: {
      type: Number,
      required: true,
    },
    totalValue: {
      type: Number,
      required: true,
    },
    items: [
      {
        name: {
          type: String,
          required: true,
        },
        sku: {
          type: String,
          required: true,
        },
        category: {
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
        status: {
          type: String,
          enum: ["New", "Updated"],
          default: "New",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ImportHistory = mongoose.model("ImportHistory", importHistorySchema);

export default ImportHistory;
