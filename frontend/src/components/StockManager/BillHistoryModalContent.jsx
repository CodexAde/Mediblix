import { useState, useEffect } from 'react';
import { Search, Package, Printer, Download, ArrowLeft } from 'lucide-react';
import saleService from '../../services/saleService';

const BillHistoryModalContent = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        const data = await saleService.getSales({});
        setBills(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  const handlePrint = async (saleId) => {
    try {
      const blob = await saleService.generateInvoice(saleId);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownload = async (saleId, invoiceNumber) => {
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
    }
  };

  const filteredBills = bills.filter(bill =>
    bill.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bill.customer?.name && bill.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTaxBreakdown = (totalAmount) => {
    const taxableValue = Math.round(totalAmount / 1.18);
    const totalGst = totalAmount - taxableValue;
    const cgst = Math.round(totalGst / 2);
    const sgst = totalGst - cgst;
    return { taxableValue, cgst, sgst };
  };

  if (selectedBill) {
    const { taxableValue, cgst, sgst } = getTaxBreakdown(selectedBill.totalAmount);
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-bold text-xl text-green-600">Mediblix Pharmacy</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Invoice number: {selectedBill.invoiceNumber}</p>
            <p className="text-xs text-[var(--text-secondary)]">Date: {new Date(selectedBill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-semibold">Paid</span>
            <p className="text-xs text-[var(--text-secondary)] mt-2">Payment: {selectedBill.paymentMethod}</p>
          </div>
        </div>

        <div className="border border-[var(--border-soft)] rounded-xl overflow-hidden mb-6">
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
            <span className="font-semibold">₹{taxableValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Cgst @ 9%</span>
            <span className="font-semibold">₹{cgst.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Sgst @ 9%</span>
            <span className="font-semibold">₹{sgst.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-[var(--text-primary)] border-t border-dashed border-[var(--border-soft)] pt-2">
            <span>Grand total</span>
            <span className="text-lg text-green-600 font-bold">₹{selectedBill.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[var(--border-soft)]">
          <button
            type="button"
            onClick={() => setSelectedBill(null)}
            className="px-4 py-2 bg-gray-50 border border-[var(--border-soft)] hover:border-gray-400 text-gray-700 text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft size={16} />
            Back to history
          </button>
          <button
            type="button"
            onClick={() => handlePrint(selectedBill._id)}
            className="px-4 py-2 bg-gray-50 border border-[var(--border-soft)] hover:border-green-600 text-gray-700 hover:text-green-700 text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
          >
            <Printer size={14} />
            Print
          </button>
          <button
            type="button"
            onClick={() => handleDownload(selectedBill._id, selectedBill.invoiceNumber)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Download size={14} />
            Download Pdf
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by invoice number or customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-green-600 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-[var(--text-secondary)] py-12">
          <Package size={36} className="text-gray-300 mb-2" />
          <p className="text-sm font-medium">No past bills found.</p>
        </div>
      ) : (
        <div className="border border-[var(--border-soft)] rounded-xl overflow-hidden max-h-[50vh] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[var(--text-secondary)] text-xs font-semibold border-b border-[var(--border-soft)]">
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)] text-sm">
              {filteredBills.map((bill) => (
                <tr key={bill._id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                    {bill.invoiceNumber}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-[var(--text-primary)]">
                      {bill.customer?.name || "Walk-in"}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {bill.customer?.mobile}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {bill.paymentMethod}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--text-primary)]">
                    ₹{bill.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedBill(bill)}
                      className="px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 text-xs font-semibold rounded-md transition-all cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BillHistoryModalContent;
