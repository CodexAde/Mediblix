import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StockModal from '../components/StockModal';
import StatsCards from '../components/StockManager/StatsCards';
import QuickActions from '../components/StockManager/QuickActions';
import RecentMovements from '../components/StockManager/RecentMovements';
import LowStockAlerts from '../components/StockManager/LowStockAlerts';
import AddProductForm from '../components/StockManager/AddProductForm';
import PurchaseOrderForm from '../components/StockManager/PurchaseOrderForm';
import GenerateReportForm from '../components/StockManager/GenerateReportForm';
import AddProductChoiceModal from '../components/Inventory/AddProductChoiceModal';
import BillHistoryModalContent from '../components/StockManager/BillHistoryModalContent';

const StockManager = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [isChoiceOpen, setIsChoiceOpen] = useState(false);

  const modalTitles = {
    'add-product': 'Add New Product',
    'purchase-order': 'Create Purchase Order',
    'generate-report': 'Ai Analytics Report',
    'bill-history': 'Bill History',
  };

  const handleActionClick = (action) => {
    if (action === 'add-product') {
      setIsChoiceOpen(true);
    } else if (action === 'activity-calendar') {
      navigate('/audits?tab=activity-calendar');
    } else if (action === 'generate-report') {
      navigate('/audits?tab=reports');
    } else {
      setActiveModal(action);
    }
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'add-product':
        return <AddProductForm onClose={() => setActiveModal(null)} />;
      case 'purchase-order':
        return <PurchaseOrderForm onClose={() => setActiveModal(null)} />;
      case 'generate-report':
        return <GenerateReportForm onClose={() => setActiveModal(null)} />;
      case 'bill-history':
        return <BillHistoryModalContent onClose={() => setActiveModal(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-70px)] w-full bg-[var(--bg-main)] overflow-hidden p-8">
      <div className="h-full max-w-7xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Stock Manager</h1>
            <p className="text-[var(--text-secondary)] mt-1">Manage and monitor your inventory in real-time</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex-shrink-0">
          <StatsCards />
        </div>

        {/* Main Content Grid - Scrollable */}
        <div className="flex-1 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="overflow-y-auto h-full">
              <QuickActions onActionClick={handleActionClick} />
            </div>
            <div className="overflow-y-auto h-full">
              <RecentMovements />
            </div>
            <div className="overflow-y-auto h-full">
              <LowStockAlerts />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <StockModal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={modalTitles[activeModal] || ''}
      >
        {renderModalContent()}
      </StockModal>

      <AddProductChoiceModal
        isOpen={isChoiceOpen}
        onClose={() => setIsChoiceOpen(false)}
        onManualSelect={() => setActiveModal('add-product')}
      />
    </div>
  );
};

export default StockManager;
