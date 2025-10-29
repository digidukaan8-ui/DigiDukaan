<meta name='viewport' content='width=device-width, initial-scale=1'/><script>import React from 'react';
import { FileDown, Store, User, Calendar, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const BillGenerator = ({ billData }) => {
  // Default data for demo purposes
  const defaultData = {
    store: {
      name: "DigiDukaan Mart",
      address: "123 Market Road, Mumbai, India",
      email: "store@digidukaan.com",
      phone: "+91 9876543210",
      gstNumber: "27ABCDE1234F1Z5"
    },
    buyer: {
      name: "Khalid Khilji",
      address: "12 Noor Street, Bandra, Mumbai",
      email: "khalid@example.com",
      phone: "+91 9999999999"
    },
    products: [
      { name: "Wireless Mouse", quantity: 2, price: 499 },
      { name: "Mechanical Keyboard", quantity: 1, price: 2899 },
      { name: "USB-C Cable", quantity: 3, price: 299 },
      { name: "Laptop Stand", quantity: 1, price: 1499 }
    ],
    billDate: "2025-10-28",
    billId: "INV-2025-0101"
  };

  const data = billData || defaultData;

  // Calculate totals
  const calculateSubtotal = () => {
    return data.products.reduce((sum, product) => {
      return sum + (product.quantity * product.price);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const gstRate = 0.18; // 18% GST
  const gstAmount = data.store.gstNumber ? subtotal * gstRate : 0;
  const grandTotal = subtotal + gstAmount;

  // Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Colors
    const primaryColor = [79, 70, 229]; // Indigo
    const secondaryColor = [100, 116, 139]; // Slate
    const lightGray = [241, 245, 249];

    // Header Section
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(data.store.name, 20, 25);

    // Invoice Details (Top Right)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice: ${data.billId}`, pageWidth - 20, 20, { align: 'right' });
    doc.text(`Date: ${new Date(data.billDate).toLocaleDateString('en-IN')}`, pageWidth - 20, 27, { align: 'right' });

    let yPos = 50;

    // Store Details Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('From:', 20, yPos);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(data.store.name, 20, yPos + 7);
    doc.text(data.store.address, 20, yPos + 14);
    doc.text(`Email: ${data.store.email}`, 20, yPos + 21);
    doc.text(`Phone: ${data.store.phone}`, 20, yPos + 28);
    if (data.store.gstNumber) {
      doc.text(`GST No: ${data.store.gstNumber}`, 20, yPos + 35);
      yPos += 42;
    } else {
      yPos += 35;
    }

    // Buyer Details Section
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, yPos);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(data.buyer.name, 20, yPos + 7);
    doc.text(data.buyer.address, 20, yPos + 14);
    doc.text(`Email: ${data.buyer.email}`, 20, yPos + 21);
    doc.text(`Phone: ${data.buyer.phone}`, 20, yPos + 28);

    yPos += 40;

    // Product Table
    const tableData = data.products.map(product => [
      product.name,
      product.quantity.toString(),
      `₹${product.price.toFixed(2)}`,
      `₹${(product.quantity * product.price).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Product Name', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Summary Section
    const summaryX = pageWidth - 70;
    
    doc.setFillColor(...lightGray);
    doc.rect(summaryX - 10, yPos - 5, 60, data.store.gstNumber ? 30 : 20, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', summaryX, yPos);
    doc.text(`₹${subtotal.toFixed(2)}`, summaryX + 50, yPos, { align: 'right' });

    if (data.store.gstNumber) {
      yPos += 7;
      doc.text(`GST (${gstRate * 100}%):`, summaryX, yPos);
      doc.text(`₹${gstAmount.toFixed(2)}`, summaryX + 50, yPos, { align: 'right' });
    }

    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Grand Total:', summaryX, yPos);
    doc.text(`₹${grandTotal.toFixed(2)}`, summaryX + 50, yPos, { align: 'right' });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFillColor(...primaryColor);
    doc.rect(0, footerY - 5, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for shopping with us – DigiDukaan', pageWidth / 2, footerY + 5, { align: 'center' });

    // Save PDF
    doc.save(`Invoice_${data.billId}_${data.buyer.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">Invoice Generator</h1>
          <p className="text-slate-600">Generate professional invoices instantly</p>
        </div>

        {/* Bill Preview Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Store className="w-8 h-8" />
                  <h2 className="text-3xl font-bold">{data.store.name}</h2>
                </div>
                <p className="text-indigo-100 text-sm">{data.store.address}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <FileText className="w-5 h-5" />
                  <p className="text-lg font-semibold">{data.billId}</p>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Calendar className="w-4 h-4" />
                  <p className="text-sm text-indigo-100">{new Date(data.billDate).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Store and Buyer Details */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Store Details */}
              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Store className="w-5 h-5 text-indigo-600" />
                  From
                </h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p className="font-semibold text-slate-800">{data.store.name}</p>
                  <p>{data.store.address}</p>
                  <p>📧 {data.store.email}</p>
                  <p>📱 {data.store.phone}</p>
                  {data.store.gstNumber && (
                    <p className="font-medium text-slate-700">GST: {data.store.gstNumber}</p>
                  )}
                </div>
              </div>

              {/* Buyer Details */}
              <div className="bg-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Bill To
                </h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p className="font-semibold text-slate-800">{data.buyer.name}</p>
                  <p>{data.buyer.address}</p>
                  <p>📧 {data.buyer.email}</p>
                  <p>📱 {data.buyer.phone}</p>
                </div>
              </div>
            </div>

            {/* Product Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-indigo-600 text-white">
                    <th className="text-left py-3 px-4 font-semibold">Product Name</th>
                    <th className="text-center py-3 px-4 font-semibold">Qty</th>
                    <th className="text-right py-3 px-4 font-semibold">Price</th>
                    <th className="text-right py-3 px-4 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.map((product, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="py-3 px-4 text-slate-800">{product.name}</td>
                      <td className="py-3 px-4 text-center text-slate-600">{product.quantity}</td>
                      <td className="py-3 px-4 text-right text-slate-600">₹{product.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">
                        ₹{(product.quantity * product.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Section */}
            <div className="flex justify-end mb-8">
              <div className="w-full md:w-80 bg-slate-50 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {data.store.gstNumber && (
                    <div className="flex justify-between text-slate-700">
                      <span>GST ({(gstRate * 100).toFixed(0)}%):</span>
                      <span className="font-semibold">₹{gstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-indigo-200 pt-3 flex justify-between text-lg font-bold text-indigo-900">
                    <span>Grand Total:</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="flex justify-center">
              <button
                onClick={generatePDF}
                className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <FileDown className="w-5 h-5" />
                Download Invoice PDF
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-4">
            <p className="text-sm italic">Thank you for shopping with us – DigiDukaan ✨</p>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-3">Usage Instructions</h3>
          <div className="text-sm text-slate-600 space-y-2">
            <p>• This component accepts a <code className="bg-slate-100 px-2 py-1 rounded">billData</code> prop with store, buyer, products, billDate, and billId.</p>
            <p>• Click "Download Invoice PDF" to generate and download a professional PDF invoice.</p>
            <p>• GST is automatically calculated at 18% if the store has a GST number.</p>
            <p>• The component is fully reusable across your application.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillGenerator;</script>
