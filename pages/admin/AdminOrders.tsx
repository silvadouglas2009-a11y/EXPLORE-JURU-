
import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { aiService } from '../../services/aiService';
import { Order, OrderStatus, PaymentMethod } from '../../types';
import { Truck, Check, X, QrCode, Banknote, Sparkles, AlertTriangle, UserCheck, Star, ThumbsUp, ThumbsDown } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [insights, setInsights] = useState<any>({});
  const storeId = localStorage.getItem('dha_admin_store_context');

  const fetchOrders = () => {
    if (storeId) {
      setOrders(db.getOrders(storeId));
      setInsights(aiService.getAdminInsights());
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000); // Faster polling for orders
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    if (status === OrderStatus.DECLINED) {
      if (!window.confirm("Recusar este pedido? Isso pode afetar sua reputação na plataforma.")) return;
    }
    db.updateOrderStatus(orderId, status);
    fetchOrders(); // Immediate update
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Pedidos</h2>
        <div className="bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm flex items-center gap-3">
           <span className="text-xs font-bold text-gray-500 uppercase">Reputação IA</span>
           <div className="flex items-center gap-1">
             <Star size={16} className="text-brand-yellow fill-brand-yellow" />
             <span className="font-bold text-gray-800">{insights.acceptanceRate || 100}%</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.map(order => (
          <div key={order.id} className={`bg-white p-6 rounded-xl shadow-sm border flex flex-col gap-4 animate-in fade-in duration-500 relative overflow-hidden transition-all ${
            order.status === OrderStatus.PENDING ? 'border-l-4 border-l-brand-yellow border-gray-200 shadow-md' : 'border-gray-200 opacity-90'
          }`}>
             
             {/* AI Priority Indicator */}
             {order.aiInsights && order.aiInsights.priorityScore >= 8 && order.status === OrderStatus.PENDING && (
               <div className="absolute top-0 right-0 bg-brand-yellow text-blue-900 text-xs font-bold px-3 py-1 rounded-bl-xl z-10 flex items-center gap-1 shadow-sm animate-pulse">
                 <Star size={12} fill="currentColor" /> Prioridade Alta
               </div>
             )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-700' :
                    order.status === OrderStatus.IN_ROUTE ? 'bg-blue-100 text-blue-700' :
                    order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.status === OrderStatus.IN_ROUTE ? 'ACEITO & EM ROTA' : order.status}
                  </span>
                  <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  {order.userName}
                  {order.aiInsights?.customerLabel === 'VIP' && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 rounded-full border border-purple-200">VIP</span>}
                  {order.aiInsights?.customerLabel === 'Novo' && <span className="bg-green-100 text-green-700 text-[10px] px-2 rounded-full border border-green-200">Novo</span>}
                </h3>
                
                <p className="text-sm text-gray-500 mb-2">Itens: {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                
                <div className="flex items-center justify-between md:justify-start md:gap-8 mt-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      {order.paymentMethod === PaymentMethod.PIX ? 
                        <><QrCode size={16} className="text-brand-green" /> <span className="font-bold text-brand-green">Pix</span></> : 
                        <><Banknote size={16} className="text-brand-blue" /> <span>A Combinar</span></>
                      }
                    </div>
                    <p className="font-black text-brand-blue text-lg">R$ {order.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Action Buttons Logic */}
              <div className="flex gap-2 w-full md:w-auto">
                {order.status === OrderStatus.PENDING && (
                  <>
                    <button 
                      onClick={() => handleStatusChange(order.id, OrderStatus.IN_ROUTE)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-green-600 transition-colors font-bold shadow-lg shadow-green-100"
                    >
                      <ThumbsUp size={18} /> ACEITAR
                    </button>
                    <button 
                      onClick={() => handleStatusChange(order.id, OrderStatus.DECLINED)}
                      className="p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                      title="Recusar Pedido"
                    >
                      <ThumbsDown size={18} />
                    </button>
                  </>
                )}

                {order.status === OrderStatus.IN_ROUTE && (
                  <button 
                    onClick={() => handleStatusChange(order.id, OrderStatus.DELIVERED)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium border border-blue-200"
                  >
                    <Check size={18} /> Marcar Entregue
                  </button>
                )}
              </div>
            </div>
            
            {/* AI Insights Panel */}
            {order.aiInsights && order.status === OrderStatus.PENDING && (
              <div className="mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100 flex items-start gap-3">
                 <div className="bg-white p-1.5 rounded-full shadow-sm text-brand-blue">
                   <Sparkles size={16} />
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">DHA Neural Insight™</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                       <p><span className="font-semibold">Perfil:</span> {order.aiInsights.customerLabel}</p>
                       <p><span className="font-semibold">Risco de Perda:</span> {order.aiInsights.churnRisk ? 'Sim ⚠️' : 'Não'}</p>
                    </div>
                    <p className="text-sm font-medium text-blue-900 mt-1 border-t border-blue-100 pt-1">
                      💡 {order.aiInsights.suggestedAction}
                    </p>
                 </div>
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center p-10 bg-white rounded-xl border border-dashed border-gray-300">
             <p className="text-gray-400 font-medium">Aguardando novos pedidos...</p>
             <p className="text-xs text-gray-300 mt-1">Sua loja está {insights.acceptanceRate ? 'monitorada pela IA' : 'pronta'}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
