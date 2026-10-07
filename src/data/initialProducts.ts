import { Product, Coupon } from '../types';
import heroImg from '../assets/images/hero_japandi_living_1791359423519.jpg';
import lampImg from '../assets/images/product_sculptural_lamp_1791359474020.jpg';
import ceramicImg from '../assets/images/product_ceramic_dining_1791359456160.jpg';
import linenImg from '../assets/images/product_linen_bedding_1791359490733.jpg';

export const HERO_IMAGE = heroImg;

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Living & Decor (4 products)
  {
    id: 'prod-001',
    name: 'Akari Washi Sculptural Table Lamp',
    category: 'Living & Decor',
    price: 680000,
    originalPrice: 790000,
    stock: 14,
    description: 'Lampu meja artistik berdesain Japandi minimalis dengan kap kertas washi handmade dan silinder marmer alam berulir. Memancarkan pencahayaan hangat menenangkan untuk sudut ruang keluarga atau meja nakas.',
    dimensions: 'Tinggi 38 cm x Diameter 24 cm',
    material: 'Natural Fluted Marble & Artisan Washi Paper',
    imageUrl: lampImg,
    rating: 4.9,
    reviewsCount: 38,
    badge: 'Koleksi Favorit'
  },
  {
    id: 'prod-002',
    name: 'Kyoto Hand-Carved Teak Pedestal Bowl',
    category: 'Living & Decor',
    price: 345000,
    originalPrice: 420000,
    stock: 18,
    description: 'Mangkuk dekorasi berkaki satu yang dipahat tangan dari kayu jati solid reclaimed dengan lapisan food-safe beeswax alami. Tekstur serat kayu unik dan organik untuk buah segar atau hiasan meja.',
    dimensions: 'Diameter 28 cm x Tinggi 12 cm',
    material: 'Kayu Jati Solid Reclaimed Grade A',
    imageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 24,
    badge: 'Artisan Handcrafted'
  },
  {
    id: 'prod-003',
    name: 'Travertine Sculptural Arch Bookends',
    category: 'Living & Decor',
    price: 495000,
    originalPrice: 580000,
    stock: 9,
    description: 'Sepasang penyangga buku berbentuk lengkungan arsitektural minimalis yang dipotong dari batu travertine alami Italia. Memiliki pori-pori autentik dan bobot kokoh yang elegan.',
    dimensions: '15 cm x 8 cm x 18 cm (Per Unit)',
    material: '100% Batu Alam Travertine Asli',
    imageUrl: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    reviewsCount: 19,
    badge: 'Best Seller'
  },
  {
    id: 'prod-004',
    name: 'Wabi-Sabi Asymmetric Flora Vase',
    category: 'Living & Decor',
    price: 280000,
    originalPrice: 330000,
    stock: 22,
    description: 'Vas keramik bertekstur pasir kasar (rough sandstone glaze) dengan siluet kurva asimetris. Menghadirkan filosofi estetika wabi-sabi yang menghargai ketidaksempurnaan alami.',
    dimensions: 'Tinggi 26 cm x Lebar 16 cm',
    material: 'Sandstone Coated Ceramic Stoneware',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewsCount: 31,
    badge: 'New Arrival'
  },

  // 2. Kitchen & Dining (4 products)
  {
    id: 'prod-005',
    name: 'Artisan Stoneware Dinnerware Set (4-Pcs)',
    category: 'Kitchen & Dining',
    price: 560000,
    originalPrice: 650000,
    stock: 16,
    description: 'Set tableware premium keramik stoneware bakar suhu tinggi (1280°C). Terdiri dari 1 piring saji utama, 1 piring salad, 1 mangkuk serbaguna, dan 1 cangkir espresso dengan glasir earth tone matte.',
    dimensions: 'Piring Utama 26cm, Mangkuk 18cm, Cangkir 250ml',
    material: 'High-Fired Stoneware, Microwave & Dishwasher Safe',
    imageUrl: ceramicImg,
    rating: 4.9,
    reviewsCount: 52,
    badge: 'Best Seller'
  },
  {
    id: 'prod-006',
    name: 'Nordic Fluted Glass Carafe & Tumbler Set',
    category: 'Kitchen & Dining',
    price: 295000,
    originalPrice: 350000,
    stock: 25,
    description: 'Teko air kaca borosilikat tahan panas dengan tekstur ribbed fluted elegan serta tutup kayu akasia kedap udara. Dilengkapi 2 gelas tumbler bertekstur serasi.',
    dimensions: 'Carafe 1200ml, Tumbler 350ml (x2)',
    material: 'Borosilicate Glass & Acacia Wood Lid',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 41,
    badge: 'Trending'
  },
  {
    id: 'prod-007',
    name: 'Solid Walnut End-Grain Serving Paddle',
    category: 'Kitchen & Dining',
    price: 390000,
    originalPrice: 450000,
    stock: 11,
    description: 'Talenan & papan saji charcuterie berbahan kayu American Walnut pilihan dengan sambungan end-grain yang melindungi ketajaman pisau dapur. Dilengkapi gagang ergonomis bertali kulit.',
    dimensions: '45 cm x 22 cm x 2.2 cm',
    material: 'American Walnut Solid Wood & Vegetable-Tanned Leather',
    imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 16,
    badge: 'Artisan Handcrafted'
  },
  {
    id: 'prod-008',
    name: 'Matte Champagne Brass Cutlery Set (16-Pcs)',
    category: 'Kitchen & Dining',
    price: 520000,
    originalPrice: 620000,
    stock: 15,
    description: 'Set sendok garpu pisau untuk 4 orang berbahan stainless steel food grade 304 dengan electroplating matte champagne titanium. Tahan karat, bobot mantap dan seimbang di genggaman.',
    dimensions: 'Sendok Makan 20.5cm, Garpu 20.8cm, Pisau Steak 22cm',
    material: '304 High-Grade Stainless Steel Brushed PVD',
    imageUrl: 'https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 29,
    badge: 'Koleksi Mewah'
  },

  // 3. Bed & Bath (4 products)
  {
    id: 'prod-009',
    name: 'Washed Organic French Linen Duvet Cover Set',
    category: 'Bed & Bath',
    price: 890000,
    originalPrice: 1050000,
    stock: 8,
    description: 'Set duvet cover & 2 sarung bantal dari 100% serat rami Prancis murni yang diproses stone-washed untuk kelembutan ekstra. Bersifat hypoallergenic, berpori sejuk dan semakin lembut seiring waktu pemakaian.',
    dimensions: 'Queen 200 x 200 cm (Termasuk 2 Sarung Bantal 50x75cm)',
    material: '100% Pure Certified French Flax Linen 175 GSM',
    imageUrl: linenImg,
    rating: 5.0,
    reviewsCount: 47,
    badge: 'Premium Choice'
  },
  {
    id: 'prod-010',
    name: 'Hinoki Cypress Japanese Bath Stool',
    category: 'Bed & Bath',
    price: 460000,
    originalPrice: 530000,
    stock: 12,
    description: 'Bangku kamar mandi onsen khas Jepang dari kayu Cypress Hinoki alami. Memiliki ketahanan tinggi terhadap kelembapan dan mengeluarkan aroma herbal alami menenangkan ketika terkena uap air panas.',
    dimensions: '30 cm x 18 cm x 22 cm',
    material: 'Solid Japanese Hinoki Cypress Wood',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 20,
    badge: 'Authentic Design'
  },
  {
    id: 'prod-011',
    name: 'Waffle Weave Organic Cotton Bath Towel (Set of 2)',
    category: 'Bed & Bath',
    price: 310000,
    originalPrice: 360000,
    stock: 30,
    description: 'Handuk mandi tenun sarang lebah (waffle weave) dari 100% Aegean organic cotton. Sangat ringan, menyerap air 2x lebih cepat dari handuk biasa dan cepat kering tanpa bau apek.',
    dimensions: '70 cm x 140 cm (Set isi 2 pcs: Oat & Warm Grey)',
    material: '100% Certified Aegean Organic Cotton 450 GSM',
    imageUrl: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewsCount: 35,
    badge: 'Favorit Harian'
  },
  {
    id: 'prod-012',
    name: 'Kyoto Hinoki & Sandalwood Soy Aromatherapy Candle',
    category: 'Bed & Bath',
    price: 195000,
    originalPrice: 240000,
    stock: 35,
    description: 'Lilin aromaterapi lilin kedelai murni beraroma kayu Hinoki, cendana, dan teh hijau segar dengan sumbu kayu retik (crackling wood wick). Disajikan dalam pot keramik handmade yang dapat dipakai ulang.',
    dimensions: 'Isi Bersih 220 gram (~50 Jam Waktu Nyala)',
    material: '100% Natural Soy Wax, Wood Wick & Essential Oils',
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 63,
    badge: 'Aroma Alami'
  }
];

