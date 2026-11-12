import asyncHandler from "express-async-handler";
import crypto from "crypto";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Customer from "../models/Customer.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import generateToken from "../utils/generateToken.js";

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = email ? email.toLowerCase().trim() : "";
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid admin credentials");
  }

  if (user.role !== "superadmin" && !user.isAdmin) {
    res.status(403);
    throw new Error("Access restricted to platform administrators");
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: "superadmin",
    isAdmin: true,
    token: generateToken(user._id),
  });
});

const getAdminStats = asyncHandler(async (req, res) => {
  const totalOrgs = await Organization.countDocuments();
  const activeOrgs = await Organization.countDocuments({ status: "Active" });
  const frozenOrgs = await Organization.countDocuments({ status: "Frozen" });
  const totalProducts = await Product.countDocuments();
  const totalSalesCount = await Sale.countDocuments();
  const totalUsers = await User.countDocuments();

  const salesAggregate = await Sale.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);

  const totalRevenue = salesAggregate.length > 0 ? salesAggregate[0].totalRevenue : 0;

  res.json({
    totalOrgs,
    activeOrgs,
    frozenOrgs,
    totalProducts,
    totalSalesCount,
    totalUsers,
    totalRevenue,
  });
});

const getOrganizations = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const query = {};

  if (status && status !== "All") {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
      { contactEmail: { $regex: search, $options: "i" } },
      { contactPerson: { $regex: search, $options: "i" } },
    ];
  }

  const organizations = await Organization.find(query).sort({ createdAt: -1 });

  const orgSummaries = await Promise.all(
    organizations.map(async (org) => {
      const productCount = await Product.countDocuments({ organization: org._id });
      const saleCount = await Sale.countDocuments({ organization: org._id });
      const userCount = await User.countDocuments({ organization: org._id });

      const revenueAgg = await Sale.aggregate([
        { $match: { organization: org._id } },
        { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
      ]);
      const revenue = revenueAgg.length > 0 ? revenueAgg[0].revenue : 0;

      return {
        ...org.toObject(),
        productCount,
        saleCount,
        userCount,
        revenue,
      };
    })
  );

  res.json(orgSummaries);
});

const getOrganizationById = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.params.id);

  if (!org) {
    res.status(404);
    throw new Error("Organization not found");
  }

  const users = await User.find({ organization: org._id }).select("-password");
  const productCount = await Product.countDocuments({ organization: org._id });
  const saleCount = await Sale.countDocuments({ organization: org._id });
  const customerCount = await Customer.countDocuments({ organization: org._id });
  const purchaseOrderCount = await PurchaseOrder.countDocuments({ organization: org._id });

  const revenueAgg = await Sale.aggregate([
    { $match: { organization: org._id } },
    { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
  ]);
  const revenue = revenueAgg.length > 0 ? revenueAgg[0].revenue : 0;

  const recentSales = await Sale.find({ organization: org._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("customer", "name mobile");

  res.json({
    organization: org,
    users,
    stats: {
      productCount,
      saleCount,
      customerCount,
      purchaseOrderCount,
      revenue,
    },
    recentSales,
  });
});

const createOrganization = asyncHandler(async (req, res) => {
  const {
    name,
    code,
    contactPerson,
    contactEmail,
    contactPhone,
    address,
    password,
  } = req.body;

  if (!name || !contactPerson || !contactEmail) {
    res.status(400);
    throw new Error("Name, Contact Person, and Contact Email are required");
  }

  const existingOrg = await Organization.findOne({
    $or: [
      { contactEmail: contactEmail.toLowerCase() },
      ...(code ? [{ code: code.toUpperCase() }] : []),
    ],
  });

  if (existingOrg) {
    res.status(400);
    throw new Error("An organization with this email or code already exists");
  }

  const existingUser = await User.findOne({ email: contactEmail.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  const generatedCode =
    code && code.trim()
      ? code.trim().toUpperCase()
      : name
          .replace(/[^a-zA-Z0-9]/g, "")
          .substring(0, 6)
          .toUpperCase() + Math.floor(100 + Math.random() * 900);

  const initialPassword = password && password.trim() ? password.trim() : "Mediblix@" + crypto.randomBytes(4).toString("hex");

  const org = await Organization.create({
    name: name.trim(),
    code: generatedCode,
    contactPerson: contactPerson.trim(),
    contactEmail: contactEmail.trim().toLowerCase(),
    contactPhone: contactPhone ? contactPhone.trim() : "",
    address: address ? address.trim() : "",
    status: "Active",
  });

  const orgAdmin = await User.create({
    name: contactPerson.trim(),
    email: contactEmail.trim().toLowerCase(),
    password: initialPassword,
    role: "org_admin",
    isAdmin: true,
    organization: org._id,
  });

  res.status(201).json({
    message: "Organization created successfully",
    organization: org,
    credentials: {
      email: orgAdmin.email,
      password: initialPassword,
    },
  });
});

const updateOrganization = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.params.id);

  if (!org) {
    res.status(404);
    throw new Error("Organization not found");
  }

  org.name = req.body.name || org.name;
  org.contactPerson = req.body.contactPerson || org.contactPerson;
  org.contactEmail = req.body.contactEmail ? req.body.contactEmail.toLowerCase() : org.contactEmail;
  org.contactPhone = req.body.contactPhone !== undefined ? req.body.contactPhone : org.contactPhone;
  org.address = req.body.address !== undefined ? req.body.address : org.address;

  const updatedOrg = await org.save();
  res.json(updatedOrg);
});

const toggleOrganizationStatus = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.params.id);

  if (!org) {
    res.status(404);
    throw new Error("Organization not found");
  }

  const newStatus = req.body.status || (org.status === "Active" ? "Frozen" : "Active");
  org.status = newStatus;
  await org.save();

  res.json({
    message: `Organization status updated to ${newStatus}`,
    organization: org,
  });
});

const resetOrgPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const org = await Organization.findById(req.params.id);

  if (!org) {
    res.status(404);
    throw new Error("Organization not found");
  }

  const orgAdmin = await User.findOne({ organization: org._id, role: "org_admin" });

  if (!orgAdmin) {
    res.status(404);
    throw new Error("Admin user for this organization not found");
  }

  const generatedPassword = newPassword && newPassword.trim() ? newPassword.trim() : "Mediblix@" + crypto.randomBytes(4).toString("hex");

  orgAdmin.password = generatedPassword;
  await orgAdmin.save();

  res.json({
    message: "Password reset successfully",
    credentials: {
      email: orgAdmin.email,
      password: generatedPassword,
    },
  });
});

export {
  adminLogin,
  getAdminStats,
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  toggleOrganizationStatus,
  resetOrgPassword,
};

