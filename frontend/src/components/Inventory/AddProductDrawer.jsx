import { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import productService from "../../services/productService";

const AddProductDrawer = ({ isOpen, onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: "",
    price: "",
    status: "In Stock",
    expiryDate: "",
    packaging: "10 Tablets / Strip",
    tabletsPerStrip: 10,
  });
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      setFormData({
        name: "",
        sku: "",
        category: "",
        quantity: "",
        price: "",
        status: "In Stock",
        expiryDate: "",
        packaging: "10 Tablets / Strip",
        tabletsPerStrip: 10,
      });
      setError("");
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: (name === "quantity" || name === "price" || name === "tabletsPerStrip") && value !== "" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await productService.createProduct(formData);
      onProductAdded();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to add product"
      );
    }
  };

  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 700);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-700 ${isVisible && isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-700 ${isVisible && isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div 
        className={`relative w-full max-w-md h-full bg-white shadow-2xl transform transition-transform duration-700 ease-custom p-6 flex flex-col ${isVisible && isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Add New Product
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-400"
                placeholder="e.g. Paracetamol 650mg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sku
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-400"
                placeholder="e.g. PHR-CAL650"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-400"
                placeholder="e.g. Analgesics"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (Strips)
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Packaging
                </label>
                <input
                  type="text"
                  name="packaging"
                  value={formData.packaging}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-400"
                  placeholder="e.g. 10 Tablets / Strip"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tablets Per Strip
                </label>
                <input
                  type="number"
                  name="tabletsPerStrip"
                  value={formData.tabletsPerStrip}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all appearance-none cursor-pointer"
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 mt-auto">
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Save size={20} className="group-hover:scale-110 transition-transform" />
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default AddProductDrawer;
