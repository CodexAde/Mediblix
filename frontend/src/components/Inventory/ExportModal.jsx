import { X, FileText, Table } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ExportModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "Spren_Inventory.xlsx");
    onClose();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("Spren", 14, 22);
    
    doc.setFontSize(14);
    doc.text("Inventory Report", 14, 32);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40);

    const tableColumn = ["SKU", "Name", "Category", "Qty", "Price", "Status"];
    const tableRows = [];

    data.forEach((item) => {
      const rowData = [
        item.sku,
        item.name,
        item.category,
        item.quantity,
        `$${item.price}`,
        item.status,
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [66, 66, 66] },
    });

    doc.save("Spren_Inventory.pdf");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Export Inventory</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={exportToExcel}
            className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-green-500/50 transition-all group"
          >
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Table className="text-green-500" size={24} />
            </div>
            <span className="text-white font-medium">Excel Sheet</span>
            <span className="text-xs text-gray-400 mt-1">.xlsx format</span>
          </button>

          <button
            onClick={exportToPDF}
            className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-red-500/50 transition-all group"
          >
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText className="text-red-500" size={24} />
            </div>
            <span className="text-white font-medium">PDF Document</span>
            <span className="text-xs text-gray-400 mt-1">.pdf format</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
