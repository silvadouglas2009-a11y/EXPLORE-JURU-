import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { User } from '../../types';
import { User as UserIcon, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState<User>(db.getUser());

  // Simulating fetching updated user data
  useEffect(() => {
    setUser(db.getUser());
  }, []);

  return (
    <div className="p-6">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-brand-blue text-white flex items-center justify-center text-3xl font-bold mb-4 border-4 border-white shadow-xl">
          {user.name.charAt(0)}
        </div>
        <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
        <p className="text-gray-500 text-sm">Membro desde 2023</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-50 flex items-center gap-3">
          <Phone className="text-brand-green" size={20} />
          <div>
            <p className="text-xs text-gray-400">Telefone</p>
            <p className="text-sm font-medium text-gray-800">{user.phone}</p>
          </div>
        </div>
        <div className="p-4 border-b border-gray-50 flex items-center gap-3">
          <Mail className="text-brand-blue" size={20} />
          <div>
            <p className="text-xs text-gray-400">E-mail</p>
            <p className="text-sm font-medium text-gray-800">{user.email}</p>
          </div>
        </div>
        <div className="p-4 flex items-center gap-3">
          <MapPin className="text-brand-yellow" size={20} />
          <div>
            <p className="text-xs text-gray-400">Endereço de Entrega</p>
            <p className="text-sm font-medium text-gray-800">{user.address}</p>
          </div>
        </div>
      </div>

      <Link to="/admin" className="w-full bg-gray-800 text-white p-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-900 transition-colors shadow-lg">
        <ShieldCheck size={20} />
        <span>Acessar Painel Admin</span>
      </Link>
      
      <p className="text-center text-xs text-gray-400 mt-4">
        Versão 1.0.0 • DHA Bebidas
      </p>
    </div>
  );
};

export default Profile;