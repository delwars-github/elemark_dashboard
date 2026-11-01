'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Header from '../../components/Header';
import { Icons } from '../../components/Icons';
import { api } from '../../lib/api';
import { Order, OrderStatus, PaymentStatus } from '../../types';

const STATUS_FILTERS = ['ALL', 'placed', 'confirmed', 'packed', 'shipped', 'delivered'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getOrders({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: nextStatus });
      }
    } catch (e) {
      alert('Failed to update order status');
    }
  };

  const handleMarkPaymentPaid = async (orderId: string) => {
    try {
      await api.updatePaymentStatus(orderId, 'paid');
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          paymentStatus: 'paid',
          dueAmount: 0,
          paidAmount: selectedOrder.totalAmount,
        });
      }
    } catch (e) {
      alert('Failed to update payment status');
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const map: Record<OrderStatus, { bg: string; text: string; border: string }> = {
      placed: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
      confirmed: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
      packed: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
      shipped: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
      delivered: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
      cancelled: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
    };
    const s = map[status] || { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${s.bg} ${s.text} ${s.border}`}>
        {status}
      </span>
    );
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    if (current === 'placed') return 'confirmed';
    if (current === 'confirmed') return 'packed';
    if (current === 'packed') return 'shipped';
    if (current === 'shipped') return 'delivered';
    return null;
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Wholesale Order Pipeline"
        subtitle="Track bulk purchase orders, delivery statuses, and buyer credit terms"
        onRefresh={loadOrders}
      />

      <div className="p-8 space-y-6 flex-1">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Order ID & Date</th>
                  <th className="py-4 px-6">Buyer Retailer / Shop</th>
                  <th className="py-4 px-6">Items Summary</th>
                  <th className="py-4 px-6 text-right">Total (৳)</th>
                  <th className="py-4 px-6 text-center">Payment</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      {loading ? 'Loading orders from VoltMart API...' : 'No orders found matching filter.'}
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => {
                    const nextSt = getNextStatus(ord.status);
                    return (
                      <tr key={ord.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-white text-sm font-mono">{ord.orderNumber}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(ord.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </td>

                        <td className="py-4 px-6">
                          <p className="font-semibold text-white">{ord.sellerShop || ord.sellerName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{ord.sellerPhone}</p>
                        </td>

                        <td className="py-4 px-6">
                          <p className="text-xs text-slate-300 font-medium">
                            {ord.items?.length || 1} Products
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {ord.items?.map((i) => i.title).join(', ')}
                          </p>
                        </td>

                        <td className="py-4 px-6 text-right font-black text-white">
                          ৳{ord.totalAmount.toLocaleString()}
                          {ord.dueAmount > 0 && (
                            <p className="text-xs font-semibold text-amber-400 mt-0.5">
                              Due: ৳{ord.dueAmount.toLocaleString()}
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                              ord.paymentStatus === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : ord.paymentStatus === 'partial'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-center">{getStatusBadge(ord.status)}</td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {nextSt && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, nextSt)}
                                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all"
                              >
                                Advance → {nextSt}
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="View Invoice & Details"
                            >
                              <Icons.BookOpen className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details & Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Order Invoice: {selectedOrder.orderNumber}</span>
                  {getStatusBadge(selectedOrder.status)}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Invoice No: {selectedOrder.invoiceNumber || 'INV-2026-001'}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <Icons.Close className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Buyer & Seller Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Buyer Retailer
                  </span>
                  <p className="text-sm font-bold text-white mt-1">
                    {selectedOrder.sellerShop || selectedOrder.sellerName}
                  </p>
                  <p className="text-xs text-slate-400">{selectedOrder.sellerPhone}</p>
                  <p className="text-xs text-slate-400 mt-1">{selectedOrder.deliveryAddress || 'Nawabpur Electrical Market, Dhaka'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Manufacturer / Vendor
                  </span>
                  <p className="text-sm font-bold text-white mt-1">
                    {selectedOrder.companyName || 'BRB Cable Industries Ltd'}
                  </p>
                  <p className="text-xs text-slate-400">Payment: {selectedOrder.paymentMethod.toUpperCase()}</p>
                  <p className="text-xs text-amber-400 font-semibold mt-1">
                    Payment Status: {selectedOrder.paymentStatus.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Order Items Breakdown
                </span>
                <div className="rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 uppercase font-semibold text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Wholesale Rate</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-medium text-white">{item.title}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{item.quantity} {item.unitType}</td>
                          <td className="py-2.5 px-3 text-right">৳{item.wholesalePrice.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-white">
                            ৳{(item.quantity * item.wholesalePrice).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Total:</span>
                  <span>৳{selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Paid Amount:</span>
                  <span>৳{selectedOrder.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-400 font-black text-sm pt-1 border-t border-slate-800">
                  <span>Outstanding Due Balance:</span>
                  <span>৳{selectedOrder.dueAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                {selectedOrder.paymentStatus !== 'paid' && (
                  <button
                    onClick={() => handleMarkPaymentPaid(selectedOrder.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
                  >
                    ✓ Mark Fully Paid
                  </button>
                )}
                <div className="ml-auto">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

