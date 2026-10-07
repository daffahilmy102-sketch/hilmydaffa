import React, { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  LogOut, 
  Search, 
  Filter, 
  AlertTriangle,
  Truck,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  DollarSign,
  X
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatRupiah, formatDate } from '../lib/formatters';
import { Product, Order, Customer, ProductCategory, OrderStatus, OrderPaymentStatus } from '../types';

export const AdminPanel: React.FC<{ onExitAdmin: () => void }> = ({ onExitAdmin }) => {
  const {
    products,
    orders,
    customers,
    updateStock,
    updateProduct,
    addProduct,
    deleteProduct,
    resetCatalogToDefault,
    approvePayment,
    rejectPayment,
    updateOrderStatus,
    adminUser,
    logoutAdmin
  } = useStore();

  const [activeTab, setActiveTab] = useState<'reports' | 'approvals' | 'products' | 'orders' | 'customers'>('approvals');
  
  // Modal states
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('Nominal pembayaran tidak sesuai dengan total tagihan');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);
  const [shippingResiInput, setShippingResiInput] = useState('');

  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategory>('Living & Decor');
  const [prodPrice, setProdPrice] = useState(350000);
  const [prodStock, setProdStock] = useState(15);
  const [prodDesc, setProdDesc] = useState('');
  const [prodDimensions, setProdDimensions] = useState('');
  const [prodMaterial, setProdMaterial] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodBadge, setProdBadge] = useState('New Arrival');

  // Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // 1. SALES REPORT METRICS
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'approved' || o.orderStatus === 'completed' || o.orderStatus === 'processing' || o.orderStatus === 'shipped')
    .reduce((sum, o) => sum + o.total, 0);

  const totalCompletedOrders = orders.filter(o => o.paymentStatus === 'approved').length;
  const averageOrderValue = totalCompletedOrders > 0 ? Math.round(totalRevenue / totalCompletedOrders) : 0;
  
  // Calculate top selling products
  const productSalesMap: Record<string, { product: Product | undefined; quantity: number; revenue: number }> = {};
  orders.forEach(order => {
    if (order.paymentStatus === 'approved' || order.orderStatus === 'processing') {
      order.items.forEach(item => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            product: products.find(p => p.id === item.productId),
            quantity: 0,
            revenue: 0
          };
        }
        productSalesMap[item.productId].quantity += item.quantity;
        productSalesMap[item.productId].revenue += item.price * item.quantity;
      });
    }
  });

  const topSellingList = Object.values(productSalesMap)
    .filter(item => item.product !== undefined)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Category revenue breakdown
  const categoryRevenue: Record<ProductCategory, number> = {
    'Living & Decor': 0,
    'Kitchen & Dining': 0,
    'Bed & Bath': 0
  };
  orders.forEach(order => {
    if (order.paymentStatus === 'approved' || order.orderStatus === 'processing') {
      order.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod && categoryRevenue[prod.category] !== undefined) {
          categoryRevenue[prod.category] += item.price * item.quantity;
        }
      });
    }
  });

  // Approvals Filter
  const pendingApprovals = orders.filter(o => o.paymentStatus === 'proof_submitted');
  const processedApprovals = orders.filter(o => o.paymentStatus === 'approved' || o.paymentStatus === 'rejected');

  const handleApprove = async (orderId: string) => {
    try {
      await approvePayment(orderId);
      alert('Pembayaran pesanan berhasil disetujui! Status berubah menjadi "Diproses" di Firestore.');
    } catch {
      alert('Gagal menyetujui pembayaran.');
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalOrder) return;
    try {
      await rejectPayment(rejectModalOrder.id, rejectReason);
      setRejectModalOrder(null);
      alert('Bukti pembayaran berhasil ditolak dengan catatan alasan untuk pelanggan.');
    } catch {
      alert('Gagal menolak pembayaran.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodDesc) return;

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: prodName,
          category: prodCategory,
          price: Number(prodPrice),
          stock: Number(prodStock),
          description: prodDesc,
          dimensions: prodDimensions,
          material: prodMaterial,
          imageUrl: prodImage || editingProduct.imageUrl,
          badge: prodBadge
        });
        alert('Produk berhasil diperbarui di Cloud Firestore!');
      } else {
        await addProduct({
          name: prodName,
          category: prodCategory,
          price: Number(prodPrice),
          stock: Number(prodStock),
          description: prodDesc,
          dimensions: prodDimensions,
          material: prodMaterial,
          imageUrl: prodImage || 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80',
          rating: 5.0,
          reviewsCount: 1,
          badge: prodBadge
        });
        alert('Produk baru berhasil ditambahkan ke Cloud Firestore!');
      }

      setIsAddingProduct(false);
      setEditingProduct(null);
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan produk.');
    }
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdPrice(prod.price);
    setProdStock(prod.stock);
    setProdDesc(prod.description);
    setProdDimensions(prod.dimensions || '');
    setProdMaterial(prod.material || '');
    setProdImage(prod.imageUrl);
    setProdBadge(prod.badge || '');
    setIsAddingProduct(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory('Living & Decor');
    setProdPrice(350000);
    setProdStock(15);
    setProdDesc('');
    setProdDimensions('');
    setProdMaterial('');
    setProdImage('');
    setProdBadge('New Arrival');
  };

  const handleUpdateShippingStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status, shippingResiInput || undefined);
      setSelectedOrderDetail(null);
      setShippingResiInput('');
      alert(`Status pesanan diperbarui menjadi "${status}".`);
    } catch {
      alert('Gagal memperbarui status pengiriman.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#1c1917] pb-16">
      
      {/* Top Admin Navigation Bar */}
      <header className="bg-[#1c1917] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-lg tracking-wide text-[#f4f1ea]">
              KOMOREBI · PANEL PENGELOLA
            </span>
            <span className="bg-[#8c6d52] text-white text-[10px] font-semibold uppercase px-2 py-0.5 rounded tracking-wider">
              {adminUser?.isDemo ? 'UTS Mode' : 'Cloud Firestore Real DB'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline text-[#a8a29e]">
              Halo, <strong className="text-white">{adminUser?.name || 'Admin'}</strong>
            </span>
            <button
              onClick={onExitAdmin}
              className="px-3 py-1.5 bg-[#292524] hover:bg-[#44403c] rounded text-[#f4f1ea] transition-colors cursor-pointer"
            >
              Lihat Webstore
            </button>
            <button
              onClick={async () => {
                await logoutAdmin();
                onExitAdmin();
              }}
              className="p-1.5 text-[#a8a29e] hover:text-white transition-colors cursor-pointer"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Sub-Header */}
        <div className="border-t border-[#292524] bg-[#24211e]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-1 py-1">
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'approvals' ? 'bg-[#fbfbf9] text-[#1c1917]' : 'text-[#d6cebf] hover:text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-[#8c6d52]" />
              <span>Approval Bukti Bayar</span>
              {pendingApprovals.length > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                  {pendingApprovals.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'reports' ? 'bg-[#fbfbf9] text-[#1c1917]' : 'text-[#d6cebf] hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#8c6d52]" />
              <span>Laporan Sales</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'products' ? 'bg-[#fbfbf9] text-[#1c1917]' : 'text-[#d6cebf] hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 text-[#8c6d52]" />
              <span>Data Produk & Stok</span>
              <span className="text-[10px] opacity-70">({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'orders' ? 'bg-[#fbfbf9] text-[#1c1917]' : 'text-[#d6cebf] hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-[#8c6d52]" />
              <span>Data Order & Riwayat</span>
              <span className="text-[10px] opacity-70">({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'customers' ? 'bg-[#fbfbf9] text-[#1c1917]' : 'text-[#d6cebf] hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-[#8c6d52]" />
              <span>Data Pelanggan</span>
              <span className="text-[10px] opacity-70">({customers.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* ========================================================= */}
        {/* TAB 1: APPROVAL BUKTI PEMBAYARAN                          */}
        {/* ========================================================= */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#1c1917]">
                  Persetujuan Bukti Pembayaran Pelanggan
                </h2>
                <p className="text-xs text-[#78716c] mt-0.5">
                  Tinjau dan verifikasi bukti transfer pelanggan sebelum pesanan diproses pengiriman.
                </p>
              </div>
              <span className="text-xs font-medium bg-[#f4f1ea] px-3 py-1 rounded-md border border-[#d6cebf] text-[#1c1917]">
                Menunggu Verifikasi: <strong>{pendingApprovals.length}</strong>
              </span>
            </div>

            {/* Pending Approvals Grid */}
            {pendingApprovals.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center border border-[#e7e2d7] space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-serif font-bold text-base text-[#1c1917]">
                  Semua Bukti Pembayaran Telah Diproses
                </h3>
                <p className="text-xs text-[#78716c] max-w-md mx-auto">
                  Tidak ada bukti transfer yang tertunda. Pelanggan baru yang mengunggah bukti pembayaran akan langsung muncul di sini secara real-time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pendingApprovals.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border-2 border-amber-300 p-5 shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between border-b border-[#f4f1ea] pb-3">
                      <div>
                        <span className="text-[11px] font-mono text-[#8c6d52] font-semibold">
                          {order.orderNumber}
                        </span>
                        <h4 className="text-sm font-bold text-[#1c1917] mt-0.5">
                          {order.customerName}
                        </h4>
                        <p className="text-xs text-[#78716c]">{order.customerEmail} · {order.customerPhone}</p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded">
                        Perlu Tindakan
                      </span>
                    </div>

                    {/* Order & Payment Summary */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-[#fbfbf9] p-3 rounded-lg border border-[#e7e2d7]">
                      <div>
                        <span className="text-[#78716c] text-[10px] block">Total Tagihan:</span>
                        <strong className="text-sm font-bold text-[#1c1917] tabular-nums">
                          {formatRupiah(order.total)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#78716c] text-[10px] block">Metode Pembayaran:</span>
                        <span className="font-medium text-[#1c1917]">{order.paymentMethod}</span>
                      </div>
                    </div>

                    {/* Receipt Image Thumbnail & Zoom */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-[#57534e] block">Bukti Pembayaran Pelanggan:</span>
                      {order.paymentProofUrl ? (
                        <div className="relative group rounded-lg overflow-hidden border border-[#d6cebf] bg-[#f4f1ea] max-h-52 flex items-center justify-center">
                          <img
                            src={order.paymentProofUrl}
                            alt="Bukti Transfer"
                            className="max-h-52 w-auto object-contain cursor-pointer"
                            onClick={() => setProofPreviewUrl(order.paymentProofUrl || null)}
                          />
                          <button
                            onClick={() => setProofPreviewUrl(order.paymentProofUrl || null)}
                            className="absolute bottom-2 right-2 px-2.5 py-1 bg-[#1c1917]/80 hover:bg-[#1c1917] text-white text-[11px] rounded flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Perbesar Bukti</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 bg-stone-50 border border-stone-200 rounded text-xs text-stone-500 italic">
                          Pelanggan belum melampirkan gambar bukti transfer.
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: Approve or Reject */}
                    <div className="pt-2 flex gap-3">
                      <button
                        onClick={() => handleApprove(order.id)}
                        className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-md shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Setujui Pembayaran (Lunas)</span>
                      </button>

                      <button
                        onClick={() => setRejectModalOrder(order)}
                        className="py-2.5 px-3 bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 font-semibold text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Tolak</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Recently Processed Approvals List */}
            {processedApprovals.length > 0 && (
              <div className="pt-6 border-t border-[#e7e2d7] space-y-3">
                <h3 className="font-serif font-bold text-base text-[#1c1917]">
                  Riwayat Verifikasi Bukti Terakhir
                </h3>
                <div className="bg-white rounded-xl border border-[#e7e2d7] overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#fbfbf9] text-[#78716c] border-b border-[#e7e2d7]">
                      <tr>
                        <th className="p-3">No. Pesanan</th>
                        <th className="p-3">Pelanggan</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status Verifikasi</th>
                        <th className="p-3">Bukti</th>
                        <th className="p-3">Catatan Penolakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f4f1ea]">
                      {processedApprovals.slice(0, 5).map(o => (
                        <tr key={o.id} className="hover:bg-stone-50">
                          <td className="p-3 font-mono font-medium">{o.orderNumber}</td>
                          <td className="p-3">{o.customerName}</td>
                          <td className="p-3 font-semibold tabular-nums">{formatRupiah(o.total)}</td>
                          <td className="p-3">
                            {o.paymentStatus === 'approved' ? (
                              <span className="text-emerald-700 font-semibold">✓ Disetujui (Lunas)</span>
                            ) : (
                              <span className="text-rose-600 font-semibold">✗ Ditolak</span>
                            )}
                          </td>
                          <td className="p-3">
                            {o.paymentProofUrl ? (
                              <button
                                onClick={() => setProofPreviewUrl(o.paymentProofUrl || null)}
                                className="text-[#8c6d52] underline cursor-pointer"
                              >
                                Lihat
                              </button>
                            ) : '-'}
                          </td>
                          <td className="p-3 text-[#78716c] italic">{o.rejectionReason || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: LAPORAN SALES                                      */}
        {/* ========================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#1c1917]">
                Laporan Penjualan & Analitik Toko
              </h2>
              <p className="text-xs text-[#78716c] mt-0.5">
                Data real-time yang diagregasi langsung dari transaksi Cloud Firestore.
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-[#e7e2d7] shadow-2xs">
                <div className="flex items-center justify-between text-[#78716c] mb-2">
                  <span className="text-xs font-medium">Total Pendapatan (Omset)</span>
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-bold font-serif text-[#1c1917] tabular-nums">
                  {formatRupiah(totalRevenue)}
                </div>
                <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                  {totalCompletedOrders} transaksi terverifikasi
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#e7e2d7] shadow-2xs">
                <div className="flex items-center justify-between text-[#78716c] mb-2">
                  <span className="text-xs font-medium">Total Pesanan Masuk</span>
                  <ShoppingCart className="w-4 h-4 text-[#8c6d52]" />
                </div>
                <div className="text-2xl font-bold font-serif text-[#1c1917] tabular-nums">
                  {orders.length}
                </div>
                <p className="text-[11px] text-[#78716c] mt-1">
                  Semua status transaksi
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#e7e2d7] shadow-2xs">
                <div className="flex items-center justify-between text-[#78716c] mb-2">
                  <span className="text-xs font-medium">Rata-Rata Nilai Order (AOV)</span>
                  <TrendingUp className="w-4 h-4 text-sky-700" />
                </div>
                <div className="text-2xl font-bold font-serif text-[#1c1917] tabular-nums">
                  {formatRupiah(averageOrderValue)}
                </div>
                <p className="text-[11px] text-[#78716c] mt-1">
                  Per keranjang checkout
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#e7e2d7] shadow-2xs">
                <div className="flex items-center justify-between text-[#78716c] mb-2">
                  <span className="text-xs font-medium">Basis Pelanggan</span>
                  <Users className="w-4 h-4 text-purple-700" />
                </div>
                <div className="text-2xl font-bold font-serif text-[#1c1917] tabular-nums">
                  {customers.length}
                </div>
                <p className="text-[11px] text-purple-700 mt-1 font-medium">
                  Pelanggan unik terdaftar
                </p>
              </div>
            </div>

            {/* Sales by Category & Top Selling Products */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Category Breakdown (5 cols) */}
              <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#e7e2d7] space-y-4">
                <h3 className="text-sm font-bold font-serif text-[#1c1917]">
                  Kontribusi Penjualan per Kategori
                </h3>
                <div className="space-y-3 pt-2">
                  {(['Living & Decor', 'Kitchen & Dining', 'Bed & Bath'] as ProductCategory[]).map((cat) => {
                    const rev = categoryRevenue[cat];
                    const percent = totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 33;
                    return (
                      <div key={cat} className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium text-[#1c1917]">{cat}</span>
                          <span className="font-semibold tabular-nums text-[#1c1917]">
                            {formatRupiah(rev)} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#f4f1ea] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#1c1917] h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Selling Products (7 cols) */}
              <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#e7e2d7] space-y-4">
                <h3 className="text-sm font-bold font-serif text-[#1c1917]">
                  Produk Terlaris (Top 5 Best Sellers)
                </h3>
                {topSellingList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#78716c]">
                    Belum ada data produk terjual yang terkonfirmasi lunas.
                  </div>
                ) : (
                  <div className="divide-y divide-[#f4f1ea]">
                    {topSellingList.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#f4f1ea] text-[#1c1917] font-bold text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <img
                            src={item.product?.imageUrl}
                            alt=""
                            className="w-9 h-9 object-cover rounded bg-[#f4f1ea]"
                          />
                          <div>
                            <p className="font-semibold text-[#1c1917]">{item.product?.name}</p>
                            <p className="text-[11px] text-[#78716c]">{item.product?.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#1c1917] tabular-nums">{item.quantity} Terjual</p>
                          <p className="text-[11px] text-[#8c6d52] tabular-nums">{formatRupiah(item.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DATA PRODUK DAN STOK                               */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#1c1917]">
                  Katalog Produk & Kelola Stok
                </h2>
                <p className="text-xs text-[#78716c] mt-0.5">
                  Sumber data tunggal di Cloud Firestore. Perubahan stok langsung disinkronkan ke seluruh pembeli.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={async () => {
                    if (confirm('Reset ulang katalog ke 12 produk aesthetic awal?')) {
                      await resetCatalogToDefault();
                      alert('Katalog 12 produk berhasil di-reset di Cloud Firestore!');
                    }
                  }}
                  className="px-3 py-2 bg-white hover:bg-stone-50 border border-[#d6cebf] rounded-md text-xs font-medium text-[#57534e] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Kembalikan 12 produk default"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset 12 Produk Default</span>
                </button>

                <button
                  onClick={() => {
                    resetProductForm();
                    setIsAddingProduct(true);
                  }}
                  className="px-4 py-2 bg-[#1c1917] hover:bg-[#292524] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Produk Baru</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-[#e7e2d7] flex flex-wrap gap-3 items-center justify-between text-xs">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[#78716c]" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Cari nama produk / material..."
                  className="w-full p-1.5 bg-[#fbfbf9] border border-[#d6cebf] rounded text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#78716c]">Kategori:</span>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="p-1.5 bg-[#fbfbf9] border border-[#d6cebf] rounded text-xs focus:outline-none"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="Living & Decor">Living & Decor</option>
                  <option value="Kitchen & Dining">Kitchen & Dining</option>
                  <option value="Bed & Bath">Bed & Bath</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-[#e7e2d7] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fbfbf9] text-[#78716c] border-b border-[#e7e2d7]">
                    <tr>
                      <th className="p-3.5">Produk</th>
                      <th className="p-3.5">Kategori</th>
                      <th className="p-3.5">Harga</th>
                      <th className="p-3.5">Stok Real-Time</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f4f1ea]">
                    {products
                      .filter(p => {
                        const matchCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
                        const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
                        return matchCat && matchSearch;
                      })
                      .map((product) => {
                        const isOutOfStock = product.stock <= 0;
                        const isLowStock = product.stock > 0 && product.stock <= 5;

                        return (
                          <tr key={product.id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.imageUrl}
                                  alt=""
                                  className="w-12 h-12 object-cover rounded bg-[#f4f1ea] shrink-0"
                                />
                                <div>
                                  <h4 className="font-semibold text-[#1c1917] font-serif text-sm">
                                    {product.name}
                                  </h4>
                                  <p className="text-[11px] text-[#78716c] line-clamp-1">
                                    {product.material || product.dimensions}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <span className="text-[11px] font-medium text-[#8c6d52]">
                                {product.category}
                              </span>
                            </td>

                            <td className="p-3.5 font-semibold text-[#1c1917] tabular-nums">
                              {formatRupiah(product.price)}
                            </td>

                            {/* Inline Stock Editor */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => updateStock(product.id, Math.max(0, product.stock - 1))}
                                  className="w-6 h-6 rounded bg-[#f4f1ea] hover:bg-[#eae3d5] text-[#1c1917] font-bold flex items-center justify-center cursor-pointer"
                                  title="Kurangi stok"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={product.stock}
                                  onChange={(e) => updateStock(product.id, Number(e.target.value))}
                                  className="w-14 text-center p-1 border border-[#d6cebf] rounded font-semibold tabular-nums text-xs"
                                />
                                <button
                                  onClick={() => updateStock(product.id, product.stock + 1)}
                                  className="w-6 h-6 rounded bg-[#f4f1ea] hover:bg-[#eae3d5] text-[#1c1917] font-bold flex items-center justify-center cursor-pointer"
                                  title="Tambah stok"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            <td className="p-3.5">
                              {isOutOfStock ? (
                                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                  Habis (0)
                                </span>
                              ) : isLowStock ? (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                  Menipis ({product.stock})
                                </span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                  Aman ({product.stock})
                                </span>
                              )}
                            </td>

                            <td className="p-3.5 text-right space-x-2">
                              <button
                                onClick={() => openEditProduct(product)}
                                className="p-1.5 text-[#57534e] hover:text-[#1c1917] hover:bg-[#f4f1ea] rounded cursor-pointer transition-colors"
                                title="Edit Detail"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Hapus produk "${product.name}" dari katalog?`)) {
                                    await deleteProduct(product.id);
                                  }
                                }}
                                className="p-1.5 text-[#a8a29e] hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                                title="Hapus Produk"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: DATA ORDER DAN RIWAYAT                             */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#1c1917]">
                  Data Pesanan & Riwayat Transaksi
                </h2>
                <p className="text-xs text-[#78716c] mt-0.5">
                  Kelola siklus status pesanan dari menunggu pembayaran hingga pengiriman.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#78716c]">Filter Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="p-1.5 bg-white border border-[#d6cebf] rounded text-xs focus:outline-none"
                >
                  <option value="all">Semua Status ({orders.length})</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Diproses</option>
                  <option value="shipped">Dikirim</option>
                  <option value="completed">Selesai</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-[#e7e2d7] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fbfbf9] text-[#78716c] border-b border-[#e7e2d7]">
                    <tr>
                      <th className="p-3.5">No. Pesanan</th>
                      <th className="p-3.5">Tanggal</th>
                      <th className="p-3.5">Pelanggan</th>
                      <th className="p-3.5">Item</th>
                      <th className="p-3.5">Total Tagihan</th>
                      <th className="p-3.5">Status Bayar</th>
                      <th className="p-3.5">Status Pesanan</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f4f1ea]">
                    {orders
                      .filter(o => orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter)
                      .map((order) => (
                        <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-[#1c1917]">
                            {order.orderNumber}
                          </td>

                          <td className="p-3.5 text-[#78716c]">
                            {formatDate(order.createdAt)}
                          </td>

                          <td className="p-3.5">
                            <span className="font-semibold text-[#1c1917] block">{order.customerName}</span>
                            <span className="text-[#78716c] text-[11px]">{order.city} · {order.customerPhone}</span>
                          </td>

                          <td className="p-3.5 text-[#57534e]">
                            {order.items.length} item ({order.items.map(i => i.name).slice(0, 1).join(', ')}{order.items.length > 1 ? '...' : ''})
                          </td>

                          <td className="p-3.5 font-bold text-[#1c1917] tabular-nums">
                            {formatRupiah(order.total)}
                          </td>

                          <td className="p-3.5">
                            {order.paymentStatus === 'approved' && (
                              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Lunas ✓</span>
                            )}
                            {order.paymentStatus === 'proof_submitted' && (
                              <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded">Verifikasi ⏳</span>
                            )}
                            {order.paymentStatus === 'rejected' && (
                              <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded">Ditolak ✗</span>
                            )}
                            {order.paymentStatus === 'waiting_payment' && (
                              <span className="text-stone-600 bg-stone-100 px-2 py-0.5 rounded">Belum Bayar</span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <span className="font-semibold text-[#1c1917] uppercase text-[10px] tracking-wider">
                              {order.orderStatus}
                            </span>
                            {order.trackingNumber && (
                              <span className="block text-[10px] font-mono text-[#8c6d52]">
                                Resi: {order.trackingNumber}
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrderDetail(order);
                                setShippingResiInput(order.trackingNumber || '');
                              }}
                              className="px-2.5 py-1 bg-[#f4f1ea] hover:bg-[#eae3d5] text-[#1c1917] font-medium rounded border border-[#d6cebf] cursor-pointer"
                            >
                              Detail & Status
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: DATA PELANGGAN (CRM)                               */}
        {/* ========================================================= */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#1c1917]">
                Direktori Pelanggan Komorebi Living
              </h2>
              <p className="text-xs text-[#78716c] mt-0.5">
                Daftar pelanggan beserta akumulasi pembelanjaan (Customer Lifetime Value).
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#e7e2d7] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fbfbf9] text-[#78716c] border-b border-[#e7e2d7]">
                    <tr>
                      <th className="p-3.5">Nama Pelanggan</th>
                      <th className="p-3.5">Kontak</th>
                      <th className="p-3.5">Kota / Alamat</th>
                      <th className="p-3.5">Total Pesanan</th>
                      <th className="p-3.5">Total Akumulasi Belanja</th>
                      <th className="p-3.5">Order Terakhir</th>
                      <th className="p-3.5 text-right">Hubungi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f4f1ea]">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#78716c]">
                          Belum ada pelanggan terdaftar. Data akan terisi otomatis saat checkout.
                        </td>
                      </tr>
                    ) : (
                      customers.map((c) => (
                        <tr key={c.id} className="hover:bg-stone-50/70">
                          <td className="p-3.5 font-bold text-[#1c1917] font-serif text-sm">
                            {c.name}
                          </td>
                          <td className="p-3.5">
                            <span className="block text-[#1c1917]">{c.email}</span>
                            <span className="text-[#78716c]">{c.phone}</span>
                          </td>
                          <td className="p-3.5 text-[#57534e]">
                            {c.city || c.address || '-'}
                          </td>
                          <td className="p-3.5 font-semibold text-[#1c1917] tabular-nums">
                            {c.totalOrders} pesanan
                          </td>
                          <td className="p-3.5 font-bold text-emerald-800 tabular-nums">
                            {formatRupiah(c.totalSpent)}
                          </td>
                          <td className="p-3.5 text-[#78716c]">
                            {formatDate(c.lastOrderAt)}
                          </td>
                          <td className="p-3.5 text-right">
                            <a
                              href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded font-semibold inline-flex items-center gap-1"
                            >
                              <span>WhatsApp</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* MODAL 1: PREVIEW BUKTI TRANSFER FULL RESOLUSI             */}
      {/* ========================================================= */}
      {proofPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative max-w-2xl w-full bg-white rounded-xl overflow-hidden p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e7e2d7]">
              <h3 className="font-serif font-bold text-sm text-[#1c1917]">
                Tampilan Bukti Transfer Pelanggan
              </h3>
              <button
                onClick={() => setProofPreviewUrl(null)}
                className="p-1 text-[#78716c] hover:text-[#1c1917] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 flex justify-center bg-[#f4f1ea] rounded-lg mt-3">
              <img
                src={proofPreviewUrl}
                alt="Bukti Transfer Penuh"
                className="max-h-[70vh] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: TOLAK BUKTI PEMBAYARAN DENGAN ALASAN             */}
      {/* ========================================================= */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative max-w-md w-full bg-white rounded-xl overflow-hidden p-6 space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1c1917]">
              Tolak Bukti Pembayaran: {rejectModalOrder.orderNumber}
            </h3>
            <p className="text-xs text-[#78716c]">
              Pelanggan akan melihat alasan ini pada menu Lacak Pesanan dan dapat mengunggah bukti baru.
            </p>

            <div className="space-y-2 text-xs">
              <label className="block font-medium text-[#57534e]">Alasan Penolakan:</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 border border-[#d6cebf] rounded-md focus:outline-none focus:border-[#1c1917] bg-[#fbfbf9]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setRejectModalOrder(null)}
                className="w-1/2 py-2 border border-[#d6cebf] rounded text-xs font-semibold hover:bg-[#f4f1ea] cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                className="w-1/2 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-semibold cursor-pointer"
              >
                Kirim Penolakan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: TAMBAH / EDIT PRODUK                             */}
      {/* ========================================================= */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative max-w-xl w-full bg-white rounded-xl overflow-hidden p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e7e2d7]">
              <h3 className="font-serif font-bold text-lg text-[#1c1917]">
                {editingProduct ? 'Edit Data Produk' : 'Tambah Produk Home Living Baru'}
              </h3>
              <button
                onClick={() => setIsAddingProduct(false)}
                className="p-1 text-[#78716c] hover:text-[#1c1917] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#57534e] font-medium mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Contoh: Wabi-Sabi Asymmetric Flora Vase"
                  className="w-full p-2 bg-[#fbfbf9] border border-[#d6cebf] rounded focus:outline-none focus:border-[#1c1917]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#57534e] font-medium mb-1">Kategori *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                    className="w-full p-2 bg-[#fbfbf9] border border-[#d6cebf] rounded focus:outline-none"
                  >
                    <option value="Living & Decor">Living & Decor</option>
                    <option value="Kitchen & Dining">Kitchen & Dining</option>
                    <option value="Bed & Bath">Bed & Bath</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#57534e] font-medium mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={prodBadge}
                    onChange={(e) => setProdBadge(e.target.value)}
                    placeholder="Contoh: Best Seller / Artisan"
                    className="w-full p-2 bg-[#fbfbf9] border border-[#d6cebf] rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#57534e] font-medium mb-1">Harga Satuan (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full p-2 bg-[#fbfbf9] border border-[#d6cebf] rounded focus:outline-none tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[#57534e] font-medium mb-1">Jumlah Stok Real-Time *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full p-2 bg-[#fbfbf9] border border-[#d6cebf] rounded focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#57534e] font-medium mb-1">Deskripsi Produk *</label>
                <textarea
                  rows={3}
                  required
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Jelaskan keunikan bahan, desain, dan fungsi produk..."
                  className="w-full p-2 bg-[#fbfbf9] border border-[#d6cebf] rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#57534e] font-medium mb-1">Dimensi / Ukuran</label>
                  <input
                    type="text"
                    value={prodDimensions}
                    onChange={(e) => setProdDimensions(e.target.value)}
                    placeholder="Contoh: T: 26cm x D: 16cm"
                    className="w-full p-2 bg-[#fbfbf9] border border-[#d6cebf] rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#57534e] font-medium mb-1">Bahan / Material</label>
                  <input
                    type="text"
                    value={prodMaterial}
                    onChange={(e) => setProdMaterial(e.target.value)}
                    placeholder="Contoh: Kayu Jati Solid Grade A"
                    className="w-full p-2 bg-[#fbfbf9] border border-[#d6cebf] rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#57534e] font-medium mb-1">URL Foto Produk</label>
                <input
                  type="text"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 bg-[#fbfbf9] border border-[#d6cebf] rounded focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="w-1/3 py-2.5 border border-[#d6cebf] rounded font-semibold text-xs hover:bg-[#f4f1ea] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-[#1c1917] hover:bg-[#292524] text-white rounded font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  {editingProduct ? 'Simpan Perubahan ke Firestore' : 'Tambahkan ke Katalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: DETAIL PESANAN & UPDATE STATUS PENGIRIMAN        */}
      {/* ========================================================= */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative max-w-xl w-full bg-white rounded-xl overflow-hidden p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#e7e2d7]">
              <div>
                <span className="text-[11px] font-mono text-[#8c6d52] font-semibold">
                  {selectedOrderDetail.orderNumber}
                </span>
                <h3 className="font-serif font-bold text-base text-[#1c1917]">
                  Kelola Pesanan: {selectedOrderDetail.customerName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="p-1 text-[#78716c] hover:text-[#1c1917] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Address & Items */}
            <div className="space-y-3 text-xs">
              <div className="bg-[#fbfbf9] p-3 rounded-lg border border-[#e7e2d7]">
                <p className="font-semibold text-[#1c1917]">Alamat Pengiriman:</p>
                <p className="text-[#57534e] mt-0.5">{selectedOrderDetail.shippingAddress}, {selectedOrderDetail.city}</p>
                <p className="text-[#78716c] mt-0.5">WhatsApp: {selectedOrderDetail.customerPhone}</p>
              </div>

              {/* Items */}
              <div className="space-y-1">
                <span className="font-semibold text-[#1c1917]">Item yang Dipesan:</span>
                {selectedOrderDetail.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-[#f4f1ea]">
                    <span>{i.name} ({i.quantity}x)</span>
                    <span className="font-semibold tabular-nums">{formatRupiah(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Resi Tracking Input */}
              <div className="pt-2">
                <label className="block text-[#57534e] font-medium mb-1">
                  Nomor Resi Ekspedisi ({selectedOrderDetail.shippingCourier}):
                </label>
                <input
                  type="text"
                  value={shippingResiInput}
                  onChange={(e) => setShippingResiInput(e.target.value)}
                  placeholder="Contoh: SCP891024810291"
                  className="w-full p-2 bg-[#fbfbf9] border border-[#d6cebf] rounded focus:outline-none font-mono"
                />
              </div>

              {/* Status Action Buttons */}
              <div className="pt-3 space-y-2">
                <span className="font-semibold text-[#1c1917] block">Ubah Status Pesanan:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateShippingStatus(selectedOrderDetail.id, 'processing')}
                    className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded font-semibold text-center cursor-pointer"
                  >
                    Diproses Packing
                  </button>
                  <button
                    onClick={() => handleUpdateShippingStatus(selectedOrderDetail.id, 'shipped')}
                    className="py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded font-semibold text-center cursor-pointer"
                  >
                    Kirim (+ Resi)
                  </button>
                  <button
                    onClick={() => handleUpdateShippingStatus(selectedOrderDetail.id, 'completed')}
                    className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded font-semibold text-center cursor-pointer"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
