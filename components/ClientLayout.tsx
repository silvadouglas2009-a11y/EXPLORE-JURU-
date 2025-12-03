import React from 'react';
import { Home, ShoppingCart, Package, User, Tag } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const ClientLayout = ({ children, cartCount }: { children?: React.ReactNode, cartCount: number }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? 'text-brand-blue font-bold scale-110' : 'text-gray-400';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-200">
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full bg-white border-t border-gray-200 py-3 px-6 flex justify-between items-center z-50">
        <Link to="/" className={`flex flex-col items-center transition-all ${isActive('/')}`}>
          <Home size={24} />
          <span className="text-xs mt-1">Início</span>
        </Link>
        
        <Link to="/promotions" className={`flex flex-col items-center transition-all ${isActive('/promotions')}`}>
          <Tag size={24} />
          <span className="text-xs mt-1">Ofertas</span>
        </Link>

        <Link to="/cart" className={`flex flex-col items-center transition-all relative ${isActive('/cart')}`}>
          <div className="relative">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-green text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-xs mt-1">Carrinho</span>
        </Link>

        <Link to="/orders" className={`flex flex-col items-center transition-all ${isActive('/orders')}`}>
          <Package size={24} />
          <span className="text-xs mt-1">Pedidos</span>
        </Link>

        <Link to="/profile" className={`flex flex-col items-center transition-all ${isActive('/profile')}`}>
          <User size={24} />
          <span className="text-xs mt-1">Perfil</span>
        </Link>
      </div>
    </div>
  );
};

export default ClientLayout;