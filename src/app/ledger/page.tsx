'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Header from '../../components/Header';
import { Icons } from '../../components/Icons';
import { api } from '../../lib/api';
import { LedgerTransaction } from '../../types';

export default function LedgerPage() {
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState<boolean>(false);

  // Collect Due Form
  const [collectForm, setCollectForm] = useState({
    sellerId: 'usr_seller_1',
    companyId: 'comp_brb',
    amount: 50000,
    paymentMethod: 'bkash',
    notes: 'Installment payment for monthly cable order',
  });

  const loadLedger = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getLedger();
      if (res.success) {
        setTransactions(res.transactions);
      }
    } catch (err) {
      console.error('Failed to load ledger', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.payLedgerDue({
        sellerId: collectForm.sellerId,
        companyId: collectForm.companyId,
        amount: Number(collectForm.amount),
        paymentMethod: collectForm.paymentMethod,
        notes: collectForm.notes,
      });
      setIsCollectModalOpen(false);
      loadLedger();
    } catch (err) {
      alert('Failed to record payment');
    }
  };

  const totalDuesReceivable = transactions.reduce((acc, t) => {
    if (t.type === 'debit') return acc + t.amount;
    if (t.type === 'credit') return acc - t.amount;
    return acc;
  }, 0);

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Wholesale Ledger & Dues Hub (বাকি খাতা)"
        subtitle="Manage retailer credit limits, installment repayments, and transaction history"
        onRefresh={loadLedger}
        actionButton={
          <button
            onClick={() => setIsCollectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Record Payment (বাকি আদায়)</span>
          </button>
        }
      />

      <div className="p-8 space-y-6 flex-1">
        {/* Ledger Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Outstanding Balance
            </span>
            <h3 className="text-2xl font-black text-amber-400 mt-2">
              ৳{Math.max(0, totalDuesReceivable).toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Across all registered electrical shops</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recovered This Month
            </span>
            <h3 className="text-2xl font-black text-emerald-400 mt-2">
              ৳175,000
            </h3>
            <p className="text-xs text-slate-500 mt-1">Received via bKash, Nagad & Bank Transfer</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Credit Accounts
            </span>
            <h3 className="text-2xl font-black text-white mt-2">
              8 Verified Stores
            </h3>
            <p className="text-xs text-slate-500 mt-1">Average repayment cycle: 14 days</p>
          </div>
        </div>

        {/* Ledger Transactions Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Transaction Journal
            </h2>
            <span className="text-xs text-slate-400 font-mono">{transactions.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Transaction Date</th>
                  <th className="py-4 px-6">Retailer Shop</th>
                  <th className="py-4 px-6">Manufacturer</th>
                  <th className="py-4 px-6 text-center">Type</th>
                  <th className="py-4 px-6 text-right">Amount (৳)</th>
                  <th className="py-4 px-6 text-right">Closing Balance</th>
                  <th className="py-4 px-6">Notes / Channel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      {loading ? 'Loading ledger transactions...' : 'No ledger transactions found.'}
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 text-xs font-mono text-slate-400">
                        {new Date(t.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-4 px-6 font-semibold text-white">
                        {t.sellerShop || t.sellerName}
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-400">
                        {t.companyName || 'BRB Cable Industries'}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                            t.type === 'debit'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {t.type === 'debit' ? 'New Due (+)' : 'Payment (-)'}
                        </span>
                      </td>

                      <td
                        className={`py-4 px-6 text-right font-black ${
                          t.type === 'debit' ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {t.type === 'debit' ? '+' : '-'}৳{t.amount.toLocaleString()}
                      </td>

                      <td className="py-4 px-6 text-right font-mono text-xs text-white">
                        ৳{t.newBalance.toLocaleString()}
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-400">
                        {t.paymentMethod && (
                          <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 mr-2 border border-slate-700">
                            {t.paymentMethod}
                          </span>
                        )}
                        <span>{t.notes || 'Ledger entry'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Record Due Installment (বাকি আদায়)</h2>
              <button
                onClick={() => setIsCollectModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <Icons.Close className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Retailer Shop
                </label>
                <select
                  value={collectForm.sellerId}
                  onChange={(e) => setCollectForm({ ...collectForm, sellerId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="usr_seller_1">Bismillah Electric Store (Al-Haj Rafiqul Islam)</option>
                  <option value="usr_seller_2">Rahim Hardware & Sanitary (Rahim Uddin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Payment Amount (৳)
                </label>
                <input
                  type="number"
                  required
                  value={collectForm.amount}
                  onChange={(e) => setCollectForm({ ...collectForm, amount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold text-emerald-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Payment Channel
                </label>
                <select
                  value={collectForm.paymentMethod}
                  onChange={(e) => setCollectForm({ ...collectForm, paymentMethod: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="bkash">bKash Merchant</option>
                  <option value="nagad">Nagad</option>
                  <option value="rocket">DBBL Rocket</option>
                  <option value="bank_transfer">Direct Bank Transfer</option>
                  <option value="cod">Cash on Hand</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Reference Note / Receipt No
                </label>
                <input
                  type="text"
                  value={collectForm.notes}
                  onChange={(e) => setCollectForm({ ...collectForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-md shadow-amber-500/20"
                >
                  Confirm Repayment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

