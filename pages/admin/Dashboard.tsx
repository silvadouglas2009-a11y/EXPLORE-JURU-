import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { aiService } from '../../services/aiService';
import { DashboardStats, OrderStatus } from '../../types';
import { TrendingUp, Package, AlertCircle, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({ totalSales: 0, totalOrders: 0, activePromos: 0, lowStock: 0 });
  const [insights, setInsights] = useState<any>({});
  const [salesData, setSalesData] = useState<any[]>([]);

  const refreshData = () => {
    const orders = db.getOrders();
    const products = db.getProducts();

    const totalSales = orders.reduce((acc, o) => acc + o.total, 0);
    const lowStock = products.filter(p => p.stock < 10).length;
    const activePromos = products.filter(p => p.isPromo).length;

    setStats({
      totalSales,
      totalOrders: orders.length,
      activePromos,
      lowStock
    });

    setInsights(aiService.getAdminInsights());

    // Mock Chart Data - Last 7 days
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const mockData = days.map(day => ({
      name: day,
      vendas: Math.floor(Math.random() * 500) + 100,
      pedidos: Math.floor(Math.random() * 20) + 1
    }));
    setSalesData(mockData);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const Card = ({ title, value, icon: Icon, color, subText }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {subText && <p className="text-xs text-gray-400 mt-2">{subText}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color} text-white`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Geral</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Vendas Totais" value={`R$ ${stats.totalSales.toFixed(2)}`} icon={DollarSign} color="bg-brand-blue" subText="+12% que ontem" />
        <Card title="Pedidos" value={stats.totalOrders} icon={Package} color="bg-brand-green" subText="4 pendentes" />
        <Card title="Promoções Ativas" value={stats.activePromos} icon={TrendingUp} color="bg-brand-yellow" subText="Gerado pela IA" />
        <Card title="Alerta Estoque" value={stats.lowStock} icon={AlertCircle} color="bg-red-500" subText="Itens críticos" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">Vendas da Semana</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="vendas" fill="#0077FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Suggestions Panel */}
        <div className="bg-gradient-to-br from-brand-blue to-blue-900 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse"></div>
             <h3 className="font-bold text-lg">DHA SmartCore™</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
               <p className="text-xs text-blue-200 mb-1">Sugestão de Preço</p>
               <p className="text-sm font-medium">{insights.priceSuggestion || "Analisando mercado..."}</p>
            </div>
            
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
               <p className="text-xs text-blue-200 mb-1">Alertas</p>
               <ul className="text-sm list-disc pl-4 space-y-1">
                 {insights.stockAlerts?.slice(0, 3).map((alert: string, i: number) => (
                   <li key={i}>{alert}</li>
                 )) || <li>Tudo certo por enquanto.</li>}
               </ul>
            </div>

             <button className="w-full bg-brand-yellow text-blue-900 font-bold py-2 rounded-lg text-sm mt-4 hover:bg-yellow-400 transition-colors">
               Aplicar Sugestões
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;