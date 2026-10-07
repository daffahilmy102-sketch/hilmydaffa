export type ProductCategory = 'Living & Decor' | 'Kitchen & Dining' | 'Bed & Bath';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  stock: number;
  description: string;
  dimensions?: string;
  material?: string;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  badge?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export type OrderPaymentStatus = 'waiting_payment' | 'proof_submitted' | 'approved' | 'rejected';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode?: string;
  shippingCourier: string;
  shippingCost: number;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  total: number;
  notes?: string;
  paymentMethod: string;
  paymentProofUrl?: string;
  paymentProofUploadedAt?: string;
  paymentStatus: OrderPaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  description: string;
}
