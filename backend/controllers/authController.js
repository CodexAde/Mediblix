import asyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import generateToken from "../utils/generateToken.js";

const parseDeviceName = (uaString = "") => {
  let browser = "Web Browser";
  let os = "Desktop";

  if (/iphone/i.test(uaString)) os = "iPhone";
  else if (/ipad/i.test(uaString)) os = "iPad";
  else if (/android/i.test(uaString)) os = "Android";
  else if (/macintosh|mac os x/i.test(uaString)) os = "macOS";
  else if (/windows nt/i.test(uaString)) os = "Windows";
  else if (/linux/i.test(uaString)) os = "Linux";

  if (/edg/i.test(uaString)) browser = "Edge";
  else if (/chrome|crios/i.test(uaString)) browser = "Chrome";
  else if (/firefox|fxios/i.test(uaString)) browser = "Firefox";
  else if (/safari/i.test(uaString)) browser = "Safari";

  return `${browser} on ${os}`;
};

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = email ? email.toLowerCase().trim() : "";
  const user = await User.findOne({ email: normalizedEmail }).populate("organization");

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const rawUa = req.headers["user-agent"] || "";
  const clientIp =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    "Unknown IP";
  const deviceName = parseDeviceName(rawUa);
  const clientSession = req.headers["x-device-session"] || req.body.activeSessionKey;
  const rawDeviceId = req.headers["x-device-id"] || req.body.deviceId;

  if (
    user.role !== "superadmin" &&
    user.organization &&
    user.organization.status === "Frozen"
  ) {
    return res.status(403).json({
      message: "This organization is frozen by administrator. Access restricted.",
      isFrozen: true,
      organizationName: user.organization.name,
    });
  }

  if (
    user.role !== "superadmin" &&
    user.organization &&
    user.organization.subscriptionExpiresAt &&
    new Date(user.organization.subscriptionExpiresAt) < new Date()
  ) {
    return res.status(403).json({
      message: `Organization subscription expired on ${new Date(
        user.organization.subscriptionExpiresAt
      ).toLocaleDateString("en-IN")}. Please contact administrator to renew.`,
      isExpired: true,
      organizationName: user.organization.name,
      expiresAt: user.organization.subscriptionExpiresAt,
    });
  }

  let orgDoc = null;
  if (user.role !== "superadmin" && user.organization) {
    const orgId = user.organization._id || user.organization;
    orgDoc = await Organization.findById(orgId);

    if (orgDoc) {
      orgDoc.registeredDevices = orgDoc.registeredDevices || [];
      const maxDevices = orgDoc.maxAllowedDevices && orgDoc.maxAllowedDevices > 0 ? orgDoc.maxAllowedDevices : 1;
      const deviceId = rawDeviceId ? String(rawDeviceId).trim() : null;

      if (deviceId) {
        const existingDevice = orgDoc.registeredDevices.find((d) => d.deviceId === deviceId);

        if (existingDevice) {
          existingDevice.lastActiveAt = new Date();
          existingDevice.ip = clientIp;
          existingDevice.userAgent = rawUa;
          existingDevice.deviceName = deviceName;
          await orgDoc.save();
        } else {
          if (orgDoc.registeredDevices.length >= maxDevices) {
            user.conflictAttemptsCount = (user.conflictAttemptsCount || 0) + 1;
            user.deviceAccessLogs = user.deviceAccessLogs || [];
            user.deviceAccessLogs.unshift({
              attemptedAt: new Date(),
              ip: clientIp,
              userAgent: rawUa,
              deviceName,
              status: "Blocked_Device_Conflict",
              details: `Device limit reached (${orgDoc.registeredDevices.length}/${maxDevices} bound). Login rejected from unregistered device.`,
            });

            if (user.deviceAccessLogs.length > 50) {
              user.deviceAccessLogs = user.deviceAccessLogs.slice(0, 50);
            }

            await user.save();

            return res.status(403).json({
              message: `Device limit reached (${orgDoc.registeredDevices.length} of ${maxDevices} allowed). This pharmacy account is locked to its registered devices. Even after logging out, new devices cannot access this account. Contact your administrator to increase the device limit or reset registered devices.`,
              isDeviceLimitReached: true,
              maxAllowedDevices: maxDevices,
              registeredCount: orgDoc.registeredDevices.length,
            });
          }

          orgDoc.registeredDevices.push({
            deviceId,
            deviceName,
            ip: clientIp,
            userAgent: rawUa,
            registeredAt: new Date(),
            lastActiveAt: new Date(),
          });
          await orgDoc.save();
        }
      }
    }
  }

  if (
    user.role !== "superadmin" &&
    user.activeSessionKey &&
    clientSession !== user.activeSessionKey
  ) {
    const isSameRegisteredDevice =
      orgDoc &&
      rawDeviceId &&
      orgDoc.registeredDevices?.some((d) => d.deviceId === String(rawDeviceId).trim());

    if (!isSameRegisteredDevice) {
      user.conflictAttemptsCount = (user.conflictAttemptsCount || 0) + 1;
      user.deviceAccessLogs = user.deviceAccessLogs || [];
      user.deviceAccessLogs.unshift({
        attemptedAt: new Date(),
        ip: clientIp,
        userAgent: rawUa,
        deviceName,
        status: "Blocked_Device_Conflict",
        details: `Concurrent login attempt blocked while active on ${
          user.activeDeviceInfo?.deviceName || "Terminal"
        }`,
      });

      if (user.deviceAccessLogs.length > 50) {
        user.deviceAccessLogs = user.deviceAccessLogs.slice(0, 50);
      }

      await user.save();

      return res.status(403).json({
        message: `Account is currently logged in on another device (${
          user.activeDeviceInfo?.deviceName || "Active Terminal"
        }). Single-device policy is strictly enforced. Please log out from that device or contact your administrator to reset access.`,
        isDeviceConflict: true,
        activeDevice: user.activeDeviceInfo?.deviceName || "Active Terminal",
        conflictCount: user.conflictAttemptsCount,
      });
    }
  }

  const sessionKey = crypto.randomBytes(24).toString("hex");
  user.activeSessionKey = sessionKey;
  user.activeDeviceInfo = {
    deviceName,
    ip: clientIp,
    userAgent: rawUa,
    loggedInAt: new Date(),
    lastActiveAt: new Date(),
  };

  user.deviceAccessLogs = user.deviceAccessLogs || [];
  user.deviceAccessLogs.unshift({
    attemptedAt: new Date(),
    ip: clientIp,
    userAgent: rawUa,
    deviceName,
    status: "Success",
    details: "Authorized session started",
  });

  if (user.deviceAccessLogs.length > 50) {
    user.deviceAccessLogs = user.deviceAccessLogs.slice(0, 50);
  }

  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || (user.isAdmin ? "superadmin" : "staff"),
    isAdmin: user.isAdmin,
    organization: user.organization || null,
    token: generateToken(user._id, user.sessionVersion || 1),
    sessionKey,
    activeDevice: user.activeDeviceInfo,
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  if (req.user) {
    const rawUa = req.headers["user-agent"] || "";
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      "Unknown IP";
    const deviceName = parseDeviceName(rawUa);

    req.user.activeSessionKey = null;
    req.user.deviceAccessLogs = req.user.deviceAccessLogs || [];
    req.user.deviceAccessLogs.unshift({
      attemptedAt: new Date(),
      ip: clientIp,
      userAgent: rawUa,
      deviceName,
      status: "Logged_Out",
      details: "Session terminated cleanly by user",
    });

    if (req.user.deviceAccessLogs.length > 50) {
      req.user.deviceAccessLogs = req.user.deviceAccessLogs.slice(0, 50);
    }

    await req.user.save();
  }

  res.json({ message: "Logged out successfully" });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password").populate("organization");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("organization");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (req.body.name) {
    user.name = req.body.name.trim();
  }

  if (req.body.email) {
    const targetEmail = req.body.email.toLowerCase().trim();
    if (targetEmail !== user.email) {
      const existing = await User.findOne({ email: targetEmail });
      if (existing) {
        res.status(400);
        throw new Error("Email address is already in use");
      }
      user.email = targetEmail;
    }
  }

  await user.save();

  if (user.organization) {
    const org = await Organization.findById(user.organization._id || user.organization);
    if (org) {
      if (req.body.organizationName) {
        org.name = req.body.organizationName.trim();
      }
      if (req.body.contactPerson) {
        org.contactPerson = req.body.contactPerson.trim();
      }
      if (req.body.contactPhone !== undefined) {
        org.contactPhone = req.body.contactPhone.trim();
      }
      if (req.body.address !== undefined) {
        org.address = req.body.address.trim();
      }
      await org.save();
    }
  }

  const updatedUser = await User.findById(user._id).select("-password").populate("organization");

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    isAdmin: updatedUser.isAdmin,
    organization: updatedUser.organization,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Please provide current and new password");
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error("Incorrect current password");
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password updated successfully" });
});

export { authUser, logoutUser, getMe, updateUserProfile, changePassword };
