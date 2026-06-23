import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, Phone, Package, Printer, Download, X, Check, ShoppingCart, Calculator, Clock, RotateCcw, Banknote, CreditCard, Smartphone, Eye, Save, FileText, AlertTriangle, CheckCircle2, Sparkles, Upload, Minimize2, Maximize2 } from 'lucide-react';
import customerService from '../services/customerService';
import saleService from '../services/saleService';
import productService from '../services/productService';
import aiService from '../services/aiService';

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

  const [customerBills, setCustomerBills] = useState([]);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isLastBillView, setIsLastBillView] = useState(false);
  const [loadingBills, setLoadingBills] = useState(false);
  const [billSearch, setBillSearch] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [activeInvoiceNumber, setActiveInvoiceNumber] = useState('');
  const [toast, setToast] = useState(null);

  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isScanMinimized, setIsScanMinimized] = useState(false);
  const [scanAnalyzing, setScanAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanDragActive, setScanDragActive] = useState(false);
  const [scanFileName, setScanFileName] = useState('');
  const [cartDragActive, setCartDragActive] = useState(false);
  const scanInputRef = useRef(null);

  useEffect(() => {
    if (!scanAnalyzing) return;
    const interval = setInterval(() => {
      setScanStep((prev) => {
        if (prev < 4) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [scanAnalyzing]);

  const handleScanBill = async (fileToScan) => {
    if (!fileToScan) return;
    setScanFileName(fileToScan.name);
    setIsScanModalOpen(false);
    setScanAnalyzing(true);
    setScanStep(0);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result.split(',')[1];
        const mimeType = fileToScan.type;
        const result = await aiService.parseBill(base64Data, mimeType);

        if (result && typeof result === 'object') {
          if (result.customerMobile) {
            const formattedMobile = result.customerMobile.replace(/\D/g, '').slice(0, 10);
            if (formattedMobile.length === 10) {
              setCustomerPhone(formattedMobile);
              setIsSearching(true);
              try {
                const results = await customerService.searchCustomers(formattedMobile);
                if (results && results.length > 0) {
                  setCustomer(results[0]);
                  setShowNewCustomer(false);
                } else {
                  setCustomer(null);
                  setShowNewCustomer(true);
                  setNewCustomerName(result.customerName || '');
                }
              } catch (err) {
                console.error(err);
              } finally {
                setIsSearching(false);
              }
            }
          }

          if (Array.isArray(result.items)) {
            let matchedCount = 0;
            let unmatchedCount = 0;
            const newCartItems = [];

            result.items.forEach((item) => {
              const matched = products.find((p) =>
                (item.sku && p.sku.toLowerCase() === item.sku.toLowerCase()) ||
                (item.name && p.name.toLowerCase() === item.name.toLowerCase()) ||
                (item.name && p.name.toLowerCase().includes(item.name.toLowerCase())) ||
                (item.name && item.name.toLowerCase().includes(p.name.toLowerCase()))
              );

              if (matched) {
                newCartItems.push({
                  ...matched,
                  quantity: Number(item.quantity) || 1
                });
                matchedCount++;
              } else {
                unmatchedCount++;
              }
            });

            if (newCartItems.length > 0) {
              setCart((prev) => {
                const updated = [...prev];
                newCartItems.forEach((newItem) => {
                  const existingIndex = updated.findIndex((c) => c._id === newItem._id);
                  if (existingIndex !== -1) {
                    updated[existingIndex].quantity += newItem.quantity;
                  } else {
                    updated.push(newItem);
                  }
                });
                return updated;
              });
            }

            if (matchedCount > 0 && unmatchedCount > 0) {
              showToast(`Matched ${matchedCount} items. ${unmatchedCount} items not found in inventory.`, 'info');
            } else if (matchedCount > 0) {
              showToast(`Successfully added ${matchedCount} items to cart.`, 'success');
            } else if (unmatchedCount > 0) {
              showToast(`Could not match any items in inventory.`, 'error');
            }
          }

        } else {
          showToast('Failed to parse bill structure.', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Failed to analyze bill document.', 'error');
      } finally {
        setScanAnalyzing(false);
      }
    };
    reader.readAsDataURL(fileToScan);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const saveCurrentAsDraft = () => {
    if (cart.length === 0 && !customer) {
      showToast("Cannot save empty draft.", "error");
      return;
    }
    const draft = {
      id: activeInvoiceNumber,
      invoiceNumber: activeInvoiceNumber,
      customer,
      cart,
      discount,
      paymentMethod,
      createdAt: new Date().toISOString()
    };
    const updatedDrafts = drafts.filter(d => d.id !== activeInvoiceNumber);
    updatedDrafts.unshift(draft);
    setDrafts(updatedDrafts);
    localStorage.setItem('spren_drafts', JSON.stringify(updatedDrafts));
    showToast("Draft saved successfully!", "success");
    clearAll();
  };

  const loadDraft = (draft) => {
    setCustomer(draft.customer);
    if (draft.customer) {
      setCustomerPhone(draft.customer.mobile);
    } else {
      setCustomerPhone('');
    }
    setCart(draft.cart);
    setDiscount(draft.discount || 0);
    setPaymentMethod(draft.paymentMethod || 'Cash');
    setActiveInvoiceNumber(draft.invoiceNumber);
    setShowDraftsModal(false);
  };

  const deleteDraft = (draftId) => {
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    setDrafts(updatedDrafts);
    localStorage.setItem('spren_drafts', JSON.stringify(updatedDrafts));
  };

  const fetchCustomerBills = async (customerId) => {
    try {
      setLoadingBills(true);
      const data = await saleService.getSales({ customer: customerId });
      setCustomerBills(data);
      return data;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      setLoadingBills(false);
    }
  };

  const handleOpenLastBill = async () => {
    if (!customer) return;
    const bills = await fetchCustomerBills(customer._id);
    if (bills && bills.length > 0) {
      setSelectedBill(bills[0]);
      setIsLastBillView(true);
      setShowBillingModal(true);
    } else {
      showToast("No bills found for this customer.", "info");
    }
  };

  const handleOpenBillHistory = async () => {
    if (!customer) return;
    await fetchCustomerBills(customer._id);
    setSelectedBill(null);
    setIsLastBillView(false);
    setShowBillingModal(true);
  };

  const handlePrintPastInvoice = async (saleId) => {
    try {
      const blob = await saleService.generateInvoice(saleId);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error(error);
      showToast('Failed to print invoice.', "error");
    }
  };

  const handleDownloadPastInvoice = async (saleId, invoiceNumber) => {
    try {
      const blob = await saleService.generateInvoice(saleId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      showToast('Failed to download invoice.', "error");
    }
  };
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
    setActiveInvoiceNumber(`Inv-${Date.now().toString().slice(-6)}`);
    const savedDrafts = localStorage.getItem('spren_drafts');
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    }
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
        paymentMethod,
        invoiceNumber: activeInvoiceNumber
      };
      
      const sale = await saleService.createSale(saleData);
      deleteDraft(activeInvoiceNumber);
      setCurrentSaleId(sale._id);
      setInvoiceGenerated(true);
      setShowInvoiceModal(true);
      
      // Refresh products to get updated stock
      await fetchProducts();
    } catch (error) {
      console.error('Error creating sale:', error);
      showToast('Failed to create sale. Please try again.', "error");
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

  const filteredBills = billSearch.length > 0
    ? customerBills.filter(bill =>
        bill.invoiceNumber.toLowerCase().includes(billSearch.toLowerCase()) ||
        (bill.paymentMethod && bill.paymentMethod.toLowerCase().includes(billSearch.toLowerCase()))
      )
    : customerBills;
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



  function clearAll() {
    setCustomer(null);
    setCustomerPhone('');
    setCart([]);
    setDiscount(0);
    setShowNewCustomer(false);
    setInvoiceGenerated(false);
    setShowInvoiceModal(false);
    setCurrentSaleId(null);
    setActiveInvoiceNumber(`Inv-${Date.now().toString().slice(-6)}`);
    phoneInputRef.current?.focus();
  }

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
      showToast('Failed to download invoice. Please try again.', "error");
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
            <button
              onClick={() => setShowDraftsModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-all text-xs cursor-pointer font-semibold font-sans"
            >
              <FileText size={12} />
              Drafts
              {drafts.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-blue-600 text-white rounded text-[10px] font-sans">
                  {drafts.length}
                </span>
              )}
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 rounded-md transition-all text-xs cursor-pointer font-sans"
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
                    <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold font-sans">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)] text-sm">{customer.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">+91 {customer.mobile}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs font-medium">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenLastBill}
                      className="px-3 py-1.5 bg-[var(--accent-light)] hover:bg-green-200 text-[var(--accent)] rounded-lg text-xs font-semibold transition-all cursor-pointer font-sans"
                    >
                      Last Bill
                    </button>
                    <button
                      onClick={handleOpenBillHistory}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition-all cursor-pointer font-sans"
                    >
                      Bill History
                    </button>
                    <button
                      onClick={() => { setCustomer(null); setCustomerPhone(''); }}
                      className="p-1.5 hover:bg-red-50 rounded-md text-red-500 transition-all cursor-pointer ml-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
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
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsScanModalOpen(true)}
                    className="flex items-center gap-1.5 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 hover:border-purple-200 hover:bg-purple-100 rounded text-[10px] font-semibold transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    <Sparkles size={10} className="text-purple-600 animate-pulse" />
                    Ai Scan
                  </button>
                  {cart.length > 0 && (
                    <button 
                      onClick={() => setCart([])}
                      className="text-xs text-red-500 hover:text-red-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                  scanAnalyzing ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <div className="relative">
                        <div className="w-14 h-14 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                        <Sparkles size={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">Analyzing Bill...</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          {[
                            "Reading bill image...",
                            "Sending to Gemini Ai...",
                            "Extracting client details...",
                            "Identifying items...",
                            "Processing cart..."
                          ][scanStep]}
                        </p>
                      </div>
                      <div className="w-40 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 transition-all duration-1000"
                          style={{ width: `${((scanStep + 1) / 5) * 100}%` }}
                        />
                      </div>
                      {scanFileName && (
                        <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{scanFileName}</p>
                      )}
                    </div>
                  ) : (
                  <div 
                    onDragEnter={(e) => { e.preventDefault(); setCartDragActive(true); }}
                    onDragOver={(e) => { e.preventDefault(); setCartDragActive(true); }}
                    onDragLeave={() => setCartDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setCartDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleScanBill(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`h-full flex flex-col items-center justify-center text-center p-6 transition-all duration-300 ${
                      cartDragActive 
                        ? 'bg-green-50/50 border-2 border-dashed border-[var(--accent)] m-2 rounded-xl' 
                        : ''
                    }`}
                  >
                    <div className="max-w-xs space-y-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-[var(--accent)]">
                        <Upload size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">No Items In Cart</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          Search products above or drag & drop a bill photo here to auto-fill
                        </p>
                      </div>
                      <div className="pt-2">
                        <label className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[var(--border-soft)] hover:border-purple-300 hover:text-purple-600 text-[var(--text-secondary)] rounded-lg text-xs font-semibold cursor-pointer transition-all">
                          <Sparkles size={12} className="text-purple-600 animate-pulse" />
                          Scan Bill
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleScanBill(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  )

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
            <div className="px-4 py-2.5 border-b border-[var(--border-soft)] bg-gray-50 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Calculator size={14} className="text-[var(--accent)]" />
                <span className="font-semibold text-[var(--text-primary)] text-sm">Bill Summary</span>
              </div>
              <span className="px-2.5 py-1 bg-white border border-[var(--border-soft)] text-[var(--accent)] rounded-lg text-xs font-mono font-semibold">
                {activeInvoiceNumber}
              </span>
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
                <div className="flex gap-2">
                  {!invoiceGenerated && (
                    <button
                      onClick={saveCurrentAsDraft}
                      disabled={cart.length === 0 && !customer}
                      className={`flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border font-sans ${
                        cart.length > 0 || customer
                          ? 'bg-white border-[var(--border-soft)] hover:border-[var(--accent)] text-[var(--text-primary)] hover:bg-gray-50 shadow-sm'
                          : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Save size={16} />
                      Save Draft
                    </button>
                  )}
                  <button
                    onClick={generateInvoice}
                    disabled={!customer || cart.length === 0}
                    className={`py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer font-sans ${
                      !invoiceGenerated ? 'flex-1' : 'w-full'
                    } ${
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
                </div>

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

      {showBillingModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl border border-[var(--border-soft)] shadow-strong overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[var(--border-soft)] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {selectedBill ? "Invoice Details" : "Bill History"}
              </h2>
              <button
                onClick={() => setShowBillingModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {loadingBills ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : selectedBill ? (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col min-h-0">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-xl text-[var(--accent)]">Spren</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Invoice Number: {selectedBill.invoiceNumber}</p>
                    <p className="text-xs text-[var(--text-secondary)]">Date: {new Date(selectedBill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-semibold">Paid</span>
                    <p className="text-xs text-[var(--text-secondary)] mt-2">Payment: {selectedBill.paymentMethod}</p>
                  </div>
                </div>

                <div className="border border-[var(--border-soft)] rounded-xl overflow-hidden mb-6 flex-shrink-0 animate-fade-in">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-[var(--text-secondary)] text-xs font-semibold border-b border-[var(--border-soft)]">
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-center">Quantity</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-soft)] text-sm">
                      {selectedBill.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                            {item.product?.name || "Deleted Product"}
                          </td>
                          <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                            ₹{item.price.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center font-medium">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-[var(--text-primary)]">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="w-full max-w-xs ml-auto space-y-2 border-t border-[var(--border-soft)] pt-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Subtotal</span>
                    <span className="font-semibold">₹{selectedBill.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[var(--text-primary)] border-t border-dashed border-[var(--border-soft)] pt-2">
                    <span>Grand Total</span>
                    <span className="text-lg text-[var(--accent)]">₹{selectedBill.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[var(--border-soft)]">
                  {!isLastBillView && (
                    <button
                      onClick={() => setSelectedBill(null)}
                      className="px-4 py-2 bg-gray-50 border border-[var(--border-soft)] hover:border-gray-400 text-gray-700 text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={() => handlePrintPastInvoice(selectedBill._id)}
                    className="px-4 py-2 bg-gray-50 border border-[var(--border-soft)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--accent)] text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ml-auto font-sans"
                  >
                    <Printer size={14} />
                    Print
                  </button>
                  <button
                    onClick={() => handleDownloadPastInvoice(selectedBill._id, selectedBill.invoiceNumber)}
                    className="px-4 py-2 bg-[var(--accent)] hover:opacity-90 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-sans"
                  >
                    <Download size={14} />
                    Download PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col min-h-0">
                <div className="relative mb-4">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by invoice number..."
                    value={billSearch}
                    onChange={(e) => setBillSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-[var(--accent)] text-sm"
                  />
                </div>

                {filteredBills.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-[var(--text-secondary)]">
                    <Package size={36} className="text-gray-300 mb-2" />
                    <p className="text-sm font-medium">No past bills found for this customer.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto border border-[var(--border-soft)] rounded-xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-[var(--text-secondary)] text-xs font-semibold border-b border-[var(--border-soft)] sticky top-0 z-10">
                          <th className="px-4 py-3">Invoice</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Items</th>
                          <th className="px-4 py-3">Payment</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                          <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-soft)] text-sm">
                        {filteredBills.map((bill) => (
                          <tr key={bill._id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-4 font-semibold text-[var(--text-primary)]">
                              {bill.invoiceNumber}
                            </td>
                            <td className="px-4 py-4 text-[var(--text-secondary)]">
                              {new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-4 py-4 text-[var(--text-secondary)] max-w-xs truncate">
                              {bill.items.map(item => item.product?.name || "Deleted Product").join(', ')}
                            </td>
                            <td className="px-4 py-4">
                              <span className="px-2 py-0.5 bg-gray-100 text-[var(--text-secondary)] rounded text-xs font-medium">
                                {bill.paymentMethod}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right font-bold text-[var(--accent)]">
                              ₹{bill.totalAmount.toLocaleString()}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <button
                                onClick={() => setSelectedBill(bill)}
                                className="p-1.5 bg-gray-50 border border-[var(--border-soft)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--accent)] rounded-lg transition-all cursor-pointer"
                              >
                                <Eye size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-end mt-6 pt-4 border-t border-[var(--border-soft)]">
                  <button
                    onClick={() => setShowBillingModal(false)}
                    className="px-4 py-2 bg-gray-50 border border-[var(--border-soft)] hover:border-gray-400 text-gray-700 text-sm font-semibold rounded-lg transition-all cursor-pointer font-sans"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showDraftsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl border border-[var(--border-soft)] shadow-strong overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[var(--border-soft)] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Saved Drafts
              </h2>
              <button
                onClick={() => setShowDraftsModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col min-h-0">
              {drafts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-[var(--text-secondary)]">
                  <Package size={36} className="text-gray-300 mb-2" />
                  <p className="text-sm font-medium">No saved drafts found.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto border border-[var(--border-soft)] rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-[var(--text-secondary)] text-xs font-semibold border-b border-[var(--border-soft)] sticky top-0 z-10">
                        <th className="px-4 py-3">Invoice</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Items</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-soft)] text-sm">
                      {drafts.map((draft) => (
                        <tr key={draft.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-4 font-semibold text-[var(--text-primary)]">
                            {draft.invoiceNumber}
                          </td>
                          <td className="px-4 py-4 text-[var(--text-secondary)]">
                            {draft.customer ? (
                              <div>
                                <p className="font-semibold text-[var(--text-primary)] text-sm font-sans">{draft.customer.name}</p>
                                <p className="text-xs font-sans">+91 {draft.customer.mobile}</p>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 font-sans">Walk-in Customer</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-[var(--text-secondary)] max-w-xs truncate font-sans">
                            {draft.cart.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                          </td>
                          <td className="px-4 py-4 text-[var(--text-secondary)] font-sans">
                            {new Date(draft.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => loadDraft(draft)}
                                className="px-3 py-1.5 bg-[var(--accent-light)] hover:bg-green-200 text-[var(--accent)] rounded-lg text-xs font-semibold transition-all cursor-pointer font-sans"
                              >
                                Resume
                              </button>
                              <button
                                onClick={() => deleteDraft(draft.id)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-end mt-6 pt-4 border-t border-[var(--border-soft)]">
                <button
                  onClick={() => setShowDraftsModal(false)}
                  className="px-4 py-2 bg-gray-50 border border-[var(--border-soft)] hover:border-gray-400 text-gray-700 text-sm font-semibold rounded-lg transition-all cursor-pointer font-sans"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isScanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsScanModalOpen(false)}
          />
          <div className="relative bg-white border border-gray-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl transform transition-all animate-toast">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Scan Bill</h2>
                <p className="text-sm text-gray-500 mt-0.5">Parse bill photo using artificial intelligence to auto-fill sale details</p>
              </div>
              <button
                onClick={() => setIsScanModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {scanAnalyzing && !isScanMinimized ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="absolute top-4 right-4 z-20">
                  <button
                    onClick={() => setIsScanMinimized(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-[var(--accent)] transition-all cursor-pointer"
                  >
                    <Minimize2 size={14} />
                    Minimize
                  </button>
                </div>
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-green-100 border-t-[var(--accent)] rounded-full animate-spin" />
                  <Sparkles size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--accent)]" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Analyzing Bill Document...
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {[
                      "Reading Bill Image...",
                      "Sending Data To Gemini...",
                      "Extracting Client Details...",
                      "Identifying Items In Bill...",
                      "Processing Billing Cart..."
                    ][scanStep]}
                  </p>
                </div>
                <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] transition-all duration-1000"
                    style={{ width: `${((scanStep + 1) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div
                onDragEnter={(e) => { e.preventDefault(); setScanDragActive(true); }}
                onDragOver={(e) => { e.preventDefault(); setScanDragActive(true); }}
                onDragLeave={() => setScanDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setScanDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleScanBill(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  scanDragActive
                    ? 'border-[var(--accent)] bg-green-50/50 shadow-inner'
                    : 'border-2 border-dashed border-[var(--border-soft)] bg-[var(--bg-card)] hover:border-[var(--accent)]'
                }`}
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-green-100 text-[var(--accent)] rounded-xl flex items-center justify-center mx-auto">
                    <Upload size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Drag & Drop Bill Here</p>
                    <p className="text-xs text-gray-500">Supports Jpeg, Png, or Pdf</p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-[var(--accent)] text-gray-700 hover:text-[var(--accent)] rounded-lg transition-all text-xs font-semibold cursor-pointer">
                      <Upload size={13} />
                      Add Document
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleScanBill(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <label className="inline-flex items-center justify-center px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-all text-xs font-semibold cursor-pointer">
                      Select File
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleScanBill(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {scanAnalyzing && isScanMinimized && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-green-200 rounded-2xl p-4 shadow-xl flex items-center gap-4 animate-toast max-w-sm">
          <div className="w-8 h-8 border-2 border-green-100 border-t-[var(--accent)] rounded-full animate-spin flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900 truncate">Scanning Bill</h4>
            <p className="text-xs text-gray-500 truncate mt-0.5">{scanFileName}</p>
          </div>
          <button
            onClick={() => setIsScanMinimized(false)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-toast">
          <div className={`flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-[var(--border-soft)] border-l-4 transition-all duration-300 ${
            toast.type === 'success' ? 'border-l-green-500' : toast.type === 'error' ? 'border-l-red-500' : 'border-l-blue-500'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
            ) : (
              <FileText size={18} className="text-blue-500 flex-shrink-0" />
            )}
            <span className="text-sm font-semibold text-[var(--text-primary)] font-sans">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-all cursor-pointer ml-2"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
