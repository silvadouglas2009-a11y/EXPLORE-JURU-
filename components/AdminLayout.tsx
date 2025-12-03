
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Beer, Settings, PackageCheck, BarChart3, LogOut, Menu, X, Bell, Store, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { aiService } from '../services/aiService';
import { db } from '../services/db';
import { Merchant } from '../types';

const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [storeName, setStoreName] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  
  // Push Notification State
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  useEffect(() => {
    // Auth Check
    const loggedMerchant = db.getLoggedMerchant();
    if (!loggedMerchant) {
      navigate('/merchant/login');
      return;
    }
    setMerchant(loggedMerchant);

    // Load Store Info for UI
    if (loggedMerchant.storeId) {
      const store = db.getStoreById(loggedMerchant.storeId);
      if (store) {
        setStoreName(store.name);
        setIsOnline(store.isOnline);
      }
    }

    // Push Notification Polling (Simulating Websocket)
    const interval = setInterval(() => {
      if (loggedMerchant.storeId) {
        const hasNew = db.checkForNewPendingOrders(loggedMerchant.storeId);
        if (hasNew) {
           setNewOrderAlert(true);
           // Play sound logic would go here
           // new Audio('/alert.mp3').play().catch(e => console.log('Audio blocked'));
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  const toggleOnline = () => {
    if (merchant?.storeId) {
      const newState = db.toggleStoreOnline(merchant.storeId);
      setIsOnline(newState);
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Beer, label: 'Produtos', path: '/admin/products' },
    { icon: PackageCheck, label: 'Pedidos', path: '/admin/orders' },
    { icon: Bell, label: 'Notificações', path: '/admin/notifications' },
    { icon: BarChart3, label: 'Relatórios', path: '/admin/reports' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings' },
  ];

  const handleLogout = () => {
    db.logoutMerchant();
    navigate('/');
  };

  if (!merchant) return null; // Prevent flicker

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* New Order Push Alert */}
      {newOrderAlert && (
        <div className="fixed top-4 right-4 z-50 bg-brand-blue text-white p-4 rounded-xl shadow-2xl animate-bounce cursor-pointer border-2 border-brand-yellow"
             onClick={() => { setNewOrderAlert(false); navigate('/admin/orders'); }}>
           <div className="flex items-center gap-3">
              <Bell className="text-brand-yellow animate-ping" />
              <div>
                <h4 className="font-bold">Novo Pedido Chegou!</h4>
                <p className="text-xs">Clique para visualizar e aceitar.</p>
              </div>
           </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-brand-blue text-white transition-all duration-300 flex flex-col shadow-xl fixed h-full z-40`}>
        <div className="p-4 flex items-center justify-between border-b border-blue-400">
          {isSidebarOpen && (
            <div>
              <h1 className="font-bold text-xl italic text-brand-yellow tracking-tighter">BEBIDA <span className="text-white">EXPRESS</span></h1>
              <p className="text-xs text-blue-100">Painel do Parceiro</p>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-blue-600 rounded">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Store Info Display */}
        {isSidebarOpen && storeName && (
          <div className="px-4 mt-4 space-y-3">
             <div className="bg-blue-800/50 p-3 rounded-lg border border-blue-400/30 flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-full">
                  <Store size={18} className="text-brand-yellow" />
                </div>
                <div>
                  <p className="text-[10px] text-blue-200 uppercase font-bold">Gerenciando</p>
                  <p className="font-bold text-sm leading-tight">{storeName}</p>
                </div>
             </div>

             {/* Online/Offline Toggle */}
             <div 
               onClick={toggleOnline}
               className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                 isOnline 
                 ? 'bg-green-500/20 border-green-400/50 text-green-100' 
                 : 'bg-red-500/20 border-red-400/50 text-red-100'
               }`}
             >
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                   <span className="font-bold text-xs uppercase">{isOnline ? 'Loja Aberta' : 'Loja Fechada'}</span>
                </div>
                {isOnline ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
             </div>
          </div>
        )}

        <nav className="flex-1 mt-6">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center p-4 hover:bg-blue-600 transition-colors ${active ? 'bg-blue-700 border-l-4 border-brand-yellow' : ''}`}
              >
                <item.icon size={24} className={active ? 'text-brand-yellow' : 'text-white'} />
                {isSidebarOpen && <span className="ml-4 font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-400">
           {isSidebarOpen && (
             <div className="mb-4 bg-blue-700 p-2 rounded text-xs">
               <p className="font-bold text-brand-yellow mb-1">DHA SmartCore™</p>
               <p>{aiService.getGreeting(merchant.name).split(',')[0]}!</p>
             </div>
           )}
          <button onClick={handleLogout} className="flex items-center w-full p-2 hover:bg-blue-600 rounded text-red-100 hover:text-white transition-colors">
            <LogOut size={24} />
            {isSidebarOpen && <span className="ml-4 font-bold">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-8`}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
