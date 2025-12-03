
import { db } from './db';
import { Product, Category, Order, User, OrderAIInsights, OrderStatus } from '../types';

export const aiService = {
  getGreeting: (userName: string): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return `Bom dia, ${userName}! Vamos abastecer?`;
    if (hour >= 12 && hour < 18) return `Boa tarde, ${userName}! Que tal algo gelado?`;
    if (hour >= 18 || hour < 5) return `Fala ${userName}, pronto pra mais uma gelada?`;
    return `Olá, ${userName}!`;
  },

  getRecommendations: (userId: string): Product[] => {
    const products = db.getProducts();
    // Simulate smart logic: Prioritize high sales and user preferences (Mocked)
    return products
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 4);
  },

  generateDynamicCombos: (): Product[] => {
    const products = db.getProducts();
    return products.filter(p => p.category === Category.COMBO);
  },

  getAdminInsights: () => {
    const products = db.getProducts();
    const storeId = localStorage.getItem('dha_admin_store_context');
    const orders = db.getOrders(storeId || undefined);
    
    const lowStock = products.filter(p => p.stock < 20);
    const revenue = orders.filter(o => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.DECLINED).reduce((acc, order) => acc + order.total, 0);
    const topProduct = products.sort((a, b) => b.salesCount - a.salesCount)[0];

    // AI Reputation Calculation
    const totalOrders = orders.length;
    const acceptedOrders = orders.filter(o => o.status !== OrderStatus.DECLINED && o.status !== OrderStatus.CANCELLED).length;
    const acceptanceRate = totalOrders > 0 ? (acceptedOrders / totalOrders) * 100 : 100;

    return {
      stockAlerts: lowStock.map(p => `Estoque baixo: ${p.name} (${p.stock} un)`),
      priceSuggestion: topProduct ? `Alta demanda para ${topProduct.name}. Considere aumentar preço em 5%.` : '',
      revenueToday: revenue,
      acceptanceRate: Math.round(acceptanceRate)
    };
  },

  /**
   * CORE INTEGRATION: Processes the order between Client and Merchant.
   * Analyzes customer history to give the merchant context.
   */
  processOrderIntegration: (order: Order, user: User, historyOrders: Order[]): OrderAIInsights => {
    const userOrders = historyOrders.filter(o => o.userId === user.id);
    const orderCount = userOrders.length;
    
    // Calculate total spent history
    const totalSpent = userOrders.reduce((acc, o) => acc + o.total, 0);
    
    let customerLabel: 'Novo' | 'Recorrente' | 'VIP' | 'Ausente' = 'Novo';
    let suggestedAction = 'Verifique endereço e boas-vindas.';
    let priorityScore = 5;

    // Logic to label customer
    if (orderCount === 0) {
      customerLabel = 'Novo';
      priorityScore = 8; // High priority to impress new customer
      suggestedAction = 'Envie um brinde de boas-vindas ou cupom para próxima compra.';
    } else if (totalSpent > 500 || orderCount > 10) {
      customerLabel = 'VIP';
      priorityScore = 10;
      suggestedAction = 'Cliente VIP. Prioridade máxima na entrega.';
    } else if (orderCount > 2) {
      customerLabel = 'Recorrente';
      priorityScore = 6;
      suggestedAction = 'Cliente fiel. Agradeça a preferência.';
    }

    // Check churn risk (if last order was long ago)
    const lastOrder = userOrders[0]; // Assuming sorted desc
    let churnRisk = false;
    if (lastOrder) {
      const daysSinceLast = (Date.now() - lastOrder.createdAt) / (1000 * 60 * 60 * 24);
      if (daysSinceLast > 30) {
        churnRisk = true;
        customerLabel = 'Ausente';
        suggestedAction = 'Cliente retornando após tempo inativo. Trate com carinho!';
        priorityScore += 1;
      }
    }

    // Cart analysis for cross-selling tips
    const hasBeer = order.items.some(i => i.category === Category.BEER);
    const hasIce = order.items.some(i => i.category === Category.ICE);
    const hasSnacks = order.items.some(i => i.category === Category.SNACKS);

    if (hasBeer && !hasIce) {
      suggestedAction += ' (Sugira Gelo na confirmação)';
    } else if (hasBeer && !hasSnacks) {
      suggestedAction += ' (Sugira Salgadinhos)';
    }

    return {
      customerLabel,
      churnRisk,
      suggestedAction,
      priorityScore
    };
  }
};
