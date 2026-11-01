'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from './Icons';
import { api } from '../lib/api';

const navItems = [
  { name: 'Overview', href: '/', icon: Icons.LayoutDashboard },
  { name: 'Products Catalog', href: '/products', icon: Icons.Package },
  { name: 'Wholesale Orders', href: '/orders', icon: Icons.ShoppingCart },
  { name: 'Ledger & Dues (বাকি)', href: '/ledger', icon: Icons.BookOpen },
  { name: 'Companies & Sellers', href: '/companies', icon: Icons.Building },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [apiOnline, setApiOnline] = useState<boolean>(false);

  useEffect(() => {
    const check = async () => {
      const ok = await api.checkHealth();
      setApiOnline(ok);
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-40 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Icons.Zap className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-wide flex items-center gap-1.5">
              VoltMart <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold uppercase">B2B</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Wholesale Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Management
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* API Health & User Info Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className={apiOnline ? 'text-emerald-400 font-medium' : 'text-rose-400'}>
              API {apiOnline ? 'Online (:5000)' : 'Connecting...'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">v1.0</span>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
            VM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">VoltMart Master</p>
            <p className="text-[11px] text-slate-400 truncate">Super Admin Portal</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

