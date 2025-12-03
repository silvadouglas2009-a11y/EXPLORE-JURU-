import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Product, Category } from '../../types';
import { Plus, Edit, Trash2, Search, Save, X, Image as ImageIcon, Upload, AlertCircle } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: Category.BEER,
    image: '',
    salesCount: 0,
    isPromo: false,
    oldPrice: 0
  });

  useEffect(() => {
    refreshProducts();
  }, []);

  const refreshProducts = () => {
    setProducts(db.getProducts());
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({ ...product });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: Category.BEER,
        image: 'https://via.placeholder.com/200?text=Sem+Imagem',
        salesCount: 0,
        isPromo: false,
        oldPrice: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      db.deleteProduct(id);
      refreshProducts();
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) {
      alert('Preencha pelo menos o nome e o preço.');
      return;
    }

    const productToSave: Product = {
      id: editingId || Date.now().toString(),
      name: formData.name!,
      description: formData.description || '',
      price: Number(formData.price),
      stock: Number(formData.stock),
      category: formData.category as Category,
      image: formData.image || 'https://via.placeholder.com/200?text=Sem+Imagem',
      salesCount: formData.salesCount || 0,
      isPromo: formData.isPromo,
      oldPrice: formData.oldPrice
    };

    db.saveProduct(productToSave);

    // AUTOMATIC NOTIFICATION LOGIC
    // If it's a promotion and it's being saved (new or updated to promo)
    if (formData.isPromo) {
      db.createNotification({
        title: 'Nova Promoção! 💥',
        message: `O item ${formData.name} entrou em oferta por apenas R$ ${Number(formData.price).toFixed(2)}. Aproveite!`,
        type: 'promo'
      });
    }

    refreshProducts();
    setIsModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gerenciar Produtos</h2>
          <p className="text-gray-500 text-sm">Controle total do catálogo e estoque</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
             <input 
               type="text" 
               placeholder="Buscar produto..." 
               className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue w-64"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-brand-green text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-600 transition-colors"
          >
            <Plus size={20} /> Novo Produto
          </button>
        </div>
      </div>

      {/* Product Grid / Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Produto</th>
              <th className="p-4 font-semibold text-gray-600">Categoria</th>
              <th className="p-4 font-semibold text-gray-600">Preço</th>
              <th className="p-4 font-semibold text-gray-600">Estoque</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <img src={product.image} alt={product.name} className="w-12 h-12 object-contain rounded-md bg-white border border-gray-100" />
                  <div>
                    <p className="font-bold text-gray-800 flex items-center gap-2">
                      {product.name}
                      {product.isPromo && <span className="bg-brand-yellow text-[10px] px-1.5 rounded text-blue-900">PROMO</span>}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                  </div>
                </td>
                <td className="p-4">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold border border-gray-200">
                    {product.category}
                  </span>
                </td>
                <td className="p-4 font-bold text-gray-800">
                  R$ {product.price.toFixed(2)}
                  {product.oldPrice && <span className="text-xs text-gray-400 line-through ml-2">R$ {product.oldPrice.toFixed(2)}</span>}
                </td>
                <td className="p-4">
                  <div className={`flex items-center gap-2 ${product.stock < 10 ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                    {product.stock < 10 && <AlertCircle size={16} />}
                    {product.stock} un
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleOpenModal(product)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors mr-2">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="p-10 text-center text-gray-400">
            Nenhum produto encontrado.
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? 'Editar Produto' : 'Adicionar Novo Produto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Image */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Imagem do Produto</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl h-64 flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden group">
                  {formData.image && formData.image !== 'https://via.placeholder.com/200?text=Sem+Imagem' ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon size={48} className="mx-auto mb-2" />
                      <p className="text-sm">Nenhuma imagem</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 w-full p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload size={20} className="text-brand-blue" />
                    <span className="text-sm text-gray-600 font-medium">Escolher arquivo local...</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Suporta JPG, PNG e WEBP.
                  </p>
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Produto</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Heineken Long Neck"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
                  >
                    {Object.values(Category).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Preço (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Estoque Atual</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                    />
                  </div>
                </div>

                {/* Promo Checkbox */}
                 <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <input 
                      type="checkbox" 
                      id="isPromo"
                      className="w-5 h-5 rounded text-brand-blue"
                      checked={formData.isPromo}
                      onChange={(e) => setFormData({...formData, isPromo: e.target.checked})}
                    />
                    <div>
                      <label htmlFor="isPromo" className="font-bold text-gray-700 text-sm">Produto em Promoção?</label>
                      <p className="text-xs text-gray-500">Isso enviará uma notificação automática.</p>
                    </div>
                 </div>

                 {formData.isPromo && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Preço Antigo (De:)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        value={formData.oldPrice || ''}
                        onChange={(e) => setFormData({...formData, oldPrice: Number(e.target.value)})}
                      />
                    </div>
                 )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Descrição Curta</label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-lg h-24 resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Detalhes do produto..."
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 rounded-lg bg-brand-green text-white hover:bg-green-600 font-bold shadow-lg shadow-green-200 flex items-center gap-2"
              >
                <Save size={18} /> Salvar Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;