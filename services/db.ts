
import { Product, Order, User, Category, OrderStatus, PaymentMethod, StoreConfig, Notification, Store, Merchant } from '../types';
import { aiService } from './aiService';

// Initial Data Seeding
const SEED_MERCHANTS: Merchant[] = [
  { id: 'm_1', name: 'Admin Adega', email: 'adega@admin.com', password: '123', storeId: 'store_1' },
  { id: 'm_2', name: 'Zé Distribuidora', email: 'ze@admin.com', password: '123', storeId: 'store_2' }
];

const SEED_STORES: Store[] = [
  { 
    id: 'store_1', 
    name: 'Adega Central', 
    image: 'https://images.unsplash.com/photo-1585217462982-f67498c1d37a?auto=format&fit=crop&q=80&w=200',
    whatsapp: '5511999999999',
    address: 'Centro, Juruá - AM',
    ownerId: 'm_1',
    commissionRate: 0.05,
    isOnline: true,
    reputation: 98
  },
  { 
    id: 'store_2', 
    name: 'Distribuidora do Zé', 
    image: 'https://images.unsplash.com/photo-1604543788537-80252b489a27?auto=format&fit=crop&q=80&w=200',
    whatsapp: '5511988888888',
    address: 'Bairro Alto, Juruá - AM',
    ownerId: 'm_2',
    commissionRate: 0.05,
    isOnline: false,
    reputation: 85
  }
];

const SEED_PRODUCTS: Product[] = [
  // Store 1 Products
  { id: '1', storeId: 'store_1', name: 'Heineken 330ml', description: 'Long neck gelada', price: 7.50, category: Category.BEER, stock: 100, image: 'https://picsum.photos/seed/heineken/200', salesCount: 150 },
  { id: '2', storeId: 'store_1', name: 'Skol 350ml', description: 'Lata trincando', price: 4.00, category: Category.BEER, stock: 200, image: 'https://picsum.photos/seed/skol/200', salesCount: 300 },
  { id: '3', storeId: 'store_1', name: 'Gelo 5kg', description: 'Saco de gelo filtrado', price: 12.00, category: Category.ICE, stock: 20, image: 'https://picsum.photos/seed/ice/200', salesCount: 50 },
  
  // Store 2 Products
  { id: '4', storeId: 'store_2', name: 'Red Bull', description: 'Energético 250ml', price: 8.90, category: Category.ENERGY, stock: 50, image: 'https://picsum.photos/seed/redbull/200', salesCount: 80 },
  { id: '5', storeId: 'store_2', name: 'Vodka Absolut', description: 'Garrafa 1L', price: 89.90, category: Category.SPIRITS, stock: 10, image: 'https://picsum.photos/seed/vodka/200', salesCount: 12 },
  { id: '6', storeId: 'store_2', name: 'Carvão Vegetal 3kg', description: 'Ideal para churrasco', price: 24.90, category: Category.CHARCOAL, stock: 15, image: 'https://picsum.photos/seed/charcoal/200', salesCount: 30 },
  { id: '7', storeId: 'store_1', name: 'Kit Churrasco', description: 'Carvão + 12 Skol + Sal Grosso', price: 85.00, category: Category.COMBO, stock: 5, image: 'https://picsum.photos/seed/combo/200', salesCount: 10, isPromo: true },
  { id: '8', storeId: 'store_1', name: 'Barra de Chocolate', description: 'Ao Leite 90g', price: 6.50, category: Category.CHOCOLATE, stock: 30, image: 'https://picsum.photos/seed/choco/200', salesCount: 40 },
  { id: '9', storeId: 'store_1', name: 'Batata Pringles', description: 'Original', price: 14.90, category: Category.SNACKS, stock: 15, image: 'https://picsum.photos/seed/chips/200', salesCount: 25 },
];

const SEED_USER: User = {
  id: 'u1',
  name: 'Cliente Exemplo',
  email: 'cliente@bebidaexpress.com',
  phone: '11999999999',
  address: 'Av. Principal, 1000 - Centro',
  isAdmin: false,
  preferences: [Category.BEER, Category.ICE]
};

// LocalStorage Keys
const KEYS = {
  MERCHANTS: 'dha_merchants',
  ACTIVE_MERCHANT: 'dha_active_merchant',
  STORES: 'dha_stores',
  PRODUCTS: 'dha_products',
  ORDERS: 'dha_orders',
  USER: 'dha_user',
  CONFIG: 'dha_config',
  NOTIFICATIONS: 'dha_notifications'
};

