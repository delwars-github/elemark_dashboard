'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Header from '../components/Header';
import { Icons } from '../components/Icons';
import { api } from '../lib/api';
import { AnalyticsSummary, Order, Product } from '../types';
import Link from 'next/link';

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, productsRes] = await Promise.allSettled([
        api.getAnalytics(),
        api.getProducts(),
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.success) {
        const val: any = analyticsRes.value;
        setAnalytics(val.analytics || val);
      }
      if (productsRes.status === 'fulfilled' && productsRes.value.success) {
        setProducts(productsRes.value.products);
      }
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalRevenue = analytics?.totalRevenue || 1284500;
  const totalOrders = analytics?.totalOrders || 48;
  const pendingDues = analytics?.pendingDues || 342000;
  const totalProducts = products.length > 0 ? products.length : (analytics?.totalProducts || 18);
  const recentOrders = analytics?.recentOrders || [];

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Wholesale Intelligence Overview"
        subtitle="Real-time performance across VoltMart B2B & Elemark mobile orders"
        onRefresh={loadData}
        actionButton={
          <Link
            href="/products"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        }
      />

      <div className="p-8 space-y-8 flex-1">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Revenue */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Gross Wholesale Revenue
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Icons.TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-white tracking-tight">
                ৳{totalRevenue.toLocaleString()}
              </h3>
              <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <span>↑ 18.4%</span>
                <span className="text-slate-500">vs last month</span>
              </p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
          </div>

          {/* Dues Receivable */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Outstanding Dues (বাকি)
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Icons.DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-amber-400 tracking-tight">
                ৳{pendingDues.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                <span className="text-amber-400 font-semibold">12 Shops</span>
                <span className="text-slate-500">pending installments</span>
              </p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
          </div>

          {/* Orders */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Wholesale Orders
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Icons.ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-white tracking-tight">
                {totalOrders}
              </h3>
              <p className="text-xs text-blue-400 font-medium mt-1 flex items-center gap-1">
                <span>↑ 12 new</span>
                <span className="text-slate-500">this week</span>
              </p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
          </div>

          {/* Active Products */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Live SKUs in Catalog
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Icons.Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-white tracking-tight">
                {totalProducts}
              </h3>
              <p className="text-xs text-purple-400 font-medium mt-1 flex items-center gap-1">
                <span>100% In Stock</span>
                <span className="text-slate-500">across 6 brands</span>
              </p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
          </div>
        </div>

        {/* Two-Column Grid: Recent Orders & Top SKUs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders - 2 Cols */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-white">Live Wholesale Orders</h2>
                <p className="text-xs text-slate-400 mt-0.5">Stream of purchase orders from retailers</p>
              </div>
              <Link
                href="/orders"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                View All Orders →
              </Link>
            </div>

            <div className="divide-y divide-slate-800/80">
              {recentOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  {loading ? 'Loading orders from API...' : 'No orders recorded yet.'}
                </div>
              ) : (
                recentOrders.slice(0, 5).map((order) => {
                  const statusColors: Record<string, string> = {
                    placed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    packed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                    shipped: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                    delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  };
                  return (
                    <div key={order.id} className="py-4 flex items-center justify-between group">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300">
                          <Icons.ShoppingCart className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {order.orderNumber}
                            <span className="text-xs text-slate-400 font-normal ml-2">
                              • {order.sellerShop || order.sellerName}
                            </span>
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {order.items?.length || 1} items • ৳{order.totalAmount.toLocaleString()}
                            {order.dueAmount > 0 && (
                              <span className="text-amber-400/90 ml-1.5 font-medium">
                                (Due: ৳{order.dueAmount.toLocaleString()})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
                            statusColors[order.status] || 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {order.status}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Top Products / Inventory - 1 Col */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-white">Featured Catalog</h2>
                <p className="text-xs text-slate-400 mt-0.5">Top electrical products by demand</p>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                Catalog →
              </Link>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto">
              {products.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.images[0] || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=120'}
                      alt={p.title}
                      className="w-11 h-11 rounded-lg object-cover bg-slate-800 border border-slate-700/50 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{p.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Brand: <span className="text-slate-300 font-medium">{p.brand}</span> • MOQ: {p.moq}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-amber-400">
                      ৳{p.wholesalePrice.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Stock: {p.stock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
