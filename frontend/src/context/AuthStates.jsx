import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import axios from "axios";
import FrozenAccountModal from "../components/FrozenAccountModal";

const AuthState = (props) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFrozenModalOpen, setIsFrozenModalOpen] = useState(false);
  const [frozenOrgName, setFrozenOrgName] = useState("");

  useEffect(() => {
    const loggedInUser = localStorage.getItem("userInfo");
    if (loggedInUser) {
      try {
        const parsed = JSON.parse(loggedInUser);
        setUser(parsed);
        if (parsed.organization?.name) {
          setFrozenOrgName(parsed.organization.name);
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

    window.addEventListener("Mediblix:account_frozen", handleFrozenEvent);
    return () => {
      window.removeEventListener("Mediblix:account_frozen", handleFrozenEvent);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      const { data } = await axios.post(
        `${backendUrl}/api/users/login`,
        { email, password },
        config
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      if (data.organization?.name) {
        setFrozenOrgName(data.organization.name);
      }
      setError(null);
      return data;
    } catch (err) {
      const resData = err.response?.data;
      const resMsg = typeof resData === "string" ? resData : resData?.message || "";
      const isFrozen =
        err.response?.status === 403 ||
        resData?.isFrozen ||
        resMsg.toLowerCase().includes("frozen") ||
        (err.message || "").toLowerCase().includes("frozen");

      if (isFrozen) {
        if (resData?.organizationName) {
          setFrozenOrgName(resData.organizationName);
        }
        setIsFrozenModalOpen(true);
      }

      const message =
        resData?.message ||
        (isFrozen
          ? "This organization is frozen by administrator. Access restricted."
          : err.message || "Login failed");

      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    setIsFrozenModalOpen(false);
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
      }}
    >
      {props.children}
      <FrozenAccountModal
        isOpen={isFrozenModalOpen}
        onClose={() => setIsFrozenModalOpen(false)}
        onLogout={logout}
        organizationName={frozenOrgName || user?.organization?.name}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

export default AuthState;
