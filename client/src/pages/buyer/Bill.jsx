import { FileDown, Store, User, Calendar, FileText, Mail, Phone } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import { getOrderForInvoice } from '../../api/order';
import useLoaderStore from '../../store/loader';
import useAuthStore from '../../store/auth';
import { toast } from 'react-hot-toast';

const Bill = () => {
  const { state } = useLocation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const orderId = state?.orderId;
  const [orderData, setOrderData] = useState(null);
  const { startLoading, stopLoading } = useLoaderStore();

  useEffect(() => {
    if (!orderId) return;

    const fetchDetails = async () => {
      startLoading('fetchInvoice');
      try {
        const result = await getOrderForInvoice(orderId);
        if (result.success) {
          setOrderData(result.data);
        } else {
          toast.error(result.message || 'Failed to fetch invoice');
          navigate(`${user?.role === "seller" ? "/seller/order" : "/buyer/order"}`);
        }
      } catch (error) {
        toast.error('Error fetching invoice details');
        navigate(`${user?.role === "seller" ? "/seller/order" : "/buyer/order"}`);
      } finally {
        stopLoading();
      }
    };
    fetchDetails();
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">No Invoice Data</h2>
          <button
            onClick={() => navigate(`${user?.role === "seller" ? "/seller/order" : "/buyer/order"}`)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Go to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading invoice...</p>
        </div>
      </div>
    );
  }

  const calculateProductSubtotal = (product) => {
    const p = product.priceDistribution;
    const qty = product.quantity;
    const priceAfterDiscount = p.basePrice - p.discount;
    return (priceAfterDiscount + p.productCharge) * qty;
  };

  const totalProductSubtotal = orderData.products.reduce((sum, product) => {
    return sum + calculateProductSubtotal(product);
  }, 0);

  const totalPlatformFee = orderData.products.reduce((sum, product) => {
    return sum + (product.priceDistribution.platformFee.amount * product.quantity);
  }, 0);

  const totalProductTax = orderData.products.reduce((sum, product) => {
    return sum + (product.priceDistribution.tax.amount * product.quantity);
  }, 0);

  const platformFeeGST = totalPlatformFee * 0.18;

  const generatePDF = () => {
    const doc = new jsPDF({
      putOnlyUsedFonts: true,
      compress: true
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', margin, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(orderData.storeId.name, margin, 30);
    doc.text(`Invoice: ${orderData.orderNumber}`, pageWidth - margin, 20, { align: 'right' });
    doc.text(`Date: ${new Date(orderData.createdAt).toLocaleDateString('en-IN')}`, pageWidth - margin, 28, { align: 'right' });
    doc.text(`Status: ${orderData.paymentStatus?.toUpperCase() || 'PENDING'}`, pageWidth - margin, 36, { align: 'right' });

    let yPos = 60;

    doc.setTextColor(0, 0, 0);
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPos, 85, 35, 'F');
    doc.rect(pageWidth - margin - 85, yPos, 85, 35, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('FROM', margin + 3, yPos + 7);
    doc.text('BILL TO', pageWidth - margin - 82, yPos + 7);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(orderData.storeId.name, margin + 3, yPos + 14);
    doc.text(orderData.storeId.address || 'Store Address', margin + 3, yPos + 20, { maxWidth: 80 });
    doc.text(`${orderData.storeId.email || 'N/A'}`, margin + 3, yPos + 26);
    doc.text(`${orderData.storeId.phone || 'N/A'}`, margin + 3, yPos + 32);

    doc.text(orderData.addressId.name || 'Customer', pageWidth - margin - 82, yPos + 14);
    const customerAddress = `${orderData.addressId.city}, ${orderData.addressId.state} - ${orderData.addressId.pincode}`;
    doc.text(customerAddress, pageWidth - margin - 82, yPos + 20, { maxWidth: 80 });
    if (orderData.addressId.landmark) {
      doc.text(orderData.addressId.landmark, pageWidth - margin - 82, yPos + 26, { maxWidth: 80 });
    }

    yPos += 50;

    doc.setFillColor(37, 99, 235);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUCT', margin + 3, yPos + 7);
    doc.text('QTY', margin + 75, yPos + 7, { align: 'center' });
    doc.text('PRICE', margin + 100, yPos + 7, { align: 'right' });
    doc.text('DISCOUNT', margin + 125, yPos + 7, { align: 'right' });
    doc.text('TOTAL', pageWidth - margin - 3, yPos + 7, { align: 'right' });

    yPos += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    orderData.products.forEach((product, index) => {
      const p = product.priceDistribution;
      const qty = product.quantity;
      const unit = product.productId.unit || '';

      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');
      }

      const productName = product.productId.title.length > 30
        ? product.productId.title.substring(0, 30) + '...'
        : product.productId.title;

      doc.text(productName, margin + 3, yPos + 2);
      doc.text(qty + unit, margin + 75, yPos + 2, { align: 'center' });
      doc.text('Rs ' + (p.basePrice * qty).toFixed(2), margin + 100, yPos + 2, { align: 'right' });

      if (p.discount > 0) {
        doc.setTextColor(220, 38, 38);
        doc.text('-Rs ' + (p.discount * qty).toFixed(2), margin + 125, yPos + 2, { align: 'right' });
        doc.setTextColor(0, 0, 0);
      } else {
        doc.text('-', margin + 125, yPos + 2, { align: 'right' });
      }

      doc.setFont('helvetica', 'bold');
      doc.text('Rs ' + (product.finalPrice * qty).toFixed(2), pageWidth - margin - 3, yPos + 2, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      yPos += 10;

      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 30;
      }
    });

    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 10;
    doc.setFontSize(9);

    const summaryX = pageWidth - margin - 70;

    doc.text('Subtotal:', summaryX, yPos);
    doc.text('Rs ' + totalProductSubtotal.toFixed(2), pageWidth - margin - 3, yPos, { align: 'right' });
    yPos += 7;

    if (orderData.deliveryCharge.amount > 0) {
      doc.text('Delivery Charge:', summaryX, yPos);
      doc.text('Rs ' + orderData.deliveryCharge.amount.toFixed(2), pageWidth - margin - 3, yPos, { align: 'right' });
      yPos += 7;
    } else {
      doc.text('Delivery Charge:', summaryX, yPos);
      doc.setTextColor(22, 163, 74);
      doc.text('FREE', pageWidth - margin - 3, yPos, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      yPos += 7;
    }

    if (totalPlatformFee > 0) {
      doc.text('Platform Fee:', summaryX, yPos);
      doc.text('Rs ' + totalPlatformFee.toFixed(2), pageWidth - margin - 3, yPos, { align: 'right' });
      yPos += 7;
    }

    if (totalProductTax > 0) {
      doc.text('Tax & GST:', summaryX, yPos);
      doc.text('Rs ' + (totalProductTax + orderData.deliveryCharge.gst.amount + platformFeeGST).toFixed(2), pageWidth - margin - 3, yPos, { align: 'right' });
      yPos += 7;
    }

    yPos += 2;
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(1);
    doc.line(summaryX - 5, yPos, pageWidth - margin, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('GRAND TOTAL:', summaryX, yPos);
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('Rs ' + orderData.totalAmount.toFixed(2), pageWidth - margin - 3, yPos, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    const footerY = pageHeight - 25;
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for shopping with DigiDukaan', pageWidth / 2, footerY + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('For support, contact: support@digidukaan.com', pageWidth / 2, footerY + 14, { align: 'center' });

    doc.save(`Invoice_${orderData.orderNumber}.pdf`);
    setTimeout(() => {
      toast.success('Invoice downloaded successfully!');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 pt-30 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Invoice</h1>
          <p className="text-gray-600 dark:text-gray-400">Order details and breakdown</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-neutral-800">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Store className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">{orderData.storeId.name}</h2>
                </div>
                <p className="text-indigo-100 text-sm">{orderData.storeId.address || 'Store Address'}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <FileText className="w-5 h-5" />
                  <p className="text-lg font-semibold">{orderData.orderNumber}</p>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Calendar className="w-4 h-4" />
                  <p className="text-sm text-indigo-100">{new Date(orderData.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-neutral-950 rounded-lg p-5 border border-gray-200 dark:border-neutral-800">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Store className="w-5 h-5 text-indigo-600" />
                  From
                </h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-semibold text-gray-900 dark:text-white">{orderData.storeId.name}</p>
                  <p>{orderData.storeId.address || 'Store Address'}</p>
                  <p className='flex justify-start items-center gap-2'><Mail size={14} /> {orderData.storeId.email || 'N/A'}</p>
                  <p className='flex justify-start items-center gap-2'><Phone size={14} /> {orderData.storeId.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-5 border border-indigo-200 dark:border-indigo-900">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Bill To
                </h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-semibold text-gray-900 dark:text-white">{orderData.addressId.name || 'Customer'}</p>
                  <p>{orderData.addressId.city}, {orderData.addressId.state} - {orderData.addressId.pincode}</p>
                  {orderData.addressId.landmark && (
                    <p>Landmark: {orderData.addressId.landmark}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Delivery: within {orderData.deliveryCharge.deliverWithInDays} days
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
                <thead>
                  <tr className="bg-indigo-600 text-white">
                    <th className="px-3 py-3 text-left text-xs font-semibold min-w-[120px]">Product</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold min-w-[70px]">Qty</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold min-w-[90px]">Base Price</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold min-w-[80px]">Discount</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold min-w-[90px]">Subtotal</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold min-w-[90px]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                  {orderData.products.map((product, index) => {
                    const p = product.priceDistribution;
                    const qty = product.quantity;
                    const unit = product.productId.unit || 'N/A';
                    const finalPricePerUnit = (product.finalPrice).toFixed(2);
                    const finalTotal = (product.finalPrice * qty).toFixed(2);
                    const subtotal = calculateProductSubtotal(product).toFixed(2);

                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-neutral-950' : 'bg-white dark:bg-neutral-900'}>
                        <td className="px-3 py-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{product.productId.title}</p>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="px-2 py-0.5 bg-gray-200 dark:bg-neutral-800 rounded text-xs font-medium text-gray-900 dark:text-white">
                            {qty}{unit}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <p className="text-sm text-gray-900 dark:text-white">₹{(p.basePrice * qty).toFixed(2)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">₹{p.basePrice.toFixed(2)}/{unit}</p>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <p className={`text-sm font-medium ${p.discount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                            {p.discount > 0 ? `-₹${(p.discount * qty).toFixed(2)}` : '-'}
                          </p>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">₹{subtotal}</p>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">₹{finalTotal}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">₹{finalPricePerUnit}/{unit}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-6">
              <div className="w-full md:w-80 bg-gray-50 dark:bg-neutral-950 rounded-lg p-5 border border-gray-200 dark:border-neutral-800">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Products Subtotal:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₹{totalProductSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Delivery Charge:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {orderData.deliveryCharge.amount > 0 ? `₹${orderData.deliveryCharge.amount.toFixed(2)}` : <span className="text-green-600">FREE</span>}
                    </span>
                  </div>
                  {totalPlatformFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Platform Fee Total:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">₹{totalPlatformFee.toFixed(2)}</span>
                    </div>
                  )}
                  {totalProductTax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Product Tax:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">₹{totalProductTax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-indigo-200 dark:border-indigo-800 pt-2 flex justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">Grand Total:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">₹{orderData.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="pt-2">
                    <p className={`text-xs font-medium ${orderData.paymentStatus === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
                      Payment Status: {orderData.paymentStatus?.toUpperCase() || 'PENDING'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={generatePDF}
                className="flex cursor-pointer items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <FileDown className="w-5 h-5" />
                Download Invoice PDF
              </button>
              <button
                onClick={() => navigate(`${user?.role === "seller" ? "/seller/order" : "/buyer/order"}`)}
                className="flex cursor-pointer items-center gap-2 bg-gray-600 dark:bg-neutral-700 hover:bg-gray-700 dark:hover:bg-neutral-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Back to Orders
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-3">
            <p className="text-sm italic">Thank you for shopping with us – DigiDukaan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bill;