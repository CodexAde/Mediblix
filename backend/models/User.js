import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    lastPassword: {
      type: String,
      default: "",
    },
    passwordHistory: [
      {
        pin: { type: String, default: "" },
        deactivatedAt: { type: Date, default: Date.now },
        status: { type: String, default: "Disabled" },
      },
    ],
    role: {
      type: String,
      enum: ["superadmin", "org_admin", "staff"],
      default: "staff",
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    sessionVersion: {
      type: Number,
      default: 1,
    },
    activeSessionKey: {
      type: String,
      default: null,
    },
    activeDeviceInfo: {
      deviceName: { type: String, default: "" },
      ip: { type: String, default: "" },
      userAgent: { type: String, default: "" },
      lastActiveAt: { type: Date, default: Date.now },
      loggedInAt: { type: Date, default: Date.now },
    },
    deviceAccessLogs: [
      {
        attemptedAt: { type: Date, default: Date.now },
        ip: { type: String, default: "" },
        userAgent: { type: String, default: "" },
        deviceName: { type: String, default: "" },
        status: {
          type: String,
          enum: [
            "Success",
            "Blocked_Device_Conflict",
            "Session_Invalidated",
            "Logged_Out",
          ],
          default: "Success",
        },
        details: { type: String, default: "" },
      },
    ],
    conflictAttemptsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
