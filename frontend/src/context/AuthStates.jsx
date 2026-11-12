import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import axios from "axios";
import FrozenAccountModal from "../components/FrozenAccountModal";
import ExpiredSubscriptionModal from "../components/ExpiredSubscriptionModal";

const AuthState = (props) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFrozenModalOpen, setIsFrozenModalOpen] = useState(false);
  const [frozenOrgName, setFrozenOrgName] = useState("");
  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);
  const [expiredInfo, setExpiredInfo] = useState({
    organizationName: "",
    expiresAt: null,
  });

  useEffect(() => {
    const loggedInUser = localStorage.getItem("userInfo");
    if (loggedInUser) {
      try {
        const parsed = JSON.parse(loggedInUser);
        setUser(parsed);
        if (parsed.organization?.name) {
          setFrozenOrgName(parsed.organization.name);
          setExpiredInfo({
            organizationName: parsed.organization.name,
            expiresAt: parsed.organization.subscriptionExpiresAt,
          });
        }
      } catch (e) {
        localStorage.removeItem("userInfo");
      }
    }
    setLoading(false);

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

    window.addEventListener("Mediblix:account_frozen", handleFrozenEvent);
    window.addEventListener("Mediblix:subscription_expired", handleExpiredEvent);

    return () => {
      window.removeEventListener("Mediblix:account_frozen", handleFrozenEvent);
      window.removeEventListener("Mediblix:subscription_expired", handleExpiredEvent);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const activeSession = localStorage.getItem("active_device_session") || "";
      const config = {
        headers: {
          "Content-Type": "application/json",
          "x-device-session": activeSession,
        },
      };

      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      const { data } = await axios.post(
        `${backendUrl}/api/users/login`,
        { email, password, activeSessionKey: activeSession },
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
            },
          }
        );
      }
    } catch (e) {
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
