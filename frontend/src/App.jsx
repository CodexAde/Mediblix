import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DeviceProvider } from './context/DeviceContext';
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

function App() {
  return (
    <DeviceProvider>
      <BrowserRouter>
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
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </DeviceProvider>
  );
}

export default App;
