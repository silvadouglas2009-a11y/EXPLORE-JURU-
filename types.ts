
export enum Category {
  BEER = 'Cervejas',
  WINE = 'Vinhos',
  SPIRITS = 'Destilados',
  ENERGY = 'Energéticos',
  ICE = 'Gelo',
  COMBO = 'Combos',
  CHOCOLATE = 'Chocolates',
  SNACKS = 'Salgadinhos',
  OLIVES = 'Azeitonas',
  CHARCOAL = 'Carvão',
  OTHER = 'Outros'
}

export enum OrderStatus {
  PENDING = 'Pendente',
  IN_ROUTE = 'Em rota',
  DELIVERED = 'Entregue',
  CANCELLED = 'Cancelado',
  DECLINED = 'Recusado' // Novo status
}

export enum PaymentMethod {
  WHATSAPP = 'A Combinar',
  PIX = 'Pix'
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, this would be hashed
  storeId?: string; // Link to their store
}

export interface Store {
  id: string;
  name: string;
  image: string;
  whatsapp: string;
  address: string;
  ownerId: string;
  commissionRate: number;
  isOnline: boolean; // Novo controle de disponibilidade
  reputation?: number; // 0-100 Calculado pela IA
}

export interface Product {
  id: string;
  storeId?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  stock: number;
  oldPrice?: number; // For promotions
  isPromo?: boolean;
  salesCount: number; // For IA tracking
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderAIInsights {
  customerLabel: 'Novo' | 'Recorrente' | 'VIP' | 'Ausente';
  churnRisk: boolean;
  suggestedAction: string;
  priorityScore: number; // 1-10
}

export interface Order {
  id: string;
  storeId?: string;
  userId: string;
  userName: string;
  items: CartItem[];
  total: number;
  commission?: number;
  status: OrderStatus;
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
  paymentMethod: PaymentMethod;
  aiInsights?: OrderAIInsights; // Integração IA
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isAdmin: boolean;
  preferences: Category[];
}

export interface StoreConfig {
  storeName: string;
  whatsappPhone: string;
  address: string;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  activePromos: number;
  lowStock: number;
  acceptanceRate?: number; // IA Metric
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: 'promo' | 'info';
  isRead?: boolean; // Client-side logic
}
