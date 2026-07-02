import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, Sparkles, Plus, Trash2, Check, AlertCircle, Minimize2, Maximize2, Undo2, Redo2, X, Mic, Volume2, Play, Pause, StopCircle } from "lucide-react";
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

  const [activeScanTab, setActiveScanTab] = useState("document");
  const [audioRecordings, setAudioRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showMicScreen, setShowMicScreen] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingRecordingId, setPlayingRecordingId] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioPreviewRef = useRef(null);

  const [activeInputRowIndex, setActiveInputRowIndex] = useState(null);

  const getProductSuggestions = (queryText) => {
    if (!queryText) return [];
    const query = queryText.toLowerCase();
    return existingProducts.filter((p) => {
      const name = p.name.toLowerCase();
      const sku = p.sku.toLowerCase();
      return name.includes(query) || sku.includes(query);
    }).slice(0, 5);
  };

  useEffect(() => {
    setFile(null);
    setAudioRecordings([]);
    setShowMicScreen(false);
    setIsRecording(false);
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current = null;
    }
    setPlayingRecordingId(null);
  }, [activeScanTab]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const options = { mimeType: 'audio/webm' };
      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioRecordings((prev) => [
          ...prev,
          {
            id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: `recorded_bill_${prev.length + 1}.webm`,
            blob: audioBlob,
            url: url
          }
        ]);
        setShowMicScreen(false);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      showToast("Could not access microphone.", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const handleRemoveRecording = (id) => {
    setAudioRecordings((prev) => {
      const next = prev.filter((r) => r.id !== id);
      if (playingRecordingId === id) {
        if (audioPreviewRef.current) {
          audioPreviewRef.current.pause();
          audioPreviewRef.current = null;
        }
        setPlayingRecordingId(null);
      }
      return next;
    });
  };

  const toggleRecordingPlayback = (rec) => {
    if (playingRecordingId === rec.id) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
      setPlayingRecordingId(null);
    } else {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
      const audio = new Audio(rec.url);
      audio.onended = () => {
        setPlayingRecordingId(null);
        audioPreviewRef.current = null;
      };
      audioPreviewRef.current = audio;
      audio.play();
      setPlayingRecordingId(rec.id);
    }
  };

  const handleAddNewRecordingClick = () => {
    setShowMicScreen(true);
    startRecording();
  };

  const handleAnalyzeMultipleRecordings = async () => {
    if (audioRecordings.length === 0) return;
    setAnalyzing(true);
    setAnalysisStep(0);
    setError(null);

    try {
      const base64Files = await Promise.all(
        audioRecordings.map((rec) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Data = reader.result.split(',')[1];
              resolve({
                fileData: base64Data,
                mimeType: rec.blob.type || 'audio/webm'
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(rec.blob);
          });
        })
      );

      const result = await aiService.parseInvoice({ files: base64Files });

      if (Array.isArray(result)) {
        setItems(result);
        setHistory([JSON.parse(JSON.stringify(result))]);
        setHistoryIndex(0);
        showToast("Voice Recordings Parsed Successfully");
      } else {
        setError("Failed to parse recordings structure.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to analyze recordings.");
    } finally {
      setAnalyzing(false);
    }
  };

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
    setTimeout(() => {
      setActiveInputRowIndex(null);
    }, 180);
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
          <div className="grid grid-cols-1 gap-4">
            
            <div className="flex items-center gap-1.5 p-1 bg-gray-50 border border-gray-150 rounded-2xl w-fit mx-auto mb-2 font-sans">
              <button
                type="button"
                onClick={() => setActiveScanTab('document')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeScanTab === 'document'
                    ? 'bg-white text-green-700 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Upload size={13} />
                Document Scan
              </button>
              <button
                type="button"
                onClick={() => setActiveScanTab('voice')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeScanTab === 'voice'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Mic size={13} className={activeScanTab === 'voice' ? '' : 'text-green-600 animate-pulse'} />
                Voice Dictation
              </button>
              <button
                type="button"
                onClick={() => setActiveScanTab('audio-file')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeScanTab === 'audio-file'
                    ? 'bg-white text-green-700 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Volume2 size={13} />
                Upload Audio
              </button>
            </div>

            {activeScanTab === 'document' && (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-[var(--accent)] bg-green-50/50 shadow-inner"
                    : "border-gray-200 bg-white hover:border-green-600"
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
                    <label className="inline-flex items-center justify-center px-5 py-2.5 bg-green-600 text-white rounded-xl hover:opacity-90 transition-all font-medium cursor-pointer shadow-md">
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
                    <div className="p-3 bg-white border border-gray-150 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText size={20} className="text-green-600 flex-shrink-0" />
                        <div className="text-left min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="text-xs text-red-500 hover:underline cursor-pointer flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeScanTab === 'voice' && (
              <div className="border border-gray-200 bg-white rounded-3xl p-8 text-center min-h-[260px] flex flex-col justify-center items-center">
                <div className="w-full max-w-sm">
                  {isRecording ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4 font-sans">
                      <div className="relative flex items-center justify-center">
                        <span className="absolute w-20 h-20 bg-red-100 rounded-full animate-ping opacity-75" />
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 hover:scale-105 transition-all shadow-lg cursor-pointer z-10"
                        >
                          <span className="w-6 h-6 bg-white rounded" />
                        </button>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-900">Recording Voice Dictation...</p>
                        <p className="text-xs text-red-600 font-bold mt-1 font-mono">
                          {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      <div className="voice-wave-container flex items-end justify-center gap-1 h-6">
                        <span className="voice-bar"></span>
                        <span className="voice-bar"></span>
                        <span className="voice-bar"></span>
                        <span className="voice-bar"></span>
                        <span className="voice-bar"></span>
                      </div>
                    </div>
                  ) : (audioRecordings.length === 0 || showMicScreen) ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4 font-sans">
                      <div className="relative flex items-center justify-center">
                        <button
                          type="button"
                          onClick={startRecording}
                          className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 hover:scale-105 transition-all shadow-lg cursor-pointer"
                        >
                          <Mic size={28} />
                        </button>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-900">Start Recording</p>
                        <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                          Tap the microphone to dictate medicine names, quantity, price, and category.
                        </p>
                      </div>
                      <div className="bg-green-50 border border-green-100 rounded-xl p-3 max-w-xs text-left">
                        <p className="text-[10px] uppercase tracking-wider text-green-700 font-bold">Try saying</p>
                        <p className="text-xs text-green-800 font-medium mt-1 leading-relaxed">
                          "Paracetamol 500 price 20 quantity 10, Amoxicillin price 50 quantity 5"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4 font-sans">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                        <Volume2 size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-900">Voice Recordings Ready</p>
                        <p className="text-xs text-gray-500 mt-1">Review your voice clips before AI analysis</p>
                      </div>

                      <div className="w-full max-w-xs space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {audioRecordings.map((rec) => (
                          <div key={rec.id} className="flex items-center gap-3 bg-gray-50 border border-gray-150 px-4 py-2.5 rounded-2xl w-full justify-between font-sans">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => handleRemoveRecording(rec.id)}
                                className="text-gray-400 hover:text-red-600 transition-all cursor-pointer p-1 hover:bg-gray-100 rounded-full flex-shrink-0"
                              >
                                <X size={13} />
                              </button>
                              <span className="text-xs text-gray-600 font-semibold truncate">{rec.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleRecordingPlayback(rec)}
                              className="p-2 bg-green-600 hover:opacity-90 text-white rounded-full transition-all cursor-pointer flex-shrink-0"
                            >
                              {playingRecordingId === rec.id ? <Pause size={14} /> : <Play size={14} />}
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2.5 w-full max-w-xs pt-2">
                        <button
                          type="button"
                          onClick={handleAddNewRecordingClick}
                          className="flex-1 py-2.5 border border-green-600 text-green-700 hover:bg-green-50 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 font-sans"
                        >
                          <Plus size={13} className="stroke-[3]" />
                          Add Recording
                        </button>
                        <button
                          type="button"
                          onClick={handleAnalyzeMultipleRecordings}
                          className="flex-1 py-2.5 bg-green-600 text-white hover:opacity-90 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm font-sans"
                        >
                          <Sparkles size={12} />
                          Analyze
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeScanTab === 'audio-file' && (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-[var(--accent)] bg-green-50/50 shadow-inner"
                    : "border-gray-200 bg-white hover:border-green-600"
                }`}
              >
                <div className="max-w-md mx-auto space-y-4 font-sans">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Volume2 size={32} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      Drag And Drop Voice File Here
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supports MP3, WAV, M4A and WEBM formats
                    </p>
                  </div>
                  <div>
                    <label className="inline-flex items-center justify-center px-5 py-2.5 bg-green-600 text-white rounded-xl hover:opacity-90 transition-all font-medium cursor-pointer shadow-md">
                      Browse Audio
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {file && (
                    <div className="p-3 bg-white border border-gray-150 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText size={20} className="text-green-600 flex-shrink-0" />
                        <div className="text-left min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="text-xs text-red-500 hover:underline cursor-pointer flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {file && activeScanTab !== 'voice' && (
              <button
                onClick={handleAnalyze}
                className="w-full py-4 bg-green-600 text-white rounded-2xl hover:opacity-95 transition-all font-semibold flex items-center justify-center gap-2 shadow-md cursor-pointer shadow-green-950/10"
              >
                <Sparkles size={20} />
                Start AI Analysis
              </button>
            )}
          </div>
        ) : null}

        {(analyzing || (backgroundAnalyzing && !isMinimized)) && (
          <div className="bg-[var(--bg-card)] border border-green-200 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
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
                            <div className="relative">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                                onFocus={() => setActiveInputRowIndex(index)}
                                onBlur={handleFieldBlur}
                                className="w-full bg-white border border-[var(--border-soft)] rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                              />
                              {activeInputRowIndex === index && item.name.trim().length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-52 overflow-y-auto">
                                  {getProductSuggestions(item.name).map((product) => (
                                    <button
                                      key={product._id}
                                      type="button"
                                      onMouseDown={() => {
                                        setItems((prev) => {
                                          const updated = [...prev];
                                          updated[index].name = product.name;
                                          updated[index].sku = product.sku;
                                          if (product.category) updated[index].category = product.category;
                                          if (product.price) updated[index].price = product.price;
                                          updateHistory(updated);
                                          return updated;
                                        });
                                        setActiveInputRowIndex(null);
                                      }}
                                      className="w-full text-left px-3 py-2 hover:bg-green-50 text-xs font-semibold border-b border-gray-100 last:border-b-0 cursor-pointer flex items-center justify-between font-sans"
                                    >
                                      <div className="truncate">
                                        <span className="font-semibold text-gray-800">{product.name}</span>
                                        <span className="text-[10px] text-gray-400 ml-2 font-mono">({product.sku})</span>
                                      </div>
                                      <span className="text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded font-bold">₹{product.price || 0}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
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
