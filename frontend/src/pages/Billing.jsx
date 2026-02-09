import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, Phone, Package, Printer, Download, X, Check, ShoppingCart, Calculator, Clock, RotateCcw, Banknote, CreditCard, Smartphone } from 'lucide-react';
import customerService from '../services/customerService';
import saleService from '../services/saleService';
import productService from '../services/productService';

const Billing = () => {
  const [customerPhone, setCustomerPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentSaleId, setCurrentSaleId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const searchRef = useRef(null);
  const phoneInputRef = useRef(null);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const generateInvoice = async () => {
    if (!customer || cart.length === 0) return;
    
    try {
      const saleData = {
        customerId: customer._id,
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity
        })),
        paymentMethod
      };
      
      const sale = await saleService.createSale(saleData);
      setCurrentSaleId(sale._id);
      setInvoiceGenerated(true);
      setShowInvoiceModal(true);
      
      // Refresh products to get updated stock
      await fetchProducts();
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Failed to create sale. Please try again.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    phoneInputRef.current?.focus();
  }, []);

  const searchCustomer = async () => {
    if (customerPhone.length < 10) return;
    
    setIsSearching(true);
    try {
      const results = await customerService.searchCustomers(customerPhone);
      if (results && results.length > 0) {
        setCustomer(results[0]);
        setShowNewCustomer(false);
      } else {
        setCustomer(null);
        setShowNewCustomer(true);
      }
    } catch (error) {
      console.error('Error searching customer:', error);
      setCustomer(null);
      setShowNewCustomer(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePhoneKeyDown = (e) => {
    if (e.key === 'Enter') searchCustomer();
  };

  useEffect(() => {
    if (customerPhone.length === 10) {
      searchCustomer();
    } else if (customerPhone.length < 10) {
      setCustomer(null);
      setShowNewCustomer(false);
    }
  }, [customerPhone]);

  const createCustomer = async () => {
    if (newCustomerName.trim()) {
      try {
        const newCustomer = await customerService.createCustomer({
          name: newCustomerName,
          mobile: customerPhone,
        });
        setCustomer(newCustomer);
        setShowNewCustomer(false);
        setNewCustomerName('');
      } catch (error) {
        console.error('Error creating customer:', error);
      }
    }
  };

  const filteredProducts = productSearch.length > 0 
    ? products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
      )
    : [];

  const addToCart = (product) => {
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      setCart(cart.map(item =>
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setProductSearch('');
    setShowSuggestions(false);
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item._id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const gst = ((subtotal - discountAmount) * 18) / 100;
  const total = subtotal - discountAmount + gst;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);



  const clearAll = () => {
    setCustomer(null);
    setCustomerPhone('');
    setCart([]);
    setDiscount(0);
    setShowNewCustomer(false);
    setInvoiceGenerated(false);
    setShowInvoiceModal(false);
    setCurrentSaleId(null);
    phoneInputRef.current?.focus();
  };

  const handlePrintInvoice = () => {
    if (!currentSaleId) return;
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!currentSaleId) return;
    
    try {
      const blob = await saleService.generateInvoice(currentSaleId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${currentSaleId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="h-[calc(100vh-70px)] w-full bg-gray-50 p-4 overflow-hidden">
      <div className="h-full max-w-7xl mx-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Point of Sale</h1>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <Clock size={12} />
              <span>{currentDate} • {currentTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-white border border-[var(--border-soft)] text-[var(--accent)] rounded-md text-xs font-mono">
              INV-{Date.now().toString().slice(-6)}
            </span>
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 rounded-md transition-all text-xs cursor-pointer"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-5 gap-3 min-h-0">
          {/* Left - Customer & Products */}
          <div className="col-span-3 flex flex-col gap-3 min-h-0">
            {/* Customer Section */}
            <div className="bg-white rounded-lg border border-[var(--border-soft)] p-3 flex-shrink-0">
              {!customer ? (
                <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-2">
                      <div className="relative flex-1">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                        <input
                          ref={phoneInputRef}
                          type="tel"
                          placeholder="Enter 10-digit phone"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          onKeyDown={handlePhoneKeyDown}
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-[var(--border-soft)] rounded-md focus:outline-none focus:border-[var(--accent)] focus:bg-white transition-all text-sm"
                          maxLength={10}
                        />
                        {isSearching && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>

                  {showNewCustomer && (
                    <div className="flex items-center gap-2 pl-3 border-l border-amber-200">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                      <input
                        type="text"
                        placeholder="Customer name"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && createCustomer()}
                        className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-md focus:outline-none focus:border-amber-400 text-sm w-36"
                        autoFocus
                      />
                      <button
                        onClick={createCustomer}
                        className="p-2 bg-[var(--accent)] text-white rounded-md hover:opacity-90 cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)] text-sm">{customer.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">+91 {customer.mobile}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs font-medium">Active</span>
                  </div>
                  <button
                    onClick={() => { setCustomer(null); setCustomerPhone(''); }}
                    className="p-1.5 hover:bg-red-50 rounded-md text-red-500 transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Product Search */}
            <div className="bg-white rounded-lg border border-[var(--border-soft)] p-3 flex-shrink-0" ref={searchRef}>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => productSearch.length > 0 && setShowSuggestions(true)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-[var(--border-soft)] rounded-md focus:outline-none focus:border-[var(--accent)] focus:bg-white transition-all text-sm"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && filteredProducts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--border-soft)] rounded-lg shadow-lg z-10 max-h-52 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => addToCart(product)}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[var(--accent-light)] transition-all text-left border-b border-[var(--border-soft)] last:border-b-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <Package size={14} className="text-[var(--accent)]" />
                          </div>
                          <div>
                            <p className="font-medium text-[var(--text-primary)] text-sm">{product.name}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{product.sku} • {product.quantity} in stock</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[var(--accent)] text-sm">₹{product.price.toLocaleString()}</p>
                          <p className="text-xs text-green-600">+ Add</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 bg-white rounded-lg border border-[var(--border-soft)] overflow-hidden flex flex-col min-h-0">
              <div className="px-3 py-2 border-b border-[var(--border-soft)] bg-gray-50 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={14} className="text-[var(--accent)]" />
                  <span className="font-semibold text-[var(--text-primary)] text-sm">Cart</span>
                  {cart.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-[var(--accent)] text-white text-xs rounded font-medium">
                      {totalItems}
                    </span>
                  )}
                </div>
                {cart.length > 0 && (
                  <button 
                    onClick={() => setCart([])}
                    className="text-xs text-red-500 hover:text-red-600 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Package size={20} className="text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">No items</p>
                      <p className="text-xs">Search products above</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border-soft)]">
                    {cart.map((item, index) => (
                      <div key={item._id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-all">
                        <span className="text-xs text-[var(--text-secondary)] w-4">{index + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--text-primary)] text-sm truncate">{item.name}</p>
                          <p className="text-xs text-[var(--text-secondary)]">₹{item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-0.5 bg-gray-100 rounded p-0.5">
                          <button
                            onClick={() => updateQuantity(item._id, -1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-all cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, 1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-all cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="w-20 text-right font-bold text-[var(--accent)] text-sm">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right - Invoice Summary */}
          <div className="col-span-2 bg-white rounded-lg border border-[var(--border-soft)] flex flex-col min-h-0">
            <div className="px-4 py-2.5 border-b border-[var(--border-soft)] bg-gray-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Calculator size={14} className="text-[var(--accent)]" />
                <span className="font-semibold text-[var(--text-primary)] text-sm">Bill Summary</span>
              </div>
            </div>

            <div className="flex-1 p-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Discount</span>
                  <div className="flex items-center gap-1 bg-gray-50 rounded px-2 py-0.5">
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-10 px-1 py-0.5 bg-transparent text-right text-sm focus:outline-none font-medium"
                    />
                    <span className="text-xs text-[var(--text-secondary)]">%</span>
                  </div>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>You save</span>
                    <span className="font-medium">-₹{Math.round(discountAmount).toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">GST @18%</span>
                  <span className="font-medium">₹{Math.round(gst).toLocaleString()}</span>
                </div>
                
                <div className="border-t border-dashed border-[var(--border-soft)] pt-3 flex justify-between items-center">
                  <span className="font-bold text-[var(--text-primary)]">Grand Total</span>
                  <span className="text-2xl font-bold text-[var(--accent)]">₹{Math.round(total).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {/* Payment Method */}
                <div>
                  <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Payment</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Cash', label: 'Cash', icon: Banknote },
                      { id: 'Card', label: 'Card', icon: CreditCard },
                      { id: 'UPI', label: 'UPI', icon: Smartphone },
                    ].map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`py-2 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            paymentMethod === method.id
                              ? 'bg-[var(--accent)] text-white'
                              : 'bg-gray-50 text-[var(--text-secondary)] border border-[var(--border-soft)] hover:border-[var(--accent)]'
                          }`}
                        >
                          <Icon size={14} />
                          {method.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={generateInvoice}
                  disabled={!customer || cart.length === 0}
                  className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    customer && cart.length > 0
                      ? invoiceGenerated 
                        ? 'bg-green-500 text-white'
                        : 'bg-[var(--accent)] text-white hover:opacity-90'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Check size={16} />
                  {invoiceGenerated ? 'Invoice Generated!' : 'Complete Sale'}
                </button>

                {showInvoiceModal && (
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handlePrintInvoice}
                      className="py-2 bg-gray-50 border border-[var(--border-soft)] rounded-md text-[var(--text-secondary)] text-xs font-medium flex items-center justify-center gap-1.5 hover:border-[var(--accent)] transition-all cursor-pointer"
                    >
                      <Printer size={12} />
                      Print
                    </button>
                    <button 
                      onClick={handleDownloadPDF}
                      className="py-2 bg-gray-50 border border-[var(--border-soft)] rounded-md text-[var(--text-secondary)] text-xs font-medium flex items-center justify-center gap-1.5 hover:border-[var(--accent)] transition-all cursor-pointer"
                    >
                      <Download size={12} />
                      PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
