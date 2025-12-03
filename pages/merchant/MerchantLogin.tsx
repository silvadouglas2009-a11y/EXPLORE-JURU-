import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../services/db';
import { Store, ArrowLeft, LogIn, AlertCircle } from 'lucide-react';

const MerchantLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const merchant = db.loginMerchant(email, password);
    if (merchant) {
      navigate('/admin');
    } else {
      setError('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-6 bg-brand-blue text-center relative">
          <Link to="/" className="absolute left-4 top-4 text-white/80 hover:text-white">
            <ArrowLeft size={24} />
          </Link>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
            <Store className="text-brand-yellow" size={32} />
          </div>
          <h1 className="text-2xl font-black italic text-white tracking-tighter">Área do Parceiro</h1>
          <p className="text-blue-100 text-sm">Gerencie sua loja no Bebida Express</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">E-mail de Acesso</label>
              <input 
                type="email" 
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-brand-blue outline-none"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
              <input 
                type="password" 
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-brand-blue outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-brand-blue text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn size={20} /> Entrar no Painel
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm">Ainda não tem loja?</p>
            <Link to="/merchant/register" className="text-brand-green font-bold hover:underline">
              Cadastre-se e comece a vender
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantLogin;