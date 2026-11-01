'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Header from '../../components/Header';
import { Icons } from '../../components/Icons';
import { api } from '../../lib/api';
import { Product } from '../../types';

const CATEGORIES = [
  'All',
  'Cables & Wires',
  'Switches & Sockets',
  'Circuit Breakers & MCB',
  'LED Lighting & Fixtures',
  'Distribution Boxes & DB',
  'Conduits & Fittings',
  'Fans & Ventilation',
  'Solar & Inverters',
  'Electrician Tools & Meters',
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    brand: 'BRB Cable',
    category: 'Cables & Wires',
    description: '',
    unitPrice: 1000,
    wholesalePrice: 850,
    moq: 5,
    stock: 100,
    unitType: 'piece' as 'piece' | 'box' | 'carton' | 'coil',
    warranty: '1 Year Guarantee',
    discountPercent: 15,
    imageUrl: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=500',
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getProducts({
        category: category === 'All' ? undefined : category,
        search: search.trim() ? search.trim() : undefined,
      });
      if (res.success) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, {
          title: formData.title,
          brand: formData.brand,
          category: formData.category,
          description: formData.description,
          unitPrice: Number(formData.unitPrice),
          wholesalePrice: Number(formData.wholesalePrice),
          moq: Number(formData.moq),
          stock: Number(formData.stock),
          unitType: formData.unitType,
          warranty: formData.warranty,
          discountPercent: Number(formData.discountPercent),
          images: [formData.imageUrl],
        });
      } else {
        await api.createProduct({
          title: formData.title,
          brand: formData.brand,
          category: formData.category,
          description: formData.description,
          unitPrice: Number(formData.unitPrice),
          wholesalePrice: Number(formData.wholesalePrice),
          moq: Number(formData.moq),
          stock: Number(formData.stock),
          unitType: formData.unitType,
          warranty: formData.warranty,
          discountPercent: Number(formData.discountPercent),
          images: [formData.imageUrl],
          companyId: 'comp_brb',
          companyName: 'BRB Cable Industries Ltd',
          features: ['BSTI Certified', '100% Pure Copper', 'Flame Retardant'],
          tags: ['electrical', formData.category.toLowerCase()],
        });
      }
      setIsAddModalOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      alert('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await api.deleteProduct(id);
      loadProducts();
    }
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      title: p.title,
      brand: p.brand,
      category: p.category,
      description: p.description || '',
      unitPrice: p.unitPrice,
      wholesalePrice: p.wholesalePrice,
      moq: p.moq,
      stock: p.stock,
      unitType: p.unitType,
      warranty: p.warranty,
      discountPercent: p.discountPercent,
      imageUrl: p.images[0] || '',
    });
    setIsAddModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      brand: 'BRB Cable',
      category: 'Cables & Wires',
      description: '',
      unitPrice: 2500,
      wholesalePrice: 2100,
      moq: 5,
      stock: 150,
      unitType: 'coil',
      warranty: '5 Years Replacement Guarantee',
      discountPercent: 16,
      imageUrl: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=500',
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Products & Inventory Catalog"
        subtitle="Manage electrical inventory, wholesale price tiers, and minimum order quantities"
        onRefresh={loadProducts}
        actionButton={
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        }
      />

      <div className="p-8 space-y-6 flex-1">
        {/* Filter bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Icons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by title, brand, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-6">Category & Brand</th>
                  <th className="py-4 px-6 text-right">Wholesale Price</th>
                  <th className="py-4 px-6 text-right">Retail MRP</th>
                  <th className="py-4 px-6 text-center">MOQ / Stock</th>
                  <th className="py-4 px-6 text-center">Unit</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      {loading ? 'Fetching products...' : 'No products found.'}
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=120'}
                            alt={p.title}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700/60 flex-shrink-0"
                          />
                          <div className="max-w-xs">
                            <p className="font-bold text-white text-sm line-clamp-1">{p.title}</p>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{p.warranty}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
                          {p.category}
                        </span>
                        <p className="text-xs text-slate-400 font-medium mt-1">{p.brand}</p>
                      </td>

                      <td className="py-4 px-6 text-right font-black text-amber-400">
                        ৳{p.wholesalePrice.toLocaleString()}
                      </td>

                      <td className="py-4 px-6 text-right text-slate-400 line-through">
                        ৳{p.unitPrice.toLocaleString()}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className="font-semibold text-white">MOQ {p.moq}</span>
                        <div className="text-xs text-emerald-400 font-medium mt-0.5">
                          Stock: {p.stock}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className="uppercase text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                          {p.unitType}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Icons.Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <Icons.Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingProduct ? 'Edit Product Details' : 'Add New Electrical Product'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <Icons.Close className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. BRB 2.5 RM Single Core Fire-Resistant Cable"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Wholesale Price (৳)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.wholesalePrice}
                    onChange={(e) => setFormData({ ...formData, wholesalePrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-bold text-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Retail MRP (৳)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Min Order Qty (MOQ)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Available Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Unit Packaging
                  </label>
                  <select
                    value={formData.unitType}
                    onChange={(e) => setFormData({ ...formData, unitType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="piece">Piece (টি)</option>
                    <option value="coil">Coil (কয়েল)</option>
                    <option value="box">Box (বক্স)</option>
                    <option value="carton">Carton (কার্টুন)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Warranty / Guarantee
                  </label>
                  <input
                    type="text"
                    value={formData.warranty}
                    onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Product Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-md shadow-amber-500/20 transition-all"
                >
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

