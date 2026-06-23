import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, AlertCircle } from 'lucide-react';
import purchaseOrderService from '../../services/purchaseOrderService';
import supplierService from '../../services/supplierService';

const PurchaseOrderForm = ({ onClose }) => {
  const [supplierName, setSupplierName] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState('');
  const [items, setItems] = useState([
    { productName: '', sku: '', quantity: 1, price: 0 }
  ]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await supplierService.getSuppliers();
        setSuppliers(data);
        if (data.length > 0) {
          setSupplierName(data[0].name);
          setSupplierEmail(data[0].email);
          setSupplierPhone(data[0].phone);
          setDeliveryAddress(data[0].address);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSuppliers();
  }, []);

  const handleSupplierChange = (name) => {
    setSupplierName(name);
    const selected = suppliers.find(s => s.name === name);
    if (selected) {
      setSupplierEmail(selected.email);
      setSupplierPhone(selected.phone);
      setDeliveryAddress(selected.address);
    }
  };

  const handleItemChange = (index, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      if (field === 'quantity' || field === 'price') {
        updated[index][field] = Number(value);
      } else {
        updated[index][field] = value;
      }
      return updated;
    });
  };

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { productName: '', sku: '', quantity: 1, price: 0 }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const invalid = items.some(it => !it.productName.trim() || !it.sku.trim());
    if (invalid) {
      setError("Please fill out all product names and SKUs");
      return;
    }

    try {
      await purchaseOrderService.createPurchaseOrder({
        supplierName,
        supplierEmail,
        supplierPhone,
        deliveryAddress,
        items
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create order");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-600 text-xs">
          <AlertCircle size={16} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Supplier Name</label>
          <select 
            value={supplierName}
            onChange={(e) => handleSupplierChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600 bg-white cursor-pointer text-sm"
          >
            <option value="" disabled>Select A Supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Supplier Email</label>
          <input 
            type="email" 
            placeholder="Contact Email"
            value={supplierEmail}
            readOnly
            className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-xl focus:outline-none cursor-not-allowed text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Supplier Phone</label>
          <input 
            type="tel" 
            placeholder="Phone Number"
            value={supplierPhone}
            readOnly
            className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-xl focus:outline-none cursor-not-allowed text-sm"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Products List</label>
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 mb-1 px-1">
              <div className="col-span-4 text-[10px] font-bold text-gray-500 uppercase">Product Name</div>
              <div className="col-span-3 text-[10px] font-bold text-gray-500 uppercase">Sku</div>
              <div className="col-span-2 text-[10px] font-bold text-gray-500 uppercase">Price ($)</div>
              <div className="col-span-2 text-[10px] font-bold text-gray-500 uppercase">Qty</div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <input 
                      type="text" 
                      placeholder="Name" 
                      value={item.productName}
                      onChange={(e) => handleItemChange(idx, "productName", e.target.value)}
                      required
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-green-500" 
                    />
                  </div>
                  <div className="col-span-3">
                    <input 
                      type="text" 
                      placeholder="Sku" 
                      value={item.sku}
                      onChange={(e) => handleItemChange(idx, "sku", e.target.value)}
                      required
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-green-500" 
                    />
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="number" 
                      placeholder="Price" 
                      value={item.price}
                      onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                      min="0"
                      step="0.01"
                      required
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-green-500" 
                    />
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="number" 
                      placeholder="Qty" 
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      min="1"
                      required
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-green-500" 
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {items.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-700 cursor-pointer p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button 
              type="button"
              onClick={handleAddItem}
              className="text-xs text-green-600 hover:text-green-700 font-semibold flex items-center gap-1 cursor-pointer mt-1"
            >
              <Plus size={14} />
              Add Product Row
            </button>
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Delivery Address</label>
          <textarea 
            rows={2} 
            placeholder="Delivery Address" 
            value={deliveryAddress}
            readOnly
            className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-xl focus:outline-none cursor-not-allowed text-sm resize-none" 
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <button 
          type="submit"
          className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm shadow-md shadow-green-500/10"
        >
          <FileText size={16} />
          Create Order
        </button>
        <button 
          type="button"
          onClick={onClose} 
          className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all cursor-pointer text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PurchaseOrderForm;
