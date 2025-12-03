
import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { Store, Order } from '../../types';
import { TrendingUp, DollarSign, Store as StoreIcon, Trash2, ShieldCheck, Activity } from 'lucide-react';

const PlatformDashboard = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setStores(db.getStores());
    const allOrders = db.getOrders();
    // Only calculate from valid sales
    const revenue = allOrders.reduce((acc, order) => acc + order.total, 0);
    const commission = allOrders.reduce((acc, order) => acc + (order.commission || 0), 0);
    
    setTotalRevenue(revenue);
    setTotalCommission(commission);
  };

  const handleDeleteStore = (id: string) => {
    if (confirm('ATENÇÃO: Isso excluirá a loja e todos os produtos dela. Continuar?')) {
      db.deleteStore(id);
      refreshData();
    }
  };

  // Helper to calculate simulated AI reputation for display
  const getStoreReputation = (storeId: string) => {
    // In a real app, this comes from db or aiService.calculateReputation(storeId)
    // Here we just mock it or grab existing property
    const store = stores.find(s => s.id === storeId);
    return store?.reputation || 100;
  };

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
           <div className="flex justify-between items-start mb-4">
             <div>
               <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Faturamento Global</p>
               <h3 className="text-3xl font-black text-white mt-1">R$ {totalRevenue.toFixed(2)}</h3>
             </div>
             <div className="bg-purple-500/20 p-3 rounded-lg text-purple-400">
               <Activity size={24} />
             </div>
           </div>
           <p className="text-xs text-gray-500">Volume total transacionado</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-emerald-800 p-6 rounded-2xl shadow-xl border border-green-500/30">
           <div className="flex justify-between items-start mb-4">
             <div>
               <p className="text-green-100 text-xs font-bold uppercase tracking-wider">Minha Comissão (5%)</p>
               <h3 className="text-3xl font-black text-white mt-1">R$ {totalCommission.toFixed(2)}</h3>
             </div>
             <div className="bg-white/20 p-3 rounded-lg text-white">
               <DollarSign size={24} />
             </div>
           </div>
           <p className="text-xs text-green-100 opacity-80">Lucro líquido da plataforma</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
           <div className="flex justify-between items-start mb-4">
             <div>
               <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Lojas Parceiras</p>
               <h3 className="text-3xl font-black text-white mt-1">{stores.length}</h3>
             </div>
             <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400">
               <StoreIcon size={24} />
             </div>
           </div>
           <p className="text-xs text-gray-500">Ativas no marketplace</p>
        </div>
      </div>

      {/* Stores List */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="text-purple-400" /> Gestão de Parceiros
        </h2>
        
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-900/50 border-b border-gray-700">
              <tr>
                <th className="p-4 font-bold text-gray-400 text-sm">Loja</th>
                <th className="p-4 font-bold text-gray-400 text-sm">Status</th>
                <th className="p-4 font-bold text-gray-400 text-sm">Reputação (IA)</th>
                <th className="p-4 font-bold text-gray-400 text-sm text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {stores.map(store => (
                <tr key={store.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-700 overflow-hidden">
                        <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{store.name}</p>
                        <p className="text-xs text-gray-500">{store.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {store.isOnline ? (
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/30">ONLINE</span>
                    ) : (
                      <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/30">OFFLINE</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-700 rounded-full h-2 w-24 overflow-hidden">
                        <div className="bg-brand-yellow h-full" style={{ width: `${getStoreReputation(store.id)}%` }}></div>
                      </div>
                      <span className="text-xs text-white font-bold">{getStoreReputation(store.id)}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDeleteStore(store.id)}
                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                      title="Excluir Loja"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stores.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Nenhuma loja cadastrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
