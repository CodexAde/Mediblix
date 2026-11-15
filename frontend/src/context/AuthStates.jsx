import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import axios from "axios";
import { getOrCreateDeviceId } from "../services/api";
import FrozenAccountModal from "../components/FrozenAccountModal";
import ExpiredSubscriptionModal from "../components/ExpiredSubscriptionModal";

const AuthState = (props) => {
  const [user, setUser] = useState(() => {
    const loggedInUser = localStorage.getItem("userInfo");
    if (!loggedInUser) return null;
    try {
      return JSON.parse(loggedInUser);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("userInfo");
      return null;
    }
  });
  const [loading] = useState(false);
  const [error, setError] = useState(null);
  const [isFrozenModalOpen, setIsFrozenModalOpen] = useState(false);
  const [frozenOrgName, setFrozenOrgName] = useState(() => {
    const loggedInUser = localStorage.getItem("userInfo");
    if (!loggedInUser) return "";
    try {
      return JSON.parse(loggedInUser)?.organization?.name || "";
    } catch {
      return "";
    }
  });
  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);
  const [expiredInfo, setExpiredInfo] = useState(() => {
    const loggedInUser = localStorage.getItem("userInfo");
    if (!loggedInUser) return { organizationName: "", expiresAt: null };
    try {
      const parsed = JSON.parse(loggedInUser);
      return {
        organizationName: parsed?.organization?.name || "",
        expiresAt: parsed?.organization?.subscriptionExpiresAt || null,
      };
    } catch {
      return { organizationName: "", expiresAt: null };
    }
  });

  useEffect(() => {
    const handleFrozenEvent = (e) => {
      if (e.detail?.organizationName) {
        setFrozenOrgName(e.detail.organizationName);
      }
      setIsFrozenModalOpen(true);
    };

    const handleExpiredEvent = (e) => {
      if (e.detail?.organizationName) {
        setExpiredInfo({
          organizationName: e.detail.organizationName,
          expiresAt: e.detail.expiresAt,
        });
      }
      setIsExpiredModalOpen(true);
    };

    const handleSessionRevokedEvent = () => {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("active_device_session");
      setUser(null);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    };

    window.addEventListener("Mediblix:account_frozen", handleFrozenEvent);
    window.addEventListener("Mediblix:subscription_expired", handleExpiredEvent);
    window.addEventListener("Mediblix:session_revoked", handleSessionRevokedEvent);

    return () => {
      window.removeEventListener("Mediblix:account_frozen", handleFrozenEvent);
      window.removeEventListener("Mediblix:subscription_expired", handleExpiredEvent);
      window.removeEventListener("Mediblix:session_revoked", handleSessionRevokedEvent);
    };
  }, []);

  useEffect(() => {
    if (!user || user.role === "superadmin") return;

    const interval = setInterval(async () => {
      try {
        const userInfoStr = localStorage.getItem("userInfo");
        if (!userInfoStr) return;
        const parsed = JSON.parse(userInfoStr);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
        const activeSession = localStorage.getItem("active_device_session") || "";
        await axios.get(`${backendUrl}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${parsed.token}`,
            "x-device-session": activeSession,
            "x-device-id": getOrCreateDeviceId(),
          },
        });
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("userInfo");
          localStorage.removeItem("active_device_session");
          setUser(null);
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [user]);

  const login = async (email, password) => {
    try {
      const activeSession = localStorage.getItem("active_device_session") || "";
      const deviceId = getOrCreateDeviceId();
      const config = {
        headers: {
          "Content-Type": "application/json",
          "x-device-session": activeSession,
          "x-device-id": deviceId,
        },
      };

      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      const { data } = await axios.post(
        `${backendUrl}/api/users/login`,
        { email, password, activeSessionKey: activeSession, deviceId },
        config
      );

      if (data.sessionKey) {
        localStorage.setItem("active_device_session", data.sessionKey);
      }

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      if (data.organization?.name) {
        setFrozenOrgName(data.organization.name);
        setExpiredInfo({
          organizationName: data.organization.name,
          expiresAt: data.organization.subscriptionExpiresAt,
        });
      }
      setError(null);
      return data;
    } catch (err) {
      const resData = err.response?.data;
      const resMsg = typeof resData === "string" ? resData : resData?.message || "";

      const isFrozen =
        err.response?.status === 403 &&
        (resData?.isFrozen || resMsg.toLowerCase().includes("frozen"));

      const isExpired =
        err.response?.status === 403 &&
        (resData?.isExpired || resMsg.toLowerCase().includes("expired"));

      if (isFrozen) {
        if (resData?.organizationName) {
          setFrozenOrgName(resData.organizationName);
        }
        setIsFrozenModalOpen(true);
      }

      if (isExpired) {
        setExpiredInfo({
          organizationName: resData?.organizationName || "",
          expiresAt: resData?.expiresAt || null,
        });
        setIsExpiredModalOpen(true);
      }

      const message =
        resData?.message ||
        (isFrozen
          ? "This organization is frozen by administrator. Access restricted."
          : isExpired
          ? "Organization subscription has expired. Please contact administrator to renew."
          : err.message || "Login failed");

      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      const userInfoStr = localStorage.getItem("userInfo");
      const activeSession = localStorage.getItem("active_device_session");
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
        await axios.post(
          `${backendUrl}/api/users/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
              "x-device-session": activeSession || "",
              "x-device-id": getOrCreateDeviceId(),
            },
          }
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("active_device_session");
      setUser(null);
      setIsFrozenModalOpen(false);
      setIsExpiredModalOpen(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        error,
        setError,
        isFrozenModalOpen,
        setIsFrozenModalOpen,
        isExpiredModalOpen,
        setIsExpiredModalOpen,
      }}
    >
      {props.children}
      <FrozenAccountModal
        isOpen={isFrozenModalOpen}
        onClose={() => setIsFrozenModalOpen(false)}
        onLogout={logout}
        organizationName={frozenOrgName || user?.organization?.name}
      />
      <ExpiredSubscriptionModal
        isOpen={isExpiredModalOpen}
        onClose={() => setIsExpiredModalOpen(false)}
        onLogout={logout}
        organizationName={expiredInfo.organizationName || user?.organization?.name}
        expiresAt={expiredInfo.expiresAt}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

export default AuthState;
