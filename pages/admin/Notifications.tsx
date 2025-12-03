import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Notification } from '../../types';
import { Send, Bell, Info, Megaphone } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    refreshNotifications();
  }, []);

  const refreshNotifications = () => {
    setNotifications(db.getNotifications());
  };

  const handleSend = () => {
    if (!title || !message) return;

    setIsSending(true);
    
    // Simulate network delay
    setTimeout(() => {
      db.createNotification({
        title,
        message,
        type: 'info'
      });
      setTitle('');
      setMessage('');
      setIsSending(false);
      refreshNotifications();
    }, 800);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Central de Mensagens</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Send Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Send size={20} className="text-brand-blue" /> Enviar Nova Mensagem
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Esta mensagem aparecerá como uma notificação "Push" para todos os clientes ativos no aplicativo.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Título da Mensagem</label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue"
                placeholder="Ex: Chegou Cerveja Nova! 🍺"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Conteúdo da Notificação</label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue h-32 resize-none"
                placeholder="Digite a mensagem para os clientes..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button 
              onClick={handleSend}
              disabled={isSending || !title || !message}
              className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all ${
                isSending || !title || !message 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-brand-blue hover:bg-blue-600 shadow-lg shadow-blue-200'
              }`}
            >
              {isSending ? 'Enviando...' : 'Enviar para Todos'}
              {!isSending && <Send size={18} />}
            </button>
          </div>
        </div>

        {/* History */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Bell size={20} className="text-brand-yellow" /> Histórico de Envios
          </h3>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                Nenhuma mensagem enviada ainda.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(notif => (
                  <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                         {notif.type === 'promo' ? (
                           <span className="bg-brand-yellow/20 text-yellow-700 p-1 rounded">
                             <Megaphone size={14} />
                           </span>
                         ) : (
                           <span className="bg-brand-blue/10 text-brand-blue p-1 rounded">
                             <Info size={14} />
                           </span>
                         )}
                         <span className="font-bold text-gray-800">{notif.title}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(notif.timestamp).toLocaleDateString()} {new Date(notif.timestamp).toLocaleTimeString().slice(0,5)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 pl-8">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;