import React, { useState } from 'react';
import { CartItem, PaymentMethod, Order } from '../../types';
import { Minus, Plus, Trash2, MessageCircle, Copy, Check, QrCode, Wallet, Banknote, ShoppingCart } from 'lucide-react';
import { db } from '../../services/db';
import { useNavigate } from 'react-router-dom';

interface Props {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

const Cart: React.FC<Props> = ({ items, onUpdateQuantity, onRemove, onClear }) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.WHATSAPP);
  const [pixCopied, setPixCopied] = useState(false);
  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const user = db.getUser();
  const storeConfig = db.getStoreConfig();

  // Mock Pix Code (Static for demo)
  const PIX_CODE = "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-4266141740005204000053039865802BR5913Bebida Express6008Sao Paulo62070503***6304E2CA";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_CODE);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  const handleCheckout = () => {
    if (items.length === 0) return;

    // Create Order in DB (This now triggers AI Processing)
    const order = db.createOrder(items, total, user, paymentMethod);

    // Format WhatsApp Message with AI integration
    const currentStoreId = items[0]?.storeId;
    const store = currentStoreId ? db.getStoreById(currentStoreId) : null;
    const storeName = store ? store.name : storeConfig.storeName;

    let message = `*Novo Pedido - ${storeName}* 🍻\n`;
    message += `_Via Bebida Express_\n\n`;
    
    // AI Header for Merchant
    if (order.aiInsights) {
       message += `*[🤖 Análise IA]*\n`;
       message += `🏷️ *Cliente:* ${order.aiInsights.customerLabel}\n`;
       message += `💡 *Dica:* ${order.aiInsights.suggestedAction}\n`;
       message += `--------------------------------\n\n`;
    }

    message += `👤 *Cliente:* ${user.name}\n`;
    message += `📍 *Endereço:* ${user.address}\n\n`;
    message += `*Itens do Pedido:*\n`;
    
    items.forEach(item => {
      message += `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n💰 *Total:* R$ ${total.toFixed(2)}`;
    
    if (paymentMethod === PaymentMethod.PIX) {
      message += `\n🟣 *Pagamento:* Via Pix (Comprovante em anexo)`;
    } else {
      message += `\n💵 *Pagamento:* A Combinar / Na Entrega`;
    }
    
    message += `\n\n🆔 Pedido #${order.id.slice(-6)}`;

    const encodedMessage = encodeURIComponent(message);
    
    // Use the store's configured phone number, fallback if empty
    const targetPhone = store ? store.whatsapp : (storeConfig.whatsappPhone || '5511999999999');
    // Clean phone number (remove non-digits)
    const cleanPhone = targetPhone.replace(/\D/g, '');
    
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodedMessage}`;

    onClear();
    window.open(whatsappUrl, '_blank');
    navigate('/orders');
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-6 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
           <ShoppingCart className="text-gray-400" size={40} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Seu carrinho está vazio</h2>
        <p className="text-gray-500 mb-8 max-w-xs">Bateu a sede? Navegue pelas categorias e adicione suas bebidas favoritas.</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-brand-blue text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 transition-colors w-full max-w-xs"
        >
          Ver Produtos
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 pb-40">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-800 italic">Meu Carrinho</h1>
        <span className="bg-blue-100 text-brand-blue font-bold px-3 py-1 rounded-full text-xs">
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </span>
      </div>
      
      <div className="space-y-4 mb-8">
        {items.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 relative overflow-hidden group">
            {/* Remove Button (Top Right) */}
            <button 
                onClick={() => onRemove(item.id)}
                className="absolute top-0 right-0 p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-bl-2xl transition-all z-10"
              >
                <Trash2 size={18} />
            </button>

            {/* Product Image */}
            <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 p-2">
              <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            
            {/* Product Details */}
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1 pr-8 line-clamp-2">{item.name}</h3>
                <p className="text-xs text-gray-400">Unitário: R$ {item.price.toFixed(2)}</p>
              </div>

              <div className="flex items-end justify-between mt-2">
                <div>
                   <p className="text-[10px] text-gray-400 font-bold mb-0.5 uppercase">Subtotal</p>
                   <p className="font-black text-brand-blue text-lg">R$ {(item.price * item.quantity).toFixed(2)}</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1 shadow-inner">
                  <button 
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-red-500 active:scale-95 transition-all"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-sm font-black w-4 text-center text-gray-800">{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="w-8 h-8 flex items-center justify-center bg-brand-green text-white rounded-lg shadow-sm shadow-green-100 active:scale-95 transition-all hover:bg-green-600"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t-2 border-dashed border-gray-200 my-6"></div>

      {/* Payment Method Selector */}
      <div className="mb-8">
        <h2 className="font-bold text-gray-800 mb-3 text-lg">Forma de Pagamento</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setPaymentMethod(PaymentMethod.WHATSAPP)}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all relative overflow-hidden ${
              paymentMethod === PaymentMethod.WHATSAPP 
                ? 'bg-blue-50 border-brand-blue text-brand-blue shadow-md' 
                : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
            }`}
          >
             {paymentMethod === PaymentMethod.WHATSAPP && (
               <div className="absolute top-2 right-2 text-brand-blue"><Check size={16} /></div>
             )}
            <Banknote size={28} />
            <div className="text-center">
              <span className="block text-xs font-bold">Combinar / Entrega</span>
              <span className="block text-[10px] opacity-70">Dinheiro ou Cartão</span>
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod(PaymentMethod.PIX)}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all relative overflow-hidden ${
              paymentMethod === PaymentMethod.PIX 
                ? 'bg-green-50 border-brand-green text-brand-green shadow-md' 
                : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
            }`}
          >
            {paymentMethod === PaymentMethod.PIX && (
               <div className="absolute top-2 right-2 text-brand-green"><Check size={16} /></div>
             )}
            <QrCode size={28} />
            <div className="text-center">
              <span className="block text-xs font-bold">Pix Copia e Cola</span>
              <span className="block text-[10px] opacity-70">Aprovação imediata</span>
            </div>
          </button>
        </div>

        {/* Pix Section */}
        {paymentMethod === PaymentMethod.PIX && (
          <div className="bg-white p-5 rounded-xl border border-brand-green border-dashed mb-4 animate-in fade-in slide-in-from-bottom-2 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-brand-green flex items-center gap-2">
                <QrCode size={18} /> Chave Pix
              </span>
              {pixCopied && <span className="text-[10px] text-green-700 font-bold bg-green-100 px-2 py-1 rounded-full animate-pulse">Copiado!</span>}
            </div>
            
            <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between gap-3 border border-gray-200 group">
               <p className="text-xs text-gray-500 font-mono break-all line-clamp-2 selection:bg-green-200">
                 {PIX_CODE}
               </p>
               <button 
                 onClick={handleCopyPix}
                 className="bg-brand-green text-white p-2.5 rounded-lg hover:bg-green-600 transition-colors shrink-0 shadow-lg shadow-green-100 active:scale-95"
               >
                 {pixCopied ? <Check size={18} /> : <Copy size={18} />}
               </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-3 text-center leading-relaxed">
              1. Copie o código acima.<br/>
              2. Abra o app do seu banco e escolha "Pix Copia e Cola".<br/>
              3. Envie o comprovante no WhatsApp após finalizar.
            </p>
          </div>
        )}
      </div>

      {/* Checkout Footer */}
      <div className="fixed bottom-[4.5rem] left-0 w-full bg-white/90 backdrop-blur-md p-6 border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] max-w-md mx-auto z-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-gray-400 text-xs font-medium uppercase block mb-1">Total a pagar</span>
            <span className="text-3xl font-black text-gray-800 tracking-tight">R$ {total.toFixed(2)}</span>
          </div>
          <div className="text-right">
             <span className="text-xs text-brand-green bg-green-50 px-2 py-1 rounded font-bold">
               Sem taxas extras
             </span>
          </div>
        </div>
        <button 
          onClick={handleCheckout}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 ${
             paymentMethod === PaymentMethod.PIX 
               ? 'bg-brand-green text-white hover:bg-green-600 shadow-green-200' 
               : 'bg-brand-blue text-white hover:bg-blue-600 shadow-blue-200'
          }`}
        >
          <MessageCircle size={24} />
          {paymentMethod === PaymentMethod.PIX ? 'Confirmar e Enviar Comprovante' : 'Pedir no WhatsApp'}
        </button>
      </div>
    </div>
  );
};

export default Cart;