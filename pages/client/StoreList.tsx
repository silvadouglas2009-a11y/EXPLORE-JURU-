
import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Store } from '../../types';
import { useNavigate, Link } from 'react-router-dom';
import { Store as StoreIcon, MapPin, ChevronRight, Search, UserPlus, ShoppingBag, X, Check, User, LogIn, Sun, Moon, Cloud, Star, Lock } from 'lucide-react';

const StoreList = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDay, setIsDay] = useState(true);
  const navigate = useNavigate();

  // Modals State for Client only
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', address: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Clear any previous store selection when returning to list
    localStorage.removeItem('dha_current_store');
    
    // Poll stores to check online/offline status
    const updateStores = () => setStores(db.getStores());
    updateStores();
    const interval = setInterval(updateStores, 3000);

    // Time Logic
    const hour = new Date().getHours();
    setIsDay(hour >= 6 && hour < 18);

    return () => clearInterval(interval);
  }, []);

  const handleSelectStore = (store: Store) => {
    if (!store.isOnline) {
      alert("Esta loja está fechada no momento. Tente novamente mais tarde.");
      return;
    }
    localStorage.setItem('dha_current_store', store.id);
    navigate('/');
  };

  const filteredStores = stores.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRegisterClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.phone) return;

    setIsLoading(true);
    setTimeout(() => {
      db.registerClient({
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        address: newClient.address
      });
      setIsLoading(false);
      setShowClientModal(false);
      setNewClient({ name: '', email: '', phone: '', address: '' });
      alert(`Bem-vindo, ${newClient.name}! Sua conta foi criada.`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 relative overflow-hidden">
      {/* Dynamic Background Decoration */}
      <div className={`absolute top-0 left-0 w-full h-80 rounded-b-[4rem] z-0 transition-all duration-1000 ${
        isDay 
          ? 'bg-gradient-to-b from-sky-300 to-brand-blue' 
          : 'bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900'
      }`}>
        {/* Animated Elements */}
        {isDay ? (
          <>
            <div className="absolute top-10 right-10 animate-pulse">
               <Sun size={80} className="text-yellow-300 fill-yellow-300 drop-shadow-[0_0_25px_rgba(253,224,71,0.6)]" />
            </div>
            <div className="absolute top-20 left-10 opacity-60 animate-bounce" style={{ animationDuration: '3s' }}>
               <Cloud size={40} className="text-white fill-white" />
            </div>
            <div className="absolute top-32 right-32 opacity-40 animate-bounce" style={{ animationDuration: '5s' }}>
               <Cloud size={32} className="text-white fill-white" />
            </div>
          </>
        ) : (
          <>
            <div className="absolute top-10 right-8">
               <Moon size={70} className="text-yellow-50 fill-yellow-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
            </div>
            {/* Stars */}
            <Star size={12} className="absolute top-12 left-10 text-white fill-white animate-pulse" style={{ animationDelay: '0.2s' }} />
            <Star size={16} className="absolute top-24 left-1/4 text-yellow-100 fill-yellow-100 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <Star size={10} className="absolute top-8 left-2/3 text-white fill-white animate-pulse" style={{ animationDelay: '1s' }} />
            <Star size={14} className="absolute top-32 right-1/3 text-blue-200 fill-blue-200 animate-pulse" style={{ animationDelay: '1.5s' }} />
          </>
        )}
      </div>
      
      <div className="relative z-10 w-full max-w-md flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-8 pt-6">
           <div className={`p-4 rounded-full w-24 h-24 mx-auto flex items-center justify-center backdrop-blur-md mb-4 border-4 shadow-xl transition-all ${
             isDay ? 'bg-white/30 border-white/40' : 'bg-white/10 border-indigo-400/30'
           }`}>
             <StoreIcon size={48} className={isDay ? 'text-brand-yellow drop-shadow-sm' : 'text-blue-200 drop-shadow-sm'} />
           </div>
           <h1 className="text-3xl font-black italic text-brand-yellow drop-shadow-md tracking-tighter">
             BEBIDA <span className="text-white">EXPRESS</span>
           </h1>
           <p className={`font-medium mt-1 text-sm ${isDay ? 'text-blue-50' : 'text-indigo-200'}`}>
             Seu primeiro app de delivery de bebida de Juruá AM
           </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
           <input 
             type="text" 
             placeholder="Buscar loja ou bairro..." 
             className="w-full pl-10 pr-4 py-3.5 rounded-xl border-none shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-700 font-medium bg-white/95 backdrop-blur"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
        </div>

        {/* Store List */}
        <div className="flex-1 space-y-4 pb-32">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <MapPin size={18} className="text-brand-green" /> Lojas Disponíveis
          </h2>
          
          {filteredStores.length === 0 ? (
             <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 opacity-80">
                <p className="text-gray-400">Nenhuma loja encontrada.</p>
             </div>
          ) : (
            filteredStores.map(store => (
              <div 
                key={store.id} 
                onClick={() => handleSelectStore(store)}
                className={`bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-4 transition-all cursor-pointer group relative overflow-hidden ${
                  store.isOnline 
                  ? 'border-gray-100 hover:shadow-md hover:scale-[1.02]' 
                  : 'border-gray-200 opacity-70 grayscale bg-gray-50'
                }`}
              >
                {/* Online/Offline Badge */}
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-white ${store.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>

                <img 
                  src={store.image} 
                  alt={store.name} 
                  className="w-16 h-16 rounded-xl object-cover border border-gray-100 group-hover:border-brand-blue transition-colors" 
                />
                <div className="flex-1">
                   <h3 className="font-bold text-gray-800 text-lg">{store.name}</h3>
                   <div className="flex items-center gap-1 text-gray-400 text-xs">
                     <MapPin size={12} />
                     <span className="line-clamp-1">{store.address}</span>
                   </div>
                   {store.isOnline ? (
                      <p className="text-xs text-brand-green font-bold mt-1">Aberto • Entrega Rápida</p>
                   ) : (
                      <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                        <Lock size={10} /> Fechado no momento
                      </p>
                   )}
                </div>
                {store.isOnline && (
                  <div className="bg-gray-50 p-2 rounded-full group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <ChevronRight size={20} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Action Buttons (Footer) */}
        <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
          <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
             <Link 
               to="/merchant/register"
               className="flex flex-col items-center justify-center p-3 bg-blue-50 text-brand-blue rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors"
             >
               <ShoppingBag size={20} className="mb-1" />
               <span className="text-xs font-bold">Cadastrar Loja</span>
               <span className="text-[10px] text-blue-400">Seja parceiro</span>
             </Link>

             <button 
               onClick={() => setShowClientModal(true)}
               className="flex flex-col items-center justify-center p-3 bg-green-50 text-brand-green rounded-xl border border-green-100 hover:bg-green-100 transition-colors"
             >
               <UserPlus size={20} className="mb-1" />
               <span className="text-xs font-bold">Criar Conta</span>
               <span className="text-[10px] text-green-500">Sou cliente</span>
             </button>
          </div>
          <div className="max-w-md mx-auto mt-2 text-center">
             <Link to="/merchant/login" className="text-xs text-gray-400 hover:text-brand-blue flex items-center justify-center gap-1">
               <LogIn size={12} /> Já é lojista? Fazer Login
             </Link>
          </div>
        </div>
      </div>

      {/* MODAL: REGISTER CLIENT */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
              <button 
                onClick={() => setShowClientModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-100 text-brand-green rounded-full flex items-center justify-center mx-auto mb-2">
                   <User size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Crie sua Conta</h2>
                <p className="text-sm text-gray-500">Para fazer pedidos mais rápido.</p>
              </div>

              <form onSubmit={handleRegisterClient} className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1">Seu Nome</label>
                   <input required type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-green outline-none" 
                     placeholder="Como quer ser chamado?"
                     value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1">Seu WhatsApp</label>
                   <input required type="tel" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-green outline-none" 
                     placeholder="Para contato sobre entregas"
                     value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1">Endereço Padrão</label>
                   <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-green outline-none" 
                     placeholder="Facilita na hora da entrega"
                     value={newClient.address} onChange={e => setNewClient({...newClient, address: e.target.value})}
                   />
                 </div>
                 
                 <button 
                   type="submit" 
                   disabled={isLoading}
                   className="w-full bg-brand-green text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                 >
                   {isLoading ? 'Criando...' : 'Criar Minha Conta'}
                   {!isLoading && <Check size={20} />}
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default StoreList;
