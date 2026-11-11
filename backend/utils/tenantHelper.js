import jwt from "jsonwebtoken";
import Organization from "../models/Organization.js";
import User from "../models/User.js";

const getTenantContext = async (req) => {
  let orgId = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).populate("organization");
      if (user) {
        req.user = user;
        if (user.organization) {
          orgId = user.organization._id;
          if (user.role !== "superadmin" && user.organization.status === "Frozen") {
            const err = new Error("Organization is frozen by administrator. Action not allowed.");
            err.statusCode = 403;
            throw err;
          }
        }
      }
    } catch (err) {
      if (err.statusCode === 403) throw err;
    }
  }

  if (!orgId && req.headers["x-organization-id"]) {
    orgId = req.headers["x-organization-id"];
    const org = await Organization.findById(orgId);
    if (org && org.status === "Frozen") {
      const err = new Error("Organization is frozen by administrator. Action not allowed.");
      err.statusCode = 403;
      throw err;
    }
  }

  if (!orgId) {
    const defaultOrg = await Organization.findOne({ code: "DEFAULT" });
    if (defaultOrg) {
      orgId = defaultOrg._id;
    }
  }

  return orgId;
};

const getTenantQuery = async (req) => {
  const orgId = await getTenantContext(req);
  if (!orgId) {
    return {};
  }
  return { organization: orgId };
};

export { getTenantContext, getTenantQuery };

