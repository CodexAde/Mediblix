import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, Sparkles, Plus, Trash2, Check, AlertCircle, Minimize2, Maximize2, Undo2, Redo2, X } from "lucide-react";
import aiService from "../services/aiService";
import productService from "../services/productService";
import importHistoryService from "../services/importHistoryService";
import purchaseOrderService from "../services/purchaseOrderService";

const KNOWN_SUPPLIERS = [
  "Cipla Pharmaceuticals",
  "Sun Pharma Industries",
  "Dr. Reddy's Laboratories",
  "Lupin Ltd.",
  "Abbott India",
  "Torrent Pharmaceuticals"
];

const AIImport = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const importType = searchParams.get("type") || "inventory";

  const [existingProducts, setExistingProducts] = useState([]);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [items, setItems] = useState([]);
  const [supplierName, setSupplierName] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [minimizedFileName, setMinimizedFileName] = useState("");
  const [backgroundAnalyzing, setBackgroundAnalyzing] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [suggestions, setSuggestions] = useState({});
  const debounceTimers = useRef({});

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productService.getProducts();
        setExistingProducts(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (!analyzing && !backgroundAnalyzing) return;
    const interval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev < 4) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [analyzing, backgroundAnalyzing]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [history, historyIndex]);

  const updateHistory = (newItems) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(JSON.parse(JSON.stringify(newItems)));
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setItems(JSON.parse(JSON.stringify(history[nextIndex])));
      showToast("Undo Successful", "success");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setItems(JSON.parse(JSON.stringify(history[nextIndex])));
      showToast("Redo Successful", "success");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (isUploadModalOpen) {
        handleAddDocumentUpload(e.dataTransfer.files[0]);
      } else {
        setFile(e.dataTransfer.files[0]);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setAnalysisStep(0);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result.split(",")[1];
        const mimeType = file.type;
        const result = await aiService.parseInvoice(base64Data, mimeType);
        
        if (Array.isArray(result)) {
          setItems(result);
          setHistory([JSON.parse(JSON.stringify(result))]);
          setHistoryIndex(0);
          showToast("Invoice Parsed Successfully");
        } else {
          setError("Failed to parse invoice structure.");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to analyze document.");
      } finally {
        setAnalyzing(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file.");
      setAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddDocumentUpload = async (uploadedFile) => {
    if (!uploadedFile) return;
    setIsUploadModalOpen(false);
    setBackgroundAnalyzing(true);
    setMinimizedFileName(uploadedFile.name);
    setAnalysisStep(0);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result.split(",")[1];
        const mimeType = uploadedFile.type;
        const result = await aiService.parseInvoice(base64Data, mimeType);
        
        if (Array.isArray(result)) {
          setItems((prev) => {
            const updated = [...prev, ...result];
            updateHistory(updated);
            return updated;
          });
          showToast(`Appended ${result.length} Items From ${uploadedFile.name}`);
        } else {
          showToast("Failed to parse document structure", "error");
        }
      } catch (err) {
        showToast(err.message || "Failed to parse document", "error");
      } finally {
        setBackgroundAnalyzing(false);
        setIsMinimized(false);
        setMinimizedFileName("");
      }
    };
    reader.readAsDataURL(uploadedFile);
  };

  const handleAddField = () => {
    const randomSku = "NEW-" + Math.floor(1000 + Math.random() * 9000);
    const updated = [
      ...items,
      {
        name: "New Product Name",
        sku: randomSku,
        category: "General",
        price: 0,
        quantity: 1,
        expiryDate: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ];
    setItems(updated);
    updateHistory(updated);
  };

  const handleFieldChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      if (field === "price" || field === "quantity") {
        updated[index][field] = Number(value);
      } else {
        updated[index][field] = value;
      }
      return updated;
    });

    if (field === "name") {
      checkNameSuggestions(index, value);
    }
  };

  const checkNameSuggestions = (index, value) => {
    if (debounceTimers.current[index]) {
      clearTimeout(debounceTimers.current[index]);
    }

    debounceTimers.current[index] = setTimeout(() => {
      const words = value.trim().split(/\s+/);
      if (words.length >= 3) {
        const query = value.toLowerCase();
        const matched = existingProducts.find((p) =>
          p.name.toLowerCase().includes(query) || query.includes(p.name.toLowerCase())
        );
        if (matched) {
          setSuggestions((prev) => ({
            ...prev,
            [index]: { sku: matched.sku, name: matched.name }
          }));
        } else {
          setSuggestions((prev) => {
            const next = { ...prev };
            delete next[index];
            return next;
          });
        }
      } else {
        setSuggestions((prev) => {
          const next = { ...prev };
          delete next[index];
          return next;
        });
      }
    }, 400);
  };

  const handleFieldBlur = () => {
    updateHistory(items);
  };

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    updateHistory(updated);
    setSuggestions((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const checkSkuExists = (sku) => {
    return existingProducts.some((p) => p.sku.toLowerCase() === sku.toLowerCase());
  };

  const getSummary = () => {
    let newProductsCount = 0;
    let updatedProductsCount = 0;
    let totalQty = 0;
    let totalVal = 0;

    items.forEach((item) => {
      const exists = checkSkuExists(item.sku);
      if (exists) {
        updatedProductsCount += 1;
      } else {
        newProductsCount += 1;
      }
      totalQty += Number(item.quantity) || 0;
      totalVal += (Number(item.quantity) || 0) * (Number(item.price) || 0);
    });

    return {
      newProductsCount,
      updatedProductsCount,
      totalQty,
      totalVal
    };
  };

  const handleSave = async () => {
    if (items.length === 0) {
      showToast("No Items To Save", "error");
      return;
    }

    if (importType === "purchase-order" && !supplierName.trim()) {
      showToast("Please Specify Supplier Name", "error");
      return;
    }

    try {
      if (importType === "inventory") {
        await importHistoryService.createImportRecord({
          fileName: file ? file.name : "AI_Import.json",
          items: items.map((item) => ({
            name: item.name,
            sku: item.sku,
            category: item.category || "General",
            quantity: Number(item.quantity),
            price: Number(item.price)
          }))
        });
        showToast("Inventory Updated Successfully");
        setTimeout(() => navigate("/inventory"), 1000);
      } else {
        await purchaseOrderService.createPurchaseOrder({
          supplierName: supplierName,
          expectedDeliveryDate: expectedDeliveryDate || undefined,
          items: items.map((item) => ({
            productName: item.name,
            sku: item.sku,
            quantity: Number(item.quantity),
            price: Number(item.price)
          }))
        });
        showToast("Purchase Order Saved Successfully");
        setTimeout(() => navigate("/orders"), 1000);
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to save data", "error");
    }
  };

  const summary = getSummary();
  const stepsText = [
    "Reading File Data...",
    "Connecting To Gemini AI...",
    "Extracting Text Content...",
    "Identifying Items And Prices...",
    "Structuring Product Details..."
  ];

  return (
    <div className="min-h-full w-full bg-[var(--bg-main)] p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(importType === "purchase-order" ? "/orders" : "/inventory")}
              className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl hover:border-[var(--accent)] transition-all cursor-pointer text-[var(--text-primary)]"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                {importType === "purchase-order" ? "AI Purchase Order Import" : "AI Product Import"}
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                Upload invoice sheets or files to parse items using artificial intelligence
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                disabled={historyIndex <= 0}
                onClick={handleUndo}
                className="p-2.5 bg-white border border-[var(--border-soft)] rounded-xl hover:border-[var(--accent)] text-[var(--text-primary)] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Undo2 size={18} />
              </button>
              <button
                disabled={historyIndex >= history.length - 1}
                onClick={handleRedo}
                className="p-2.5 bg-white border border-[var(--border-soft)] rounded-xl hover:border-[var(--accent)] text-[var(--text-primary)] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Redo2 size={18} />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {items.length === 0 && !analyzing && !backgroundAnalyzing ? (
          <div className="grid grid-cols-1 gap-6">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
                dragActive
                  ? "border-[var(--accent)] bg-green-50/50 shadow-inner"
                  : "border-[var(--border-soft)] bg-[var(--bg-card)] hover:border-[var(--accent)]"
              }`}
            >
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto text-[var(--accent)]">
                  <Upload size={32} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">
                    Drag And Drop Invoice Document Here
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Supports JPEG, PNG images and PDF invoice sheets
                  </p>
                </div>
                <div>
                  <label className="inline-flex items-center justify-center px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl hover:opacity-90 transition-all font-medium cursor-pointer shadow-lg shadow-green-950/10">
                    Browse File
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {file && (
                  <div className="p-3 bg-white border border-[var(--border-soft)] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileText size={20} className="text-[var(--accent)]" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-xs text-red-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {file && (
              <button
                onClick={handleAnalyze}
                className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl hover:opacity-95 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-950/10 cursor-pointer"
              >
                <Sparkles size={20} />
                Start AI Analysis
              </button>
            )}
          </div>
        ) : null}

        {(analyzing || (backgroundAnalyzing && !isMinimized)) && (
          <div className="bg-[var(--bg-card)] border border-green-200 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setIsMinimized(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-[var(--accent)] transition-all cursor-pointer"
              >
                <Minimize2 size={14} />
                Minimize
              </button>
            </div>
            <div className="relative">
              <div className="w-20 h-20 border-4 border-green-100 border-t-[var(--accent)] rounded-full animate-spin" />
              <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--accent)]" />
            </div>
            <div className="text-center relative z-10">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                Artificial Intelligence Is Analyzing Your Invoice
              </h3>
              <p className="text-[var(--text-secondary)] mt-2 font-medium">
                {stepsText[analysisStep]}
              </p>
            </div>
            <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-[var(--accent)] transition-all duration-1000"
                style={{ width: `${((analysisStep + 1) / stepsText.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {items.length > 0 && (!analyzing && (!backgroundAnalyzing || isMinimized)) ? (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-medium text-[var(--text-secondary)]">Total Items</p>
                <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">{items.length}</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-medium text-green-800">New Products</p>
                <p className="text-3xl font-bold text-green-950 mt-1">{summary.newProductsCount}</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-medium text-green-800">Updated Stock</p>
                <p className="text-3xl font-bold text-green-950 mt-1">{summary.updatedProductsCount}</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-medium text-green-800">Total Value</p>
                <p className="text-3xl font-bold text-green-950 mt-1">₹{summary.totalVal.toFixed(2)}</p>
              </div>
            </div>

            {importType === "purchase-order" && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-2xl p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--text-primary)]">
                      Supplier Name
                    </label>
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                        placeholder="Enter or select supplier..."
                        className="bg-white border border-[var(--border-soft)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                      />
                      <select
                        onChange={(e) => setSupplierName(e.target.value)}
                        value=""
                        className="bg-white border border-[var(--border-soft)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled>Select Known Supplier</option>
                        {KNOWN_SUPPLIERS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--text-primary)]">
                      Order Date
                    </label>
                    <input
                      type="text"
                      value={new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      disabled
                      className="w-full bg-gray-50 border border-[var(--border-soft)] rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed focus:outline-none"
                    />
                    <p className="text-[10px] text-gray-400 font-medium">Order is being placed today</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--text-primary)]">
                      Expected Delivery Date
                    </label>
                    <input
                      type="date"
                      value={expectedDeliveryDate}
                      onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                      className="w-full bg-white border border-[var(--border-soft)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-[var(--border-soft)] flex justify-between items-center bg-gray-50/50">
                <h3 className="font-semibold text-[var(--text-primary)]">Parsed Document Items</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[var(--border-soft)] hover:border-[var(--accent)] rounded-xl text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-all cursor-pointer shadow-sm"
                  >
                    <Upload size={16} />
                    Add Document
                  </button>
                  <button
                    onClick={handleAddField}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[var(--border-soft)] hover:border-[var(--accent)] rounded-xl text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-all cursor-pointer shadow-sm"
                  >
                    <Plus size={16} />
                    Add Product
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-soft)] bg-gray-50/70">
                      <th className="text-left p-4 font-semibold text-[var(--text-primary)] text-sm">Product Name</th>
                      <th className="text-left p-4 font-semibold text-[var(--text-primary)] text-sm">Sku</th>
                      {importType === "inventory" && (
                        <>
                          <th className="text-left p-4 font-semibold text-[var(--text-primary)] text-sm">Category</th>
                          <th className="text-left p-4 font-semibold text-[var(--text-primary)] text-sm">Expiry Date</th>
                        </>
                      )}
                      <th className="text-left p-4 font-semibold text-[var(--text-primary)] text-sm w-28">Price</th>
                      <th className="text-left p-4 font-semibold text-[var(--text-primary)] text-sm w-28">Quantity</th>
                      <th className="text-left p-4 font-semibold text-[var(--text-primary)] text-sm">Import Status</th>
                      <th className="text-center p-4 font-semibold text-[var(--text-primary)] text-sm w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const exists = checkSkuExists(item.sku);
                      const nameSuggestion = suggestions[index];
                      return (
                        <tr 
                          key={index} 
                          className={`border-b border-[var(--border-soft)] transition-colors ${
                            exists 
                              ? 'hover:bg-gray-50/40' 
                              : 'bg-green-50/60 hover:bg-green-100/40'
                          }`}
                        >
                          <td className="p-3">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                              onBlur={handleFieldBlur}
                              className="w-full bg-white border border-[var(--border-soft)] rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                            />
                            {nameSuggestion && (
                              <div className="mt-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded inline-block animate-toast">
                                Matches Existing Catalog Item: {nameSuggestion.name} (Sku: {nameSuggestion.sku})
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={item.sku}
                              onChange={(e) => handleFieldChange(index, "sku", e.target.value)}
                              onBlur={handleFieldBlur}
                              className="w-full bg-white border border-[var(--border-soft)] rounded-lg px-2.5 py-1.5 font-mono text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                            />
                          </td>
                          {importType === "inventory" && (
                            <>
                              <td className="p-3">
                                <input
                                  type="text"
                                  value={item.category || ""}
                                  onChange={(e) => handleFieldChange(index, "category", e.target.value)}
                                  onBlur={handleFieldBlur}
                                  className="w-full bg-white border border-[var(--border-soft)] rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="date"
                                  value={item.expiryDate ? item.expiryDate.split('T')[0] : ''}
                                  onChange={(e) => handleFieldChange(index, "expiryDate", e.target.value)}
                                  onBlur={handleFieldBlur}
                                  className="w-full bg-white border border-[var(--border-soft)] rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                                />
                              </td>
                            </>
                          )}
                          <td className="p-3">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                              <input
                                type="number"
                                step="0.01"
                                value={item.price}
                                onChange={(e) => handleFieldChange(index, "price", e.target.value)}
                                onBlur={handleFieldBlur}
                                className="w-full bg-white border border-[var(--border-soft)] rounded-lg pl-6 pr-2 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                              />
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleFieldChange(index, "quantity", e.target.value)}
                              onBlur={handleFieldBlur}
                              className="w-full bg-white border border-[var(--border-soft)] rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                            />
                          </td>
                          <td className="p-3">
                            {exists ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                Existing Product
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                New Product
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  setItems([]);
                  setFile(null);
                  setHistory([]);
                  setHistoryIndex(-1);
                }}
                className="px-5 py-2.5 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl hover:border-red-400 hover:text-red-500 transition-all font-medium cursor-pointer"
              >
                Clear Results
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-[var(--accent)] hover:opacity-90 text-white rounded-xl transition-all font-medium flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Check size={18} />
                Save Import
              </button>
            </div>

          </div>
        ) : null}

      </div>

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsUploadModalOpen(false)}
          />
          <div className="relative bg-white border border-gray-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl transform transition-all animate-toast">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Invoice Document</h2>
                <p className="text-sm text-gray-500 mt-0.5">Parse new document items and append to review list</p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[var(--border-soft)] bg-[var(--bg-card)] hover:border-[var(--accent)] rounded-2xl p-8 text-center transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-green-100 text-[var(--accent)] rounded-xl flex items-center justify-center mx-auto">
                  <Upload size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Drag & Drop Document Here</p>
                  <p className="text-xs text-gray-500">JPEG, PNG, or PDF</p>
                </div>
                <label className="inline-flex items-center justify-center px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-all text-xs font-semibold cursor-pointer">
                  Select File
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleAddDocumentUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {backgroundAnalyzing && isMinimized && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-green-200 rounded-2xl p-4 shadow-xl flex items-center gap-4 animate-toast max-w-sm">
          <div className="w-8 h-8 border-2 border-green-100 border-t-[var(--accent)] rounded-full animate-spin flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900 truncate">Analyzing Invoice</h4>
            <p className="text-xs text-gray-500 truncate mt-0.5">{minimizedFileName}</p>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-toast">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border text-sm font-medium ${
            toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-green-50 border-green-200 text-green-700"
          }`}>
            {toast.type === "error" ? <AlertCircle size={18} /> : <Check size={18} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default AIImport;
