import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, AlertTriangle, Truck, Package, Upload, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatRupiah, formatDate } from '../lib/formatters';
import { Order } from '../types';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  initialOrderId
}) => {
  const { orders, uploadPaymentProof } = useStore();
  const [searchQuery, setSearchQuery] = useState(initialOrderId || '');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(() => {
    if (initialOrderId) {
      return orders.find(o => o.id === initialOrderId || o.orderNumber === initialOrderId) || null;
    }
    return orders.length > 0 ? orders[0] : null;
  });

  const [uploadingProof, setUploadingProof] = useState(false);
  const [newProofPreview, setNewProofPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const found = orders.find(
      o => o.orderNumber.toLowerCase() === query ||
           o.id.toLowerCase() === query ||
           o.customerEmail.toLowerCase() === query ||
           o.customerPhone.includes(query)
    );

    if (found) {
      setSelectedOrder(found);
    } else {
      alert('Pesanan tidak ditemukan. Mohon pastikan Nomor Pesanan atau Email sudah sesuai.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProof = async () => {
    if (!selectedOrder || !newProofPreview) return;
    setUploadingProof(true);
    try {
      await uploadPaymentProof(selectedOrder.id, newProofPreview);
      setNewProofPreview(null);
      // update local view
      setSelectedOrder({
        ...selectedOrder,
        paymentProofUrl: newProofPreview,
        paymentStatus: 'proof_submitted',
        rejectionReason: ''
      });
      alert('Bukti transfer berhasil diperbarui! Menunggu verifikasi admin.');
    } catch (err) {
      alert('Gagal mengunggah bukti pembayaran.');
    } finally {
      setUploadingProof(false);
    }
  };

  const getStatusBadge = (order: Order) => {
    if (order.orderStatus === 'completed') {
      return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded font-semibold">Selesai</span>;
    }
    if (order.orderStatus === 'shipped') {
      return <span className="bg-sky-100 text-sky-800 text-xs px-2.5 py-0.5 rounded font-semibold">Sedang Dikirim</span>;
    }
    if (order.orderStatus === 'cancelled') {
      return <span className="bg-stone-100 text-stone-700 text-xs px-2.5 py-0.5 rounded font-semibold">Dibatalkan</span>;
    }
    if (order.paymentStatus === 'approved') {
      return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded font-semibold">Lunas & Diproses</span>;
    }
    if (order.paymentStatus === 'rejected') {
      return <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded font-semibold">Bukti Ditolak</span>;
    }
    if (order.paymentStatus === 'proof_submitted') {
      return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded font-semibold">Verifikasi Pembayaran</span>;
    }
    return <span className="bg-stone-100 text-stone-800 text-xs px-2.5 py-0.5 rounded font-semibold">Menunggu Pembayaran</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-[#e7e2d7] overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#e7e2d7] bg-[#fbfbf9] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c6d52]">
              Lacak Pesanan Real-Time
            </span>
            <h2 className="text-xl font-serif font-bold text-[#1c1917]">
              Status & Verifikasi Pembayaran
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#78716c] hover:text-[#1c1917] rounded-full hover:bg-[#f4f1ea] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#78716c]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan Nomor Pesanan (KMR-...) atau Email atau No HP"
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#fbfbf9] border border-[#d6cebf] rounded-md focus:outline-none focus:border-[#1c1917]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
            >
              Cari Pesanan
            </button>
          </form>

          {/* If No Order Selected */}
          {!selectedOrder ? (
            <div className="text-center py-12 text-[#78716c] text-xs">
              <Package className="w-10 h-10 mx-auto text-[#d6cebf] mb-2" />
              <p>Silakan masukkan nomor pesanan Anda di atas untuk melihat status terkini.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Order Status Header Card */}
              <div className="bg-[#fbfbf9] border border-[#e7e2d7] rounded-xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7e2d7] pb-3">
                  <div>
                    <span className="text-[11px] text-[#78716c]">Nomor Pesanan:</span>
                    <h3 className="text-lg font-mono font-bold text-[#1c1917]">
                      {selectedOrder.orderNumber}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#78716c] block">Waktu Pemesanan:</span>
                    <span className="text-xs font-medium text-[#1c1917]">
                      {formatDate(selectedOrder.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Status Badges & Courier Tracking */}
                <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#78716c]">Status:</span>
                    {getStatusBadge(selectedOrder)}
                  </div>

                  {selectedOrder.trackingNumber ? (
                    <div className="text-xs font-mono bg-white px-2.5 py-1 rounded border border-[#d6cebf]">
                      <span className="text-[#78716c] mr-1">Resi {selectedOrder.shippingCourier}:</span>
                      <strong className="text-[#1c1917]">{selectedOrder.trackingNumber}</strong>
                    </div>
                  ) : (
                    <div className="text-xs text-[#78716c]">
                      Ekspedisi: <strong className="text-[#1c1917]">{selectedOrder.shippingCourier}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-white border border-[#e7e2d7] rounded-xl p-5">
                <h4 className="text-xs font-semibold text-[#8c6d52] uppercase tracking-wider mb-4">
                  Tahapan Pesanan
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                  {/* Step 1: Pesanan Dibuat */}
                  <div className="flex items-center sm:flex-col sm:items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      ✓
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1c1917]">Pesanan Dibuat</p>
                      <p className="text-[10px] text-[#78716c]">Data masuk database</p>
                    </div>
                  </div>

                  {/* Step 2: Bukti Pembayaran */}
                  <div className="flex items-center sm:flex-col sm:items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      selectedOrder.paymentStatus === 'approved'
                        ? 'bg-emerald-600 text-white'
                        : selectedOrder.paymentStatus === 'proof_submitted'
                        ? 'bg-amber-500 text-white'
                        : selectedOrder.paymentStatus === 'rejected'
                        ? 'bg-rose-600 text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}>
                      {selectedOrder.paymentStatus === 'approved' ? '✓' : '2'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1c1917]">Bukti Transfer</p>
                      <p className="text-[10px] text-[#78716c]">
                        {selectedOrder.paymentStatus === 'approved'
                          ? 'Pembayaran Disetujui'
                          : selectedOrder.paymentStatus === 'proof_submitted'
                          ? 'Sedang Diverifikasi'
                          : selectedOrder.paymentStatus === 'rejected'
                          ? 'Perlu Upload Ulang'
                          : 'Belum Ada Bukti'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Diproses Packing */}
                  <div className="flex items-center sm:flex-col sm:items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      ['processing', 'shipped', 'completed'].includes(selectedOrder.orderStatus)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}>
                      {['processing', 'shipped', 'completed'].includes(selectedOrder.orderStatus) ? '✓' : '3'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1c1917]">Packing Peti Kayu</p>
                      <p className="text-[10px] text-[#78716c]">Pengemasan aman</p>
                    </div>
                  </div>

                  {/* Step 4: Dikirim / Selesai */}
                  <div className="flex items-center sm:flex-col sm:items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      selectedOrder.orderStatus === 'shipped' || selectedOrder.orderStatus === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}>
                      {selectedOrder.orderStatus === 'completed' ? '✓' : '4'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1c1917]">Dikirim ke Alamat</p>
                      <p className="text-[10px] text-[#78716c]">Kurir {selectedOrder.shippingCourier}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Proof / Re-upload Action Card */}
              {(selectedOrder.paymentStatus === 'waiting_payment' || selectedOrder.paymentStatus === 'rejected') && (
                <div className={`p-4 rounded-xl border ${
                  selectedOrder.paymentStatus === 'rejected' 
                    ? 'bg-rose-50 border-rose-200' 
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 shrink-0 ${
                      selectedOrder.paymentStatus === 'rejected' ? 'text-rose-600' : 'text-amber-600'
                    }`} />
                    <div className="flex-1 text-xs">
                      <h4 className="font-semibold text-[#1c1917]">
                        {selectedOrder.paymentStatus === 'rejected'
                          ? 'Bukti Pembayaran Ditolak oleh Admin'
                          : 'Silakan Unggah Bukti Pembayaran Anda'}
                      </h4>
                      {selectedOrder.rejectionReason && (
                        <p className="text-rose-700 font-medium mt-1">
                          Alasan: "{selectedOrder.rejectionReason}"
                        </p>
                      )}
                      <p className="text-[#57534e] mt-1">
                        Total yang harus ditransfer: <strong>{formatRupiah(selectedOrder.total)}</strong> melalui {selectedOrder.paymentMethod}.
                      </p>

                      {/* File selector */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {newProofPreview ? (
                          <div className="flex items-center gap-3">
                            <img src={newProofPreview} alt="Preview" className="w-12 h-16 object-cover rounded border" />
                            <button
                              onClick={handleSaveProof}
                              disabled={uploadingProof}
                              className="px-3 py-1.5 bg-[#1c1917] hover:bg-[#292524] text-white font-semibold rounded text-xs cursor-pointer"
                            >
                              {uploadingProof ? 'Menyimpan...' : 'Kirim Bukti Pembayaran Baru'}
                            </button>
                            <button
                              onClick={() => setNewProofPreview(null)}
                              className="text-xs text-rose-600 underline cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <label className="px-3 py-1.5 bg-white border border-[#d6cebf] rounded text-xs font-semibold hover:bg-[#f4f1ea] cursor-pointer flex items-center gap-1.5 shadow-2xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Pilih File Bukti Transfer</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Uploaded Proof Preview if already submitted */}
              {selectedOrder.paymentProofUrl && selectedOrder.paymentStatus !== 'rejected' && (
                <div className="border border-[#e7e2d7] rounded-lg p-3 bg-[#fbfbf9] flex items-center gap-4 text-xs">
                  <img
                    src={selectedOrder.paymentProofUrl}
                    alt="Bukti Transfer"
                    className="w-16 h-20 object-cover rounded border shadow-xs"
                  />
                  <div>
                    <span className="font-semibold text-[#1c1917] block">
                      Bukti Pembayaran Terunggah
                    </span>
                    <span className="text-[#78716c] block">
                      Waktu upload: {formatDate(selectedOrder.paymentProofUploadedAt || selectedOrder.updatedAt)}
                    </span>
                    <span className="text-emerald-700 font-medium block mt-1">
                      {selectedOrder.paymentStatus === 'approved' ? '✓ Telah diverifikasi oleh admin' : '⏳ Sedang menunggu antrean verifikasi'}
                    </span>
                  </div>
                </div>
              )}

              {/* Items Breakdown */}
              <div className="border border-[#e7e2d7] rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-semibold text-[#8c6d52] uppercase tracking-wider">
                  Daftar Produk yang Dipesan
                </h4>
                <div className="divide-y divide-[#f4f1ea]">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded bg-[#f4f1ea]"
                        />
                        <div>
                          <p className="font-medium text-[#1c1917]">{item.name}</p>
                          <p className="text-[#78716c]">{item.quantity} x {formatRupiah(item.price)}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-[#1c1917] tabular-nums">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#e7e2d7] space-y-1 text-xs">
                  <div className="flex justify-between text-[#78716c]">
                    <span>Ongkir ({selectedOrder.shippingCourier}):</span>
                    <span>{selectedOrder.shippingCost === 0 ? 'GRATIS' : formatRupiah(selectedOrder.shippingCost)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Diskon Kupon:</span>
                      <span>- {formatRupiah(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-[#1c1917] pt-1 border-t border-[#f4f1ea]">
                    <span>Total Pembayaran:</span>
                    <span>{formatRupiah(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Destination */}
              <div className="bg-[#fbfbf9] border border-[#e7e2d7] rounded-lg p-4 text-xs space-y-1">
                <span className="font-semibold text-[#8c6d52] uppercase tracking-wider block text-[10px]">
                  Tujuan Pengiriman
                </span>
                <p className="font-bold text-[#1c1917]">{selectedOrder.customerName} ({selectedOrder.customerPhone})</p>
                <p className="text-[#57534e]">{selectedOrder.shippingAddress}, {selectedOrder.city} {selectedOrder.postalCode}</p>
                {selectedOrder.notes && (
                  <p className="text-[#78716c] italic mt-1">Catatan: "{selectedOrder.notes}"</p>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