export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: 'KOMOREBI10',
    discountType: 'percentage',
    discountValue: 10,
    minSpend: 250000,
    description: 'Diskon 10% untuk pesanan minimal Rp 250.000'
  },
  {
    code: 'RUMAHBARU',
    discountType: 'fixed',
    discountValue: 50000,
    minSpend: 500000,
    description: 'Potongan Rp 50.000 untuk pesanan minimal Rp 500.000'
  },
  {
    code: 'UTS2026',
    discountType: 'percentage',
    discountValue: 15,
    minSpend: 100000,
    description: 'Diskon Spesial UTS 15% tanpa minimum besar'
  }
];

export const PAYMENT_METHODS = [
  {
    id: 'bca',
    name: 'Bank Central Asia (BCA)',
    accountNumber: '8910 2482 1029',
    accountHolder: 'KOMOREBI HOME LIVING PT',
    badge: 'Verifikasi Cepat'
  },
  {
    id: 'mandiri',
    name: 'Bank Mandiri',
    accountNumber: '1370 0192 8472 1',
    accountHolder: 'KOMOREBI HOME LIVING PT',
    badge: 'Transfer Otomatis'
  },
  {
    id: 'qris',
    name: 'QRIS Instant (GoPay, OVO, ShopeePay, DANA, BCA Mobile)',
    accountNumber: 'NMID: ID2026918237410',
    accountHolder: 'Komorebi Living Official QRIS',
    badge: 'Scan & Pay'
  }
];

export const SHIPPING_COURIERS = [
  { id: 'sicepat', name: 'SiCepat BEST (1-2 Hari)', cost: 24000 },
  { id: 'jne', name: 'JNE Reguler (2-3 Hari)', cost: 22000 },
  { id: 'gosend', name: 'GoSend Instant / Same Day', cost: 35000 }
];
