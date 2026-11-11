import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import generateToken from "../utils/generateToken.js";

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = email ? email.toLowerCase().trim() : "";
  const user = await User.findOne({ email: normalizedEmail }).populate("organization");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (
    user.role !== "superadmin" &&
    user.organization &&
    user.organization.status === "Frozen"
  ) {
    res.status(403);
    throw new Error("This organization is frozen by administrator. Access restricted.");
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || (user.isAdmin ? "superadmin" : "staff"),
    isAdmin: user.isAdmin,
    organization: user.organization || null,
    token: generateToken(user._id),
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password").populate("organization");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

export { authUser, getMe };
