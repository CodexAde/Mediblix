import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Eye, RefreshCw, IndianRupee, Boxes, Calendar as CalendarIcon } from 'lucide-react';

const MedicineCard = ({ medicine, onFindAlternative }) => {
  const navigate = useNavigate();

  const getStockBadgeClass = (status) => {
    switch (status) {
      case 'In Stock': return 'in-stock';
      case 'Low Stock': return 'low-stock';
      case 'Out of Stock': return 'out-of-stock';
      case 'Expired': return 'out-of-stock';
      default: return 'not-in-inventory';
    }
  };

  const getStockLabel = (status) => {
    switch (status) {
      case 'In Stock': return '✅ In Stock';
      case 'Low Stock': return '⚠️ Low Stock';
      case 'Out of Stock': return '❌ Out of Stock';
      case 'Expired': return '🚫 Expired';
      default: return '📦 Not in Inventory';
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const handleAddToBill = () => {
    if (medicine.inventory?.productId) {
      navigate(`/billing?prefill=${medicine.inventory.productId}`);
    } else {
      navigate('/billing');
    }
  };

  const handleViewDetails = () => {
    if (medicine.inventory?.productId) {
      navigate(`/product/${medicine.inventory.productId}`);
    }
  };

  const inv = medicine.inventory || {};
  const brandNames = medicine.commonBrandNames || [];
  const matchedName = inv.matchedProduct || brandNames[0] || medicine.genericName;

  return (
    <div className="medagent-medicine-card">
      {/* Header */}
      <div className="medagent-card-header">
        <div>
          <div className="medagent-card-name">{matchedName}</div>
          {medicine.genericName && matchedName !== medicine.genericName && (
            <div className="medagent-card-generic">{medicine.genericName}</div>
          )}
          {brandNames.length > 0 && (
            <div className="medagent-card-generic">
              Also: {brandNames.filter(b => b !== matchedName).join(', ')}
            </div>
          )}
        </div>
        <div className="medagent-card-badges">
          <span className={`medagent-badge ${getStockBadgeClass(inv.stockStatus)}`}>
            {getStockLabel(inv.stockStatus)}
          </span>
          {medicine.category && (
            <span className="medagent-badge category">{medicine.category}</span>
          )}
        </div>
      </div>

      {/* Details Grid */}
      {inv.matchedProduct && (
        <div className="medagent-card-details">
          <div className="medagent-card-detail">
            <span className="medagent-card-detail-label">Price</span>
            <span className="medagent-card-detail-value">
              {inv.pricePerUnit != null ? `₹${inv.pricePerUnit}` : '—'}
            </span>
          </div>
          <div className="medagent-card-detail">
            <span className="medagent-card-detail-label">Stock</span>
            <span className="medagent-card-detail-value">
              {inv.currentStock != null ? `${inv.currentStock} units` : '—'}
            </span>
          </div>
          <div className="medagent-card-detail">
            <span className="medagent-card-detail-label">Expiry</span>
            <span className="medagent-card-detail-value">{formatDate(inv.expiryDate)}</span>
          </div>
        </div>
      )}

      {/* Dosage */}
      {medicine.dosageGuideline && (
        <div className="medagent-card-dosage">
          💊 <strong>Dosage:</strong> {medicine.dosageGuideline}
        </div>
      )}

      {/* Precaution */}
      {medicine.precaution && (
        <div className="medagent-card-precaution">
          ⚠️ {medicine.precaution}
        </div>
      )}

      {/* Actions */}
      <div className="medagent-card-actions">
        {inv.available && (
          <button className="medagent-card-btn primary" onClick={handleAddToBill}>
            <ShoppingCart size={13} /> Add to Bill
          </button>
        )}
        {inv.productId && (
          <button className="medagent-card-btn secondary" onClick={handleViewDetails}>
            <Eye size={13} /> View Details
          </button>
        )}
        {(!inv.available || inv.stockStatus === 'Low Stock') && (
          <button
            className="medagent-card-btn secondary"
            onClick={() => onFindAlternative(medicine.genericName || matchedName, medicine.category)}
          >
            <RefreshCw size={13} /> Find Alternative
          </button>
        )}
      </div>
    </div>
  );
};

// Alternative medicine card (simpler)
export const AlternativeCard = ({ alt, onAddToBill }) => {
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="medagent-medicine-card">
      <div className="medagent-card-header">
        <div>
          <div className="medagent-card-name">{alt.name}</div>
          {alt.suitabilityNote && (
            <div className="medagent-suitability-note">{alt.suitabilityNote}</div>
          )}
        </div>
        <div className="medagent-card-badges">
          <span className={`medagent-badge ${alt.stockStatus === 'In Stock' ? 'in-stock' : 'low-stock'}`}>
            {alt.stockStatus === 'In Stock' ? '✅ In Stock' : '⚠️ Low Stock'}
          </span>
        </div>
      </div>
      <div className="medagent-card-details">
        <div className="medagent-card-detail">
          <span className="medagent-card-detail-label">Price</span>
          <span className="medagent-card-detail-value">₹{alt.price}</span>
        </div>
        <div className="medagent-card-detail">
          <span className="medagent-card-detail-label">Stock</span>
          <span className="medagent-card-detail-value">{alt.currentStock} units</span>
        </div>
        <div className="medagent-card-detail">
          <span className="medagent-card-detail-label">Expiry</span>
          <span className="medagent-card-detail-value">{formatDate(alt.expiryDate)}</span>
        </div>
      </div>
      <div className="medagent-card-actions">
        <button
          className="medagent-card-btn primary"
          onClick={() => {
            if (alt.productId) navigate(`/billing?prefill=${alt.productId}`);
          }}
        >
          <ShoppingCart size={13} /> Add to Bill
        </button>
        {alt.productId && (
          <button
            className="medagent-card-btn secondary"
            onClick={() => navigate(`/product/${alt.productId}`)}
          >
            <Eye size={13} /> View Details
          </button>
        )}
      </div>
    </div>
  );
};

export default MedicineCard;
