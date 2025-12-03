import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { StoreConfig } from '../../types';
import { Save, Phone, MapPin, Store, CheckCircle } from 'lucide-react';

const Settings = () => {
  const [config, setConfig] = useState<StoreConfig>({
    storeName: '',
    whatsappPhone: '',
    address: ''
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setConfig(db.getStoreConfig());
  }, []);

  const handleSave = () => {
    db.updateStoreConfig(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurações da Loja</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Store className="text-brand-blue" size={20} /> 
            Dados Gerais
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nome da Loja</label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue"
                value={config.storeName}
                onChange={(e) => setConfig({...config, storeName: e.target.value})}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <label className="block text-sm font-bold text-brand-blue mb-1 flex items-center gap-2">
                 <Phone size={16} /> WhatsApp para Pedidos (Principal)
              </label>
              <p className="text-xs text-blue-400 mb-2">Este é o número para onde os clientes serão redirecionados ao finalizar o pedido.</p>
              <input 
                type="text" 
                placeholder="Ex: 11999999999"
                className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:border-brand-blue font-mono font-bold text-gray-700"
                value={config.whatsappPhone}
                onChange={(e) => setConfig({...config, whatsappPhone: e.target.value})}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">Somente números (DDD + Número)</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                <MapPin size={16} /> Endereço da Loja
              </label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue h-24 resize-none"
                value={config.address}
                onChange={(e) => setConfig({...config, address: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all shadow-lg ${
                isSaved ? 'bg-green-500 shadow-green-200' : 'bg-brand-blue hover:bg-blue-600 shadow-blue-200'
              }`}
            >
              {isSaved ? <CheckCircle size={20} /> : <Save size={20} />}
              {isSaved ? 'Salvo com Sucesso!' : 'Salvar Configurações'}
            </button>
          </div>
        </div>

        {/* Other Settings (Placeholder) */}
        <div className="space-y-6">
           <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 opacity-70">
              <h3 className="text-lg font-bold text-gray-500 mb-4">Pagamentos & Integrações</h3>
              <p className="text-sm text-gray-400">Configurações avançadas de Pix e Gateways de pagamento estarão disponíveis em breve.</p>
           </div>
           
           <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 opacity-70">
              <h3 className="text-lg font-bold text-gray-500 mb-4">Aparência do App</h3>
              <p className="text-sm text-gray-400">Personalização de cores e banners em desenvolvimento.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;