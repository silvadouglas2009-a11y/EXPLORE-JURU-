import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { Order, OrderStatus, PaymentMethod } from '../../types';
import { Clock, CheckCircle2, Truck, XCircle, QrCode, Banknote } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const user = db.getUser();

  useEffect(() => {
    const fetchOrders = () => {
      const allOrders = db.getOrders();
      // Filter orders for current user
      setOrders(allOrders.filter(o => o.userId === user.id));
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case OrderStatus.IN_ROUTE: return 'text-blue-500 bg-blue-50 border-blue-200';
      case OrderStatus.DELIVERED: return 'text-green-500 bg-green-50 border-green-200';
      case OrderStatus.CANCELLED: return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return <Clock size={16} />;
      case OrderStatus.IN_ROUTE: return <Truck size={16} />;
      case OrderStatus.DELIVERED: return <CheckCircle2 size={16} />;
      case OrderStatus.CANCELLED: return <XCircle size={16} />;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Meus Pedidos</h1>
      
      {orders.length === 0 ? (
        <div className="text-center text-gray-400 mt-10">
          <p>Você ainda não fez nenhum pedido.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="font-bold text-gray-800">Pedido #{order.id.slice(-6)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </div>

              <div className="border-t border-b border-gray-50 py-3 my-3 space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.quantity}x {item.name}</span>
                    <span className="text-gray-800 font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {order.paymentMethod === PaymentMethod.PIX ? <QrCode size={14} className="text-brand-green" /> : <Banknote size={14} className="text-brand-blue" />}
                  <span>{order.paymentMethod || PaymentMethod.WHATSAPP}</span>
                </div>
                <span className="text-lg font-black text-brand-blue">R$ {order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;