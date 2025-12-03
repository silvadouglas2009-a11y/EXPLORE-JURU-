import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../services/db';
import { ShoppingBag, ArrowLeft, Check, AlertCircle } from 'lucide-react';

const MerchantRegister = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    storeName: '',
    whatsapp: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      try {
        db.registerMerchant(formData);
        navigate('/admin');
      } catch (err: any) {
        setError(err.message || 'Erro ao cadastrar. Tente novamente.');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-6 bg-brand-green text-center relative">
          <Link to="/" className="absolute left-4 top-4 text-white/80 hover:text-white">
            <ArrowLeft size={24} />
          </Link>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
            <ShoppingBag className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-black italic text-white tracking-tighter">Seja Parceiro</h1>
          <p className="text-green-100 text-sm">Cadastre sua loja no Bebida Express</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 mb-4">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Personal Info */}
            <div>
              <h3 className="text-gray-800 font-bold border-b pb-2 mb-4">1. Dados de Acesso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Seu Nome Completo</label>
                  <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-green outline-none"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">E-mail</label>
                  <input required type="email" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-green outline-none"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Senha</label>
                  <input required type="password" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-green outline-none"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Store Info */}
            <div>
              <h3 className="text-gray-800 font-bold border-b pb-2 mb-4 mt-6">2. Dados da Loja</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Nome da Loja</label>
                  <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-green outline-none"
                    placeholder="Ex: Adega do João"
                    value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">WhatsApp Comercial</label>
                  <input required type="tel" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-green outline-none"
                    placeholder="5511999999999"
                    value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Endereço Completo</label>
                  <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-green outline-none"
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-brand-green text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? 'Criando Loja...' : 'Finalizar Cadastro'}
              {!isLoading && <Check size={20} />}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">Já tem cadastro?</p>
            <Link to="/merchant/login" className="text-brand-blue font-bold hover:underline">
              Fazer Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantRegister;