import React, { useState } from 'react';
import { X, Check, Copy, Upload, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatRupiah } from '../lib/formatters';
import { PAYMENT_METHODS, SHIPPING_COURIERS } from '../data/initialProducts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string, orderNumber: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess
}) => {
  const {
    items,
    subtotal,
    discountAmount,
    appliedCoupon,
    isFreeShipping,
    orderNote,
    clearCart
  } = useCart();

  const { createOrder, uploadPaymentProof } = useStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('Jakarta Selatan');
  const [postalCode, setPostalCode] = useState('12190');
  const [selectedCourierId, setSelectedCourierId] = useState('sicepat');
  const [selectedPaymentId, setSelectedPaymentId] = useState('bca');

  // Proof of payment
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [createdOrderInfo, setCreatedOrderInfo] = useState<{ id: string; orderNumber: string } | null>(null);

  if (!isOpen) return null;

  const courier = SHIPPING_COURIERS.find(c => c.id === selectedCourierId) || SHIPPING_COURIERS[0];
  const actualShippingCost = isFreeShipping ? 0 : courier.cost;
  const grandTotal = Math.max(0, subtotal - discountAmount) + actualShippingCost;

  const selectedPayment = PAYMENT_METHODS.find(p => p.id === selectedPaymentId) || PAYMENT_METHODS[0];

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleProof = () => {
    // Generate a clean sample payment receipt preview
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 550;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 550);
      ctx.fillStyle = '#1c1917';
      ctx.font = 'bold 20px Georgia';
      ctx.fillText('BUKTI TRANSFER BERHASIL', 40, 50);
      ctx.fillStyle = '#78716c';
      ctx.font = '13px sans-serif';
      ctx.fillText(`Bank: ${selectedPayment.name}`, 40, 80);
      ctx.fillText(`Penerima: ${selectedPayment.accountHolder}`, 40, 105);
      ctx.fillText(`Nomor: ${selectedPayment.accountNumber}`, 40, 130);
      ctx.fillText(`Pengirim: ${customerName || 'Pelanggan Komorebi'}`, 40, 160);
      ctx.fillStyle = '#1c1917';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`Rp ${grandTotal.toLocaleString('id-ID')}`, 40, 210);
      ctx.fillStyle = '#16a34a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('STATUS: TRANSAKSI BERHASIL', 40, 245);
      ctx.fillStyle = '#a8a29e';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Waktu: ${new Date().toLocaleString('id-ID')}`, 40, 280);
      ctx.fillText('ID Transaksi: TRX-' + Math.floor(Math.random() * 9999999), 40, 305);
      ctx.fillStyle = '#f4f1ea';
      ctx.fillRect(40, 330, 320, 170);
      ctx.fillStyle = '#57534e';
      ctx.font = 'italic 12px sans-serif';
      ctx.fillText('Struk resmi otomatis untuk pengujian UTS', 60, 410);
      setProofPreview(canvas.toDataURL('image/jpeg', 0.85));
    }
  };

  const handleSubmitOrder = async () => {
    if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
      alert('Mohon lengkapi nama, email, nomor WhatsApp, dan alamat pengiriman.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = items.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl
      }));

      const datePrefix = new Date().toISOString().slice(2, 7).replace('-', '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedOrderNumber = `KMR-${datePrefix}-${randomSuffix}`;

      const orderPayload = {
        orderNumber: generatedOrderNumber,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city,
        postalCode,
        shippingCourier: courier.name,
        shippingCost: actualShippingCost,
        items: orderItems,
        subtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code,
        total: grandTotal,
        notes: orderNote,
        paymentMethod: selectedPayment.name,
        paymentProofUrl: proofPreview || '',
        paymentProofUploadedAt: proofPreview ? new Date().toISOString() : '',
        paymentStatus: proofPreview ? ('proof_submitted' as const) : ('waiting_payment' as const),
        orderStatus: 'pending' as const
      };

      const newOrderId = await createOrder(orderPayload);

      setCreatedOrderInfo({ id: newOrderId, orderNumber: generatedOrderNumber });
      setStep(3);

      // Trigger celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      clearCart();
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Terjadi kesalahan saat memproses pesanan. Silakan periksa koneksi Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#e7e2d7] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#e7e2d7] bg-[#fbfbf9] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c6d52]">
              Langkah {step} dari 3
            </span>
            <h2 className="text-xl font-serif font-bold text-[#1c1917]">
              {step === 1 && 'Alamat & Pengiriman'}
              {step === 2 && 'Rincian & Bukti Pembayaran'}
              {step === 3 && 'Pesanan Berhasil Dibuat!'}
            </h2>
          </div>
          {step !== 3 && (
            <button
              onClick={onClose}
              className="p-1.5 text-[#78716c] hover:text-[#1c1917] rounded-full hover:bg-[#f4f1ea] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* STEP 1: Customer Info & Shipping */}
        {step === 1 && (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* Quick Summary Bar */}
            <div className="bg-[#f5f2eb] p-3.5 rounded-lg border border-[#e7e2d7] flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-[#1c1917]">{items.length} Macam Produk</span>
                <span className="text-[#78716c] ml-1">· Subtotal: {formatRupiah(subtotal)}</span>
              </div>
              <span className="font-bold text-[#1c1917] tabular-nums text-sm">
                Total: {formatRupiah(grandTotal)}
              </span>
            </div>

            {/* Customer Inputs */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#1c1917]">1. Informasi Penerima</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[#57534e] font-medium mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Daffa Hilmy"
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6cebf] rounded-md focus:outline-none focus:border-[#1c1917]"
                  />
                </div>
                <div>
                  <label className="block text-[#57534e] font-medium mb-1">Email Aktif *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6cebf] rounded-md focus:outline-none focus:border-[#1c1917]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[#57534e] font-medium mb-1">Nomor WhatsApp / HP *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6cebf] rounded-md focus:outline-none focus:border-[#1c1917]"
                  />
                </div>
              </div>
            </div>

            {/* Address Inputs */}
            <div className="space-y-4 pt-2 border-t border-[#e7e2d7]">
              <h3 className="text-sm font-semibold text-[#1c1917]">2. Alamat Lengkap Pengiriman</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#57534e] font-medium mb-1">Alamat Jalan, Nomor Rumah, RT/RW *</label>
                  <textarea
                    rows={2}
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Jl. Senopati No. 42, Kebayoran Baru"
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6cebf] rounded-md focus:outline-none focus:border-[#1c1917]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#57534e] font-medium mb-1">Kota / Kabupaten</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Jakarta Selatan"
                      className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6cebf] rounded-md focus:outline-none focus:border-[#1c1917]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#57534e] font-medium mb-1">Kode Pos</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="12190"
                      className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6cebf] rounded-md focus:outline-none focus:border-[#1c1917]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Courier Selection */}
            <div className="space-y-3 pt-2 border-t border-[#e7e2d7]">
              <h3 className="text-sm font-semibold text-[#1c1917]">3. Pilih Ekspedisi Pengiriman</h3>
              <div className="space-y-2 text-xs">
                {SHIPPING_COURIERS.map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedCourierId === c.id
                        ? 'border-[#1c1917] bg-[#fbfbf9] shadow-2xs'
                        : 'border-[#e7e2d7] hover:border-[#d6cebf]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="courier"
                        checked={selectedCourierId === c.id}
                        onChange={() => setSelectedCourierId(c.id)}
                        className="accent-[#1c1917]"
                      />
                      <span className="font-medium text-[#1c1917]">{c.name}</span>
                    </div>
                    <span className="font-semibold tabular-nums text-[#1c1917]">
                      {isFreeShipping ? (
                        <span className="text-emerald-700 font-bold uppercase text-[10px]">Gratis Ongkir</span>
                      ) : (
                        formatRupiah(c.cost)
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3 pt-2 border-t border-[#e7e2d7]">
              <h3 className="text-sm font-semibold text-[#1c1917]">4. Rekening Pembayaran</h3>
              <div className="space-y-2 text-xs">
                {PAYMENT_METHODS.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedPaymentId === p.id
                        ? 'border-[#1c1917] bg-[#fbfbf9] shadow-2xs'
                        : 'border-[#e7e2d7] hover:border-[#d6cebf]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPaymentId === p.id}
                        onChange={() => setSelectedPaymentId(p.id)}
                        className="accent-[#1c1917]"
                      />
                      <div>
                        <span className="font-medium text-[#1c1917] block">{p.name}</span>
                        <span className="text-[#78716c] text-[11px]">{p.accountNumber}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold bg-[#f4f1ea] text-[#8c6d52] px-2 py-0.5 rounded">
                      {p.badge}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Next Step Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
                    alert('Silakan isi seluruh informasi bertanda bintang (*) sebelum melanjutkan.');
                    return;
                  }
                  setStep(2);
                }}
                className="w-full py-3.5 bg-[#1c1917] hover:bg-[#292524] text-white font-semibold text-sm rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Lanjut ke Pembayaran & Bukti Transfer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: Payment Details & Proof Upload */}
        {step === 2 && (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* Payment Destination Card */}
            <div className="bg-[#fbfbf9] border-2 border-[#1c1917] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#e7e2d7] pb-3">
                <span className="text-xs font-semibold text-[#8c6d52] uppercase tracking-wider">
                  Tujuan Pembayaran
                </span>
                <span className="text-xs font-bold text-[#1c1917]">{selectedPayment.name}</span>
              </div>

              {/* Account Number */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-[#78716c]">Nomor Rekening / NMID:</p>
                  <p className="text-lg font-mono font-bold text-[#1c1917] tracking-wider">
                    {selectedPayment.accountNumber}
                  </p>
                  <p className="text-xs text-[#57534e]">a.n. {selectedPayment.accountHolder}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedPayment.accountNumber, 'acc')}
                  className="px-3 py-1.5 bg-white border border-[#d6cebf] rounded-md text-xs font-semibold hover:bg-[#f4f1ea] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'acc' ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>

              {/* Total Amount */}
              <div className="flex items-center justify-between pt-2 border-t border-[#e7e2d7]">
                <div>
                  <p className="text-[11px] text-[#78716c]">Total Pembayaran:</p>
                  <p className="text-xl font-bold font-serif text-[#1c1917] tabular-nums">
                    {formatRupiah(grandTotal)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(grandTotal.toString(), 'amount')}
                  className="px-3 py-1.5 bg-white border border-[#d6cebf] rounded-md text-xs font-semibold hover:bg-[#f4f1ea] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'amount' ? 'Tersalin' : 'Salin Nominal'}</span>
                </button>
              </div>
            </div>

            {/* Proof Upload Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#1c1917]">
                    Upload Bukti Transfer / Pembayaran
                  </h4>
                  <p className="text-xs text-[#78716c]">
                    Admin kami akan segera memverifikasi bukti transfer Anda di database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUseSampleProof}
                  className="text-[11px] text-[#8c6d52] hover:text-[#1c1917] underline font-medium cursor-pointer"
                >
                  + Sample Bukti (Demo)
                </button>
              </div>

              {proofPreview ? (
                <div className="relative border border-[#d6cebf] rounded-lg p-3 bg-[#fbfbf9] flex items-center gap-4">
                  <img
                    src={proofPreview}
                    alt="Bukti Transfer"
                    className="w-20 h-24 object-cover rounded border border-[#e7e2d7] shadow-xs"
                  />
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Bukti transfer siap dikirim!
                    </p>
                    <p className="text-[#78716c] mt-0.5">
                      Klik tombol ganti jika ingin memilih foto lain.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <label className="text-[11px] px-2.5 py-1 bg-white border border-[#d6cebf] rounded cursor-pointer hover:bg-[#f4f1ea]">
                        Ganti Foto
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setProofPreview(null)}
                        className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-[#d6cebf] hover:border-[#1c1917] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#fbfbf9]/60">
                  <Upload className="w-8 h-8 text-[#8c6d52] mb-2" />
                  <span className="text-xs font-semibold text-[#1c1917]">
                    Pilih File Foto atau Screenshot Struk Transfer
                  </span>
                  <span className="text-[11px] text-[#78716c] mt-0.5">
                    Format JPG, PNG atau WebP (Bisa diunggah sekarang atau via menu Lacak Pesanan)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="pt-3 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 border border-[#d6cebf] hover:bg-[#f4f1ea] text-[#1c1917] font-semibold text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="w-2/3 py-3 bg-[#1c1917] hover:bg-[#292524] text-white font-semibold text-sm rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Menyimpan ke Database...</span>
                ) : (
                  <>
                    <span>Selesaikan & Buat Pesanan</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: Order Completed Celebration */}
        {step === 3 && createdOrderInfo && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-3xl shadow-xs">
              ✓
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Data Tersimpan di Cloud Firestore
              </span>
              <h3 className="text-2xl font-serif font-bold text-[#1c1917] mt-1">
                Terima Kasih, {customerName}!
              </h3>
              <p className="text-xs text-[#78716c] max-w-md mx-auto mt-2 leading-relaxed">
                Pesanan Anda telah berhasil direkam ke database. Admin kami akan segera memeriksa bukti pembayaran Anda.
              </p>
            </div>

            {/* Order Number Box */}
            <div className="bg-[#fbfbf9] border border-[#e7e2d7] rounded-xl p-4 max-w-sm mx-auto space-y-1">
              <span className="text-[11px] text-[#78716c]">Nomor Pesanan Anda:</span>
              <div className="text-xl font-mono font-bold text-[#1c1917] tracking-wider">
                {createdOrderInfo.orderNumber}
              </div>
              <p className="text-[11px] text-[#8c6d52]">
                {proofPreview ? 'Bukti transfer terlampir (Menunggu Approval)' : 'Belum melampirkan bukti transfer'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-sm mx-auto">
              <button
                onClick={() => {
                  onClose();
                  onOrderSuccess(createdOrderInfo.id, createdOrderInfo.orderNumber);
                }}
                className="py-3 px-5 bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-semibold rounded-md shadow-xs cursor-pointer transition-colors"
              >
                Lihat Status di Lacak Pesanan
              </button>

              <button
                onClick={onClose}
                className="py-3 px-5 bg-[#f4f1ea] hover:bg-[#eae3d5] text-[#1c1917] text-xs font-semibold rounded-md border border-[#d6cebf] cursor-pointer transition-colors"
              >
                Belanja Kembali
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
