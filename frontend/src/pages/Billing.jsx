import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, Minus, Trash2, Phone, Package, Printer, Download, X, Check, ShoppingCart, Calculator, Clock, RotateCcw, Banknote, CreditCard, Smartphone, Eye, Save, FileText, AlertTriangle, CheckCircle2, Sparkles, Upload, Minimize2, Maximize2, Camera, Mic, Volume2, Play, Pause, StopCircle } from 'lucide-react';
import customerService from '../services/customerService';
import saleService from '../services/saleService';
import productService from '../services/productService';
import aiService from '../services/aiService';

const Billing = () => {
  const [searchParams] = useSearchParams();
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
  const searchInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const scanModalRef = useRef(null);
  const billingModalRef = useRef(null);

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
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'new-bill');

  useEffect(() => {
    if (activeTab === 'history') {
      if (customer) {
        fetchCustomerBills(customer._id);
      } else {
        fetchAllBills();
      }
    }
  }, [activeTab, customer]);

  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isScanMinimized, setIsScanMinimized] = useState(false);
  const [scanAnalyzing, setScanAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanDragActive, setScanDragActive] = useState(false);
  const [scanFileName, setScanFileName] = useState('');
  const [cartDragActive, setCartDragActive] = useState(false);
  const scanInputRef = useRef(null);

  const [activeScanTab, setActiveScanTab] = useState('document');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioDragActive, setAudioDragActive] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioPreviewRef = useRef(null);

  const [parsedItemsToResolve, setParsedItemsToResolve] = useState([]);
  const [isResolvingItems, setIsResolvingItems] = useState(false);
  const [audioRecordings, setAudioRecordings] = useState([]);
  const [showMicScreen, setShowMicScreen] = useState(false);
  const [playingRecordingId, setPlayingRecordingId] = useState(null);

  const getSimilarityScore = (s1, s2) => {
    s1 = s1.toLowerCase().trim();
    s2 = s2.toLowerCase().trim();
    if (s1 === s2) return 1.0;
    if (s1.includes(s2) || s2.includes(s1)) {
      return Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
    }
    const m = s1.length;
    const n = s2.length;
    const d = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) d[i][0] = i;
    for (let j = 0; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        d[i][j] = Math.min(
          d[i - 1][j] + 1,
          d[i][j - 1] + 1,
          d[i - 1][j - 1] + cost
        );
      }
    }
    const distance = d[m][n];
    const maxLength = Math.max(m, n);
    return maxLength === 0 ? 1.0 : 1.0 - distance / maxLength;
  };

  const findFuzzyMatch = (itemName) => {
    if (!itemName) return null;
    let bestMatch = null;
    let highestScore = 0;
    for (const p of products) {
      const score = getSimilarityScore(itemName, p.name);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = p;
      }
    }
    return highestScore >= 0.70 ? bestMatch : null;
  };

  const getSuggestions = (itemName) => {
    if (!itemName) return [];
    const query = itemName.toLowerCase();
    return products.filter((p) => {
      const name = p.name.toLowerCase();
      const sku = p.sku.toLowerCase();
      const queryWords = query.split(/\s+/);
      const nameWords = name.split(/\s+/);
      const hasWordOverlap = queryWords.some(qw => qw.length > 2 && nameWords.some(nw => nw.includes(qw) || qw.includes(nw)));
      return name.includes(query) || query.includes(name) || sku.includes(query) || hasWordOverlap || getSimilarityScore(query, name) >= 0.5;
    }).slice(0, 3);
  };

  const mergeDuplicateParsedItems = (items) => {
    const merged = [];
    items.forEach((item) => {
      const existing = merged.find((m) => {
        if (item.matchedProduct && m.matchedProduct) {
          return m.matchedProduct._id === item.matchedProduct._id;
        }
        return !item.matchedProduct && !m.matchedProduct && m.name.toLowerCase() === item.name.toLowerCase();
      });
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        merged.push({ ...item });
      }
    });
    return merged;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioRecordings(prev => {
          const newRec = {
            id: `rec-${Date.now()}`,
            blob,
            url,
            name: `recorded_bill_${prev.length + 1}.webm`
          };
          return [...prev, newRec];
        });
        setShowMicScreen(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      setAudioUrl('');
      setAudioBlob(null);
      setRecordingDuration(0);
      recorder.start();
      setIsRecording(true);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 60) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      showToast('Could not access microphone. Please check permissions.', 'error');
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

  const togglePreviewPlayback = () => {
    if (!audioUrl) return;
    if (isPlayingPreview) {
      audioPreviewRef.current?.pause();
      setIsPlayingPreview(false);
    } else {
      if (!audioPreviewRef.current) {
        audioPreviewRef.current = new Audio(audioUrl);
        audioPreviewRef.current.onended = () => {
          setIsPlayingPreview(false);
          audioPreviewRef.current = null;
        };
      } else if (audioPreviewRef.current.src !== audioUrl) {
        audioPreviewRef.current.src = audioUrl;
      }
      audioPreviewRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const clearRecording = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current = null;
    }
    setAudioUrl('');
    setAudioBlob(null);
    setIsPlayingPreview(false);
    setRecordingDuration(0);
  };

  const handleAddNewRecordingClick = () => {
    setShowMicScreen(true);
    startRecording();
  };

  const closeScanModal = () => {
    setIsScanModalOpen(false);
    setIsResolvingItems(false);
    setParsedItemsToResolve([]);
    setAudioRecordings([]);
    setShowMicScreen(false);
    setPlayingRecordingId(null);
    stopRecording();
    clearRecording();
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
      }
      audioPreviewRef.current = new Audio(rec.url);
      audioPreviewRef.current.onended = () => {
        setPlayingRecordingId(null);
        audioPreviewRef.current = null;
      };
      audioPreviewRef.current.play();
      setPlayingRecordingId(rec.id);
    }
  };

  const handleRemoveRecording = (recId) => {
    setAudioRecordings(prev => prev.filter(r => r.id !== recId));
  };

  const handleAnalyzeMultipleRecordings = async () => {
    if (audioRecordings.length === 0) return;

    setIsScanModalOpen(true);
    setIsScanMinimized(false);
    setScanAnalyzing(true);
    setScanStep(0);
    setScanFileName('Multiple Voice Recordings');

    try {
      const filePromises = audioRecordings.map((rec) => {
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
      });

      const files = await Promise.all(filePromises);
      const result = await aiService.parseBill({ files });

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

        if (Array.isArray(result.items) && result.items.length > 0) {
          const itemsToResolve = result.items.map((item, idx) => {
            const matched = findFuzzyMatch(item.name);
            return {
              id: `parsed-${idx}-${Date.now()}`,
              name: item.name,
              quantity: Number(item.quantity) || 1,
              unit: item.unit || 'Strip',
              matchedProduct: matched || null,
              suggestions: matched ? [] : getSuggestions(item.name)
            };
          });

          setParsedItemsToResolve(prev => mergeDuplicateParsedItems([...prev, ...itemsToResolve]));
          setIsResolvingItems(true);
          setIsScanModalOpen(true);
          setIsScanMinimized(false);
          setScanAnalyzing(false);
        } else {
          setScanAnalyzing(false);
          showToast('No medicine details found in the recordings.', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      setScanAnalyzing(false);
      showToast('Error analyzing voice recordings. Please try again.', 'error');
    }
  };

  const handleConfirmResolvedItems = () => {
    const itemsToAdd = parsedItemsToResolve.filter(item => item.matchedProduct);
    if (itemsToAdd.length === 0) {
      showToast('No items selected to add to cart.', 'error');
      return;
    }

    setCart((prev) => {
      const updated = [...prev];
      itemsToAdd.forEach((item) => {
        const existingIndex = updated.findIndex((c) => c._id === item.matchedProduct._id);
        if (existingIndex !== -1) {
          updated[existingIndex].quantity += item.quantity;
        } else {
          updated.push({
            ...item.matchedProduct,
            quantity: item.quantity,
            unit: item.unit
          });
        }
      });
      return updated;
    });

    showToast(`Successfully added ${itemsToAdd.length} items to cart.`, 'success');
    closeScanModal();
  };

  const handleQuantityChange = (itemId, change) => {
    setParsedItemsToResolve(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveParsedItem = (itemId) => {
    setParsedItemsToResolve(prev => prev.filter(item => item.id !== itemId));
  };

  const handleMapProduct = (itemId, product) => {
    setParsedItemsToResolve(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, matchedProduct: product };
      }
      return item;
    }));
  };

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

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, []);

  const handleScanBill = async (fileToScan) => {
    if (!fileToScan) return;
    setScanFileName(fileToScan.name);
    stopRecording();
    setIsScanMinimized(false);
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

          if (Array.isArray(result.items) && result.items.length > 0) {
            const itemsToResolve = result.items.map((item, idx) => {
              const matched = findFuzzyMatch(item.name);

              return {
                id: `parsed-${idx}-${Date.now()}`,
                name: item.name,
                quantity: Number(item.quantity) || 1,
                unit: item.unit || 'Strip',
                matchedProduct: matched || null,
                suggestions: matched ? [] : getSuggestions(item.name)
              };
            });

            setParsedItemsToResolve(prev => mergeDuplicateParsedItems([...prev, ...itemsToResolve]));
            setIsResolvingItems(true);
            setIsScanModalOpen(true);
            setIsScanMinimized(false);
          } else {
            showToast('The data that you uploaded is not a valid prescription or bill.', 'error');
          }

        } else {
          showToast('The data that you uploaded is not a valid prescription or bill.', 'error');
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
    const duration = type === 'error' ? 8000 : 4000;
    setTimeout(() => {
      setToast(null);
    }, duration);
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

  const generateNextInvoiceNumber = async () => {
    try {
      const sales = await saleService.getSales({});
      if (sales && sales.length > 0) {
        let maxNum = 0;
        sales.forEach(sale => {
          if (sale.invoiceNumber) {
            const match = sale.invoiceNumber.match(/Inv-(\d+)/i);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNum) {
                maxNum = num;
              }
            }
          }
        });
        const nextNum = maxNum + 1;
        const paddedNum = String(nextNum).padStart(4, '0');
        setActiveInvoiceNumber(`Inv-${paddedNum}`);
      } else {
        setActiveInvoiceNumber('Inv-0001');
      }
    } catch (error) {
      console.error(error);
      setActiveInvoiceNumber(`Inv-${Date.now().toString().slice(-6)}`);
    }
  };

  useEffect(() => {
    fetchProducts();
    generateNextInvoiceNumber();
    const savedDrafts = localStorage.getItem('spren_drafts');
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    }
  }, []);

  const getItemPrice = (item) => {
    if (item.unit === 'Tablet') {
      return Math.round((item.price / (item.tabletsPerStrip || 10)) * 100) / 100;
    }
    return item.price;
  };

  const formatStock = (qty, tabletsPerStrip) => {
    if (qty <= 0) return '0 Strips';
    if (!tabletsPerStrip || tabletsPerStrip <= 1) {
      return `${qty} Strips`;
    }
    const totalTablets = Math.round(qty * tabletsPerStrip);
    const strips = Math.floor(totalTablets / tabletsPerStrip);
    const tablets = totalTablets % tabletsPerStrip;
    if (strips > 0 && tablets > 0) {
      return `${strips} Strips, ${tablets} Tablets`;
    } else if (strips > 0) {
      return `${strips} Strips`;
    } else {
      return `${tablets} Tablets`;
    }
  };

  const toggleUnit = (productId, unit) => {
    setCart(cart.map(item =>
      item._id === productId ? { ...item, unit } : item
    ));
  };

  const fetchAllBills = async () => {
    try {
      setLoadingBills(true);
      const data = await saleService.getSales({});
      setCustomerBills(data);
      return data;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      setLoadingBills(false);
    }
  };

  const generateInvoice = async () => {
    if (!customer || cart.length === 0) return;
    
    try {
      const saleData = {
        customerId: customer._id,
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
          unit: item.unit || 'Strip',
          price: getItemPrice(item)
        })),
        paymentMethod,
        invoiceNumber: activeInvoiceNumber
      };
      
      const sale = await saleService.createSale(saleData);
      deleteDraft(activeInvoiceNumber);
      setCurrentSaleId(sale._id);
      setInvoiceGenerated(true);
      setShowInvoiceModal(true);
      
      await fetchProducts();
    } catch (error) {
      console.error('Error creating sale:', error);
      const msg = error.response?.data?.message || 'Failed to create sale. Please try again.';
      showToast(msg, "error");
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
      setCart([...cart, { ...product, quantity: 1, unit: 'Strip' }]);
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

  const subtotal = cart.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);
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
    generateNextInvoiceNumber();
    phoneInputRef.current?.focus();
  }

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('new-bill');
        setSelectedBill(null);
        clearAll();
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('new-bill');
        setSelectedBill(null);
        setTimeout(() => {
          phoneInputRef.current?.focus();
        }, 50);
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('new-bill');
        setSelectedBill(null);
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('new-bill');
        setSelectedBill(null);
        setActiveScanTab('document');
        setIsScanModalOpen(true);
      } else if (e.key === 'F5') {
        e.preventDefault();
        setActiveTab('new-bill');
        setSelectedBill(null);
        setActiveScanTab('voice');
        setIsScanModalOpen(true);
      } else if (e.key === 'F6') {
        e.preventDefault();
        setActiveTab('new-bill');
        setSelectedBill(null);
        setActiveScanTab('audio-file');
        setIsScanModalOpen(true);
      } else if (e.key === 'Escape') {
        setShowBillingModal(false);
        setShowDraftsModal(false);
        setShowInvoiceModal(false);
        closeScanModal();
        setSelectedBill(null);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [clearAll]);

  useEffect(() => {
    const activeModalRef = isScanModalOpen ? scanModalRef : (showBillingModal ? billingModalRef : null);
    if (!activeModalRef) return;
    const modalElement = activeModalRef.current;
    if (!modalElement) return;

    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (firstElement) {
      setTimeout(() => {
        firstElement.focus();
      }, 50);
    }

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    window.addEventListener('keydown', handleTabKey);
    return () => window.removeEventListener('keydown', handleTabKey);
  }, [isScanModalOpen, showBillingModal]);

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
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-[var(--border-soft)]">
              {[
                { id: 'new-bill', label: 'New Bill (F1)', icon: ShoppingCart },
                { id: 'drafts', label: 'Saved Drafts', icon: FileText, count: drafts.length }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSelectedBill(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-150'
                    }`}
                  >
                    <Icon size={12} />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`ml-0.5 px-1.5 py-0.2 rounded text-[10px] ${activeTab === tab.id ? 'bg-white text-green-600' : 'bg-green-600 text-white'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 rounded-md transition-all text-xs cursor-pointer font-sans"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {activeTab === 'new-bill' && (
            <div className="h-full grid grid-cols-5 gap-3 min-h-0">
              <div className="col-span-3 flex flex-col gap-3 min-h-0">
                <div className="bg-white rounded-lg border border-[var(--border-soft)] p-3 flex-shrink-0">
                  {!customer ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                          <input
                            ref={phoneInputRef}
                            type="tel"
                            placeholder="Enter 10-digit phone (F2)"
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
                          type="button"
                          onClick={handleOpenLastBill}
                          className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-semibold transition-all cursor-pointer font-sans"
                        >
                          Last Bill
                        </button>
                        <button
                          type="button"
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

                <div className="bg-white rounded-lg border border-[var(--border-soft)] p-3 flex-shrink-0" ref={searchRef}>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search products by name or Sku... (F3)"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => productSearch.length > 0 && setShowSuggestions(true)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-[var(--border-soft)] rounded-md focus:outline-none focus:border-[var(--accent)] focus:bg-white transition-all text-sm"
                    />
                    
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
                                <p className="font-medium text-[var(--text-primary)] text-sm">
                                  {product.name} <span className="text-xs text-gray-400 font-normal">({product.packaging || '10 Tablets / Strip'})</span>
                                </p>
                                <p className="text-xs text-[var(--text-secondary)]">
                                  {product.sku} • {formatStock(product.quantity, product.tabletsPerStrip)} in stock • Exp: {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'}
                                </p>
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

                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {cart.length === 0 ? (
                      scanAnalyzing ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                          <div className="relative">
                            <div className="w-14 h-14 border-4 border-green-100 border-t-green-600 rounded-full animate-spin" />
                            <Sparkles size={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[var(--text-primary)]">Analyzing Bill...</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">
                              {[
                                "Reading bill image...",
                                "Sending to Ai...",
                                "Extracting client details...",
                                "Identifying items...",
                                "Processing cart..."
                              ][scanStep]}
                            </p>
                          </div>
                          <div className="w-40 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-600 transition-all duration-1000"
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
                          <div className="max-w-xs w-full space-y-2">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-[var(--accent)] flex-shrink-0">
                              <Upload size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[var(--text-primary)]">No Items In Cart</p>
                              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-tight">
                                Search products above, upload a document, or speak to auto-fill items
                              </p>
                            </div>
                            <div className="pt-1 flex flex-col gap-2 font-sans w-full">
                              <button
                                type="button"
                                onClick={() => { setActiveScanTab('document'); setIsScanModalOpen(true); }}
                                className="w-full px-3 py-2 bg-white border border-gray-200 hover:border-green-600 hover:bg-green-50/10 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer group text-left"
                              >
                                <div className="w-7 h-7 bg-gray-50 text-gray-500 group-hover:bg-green-50 group-hover:text-green-600 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                                  <Upload size={13} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="block text-xs font-bold text-gray-800 truncate">Document Scan (F4)</span>
                                  <span className="block text-[9px] text-gray-400 font-medium truncate">Upload prescription image or PDF file</span>
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => { setActiveScanTab('voice'); setIsScanModalOpen(true); }}
                                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white shadow-sm rounded-xl transition-all flex items-center gap-2.5 cursor-pointer text-left"
                              >
                                <div className="w-7 h-7 bg-green-500 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Mic size={13} className="animate-pulse" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="block text-xs font-bold text-white truncate">Voice Dictation (F5)</span>
                                  <span className="block text-[9px] text-green-100 font-medium truncate">Dictate live medicines & client details</span>
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => { setActiveScanTab('audio-file'); setIsScanModalOpen(true); }}
                                className="w-full px-3 py-2 bg-white border border-gray-200 hover:border-green-600 hover:bg-green-50/10 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer group text-left"
                              >
                                <div className="w-7 h-7 bg-gray-50 text-gray-500 group-hover:bg-green-50 group-hover:text-green-600 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                                  <Volume2 size={13} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="block text-xs font-bold text-gray-800 truncate">Upload Audio (F6)</span>
                                  <span className="block text-[9px] text-gray-400 font-medium truncate">Upload an existing voice file</span>
                                </div>
                              </button>

                              <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 text-center block">PRESS KEYBOARD F4, F5, OR F6 TO QUICK LAUNCH</span>
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
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-gray-400 font-medium">({item.packaging || '10 Tablets / Strip'})</span>
                                {item.expiryDate && (
                                  <span className="text-[10px] text-red-500 font-semibold font-sans">
                                    Exp: {new Date(item.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[var(--text-secondary)] mt-0.5">₹{getItemPrice(item).toLocaleString()} / {item.unit || 'Strip'}</p>
                            </div>
                            {item.tabletsPerStrip > 1 && (
                              <div className="flex items-center border border-gray-200 rounded overflow-hidden mr-2 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => toggleUnit(item._id, 'Strip')}
                                  className={`px-2 py-0.5 text-[10px] font-semibold transition-all cursor-pointer ${
                                    item.unit !== 'Tablet'
                                      ? 'bg-green-600 text-white'
                                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  Strip
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleUnit(item._id, 'Tablet')}
                                  className={`px-2 py-0.5 text-[10px] font-semibold transition-all cursor-pointer ${
                                    item.unit === 'Tablet'
                                      ? 'bg-green-600 text-white'
                                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  Tablet
                                </button>
                              </div>
                            )}
                            <div className="flex items-center gap-0.5 bg-gray-100 rounded p-0.5">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item._id, -1)}
                                className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-all cursor-pointer"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item._id, 1)}
                                className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-all cursor-pointer"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <p className="w-20 text-right font-bold text-[var(--accent)] text-sm">
                              ₹{(getItemPrice(item) * item.quantity).toLocaleString()}
                            </p>
                            <button
                              type="button"
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
                      <span className="text-[var(--text-secondary)]">Taxable value ({totalItems} items)</span>
                      <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Discount</span>
                      <div className="flex items-center gap-1 bg-gray-50 rounded px-2 py-0.5">
                        <input
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                          className="w-12 px-1 py-0.5 bg-transparent text-right text-sm focus:outline-none font-medium"
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
                      <span className="text-[var(--text-secondary)]">Gst @ 18%</span>
                      <span className="font-medium">₹{Math.round(gst).toLocaleString()}</span>
                    </div>
                    
                    <div className="border-t border-dashed border-[var(--border-soft)] pt-3 flex justify-between items-center">
                      <span className="font-bold text-[var(--text-primary)]">Grand total</span>
                      <span className="text-2xl font-bold text-[var(--accent)]">₹{Math.round(total).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div>
                      <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Payment</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'Cash', label: 'Cash', icon: Banknote },
                          { id: 'Card', label: 'Card', icon: CreditCard },
                          { id: 'UPI', label: 'Upi', icon: Smartphone },
                        ].map((method) => {
                          const Icon = method.icon;
                          return (
                            <button
                              type="button"
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

                    <div className="flex gap-2">
                      {!invoiceGenerated && (
                        <button
                          type="button"
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
                        type="button"
                        onClick={generateInvoice}
                        disabled={!customer || cart.length === 0 || invoiceGenerated}
                        className={`py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all font-sans ${
                          !invoiceGenerated ? 'flex-1' : 'w-full'
                        } ${
                          customer && cart.length > 0
                            ? invoiceGenerated 
                              ? 'bg-green-500 text-white cursor-not-allowed opacity-90'
                              : 'bg-[var(--accent)] text-white hover:opacity-90 cursor-pointer'
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
                          type="button"
                          onClick={handlePrintInvoice}
                          className="py-2 bg-gray-50 border border-[var(--border-soft)] rounded-md text-[var(--text-secondary)] text-xs font-medium flex items-center justify-center gap-1.5 hover:border-[var(--accent)] transition-all cursor-pointer"
                        >
                          <Printer size={12} />
                          Print
                        </button>
                        <button 
                          type="button"
                          onClick={handleDownloadPDF}
                          className="py-2 bg-gray-50 border border-[var(--border-soft)] rounded-md text-[var(--text-secondary)] text-xs font-medium flex items-center justify-center gap-1.5 hover:border-[var(--accent)] transition-all cursor-pointer"
                        >
                          <Download size={12} />
                          Pdf
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'drafts' && (
            <div className="h-full bg-white rounded-lg border border-[var(--border-soft)] flex flex-col min-h-0 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Saved Drafts</h2>
              </div>
              {drafts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] py-12">
                  <Package size={36} className="text-gray-300 mb-2" />
                  <p className="text-sm font-medium">No saved drafts found.</p>
                </div>
              ) : (
                <div className="border border-[var(--border-soft)] rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-[var(--text-secondary)] text-xs font-semibold border-b border-[var(--border-soft)]">
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
                                <p className="font-semibold text-[var(--text-primary)] text-sm">{draft.customer.name}</p>
                                <p className="text-xs">+91 {draft.customer.mobile}</p>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Walk-in Customer</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-[var(--text-secondary)] max-w-xs truncate">
                            {draft.cart.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                          </td>
                          <td className="px-4 py-4 text-[var(--text-secondary)] font-sans">
                            {new Date(draft.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => { loadDraft(draft); setActiveTab('new-bill'); }}
                                className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-semibold transition-all cursor-pointer font-sans"
                              >
                                Resume
                              </button>
                              <button
                                type="button"
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
            </div>
          )}

          {activeTab === 'history' && (
            <div className="h-full bg-white rounded-lg border border-[var(--border-soft)] flex flex-col min-h-0 p-6 overflow-y-auto">
              {selectedBill ? (
                <div className="flex-1 flex flex-col min-h-0 animate-fade-in">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-xl text-green-600">Spren Pharmacy</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">Invoice Number: {selectedBill.invoiceNumber}</p>
                      <p className="text-xs text-[var(--text-secondary)]">Date: {new Date(selectedBill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-semibold">Paid</span>
                      <p className="text-xs text-[var(--text-secondary)] mt-2">Payment: {selectedBill.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="border border-[var(--border-soft)] rounded-xl overflow-hidden mb-6 flex-shrink-0">
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
                              {item.product?.name || "Deleted Product"} {item.unit && `(${item.unit})`}
                            </td>
                            <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                              ₹{item.price.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-center font-medium">
                              {item.quantity} {item.unit === 'Tablet' ? 'Tablets' : 'Strips'}
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
                      <span className="text-[var(--text-secondary)]">Taxable value</span>
                      <span className="font-semibold">₹{Math.round(selectedBill.totalAmount / 1.18).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Cgst @ 9%</span>
                      <span className="font-semibold">₹{Math.round((selectedBill.totalAmount - Math.round(selectedBill.totalAmount / 1.18)) / 2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Sgst @ 9%</span>
                      <span className="font-semibold">₹{(selectedBill.totalAmount - Math.round(selectedBill.totalAmount / 1.18) - Math.round((selectedBill.totalAmount - Math.round(selectedBill.totalAmount / 1.18)) / 2)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-[var(--text-primary)] border-t border-dashed border-[var(--border-soft)] pt-2">
                      <span>Grand total</span>
                      <span className="text-lg text-green-600 font-bold">₹{selectedBill.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[var(--border-soft)]">
                    <button
                      type="button"
                      onClick={() => setSelectedBill(null)}
                      className="px-4 py-2 bg-gray-50 border border-[var(--border-soft)] hover:border-gray-400 text-gray-700 text-sm font-semibold rounded-lg transition-all cursor-pointer"
                    >
                      Back to History
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintPastInvoice(selectedBill._id)}
                      className="px-4 py-2 bg-gray-50 border border-[var(--border-soft)] hover:border-green-600 text-gray-700 hover:text-green-700 text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                    >
                      <Printer size={14} />
                      Print
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadPastInvoice(selectedBill._id, selectedBill.invoiceNumber)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Download size={14} />
                      Download Pdf
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="relative mb-4">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by invoice number..."
                      value={billSearch}
                      onChange={(e) => setBillSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-green-600 text-sm"
                    />
                  </div>

                  {loadingBills ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : filteredBills.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] py-12">
                      <Package size={36} className="text-gray-300 mb-2" />
                      <p className="text-sm font-medium">No past bills found.</p>
                    </div>
                  ) : (
                    <div className="border border-[var(--border-soft)] rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-[var(--text-secondary)] text-xs font-semibold border-b border-[var(--border-soft)]">
                            <th className="px-4 py-3">Invoice</th>
                            <th className="px-4 py-3">Customer</th>
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
                                {bill.customer ? (
                                  <div>
                                    <p className="font-semibold text-[var(--text-primary)] text-sm">{bill.customer.name}</p>
                                    <p className="text-xs">+91 {bill.customer.mobile}</p>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">Walk-in Customer</span>
                                )}
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
                              <td className="px-4 py-4 text-right font-bold text-green-600">
                                ₹{bill.totalAmount.toLocaleString()}
                              </td>
                              <td className="px-4 py-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => setSelectedBill(bill)}
                                  className="p-1.5 bg-gray-50 border border-[var(--border-soft)] hover:border-green-600 text-gray-700 hover:text-green-700 rounded-lg transition-all cursor-pointer"
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isScanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeScanModal}
          />
          <div ref={scanModalRef} className="relative bg-white border border-gray-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl transform transition-all animate-toast">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">AI Billing Assistant</h2>
                <p className="text-sm text-gray-500 mt-0.5">Generate client invoices using document upload or audio voice dictations</p>
              </div>
              <button
                type="button"
                onClick={closeScanModal}
                className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {scanAnalyzing && !isScanMinimized ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4 font-sans">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin" />
                  <Sparkles size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {scanFileName && (scanFileName.endsWith('.mp3') || scanFileName.endsWith('.wav') || scanFileName.endsWith('.m4a') || scanFileName.endsWith('.webm') || scanFileName.endsWith('.ogg') || scanFileName.startsWith('recorded_'))
                      ? "Analyzing Voice Audio..."
                      : "Analyzing Prescription Document..."}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {(() => {
                      const isAudio = scanFileName && (scanFileName.endsWith('.mp3') || scanFileName.endsWith('.wav') || scanFileName.endsWith('.m4a') || scanFileName.endsWith('.webm') || scanFileName.endsWith('.ogg') || scanFileName.startsWith('recorded_'));
                      return isAudio
                        ? [
                            "Processing voice audio...",
                            "Transcribing speech with Ai...",
                            "Extracting customer details...",
                            "Identifying products from speech...",
                            "Updating your shopping cart..."
                          ][scanStep]
                        : [
                            "Reading prescription image...",
                            "Sending data to Ai...",
                            "Extracting client details...",
                            "Identifying items in prescription...",
                            "Processing billing cart..."
                          ][scanStep];
                    })()}
                  </p>
                </div>
                <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all duration-1000"
                    style={{ width: `${((scanStep + 1) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ) : isResolvingItems ? (
              <div className="space-y-4">
                <div className="max-h-[350px] overflow-y-auto pr-1">
                  {parsedItemsToResolve.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4 font-sans">No items to review.</p>
                  ) : (
                    parsedItemsToResolve.map((item) => (
                      <div key={item.id} className="bg-gray-50 border border-gray-150 rounded-2xl p-3.5 mb-3 font-sans">
                        {item.matchedProduct ? (
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 bg-green-150 text-green-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Check size={11} className="stroke-[3]" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-gray-900 leading-snug">{item.matchedProduct.name}</p>
                                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                                    {item.matchedProduct.sku} • ₹{item.matchedProduct.price} • {item.matchedProduct.packaging || '15 Tablets / Strip'}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveParsedItem(item.id)}
                                className="text-gray-400 hover:text-red-600 transition-all cursor-pointer p-0.5 rounded hover:bg-gray-100"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-gray-150">
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Quantity ({item.unit}):</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(item.id, -1)}
                                  className="w-5.5 h-5.5 border border-gray-250 text-gray-600 hover:border-green-600 hover:text-green-600 rounded flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                                >
                                  <Minus size={9} className="stroke-[3]" />
                                </button>
                                <span className="text-xs font-bold text-gray-800 w-6 text-center">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(item.id, 1)}
                                  className="w-5.5 h-5.5 border border-gray-250 text-gray-600 hover:border-green-600 hover:text-green-600 rounded flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                                >
                                  <Plus size={9} className="stroke-[3]" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <div className="w-5 h-5 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <AlertTriangle size={11} className="stroke-[3]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-gray-900 leading-snug truncate">"{item.name}"</p>
                                  <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Not found in inventory</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveParsedItem(item.id)}
                                className="text-gray-400 hover:text-red-600 transition-all cursor-pointer p-0.5 rounded hover:bg-gray-100"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            {item.suggestions && item.suggestions.length > 0 && (
                              <div className="mt-2.5">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Did you mean:</span>
                                <div className="flex flex-wrap gap-1.5 font-sans">
                                  {item.suggestions.map((p) => (
                                    <button
                                      key={p._id}
                                      type="button"
                                      onClick={() => handleMapProduct(item.id, p)}
                                      className="px-2 py-1 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 text-[9px] font-bold rounded-lg transition-all cursor-pointer"
                                    >
                                      {p.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="mt-2.5">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Select from inventory:</span>
                              <select
                                value=""
                                onChange={(e) => {
                                  const prod = products.find(p => p._id === e.target.value);
                                  if (prod) handleMapProduct(item.id, prod);
                                }}
                                className="w-full px-2 py-1.5 text-xs bg-white border border-gray-255 rounded-lg text-gray-700 focus:border-green-600 focus:outline-none font-sans cursor-pointer"
                              >
                                <option value="">Choose item...</option>
                                {products.map((p) => (
                                  <option key={p._id} value={p._id}>
                                    {p.name} ({p.sku}) - ₹{p.price}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 font-sans">
                  <button
                    type="button"
                    onClick={closeScanModal}
                    className="px-4 py-2 border border-gray-250 hover:border-gray-300 text-gray-600 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmResolvedItems}
                    disabled={parsedItemsToResolve.filter(item => item.matchedProduct).length === 0}
                    className="px-4 py-2 bg-green-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5 font-sans"
                  >
                    <Check size={13} className="stroke-[3]" />
                    Add {parsedItemsToResolve.filter(item => item.matchedProduct).length} Items to Cart
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex border-b border-gray-100 mb-6 font-sans">
                  <button
                    type="button"
                    onClick={() => { setActiveScanTab('document'); clearRecording(); }}
                    className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      activeScanTab === 'document'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Upload size={16} />
                    Document Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveScanTab('voice')}
                    className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      activeScanTab === 'voice'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Mic size={16} />
                    Voice Dictation
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveScanTab('audio-file'); clearRecording(); }}
                    className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      activeScanTab === 'audio-file'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Volume2 size={16} />
                    Upload Audio
                  </button>
                </div>

                {activeScanTab === 'document' && (
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
                        ? 'border-green-600 bg-green-50/50 shadow-inner'
                        : 'border-2 border-dashed border-[var(--border-soft)] bg-[var(--bg-card)] hover:border-green-600'
                    }`}
                  >
                    <div className="space-y-4 font-sans">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto">
                        <Upload size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Drag & Drop Prescription Here</p>
                        <p className="text-xs text-gray-500">Supports Jpeg, Png, or Pdf</p>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-green-600 hover:text-green-600 text-gray-700 rounded-lg transition-all text-xs font-semibold cursor-pointer">
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
                        <label className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 transition-all text-xs font-semibold cursor-pointer">
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

                {activeScanTab === 'voice' && (
                  <div>
                    {isRecording ? (
                      <div className="flex flex-col items-center justify-center py-6 space-y-4 font-sans">
                        <div className="relative flex items-center justify-center">
                          <div className="absolute w-24 h-24 bg-red-100 rounded-full animate-ring" />
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="relative z-10 w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-all shadow-lg cursor-pointer animate-pulse"
                          >
                            <StopCircle size={28} />
                          </button>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-red-600 animate-pulse">Recording...</p>
                          <p className="text-2xl font-mono font-bold text-gray-800 mt-1">
                            {(() => {
                              const m = Math.floor(recordingDuration / 60);
                              const s = recordingDuration % 60;
                              return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                            })()} / 01:00
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 h-8">
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
                            Tap the microphone to dictate medicine names, quantity, and customer mobile details.
                          </p>
                        </div>
                        <div className="bg-green-50 border border-green-100 rounded-xl p-3 max-w-xs text-left">
                          <p className="text-[10px] uppercase tracking-wider text-green-700 font-bold">Try saying</p>
                          <p className="text-xs text-green-800 font-medium mt-1 leading-relaxed">
                            "Paracetamol 2 strips, Ibuprofen 1 strip, for Ramesh mobile 9876543210"
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
                          <p className="text-xs text-gray-500 mt-1">Listen to verify or submit to parse bill</p>
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
                )}

                {activeScanTab === 'audio-file' && (
                  <div
                    onDragEnter={(e) => { e.preventDefault(); setAudioDragActive(true); }}
                    onDragOver={(e) => { e.preventDefault(); setAudioDragActive(true); }}
                    onDragLeave={() => setAudioDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setAudioDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const file = e.dataTransfer.files[0];
                        if (file.type.startsWith('audio/')) {
                          handleScanBill(file);
                        } else {
                          showToast('Please upload a valid audio file.', 'error');
                        }
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                      audioDragActive
                        ? 'border-green-600 bg-green-50/50 shadow-inner'
                        : 'border-2 border-dashed border-[var(--border-soft)] bg-[var(--bg-card)] hover:border-green-600'
                    }`}
                  >
                    <div className="space-y-4 font-sans">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto">
                        <Volume2 size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Drag & Drop Audio Here</p>
                        <p className="text-xs text-gray-500">Supports Mp3, Wav, M4a, Webm, or Ogg</p>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-green-600 hover:text-green-600 text-gray-700 rounded-lg transition-all text-xs font-semibold cursor-pointer">
                          <Upload size={13} />
                          Add Audio File
                          <input
                            type="file"
                            accept="audio/*"
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
            )}
          </div>
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
              type="button"
              onClick={() => setToast(null)}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-all cursor-pointer ml-2"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      {showBillingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowBillingModal(false)}
          />
          <div ref={billingModalRef} className="relative bg-white border-2 border-green-100 rounded-3xl p-6 w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl shadow-green-100/50 transform transition-all animate-toast overflow-hidden">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="p-1.5 bg-green-50 text-green-600 rounded-lg">
                    <FileText size={18} />
                  </span>
                  {selectedBill ? `Invoice - ${selectedBill.invoiceNumber}` : `${customer?.name}'s Bill History`}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedBill ? 'Detailed summary of selected transaction' : 'List of all past sales transactions'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBillingModal(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {selectedBill ? (
                <div className="animate-fade-in flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4 bg-green-50/50 p-4 rounded-2xl border border-green-50">
                    <div>
                      <h3 className="font-bold text-base text-green-700">Spren Pharmacy</h3>
                      <p className="text-[10px] text-gray-500 mt-1">Invoice Number: {selectedBill.invoiceNumber}</p>
                      <p className="text-[10px] text-gray-500">Date: {new Date(selectedBill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-semibold">Paid</span>
                      <p className="text-[10px] text-gray-500 mt-2.5">Payment: {selectedBill.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-2xl overflow-hidden mb-4">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-[10px] font-semibold border-b border-gray-100">
                          <th className="px-4 py-2.5">Item</th>
                          <th className="px-4 py-2.5 text-right">Price</th>
                          <th className="px-4 py-2.5 text-center">Quantity</th>
                          <th className="px-4 py-2.5 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs">
                        {selectedBill.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-4 py-2.5 font-medium text-gray-900">
                              {item.product?.name || "Deleted Product"} {item.unit && `(${item.unit})`}
                            </td>
                            <td className="px-4 py-2.5 text-right text-gray-500">
                              ₹{item.price.toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5 text-center font-medium text-gray-900">
                              {item.quantity} {item.unit === 'Tablet' ? 'Tablets' : 'Strips'}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="w-full max-w-xs ml-auto space-y-1.5 border-t border-gray-100 pt-3 mb-4">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Taxable value</span>
                      <span className="font-semibold text-gray-900">₹{Math.round(selectedBill.totalAmount / 1.18).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Cgst @ 9%</span>
                      <span className="font-semibold text-gray-900">₹{Math.round((selectedBill.totalAmount - Math.round(selectedBill.totalAmount / 1.18)) / 2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Sgst @ 9%</span>
                      <span className="font-semibold text-gray-900">₹{(selectedBill.totalAmount - Math.round(selectedBill.totalAmount / 1.18) - Math.round((selectedBill.totalAmount - Math.round(selectedBill.totalAmount / 1.18)) / 2)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-dashed border-gray-100 pt-2">
                      <span>Grand total</span>
                      <span className="text-base text-green-600 font-bold">₹{selectedBill.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
                    {!isLastBillView && (
                      <button
                        type="button"
                        onClick={() => setSelectedBill(null)}
                        className="px-3.5 py-1.5 bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                      >
                        Back to List
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handlePrintPastInvoice(selectedBill._id)}
                      className="px-3.5 py-1.5 bg-gray-50 border border-gray-200 hover:border-green-600 text-gray-700 hover:text-green-700 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ml-auto"
                    >
                      <Printer size={12} />
                      Print
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadPastInvoice(selectedBill._id, selectedBill.invoiceNumber)}
                      className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Download size={12} />
                      Download PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in flex flex-col h-full">
                  {loadingBills ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : customerBills.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-12">
                      <FileText size={36} className="text-gray-300 mb-2" />
                      <p className="text-sm font-medium">No past bills found for this customer.</p>
                    </div>
                  ) : (
                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500 text-xs font-semibold border-b border-gray-100">
                            <th className="px-4 py-3">Invoice</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Items</th>
                            <th className="px-4 py-3">Payment</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                          {customerBills.map((bill) => (
                            <tr key={bill._id} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3 font-semibold text-gray-900">
                                {bill.invoiceNumber}
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                                {bill.items.map(item => item.product?.name || "Deleted Product").join(', ')}
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
                                  {bill.paymentMethod}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-green-600">
                                ₹{bill.totalAmount.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => setSelectedBill(bill)}
                                  className="p-1.5 bg-gray-50 border border-gray-200 hover:border-green-600 text-gray-700 hover:text-green-700 rounded-lg transition-all cursor-pointer"
                                >
                                  <Eye size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <input
        ref={scanInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleScanBill(e.target.files[0]);
          }
        }}
        className="hidden"
      />
    </div>
  );
};

export default Billing;
