'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Header from '../../components/Header';
import { Icons } from '../../components/Icons';
import { api } from '../../lib/api';
import { Company } from '../../types';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getCompanies();
      if (res.success) {
        setCompanies(res.companies);
      }
    } catch (err) {
      console.error('Failed to load companies', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const toggleVerify = async (id: string, current: boolean) => {
    try {
      await api.verifyCompany(id, !current);
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, verified: !current } : c))
      );
    } catch {
      alert('Failed to update verification status');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Partner Companies & Verified Manufacturers"
        subtitle="Electrical brands, factory licenses, and authorized distributor networks"
        onRefresh={loadCompanies}
      />

      <div className="p-8 space-y-6 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.length === 0 ? (
            <div className="col-span-3 py-12 text-center text-slate-500">
              {loading ? 'Fetching companies from VoltMart API...' : 'No companies found.'}
            </div>
          ) : (
            companies.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-sm hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <img
                      src={c.logo || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=120'}
                      alt={c.name}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-800 border border-slate-700/60 p-1"
                    />
                    <button
                      onClick={() => toggleVerify(c.id, c.verified)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                        c.verified
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {c.verified ? '✓ Verified Partner' : 'Pending Verification'}
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white mt-4">{c.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{c.address}</p>

                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Trade License:</span>
                      <span className="font-mono text-slate-200">{c.tradeLicense || 'TRAD/2026/VALID'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Direct Contact:</span>
                      <span className="text-slate-200">{c.phone}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Total SKUs Listed:</span>
                      <span className="font-bold text-white">{c.totalProducts} Products</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      Total Sales Volume
                    </span>
                    <p className="text-sm font-black text-amber-400">
                      ৳{c.totalRevenue.toLocaleString()}
                    </p>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                    ⭐ {c.rating.toFixed(1)} / 5.0
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