// Helper to initialize DB
const initDB = () => {
  if (!localStorage.getItem(KEYS.MERCHANTS)) {
    localStorage.setItem(KEYS.MERCHANTS, JSON.stringify(SEED_MERCHANTS));
  }
  if (!localStorage.getItem(KEYS.STORES)) {
    localStorage.setItem(KEYS.STORES, JSON.stringify(SEED_STORES));
  }
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
  }
  if (!localStorage.getItem(KEYS.USER)) {
    localStorage.setItem(KEYS.USER, JSON.stringify(SEED_USER));
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([]));
  }
};

initDB();

// API Methods
export const db = {
  // --- Merchant Auth Methods ---
  
  loginMerchant: (email: string, pass: string): Merchant | null => {
    // Super Admin Backdoor
    if (email === 'admin@bebidaexpress.com' && pass === 'admin') {
      const superAdmin: Merchant = { id: 'super', name: 'Plataforma', email, password: pass };
      localStorage.setItem('dha_is_platform_admin', 'true');
      return superAdmin;
    }

    const merchants: Merchant[] = JSON.parse(localStorage.getItem(KEYS.MERCHANTS) || '[]');
    const merchant = merchants.find(m => m.email === email && m.password === pass);
    if (merchant) {
      localStorage.setItem(KEYS.ACTIVE_MERCHANT, JSON.stringify(merchant));
      localStorage.removeItem('dha_is_platform_admin');
      if (merchant.storeId) {
        localStorage.setItem('dha_admin_store_context', merchant.storeId);
      }
      return merchant;
    }
    return null;
  },

  logoutMerchant: () => {
    localStorage.removeItem(KEYS.ACTIVE_MERCHANT);
    localStorage.removeItem('dha_admin_store_context');
    localStorage.removeItem('dha_is_platform_admin');
  },

  getLoggedMerchant: (): Merchant | null => {
    // Check for super admin first
    if (localStorage.getItem('dha_is_platform_admin') === 'true') {
      return { id: 'super', name: 'Plataforma', email: 'admin@bebidaexpress.com' };
    }
    const stored = localStorage.getItem(KEYS.ACTIVE_MERCHANT);
    return stored ? JSON.parse(stored) : null;
  },

  isPlatformAdmin: () => {
    return localStorage.getItem('dha_is_platform_admin') === 'true';
  },

  registerMerchant: (data: { name: string, email: string, password: string, storeName: string, whatsapp: string, address: string }) => {
    const merchants: Merchant[] = JSON.parse(localStorage.getItem(KEYS.MERCHANTS) || '[]');
    
    if (merchants.find(m => m.email === data.email)) {
      throw new Error('Email já cadastrado');
    }

    const newMerchantId = `m_${Date.now()}`;
    const newStoreId = `store_${Date.now()}`;

    // Create Store
    const newStore: Store = {
      id: newStoreId,
      name: data.storeName,
      image: 'https://images.unsplash.com/photo-1542834369-a1085f4301c0?auto=format&fit=crop&q=80&w=200', // Default image
      whatsapp: data.whatsapp,
      address: data.address,
      ownerId: newMerchantId,
      commissionRate: 0.05,
      isOnline: true,
      reputation: 100
    };
    const stores = db.getStores();
    stores.push(newStore);
    localStorage.setItem(KEYS.STORES, JSON.stringify(stores));

    // Create Merchant
    const newMerchant: Merchant = {
      id: newMerchantId,
      name: data.name,
      email: data.email,
      password: data.password,
      storeId: newStoreId
    };
    merchants.push(newMerchant);
    localStorage.setItem(KEYS.MERCHANTS, JSON.stringify(merchants));

    // Auto Login
    localStorage.setItem(KEYS.ACTIVE_MERCHANT, JSON.stringify(newMerchant));
    localStorage.setItem('dha_admin_store_context', newStoreId);

    return newMerchant;
  },

  // --- Store Management ---

  getStores: (): Store[] => {
    return JSON.parse(localStorage.getItem(KEYS.STORES) || '[]');
  },

  getStoreById: (id: string): Store | undefined => {
    const stores = db.getStores();
    return stores.find(s => s.id === id);
  },

  registerStore: (data: Omit<Store, 'id' | 'ownerId' | 'commissionRate' | 'isOnline' | 'reputation'>) => {
    const stores = db.getStores();
    const newStore: Store = {
      ...data,
      id: `store_${Date.now()}`,
      ownerId: 'manual_add', // Placeholder
      commissionRate: 0.05,
      isOnline: true,
      reputation: 100
    };
    stores.push(newStore);
    localStorage.setItem(KEYS.STORES, JSON.stringify(stores));
    return newStore;
  },

  deleteStore: (storeId: string) => {
    // This is a super admin function
    let stores = db.getStores();
    stores = stores.filter(s => s.id !== storeId);
    localStorage.setItem(KEYS.STORES, JSON.stringify(stores));
    
    // Also delete associated products
    let products = db.getProducts();
    products = products.filter(p => p.storeId !== storeId);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  toggleStoreOnline: (storeId: string): boolean => {
    const stores = db.getStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index >= 0) {
      stores[index].isOnline = !stores[index].isOnline;
      localStorage.setItem(KEYS.STORES, JSON.stringify(stores));
      return stores[index].isOnline;
    }
    return false;
  },

  // User/Client Methods
  getUser: (): User => {
    return JSON.parse(localStorage.getItem(KEYS.USER) || '{}');
  },
  
  updateUser: (user: User) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  registerClient: (userData: Omit<User, 'id' | 'isAdmin' | 'preferences'>) => {
    const newUser: User = {
      ...userData,
      id: `u_${Date.now()}`,
      isAdmin: false,
      preferences: []
    };
    localStorage.setItem(KEYS.USER, JSON.stringify(newUser));
    return newUser;
  },

  // Product Methods
  getProducts: (storeId?: string): Product[] => {
    const allProducts = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    if (storeId) {
      return allProducts.filter((p: Product) => p.storeId === storeId);
    }
    return allProducts;
  },

  saveProduct: (product: Product) => {
    // Ensure we are saving to the correct store context if not provided
    if (!product.storeId) {
      const contextStoreId = localStorage.getItem('dha_admin_store_context');
      if (contextStoreId) product.storeId = contextStoreId;
    }

    const products = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    const index = products.findIndex((p: Product) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push({ ...product, id: Date.now().toString() });
    }
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  deleteProduct: (id: string) => {
    const products = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]').filter((p: Product) => p.id !== id);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Order Methods
  getOrders: (storeId?: string): Order[] => {
    const allOrders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
    if (storeId) {
      return allOrders.filter((o: Order) => o.storeId === storeId);
    }
    return allOrders;
  },

  createOrder: (cartItems: any[], total: number, user: User, paymentMethod: PaymentMethod = PaymentMethod.WHATSAPP): Order => {
    const storeId = cartItems[0]?.storeId;
    if (!storeId) throw new Error("Carrinho inválido");

    // Check if store is online
    const store = db.getStoreById(storeId);
    if (!store?.isOnline) {
      throw new Error("Desculpe, esta loja está fechada no momento.");
    }

    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
    
    // INTEGRATION: AI Logic
    // Get all previous orders for context
    const allOrders = orders as Order[];
    const aiInsights = aiService.processOrderIntegration(
      { items: cartItems, total } as Order, 
      user, 
      allOrders
    );

    const newOrder: Order = {
      id: Date.now().toString(),
      storeId,
      userId: user.id,
      userName: user.name,
      items: cartItems,
      total,
      commission: total * 0.05, // 5% Platform Fee
      status: OrderStatus.PENDING,
      paymentMethod,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      aiInsights: aiInsights // Save AI Analysis
    };
    orders.unshift(newOrder); 
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    
    // Update Sales Count
    const products = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    cartItems.forEach(item => {
      const pIndex = products.findIndex((p: Product) => p.id === item.id);
      if (pIndex >= 0) {
        products[pIndex].stock = Math.max(0, products[pIndex].stock - item.quantity);
        products[pIndex].salesCount += item.quantity;
      }
    });
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    
    return newOrder;
  },

  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
    const index = orders.findIndex((o: Order) => o.id === orderId);
    if (index >= 0) {
      orders[index].status = status;
      orders[index].updatedAt = Date.now();
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
      
      // AI: Update Store Reputation based on Acceptance
      if (status === OrderStatus.IN_ROUTE || status === OrderStatus.DECLINED) {
         // Trigger AI recalibration (simulated in next refresh)
         // In a real app, this would call aiService.updateReputation(storeId)
      }
    }
  },

  // Helper for Push Notifications Simulation
  checkForNewPendingOrders: (storeId: string): boolean => {
    const orders = db.getOrders(storeId);
    // Check if there is any PENDING order created in the last 6 seconds
    const now = Date.now();
    return orders.some(o => o.status === OrderStatus.PENDING && (now - o.createdAt) < 6000);
  },

  getStoreConfig: (): StoreConfig => {
    return JSON.parse(localStorage.getItem(KEYS.CONFIG) || JSON.stringify({}));
  },

  updateStoreConfig: (config: StoreConfig) => {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  },

  // Notification Methods
  getNotifications: (): Notification[] => {
    return JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS) || '[]');
  },

  createNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const notifications = db.getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    notifications.unshift(newNotification); // Add to top
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    return newNotification;
  }
};
