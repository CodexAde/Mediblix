import mongoose from "mongoose";

const organizationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      required: false,
      trim: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Frozen"],
      default: "Active",
    },
    plan: {
      type: String,
      enum: ["Trial", "Monthly", "Annual", "Enterprise", "Lifetime"],
      default: "Trial",
    },
    subscriptionStartDate: {
      type: Date,
      default: Date.now,
    },
    subscriptionExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    billingCycle: {
      type: String,
      enum: ["Monthly", "Annual", "Custom"],
      default: "Monthly",
    },
    billingAmount: {
      type: Number,
      default: 0,
    },
    singleDeviceEnforced: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Organization = mongoose.model("Organization", organizationSchema);

export default Organization;
