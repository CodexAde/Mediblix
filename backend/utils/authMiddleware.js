import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Organization from "../models/Organization.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password").populate("organization");

      if (!req.user) {
        res.status(401);
        throw new Error("Not authorized, user not found");
      }

      if (
        req.user.role !== "superadmin" &&
        req.user.organization &&
        req.user.organization.status === "Frozen"
      ) {
        res.status(403);
        throw new Error("Organization is frozen. Please contact administrator.");
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error(error.message || "Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }
});

const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    next();
  } else {
    res.status(403);
    throw new Error("Access denied. Superadmin privileges required.");
  }
};

const resolveOrganization = async (req) => {
  if (req.user && req.user.organization) {
    return req.user.organization._id;
  }
  const headerOrgId = req.headers["x-organization-id"];
  if (headerOrgId) {
    return headerOrgId;
  }
  const defaultOrg = await Organization.findOne({ code: "DEFAULT" });
  return defaultOrg ? defaultOrg._id : null;
};

export { protect, superAdminOnly, resolveOrganization };

