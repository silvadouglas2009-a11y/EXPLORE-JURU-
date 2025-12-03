import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { aiService } from '../../services/aiService';
import { Product, Category, Notification, Store } from '../../types';
import { Search, Plus, Bell, X, Megaphone, Info, SlidersHorizontal, Check, Gift, Sun, Moon, Star } from 'lucide-react';

interface Props {
  onAddToCart: (product: Product) => void;
}

const Home: React.FC<Props> = ({ onAddToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState(db.getUser());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [greeting, setGreeting] = useState('');
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [currentStore, setCurrentStore] = useState<Store | undefined>(undefined);
  const [isDay, setIsDay] = useState(true);
  
  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  // Advanced Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 1000,
    inStockOnly: false
  });
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 1000 });

  useEffect(() => {
    // Time Logic
    const hour = new Date().getHours();
    setIsDay(hour >= 6 && hour < 18);

    // Determine Current Store
    const storeId = localStorage.getItem('dha_current_store');
    const store = storeId ? db.getStoreById(storeId) : undefined;
    setCurrentStore(store);

    // Initial Load
    const loadData = () => {
      const loadedProducts = db.getProducts(storeId || undefined);
      setProducts(loadedProducts);
      setUser(db.getUser());
      setGreeting(aiService.getGreeting(db.getUser().name));
      setRecommendations(aiService.getRecommendations(db.getUser().id));
      
      // Calculate Price Bounds for Filters
      if (loadedProducts.length > 0) {
        const prices = loadedProducts.map(p => p.price);
        const max = Math.ceil(Math.max(...prices));
        const min = Math.floor(Math.min(...prices));
        setPriceBounds({ min: 0, max: max + 20 }); // Add buffer
        
        // Only set default max price if it hasn't been touched yet or is initial load
        setFilters(prev => {
          if (prev.maxPrice === 1000) return { ...prev, maxPrice: max + 20 };
          return prev;
        });
      }

      // Notifications check
      const notifs = db.getNotifications();
      setNotifications(notifs);
      
      // Check last read timestamp from local storage (client-side specific)
      const lastCheck = localStorage.getItem('dha_last_notif_check');
      if (notifs.length > 0) {
        if (!lastCheck || notifs[0].timestamp > parseInt(lastCheck)) {
          setHasUnread(true);
        }
      }
    };
    loadData();

    // 5-second update interval
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenNotifications = () => {
    setIsNotifModalOpen(true);
    setHasUnread(false);
    // Update last checked time
    localStorage.setItem('dha_last_notif_check', Date.now().toString());
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesPrice = p.price >= filters.minPrice && p.price <= filters.maxPrice;
    const matchesStock = filters.inStockOnly ? p.stock > 0 : true;

    return matchesSearch && matchesCategory && matchesPrice && matchesStock;
  });

  const activeFiltersCount = (filters.inStockOnly ? 1 : 0) + (filters.minPrice > 0 ? 1 : 0) + (filters.maxPrice < priceBounds.max ? 1 : 0);

  return (
    <div className="pb-6">
      {/* Header */}
      <header className={`p-6 rounded-b-[2rem] shadow-lg text-white relative overflow-hidden transition-all duration-700 ${
        isDay ? 'bg-brand-blue' : 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'
      }`}>
        {/* Animated Background Icon */}
        <div className="absolute -top-6 -right-6 opacity-20 pointer-events-none">
           {isDay ? (
             <Sun size={120} className="text-yellow-300 fill-yellow-300 animate-spin-slow" style={{ animationDuration: '20s' }} />
           ) : (
             <div className="relative">
                <Moon size={100} className="text-yellow-50 fill-yellow-50" />
                <Star size={20} className="absolute top-0 -left-10 text-white animate-pulse" />
             </div>
           )}
        </div>
        
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-brand-yellow drop-shadow-sm">Bebida <span className="text-white">Express</span></h1>
            {currentStore ? (
               <p className="text-blue-100 text-xs mt-1 font-bold bg-white/20 px-2 py-1 rounded-lg inline-block backdrop-blur-sm border border-white/10">
                 📍 {currentStore.name}
               </p>
            ) : (
               <p className="text-blue-100 text-sm mt-1">{greeting}</p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button 
              onClick={handleOpenNotifications}
              className="relative p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              <Bell size={20} />
              {hasUnread && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-brand-blue animate-pulse"></span>
              )}
            </button>

            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold border-2 border-brand-green backdrop-blur-sm shadow-sm">
              {user.name.charAt(0)}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="relative z-10 flex gap-2">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder={isDay ? "O que vamos beber hoje?" : "Bateu a sede na madrugada?"}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md text-white placeholder-blue-200 focus:outline-none focus:bg-white/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 text-blue-200" size={18} />
          </div>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className={`p-3 rounded-xl backdrop-blur-md border transition-all relative ${
              activeFiltersCount > 0 
              ? 'bg-brand-yellow text-brand-blue border-brand-yellow' 
              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`}
          >
            <SlidersHorizontal size={20} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-brand-blue">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </header>
      
      {/* Combos Banner (New Section) */}
      <section className="mt-4 px-6">
        <button 
          onClick={() => setSelectedCategory('Combos')}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-4 shadow-lg shadow-indigo-200 text-white flex items-center justify-between group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Gift size={80} className="transform rotate-12" />
          </div>
          <div className="relative z-10">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Gift size={20} className="text-brand-yellow animate-bounce" /> Combos & Ofertas
            </h3>
            <p className="text-xs text-indigo-100">Economize levando mais!</p>
          </div>
          <div className="bg-white/20 p-2 rounded-full relative z-10 group-hover:bg-white/30 transition-colors">
             <Search size={20} className="text-white" />
          </div>
        </button>
      </section>

      {/* AI Recommendations */}
      {searchTerm === '' && selectedCategory === 'Todos' && activeFiltersCount === 0 && (
        <section className="mt-6 px-6">
          <div className="flex items-center justify-between mb-3">
             <h2 className="font-bold text-gray-800">Sugeridos para você</h2>
             <span className="text-[10px] bg-brand-blue text-white px-2 py-0.5 rounded-full flex items-center gap-1">✨ IA</span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {recommendations.map(prod => (
              <div key={prod.id} className="min-w-[140px] bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                <img src={prod.image} alt={prod.name} className="w-20 h-20 object-contain mb-2" />
                <h3 className="text-xs font-bold text-center line-clamp-2 h-8">{prod.name}</h3>
                <p className="text-brand-green font-bold text-sm mt-1">R$ {prod.price.toFixed(2)}</p>
                <button 
                  onClick={() => onAddToCart(prod)}
                  className="mt-2 w-full bg-blue-50 text-brand-blue text-xs font-bold py-1.5 rounded-lg hover:bg-brand-blue hover:text-white transition-colors"
                >
                  Adicionar
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="mt-4 px-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['Todos', ...Object.values(Category)].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-brand-green text-white shadow-md shadow-green-200' 
                  : 'bg-white text-gray-500 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product List */}
      <section className="mt-6 px-6 grid grid-cols-2 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative group">
            {product.isPromo && (
              <span className="absolute top-2 left-2 bg-brand-yellow text-brand-blue text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                OFERTA
              </span>
            )}
            <div className="flex-1 flex justify-center mb-4 relative">
               <img src={product.image} alt={product.name} className={`h-28 object-contain group-hover:scale-105 transition-transform ${product.stock === 0 ? 'opacity-50 grayscale' : ''}`} />
               {product.stock === 0 && (
                 <div className="absolute inset-0 flex items-center justify-center">
                   <span className="bg-gray-800/80 text-white text-xs font-bold px-2 py-1 rounded">ESGOTADO</span>
                 </div>
               )}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase">{product.category}</p>
              <h3 className="font-bold text-sm text-gray-800 leading-tight mb-1 line-clamp-2">{product.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{product.description}</p>
              
              <div className="flex items-center justify-between">
                <div>
                   {product.oldPrice && <p className="text-[10px] text-gray-400 line-through">R$ {product.oldPrice.toFixed(2)}</p>}
                   <p className="text-base font-black text-brand-blue">R$ {product.price.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => product.stock > 0 && onAddToCart(product)}
                  disabled={product.stock === 0}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    product.stock > 0 
                    ? 'bg-brand-green text-white hover:bg-green-600 shadow-green-200 active:scale-90' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
      
      {filteredProducts.length === 0 && (
        <div className="text-center mt-10 text-gray-400 px-6">
          <p className="font-bold text-lg mb-2">Ops!</p>
          <p>Nenhum produto encontrado com estes filtros.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Todos');
              setFilters({ minPrice: 0, maxPrice: priceBounds.max, inStockOnly: false });
            }}
            className="mt-4 text-brand-blue text-sm font-bold underline"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Advanced Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
           <div className="fixed inset-0 bg-black/60 transition-opacity" onClick={() => setIsFilterOpen(false)}></div>
           
           <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl z-10 p-6 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <SlidersHorizontal size={24} className="text-brand-blue" /> Filtros Avançados
                </h3>
                <button onClick={() => setIsFilterOpen(false)} className="bg-gray-100 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Faixa de Preço (R$)</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">Mínimo</p>
                      <input 
                        type="number" 
                        min="0"
                        max={filters.maxPrice}
                        className="w-full p-3 border border-gray-200 rounded-xl font-bold text-gray-700 focus:border-brand-blue outline-none"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({...filters, minPrice: Number(e.target.value)})}
                      />
                    </div>
                    <div className="w-4 h-[2px] bg-gray-300 mt-5"></div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">Máximo</p>
                      <input 
                        type="number" 
                        min={filters.minPrice}
                        className="w-full p-3 border border-gray-200 rounded-xl font-bold text-gray-700 focus:border-brand-blue outline-none"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                {/* Stock Toggle */}
                <div 
                  onClick={() => setFilters({...filters, inStockOnly: !filters.inStockOnly})}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer border border-transparent hover:border-gray-200 transition-all"
                >
                   <div className="flex items-center gap-3">
                     <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${filters.inStockOnly ? 'bg-brand-green border-brand-green text-white' : 'bg-white border-gray-300'}`}>
                        {filters.inStockOnly && <Check size={16} />}
                     </div>
                     <span className="font-medium text-gray-700">Apenas produtos em estoque</span>
                   </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    onClick={() => {
                      setFilters({ minPrice: 0, maxPrice: priceBounds.max, inStockOnly: false });
                    }}
                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl"
                  >
                    Limpar
                  </button>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 py-3 bg-brand-blue text-white font-bold rounded-xl shadow-lg shadow-blue-200"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Notifications Modal */}
      {isNotifModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="fixed inset-0 bg-black/60 transition-opacity" onClick={() => setIsNotifModalOpen(false)}></div>
          
          <div className="bg-white w-full max-w-md h-[80vh] sm:h-auto sm:rounded-2xl rounded-t-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Bell size={20} className="text-brand-blue" /> Notificações
              </h2>
              <button onClick={() => setIsNotifModalOpen(false)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 pb-10">
                   <Bell size={48} className="mb-4 text-gray-200" />
                   <p>Nenhuma notificação por enquanto.</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${notif.type === 'promo' ? 'bg-brand-yellow' : 'bg-brand-blue'}`}></div>
                    <div className="flex justify-between items-start mb-1 pl-2">
                      <div className="flex items-center gap-2">
                        {notif.type === 'promo' ? <Megaphone size={14} className="text-brand-yellow" /> : <Info size={14} className="text-brand-blue" />}
                        <span className="font-bold text-sm text-gray-800">{notif.title}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{new Date(notif.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-600 pl-2 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;