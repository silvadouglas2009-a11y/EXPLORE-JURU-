import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientLayout from './components/ClientLayout';
import AdminLayout from './components/AdminLayout';

// Client Pages
import Home from './pages/client/Home';
import Cart from './pages/client/Cart';
import Orders from './pages/client/Orders';
import Profile from './pages/client/Profile';
import StoreList from './pages/client/StoreList';

// Merchant Pages (Auth)
import MerchantLogin from './pages/merchant/MerchantLogin';
import MerchantRegister from './pages/merchant/MerchantRegister';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/AdminOrders';
import Products from './pages/admin/Products';
import Settings from './pages/admin/Settings';
import Notifications from './pages/admin/Notifications';

import { CartItem, Product } from './types';

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Cart Actions (Wrapper to handle store conflicts logic)
  const addToCart = (product: Product) => {
    setCart(prev => {
      // Check for store conflict
      if (prev.length > 0 && prev[0].storeId !== product.storeId) {
         const confirmSwitch = window.confirm("Seu carrinho contém itens de outra loja. Deseja limpar o carrinho para adicionar este item?");
         if (confirmSwitch) {
            return [{ ...product, quantity: 1 }];
         }
         return prev; // Do nothing
      }

      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <HashRouter>
      <Routes>
        {/* Marketplace Routes */}
        <Route path="/stores" element={<StoreList />} />

        {/* Merchant Auth Routes */}
        <Route path="/merchant/login" element={<MerchantLogin />} />
        <Route path="/merchant/register" element={<MerchantRegister />} />

        {/* Client Routes (Protected by Store Selection Logic) */}
        <Route path="/" element={<ClientLayout cartCount={cart.length}><Home onAddToCart={addToCart} /></ClientLayout>} />
        <Route path="/promotions" element={<ClientLayout cartCount={cart.length}><Home onAddToCart={addToCart} /></ClientLayout>} />
        <Route path="/cart" element={
          <ClientLayout cartCount={cart.length}>
            <Cart items={cart} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} onClear={clearCart} />
          </ClientLayout>
        } />
        <Route path="/orders" element={<ClientLayout cartCount={cart.length}><Orders /></ClientLayout>} />
        <Route path="/profile" element={<ClientLayout cartCount={cart.length}><Profile /></ClientLayout>} />

        {/* Admin Routes (Protected by Merchant Auth in Layout) */}
        <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
        <Route path="/admin/products" element={<AdminLayout><Products /></AdminLayout>} />
        <Route path="/admin/notifications" element={<AdminLayout><Notifications /></AdminLayout>} />
        <Route path="/admin/reports" element={<AdminLayout><div className="p-10 font-bold text-gray-500">Módulo de Relatórios (Em breve)</div></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><Settings /></AdminLayout>} />
        
        {/* Fallback - Check if store is selected or not */}
        <Route path="*" element={<Navigate to="/stores" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;