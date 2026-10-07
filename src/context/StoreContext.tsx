import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  getDoc
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Order, Customer, OrderStatus, OrderPaymentStatus } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  isLoading: boolean;
  dbError: string | null;
  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  updateStock: (id: string, newStock: number) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetCatalogToDefault: () => Promise<void>;
  // Order actions
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  uploadPaymentProof: (orderId: string, proofUrl: string) => Promise<void>;
  approvePayment: (orderId: string) => Promise<void>;
  rejectPayment: (orderId: string, reason: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => Promise<void>;
  // Admin auth
  isAdmin: boolean;
  adminUser: { email: string; name: string; isDemo: boolean } | null;
  loginWithGoogle: () => Promise<void>;
  loginAsDemoAdmin: () => void;
  logoutAdmin: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Admin state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('komorebi_admin_auth') === 'true';
  });
  const [adminUser, setAdminUser] = useState<{ email: string; name: string; isDemo: boolean } | null>(() => {
    const saved = localStorage.getItem('komorebi_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setIsAdmin(true);
        const adminData = {
          email: user.email || 'admin@komorebi.id',
          name: user.displayName || 'Store Administrator',
          isDemo: false
        };
        setAdminUser(adminData);
        localStorage.setItem('komorebi_admin_auth', 'true');
        localStorage.setItem('komorebi_admin_user', JSON.stringify(adminData));
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for Products
  useEffect(() => {
    const productsRef = collection(db, 'products');

    const unsubscribe = onSnapshot(
      productsRef,
      async (snapshot) => {
        if (snapshot.empty) {
          // Auto-seed initial 12 aesthetic products if empty
          console.log('Seeding initial products into Firestore...');
          try {
            for (const prod of INITIAL_PRODUCTS) {
              await setDoc(doc(db, 'products', prod.id), {
                ...prod,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
          } catch (seedErr) {
            console.error('Error auto-seeding products:', seedErr);
            handleFirestoreError(seedErr, OperationType.WRITE, 'products');
          }
        } else {
          const loadedProducts: Product[] = [];
          snapshot.forEach((docSnap) => {
            loadedProducts.push({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) });
          });
          // Keep natural ordering or order by ID
          setProducts(loadedProducts);
        }
        setIsLoading(false);
      },
      (error) => {
        setDbError(error.message);
        setIsLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'products');
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for Orders
  useEffect(() => {
    const ordersRef = collection(db, 'orders');

    const unsubscribe = onSnapshot(
      ordersRef,
      (snapshot) => {
        const loadedOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          loadedOrders.push({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) });
        });
        // Sort descending by date
        loadedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(loadedOrders);
      },
      (error) => {
        console.error('Orders snapshot error:', error);
        handleFirestoreError(error, OperationType.LIST, 'orders');
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for Customers
  useEffect(() => {
    const customersRef = collection(db, 'customers');

    const unsubscribe = onSnapshot(
      customersRef,
      (snapshot) => {
        const loadedCustomers: Customer[] = [];
        snapshot.forEach((docSnap) => {
          loadedCustomers.push({ id: docSnap.id, ...(docSnap.data() as Omit<Customer, 'id'>) });
        });
        loadedCustomers.sort((a, b) => b.totalSpent - a.totalSpent);
        setCustomers(loadedCustomers);
      },
      (error) => {
        console.error('Customers snapshot error:', error);
        handleFirestoreError(error, OperationType.LIST, 'customers');
      }
    );

    return () => unsubscribe();
  }, []);

  // Product mutations
  const addProduct = async (productData: Omit<Product, 'id'>): Promise<string> => {
    const newId = `prod-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    try {
      await setDoc(doc(db, 'products', newId), {
        ...productData,
        createdAt: now,
        updatedAt: now
      });
      return newId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${newId}`);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
      throw err;
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    const safeStock = Math.max(0, Math.floor(newStock));
    try {
      await updateDoc(doc(db, 'products', id), {
        stock: safeStock,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
      throw err;
    }
  };

  const resetCatalogToDefault = async () => {
    try {
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), {
          ...prod,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'products');
      throw err;
    }
  };

  // Order creation and customer aggregation
  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const datePrefix = new Date().toISOString().slice(2, 7).replace('-', '');
    const orderNumber = orderData.orderNumber || `KMR-${datePrefix}-${randomSuffix}`;
    const orderId = `ord-${Date.now().toString(36)}-${randomSuffix}`;
    const now = new Date().toISOString();

    const fullOrder: Order = {
      ...orderData,
      id: orderId,
      orderNumber,
      createdAt: now,
      updatedAt: now
    };

    try {
      // 1. Save Order to Firestore
      await setDoc(doc(db, 'orders', orderId), fullOrder);

      // 2. Reduce Stock in Firestore
      for (const item of orderData.items) {
        const prodRef = doc(db, 'products', item.productId);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          const currentStock = prodSnap.data().stock || 0;
          const nextStock = Math.max(0, currentStock - item.quantity);
          await updateDoc(prodRef, { 
            stock: nextStock,
            updatedAt: now 
          });
        }
      }

      // 3. Upsert Customer in Firestore
      const customerDocId = `cust-${orderData.customerEmail.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const customerRef = doc(db, 'customers', customerDocId);
      const customerSnap = await getDoc(customerRef);

      if (customerSnap.exists()) {
        const existingCust = customerSnap.data() as Customer;
        await updateDoc(customerRef, {
          name: orderData.customerName,
          phone: orderData.customerPhone,
          address: orderData.shippingAddress,
          city: orderData.city,
          totalOrders: (existingCust.totalOrders || 0) + 1,
          totalSpent: (existingCust.totalSpent || 0) + orderData.total,
          lastOrderAt: now
        });
      } else {
        await setDoc(customerRef, {
          id: customerDocId,
          name: orderData.customerName,
          email: orderData.customerEmail,
          phone: orderData.customerPhone,
          address: orderData.shippingAddress,
          city: orderData.city,
          totalOrders: 1,
          totalSpent: orderData.total,
          lastOrderAt: now,
          createdAt: now
        });
      }

      return orderId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`);
      throw err;
    }
  };

  const uploadPaymentProof = async (orderId: string, proofUrl: string) => {
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'orders', orderId), {
        paymentProofUrl: proofUrl,
        paymentProofUploadedAt: now,
        paymentStatus: 'proof_submitted' as OrderPaymentStatus,
        updatedAt: now
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      throw err;
    }
  };

  const approvePayment = async (orderId: string) => {
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'orders', orderId), {
        paymentStatus: 'approved' as OrderPaymentStatus,
        orderStatus: 'processing' as OrderStatus,
        rejectionReason: '',
        updatedAt: now
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      throw err;
    }
  };

  const rejectPayment = async (orderId: string, reason: string) => {
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'orders', orderId), {
        paymentStatus: 'rejected' as OrderPaymentStatus,
        rejectionReason: reason,
        updatedAt: now
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, trackingNumber?: string) => {
    try {
      const now = new Date().toISOString();
      const updates: Record<string, any> = {
        orderStatus: status,
        updatedAt: now
      };
      if (trackingNumber !== undefined) {
        updates.trackingNumber = trackingNumber;
      }
      await updateDoc(doc(db, 'orders', orderId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      throw err;
    }
  };

  // Admin Auth Helpers
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const adminData = {
        email: user.email || 'admin@komorebi.id',
        name: user.displayName || 'Store Administrator',
        isDemo: false
      };
      setIsAdmin(true);
      setAdminUser(adminData);
      localStorage.setItem('komorebi_admin_auth', 'true');
      localStorage.setItem('komorebi_admin_user', JSON.stringify(adminData));
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      throw err;
    }
  };

  const loginAsDemoAdmin = () => {
    const demoData = {
      email: 'admin@komorebi.id',
      name: 'Manager Komorebi Living (UTS Evaluator)',
      isDemo: true
    };
    setIsAdmin(true);
    setAdminUser(demoData);
    localStorage.setItem('komorebi_admin_auth', 'true');
    localStorage.setItem('komorebi_admin_user', JSON.stringify(demoData));
  };

  const logoutAdmin = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    setIsAdmin(false);
    setAdminUser(null);
    localStorage.removeItem('komorebi_admin_auth');
    localStorage.removeItem('komorebi_admin_user');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        customers,
        isLoading,
        dbError,
        addProduct,
        updateProduct,
        updateStock,
        deleteProduct,
        resetCatalogToDefault,
        createOrder,
        uploadPaymentProof,
        approvePayment,
        rejectPayment,
        updateOrderStatus,
        isAdmin,
        adminUser,
        loginWithGoogle,
        loginAsDemoAdmin,
        logoutAdmin
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
