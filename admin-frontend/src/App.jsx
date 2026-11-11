import React from "react";
import { BrowserRouter } from "react-router-dom";
import AdminAuthState from "./context/AdminAuthStates";
import AppRoutes from "./routes/Route";

function App() {
  return (
    <BrowserRouter>
      <AdminAuthState>
        <AppRoutes />
      </AdminAuthState>
    </BrowserRouter>
  );
}

export default App;

