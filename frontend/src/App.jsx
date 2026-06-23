import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DeviceProvider } from './context/DeviceContext';
import AuthState, { useAuth } from './context/AuthStates';
import MainLayout from './layout/MainLayout';
import LandingPage from './pages/LandingPage';
import StockManager from './pages/StockManager';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import ProductDetails from './pages/ProductDetails';
import OrderDetails from './pages/OrderDetails';
import CustomerDetails from './pages/CustomerDetails';
import LoginPage from './pages/Login';
import AIImport from './pages/AIImport';
import Suppliers from './pages/Suppliers';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

function App() {
  return (
    <DeviceProvider>
      <BrowserRouter>
        <AuthState>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/stock" element={<StockManager />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/billing" element={<Billing />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/order-detail/:id" element={<OrderDetails />} />
                      <Route path="/customer/:id" element={<CustomerDetails />} />
                      <Route path="/ai-import" element={<AIImport />} />
                      <Route path="/suppliers" element={<Suppliers />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthState>
      </BrowserRouter>
    </DeviceProvider>
  );
}

export default App;
