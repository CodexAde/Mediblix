import { useState, useEffect } from "react";
import { X, Save, AlertCircle, Plus, Trash2 } from "lucide-react";
import purchaseOrderService from "../../services/purchaseOrderService";
import supplierService from "../../services/supplierService";

const AddPurchaseOrderDrawer = ({ isOpen, onClose, onOrderCreated }) => {
  const [formData, setFormData] = useState({
    supplierName: "",
    supplierEmail: "",
    supplierPhone: "",
    deliveryAddress: "",
  });
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([
    { productName: "", sku: "", quantity: 1, price: 0 }
  ]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await supplierService.getSuppliers();
        setSuppliers(data);
        if (data.length > 0) {
          setFormData({
            supplierName: data[0].name,
            supplierEmail: data[0].email,
            supplierPhone: data[0].phone,
            deliveryAddress: data[0].address,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      fetchSuppliers();
      setItems([{ productName: "", sku: "", quantity: 1, price: 0 }]);
      setExpectedDeliveryDate("");
      setError("");
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 700);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSupplierChange = (e) => {
    const name = e.target.value;
    const selected = suppliers.find((s) => s.name === name);
    if (selected) {
      setFormData({
        supplierName: selected.name,
        supplierEmail: selected.email,
        supplierPhone: selected.phone,
        deliveryAddress: selected.address,
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      if (field === "quantity" || field === "price") {
        updated[index][field] = Number(value);
      } else {
        updated[index][field] = value;
      }
      return updated;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { productName: "", sku: "", quantity: 1, price: 0 }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const invalidItem = items.some(it => !it.productName.trim() || !it.sku.trim());
    if (invalidItem) {
      setError("Please fill out all product names and Skus");
      return;
    }

    try {
      await purchaseOrderService.createPurchaseOrder({
        supplierName: formData.supplierName,
        supplierEmail: formData.supplierEmail,
        supplierPhone: formData.supplierPhone,
        deliveryAddress: formData.deliveryAddress,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        items: items
      });
      onOrderCreated();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to create purchase order"
      );
    }
  };

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-700 ${isVisible && isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-700 ${isVisible && isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div 
        className={`relative w-full max-w-xl h-full bg-white shadow-2xl transform transition-transform duration-700 ease-custom p-6 flex flex-col ${isVisible && isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Create Purchase Order
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6 pr-1">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Company Name
              </label>
              <select
                name="supplierName"
                value={formData.supplierName}
                onChange={handleSupplierChange}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all cursor-pointer text-sm"
              >
                <option value="" disabled>Select A Supplier</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="supplierEmail"
                  value={formData.supplierEmail}
                  readOnly
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 focus:outline-none cursor-not-allowed text-sm"
                  placeholder="Contact Email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="supplierPhone"
                  value={formData.supplierPhone}
                  readOnly
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 focus:outline-none cursor-not-allowed text-sm"
                  placeholder="Phone Number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address
              </label>
              <textarea
                name="deliveryAddress"
                value={formData.deliveryAddress}
                readOnly
                rows={2}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 focus:outline-none cursor-not-allowed text-sm resize-none"
                placeholder="Delivery Address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Date
                </label>
                <input
                  type="text"
                  value={new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  disabled
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-green-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Order Items</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800 transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  Add Product
                </button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 mb-1 px-1">
                  <div className="col-span-4 text-[10px] font-bold text-gray-500 uppercase">Product Name</div>
                  <div className="col-span-3 text-[10px] font-bold text-gray-500 uppercase">Sku</div>
                  <div className="col-span-2 text-[10px] font-bold text-gray-500 uppercase">Price (₹)</div>
                  <div className="col-span-2 text-[10px] font-bold text-gray-500 uppercase">Qty</div>
                  <div className="col-span-1"></div>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
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
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 mt-auto">
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Save size={20} className="group-hover:scale-110 transition-transform" />
              Create Purchase Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPurchaseOrderDrawer;
