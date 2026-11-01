'use client';

import React from 'react';
import { Icons } from './Icons';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  actionButton?: React.ReactNode;
}

export default function Header({ title, subtitle, onRefresh, actionButton }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Sync Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Synced with Elemark Mobile</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
            title="Refresh Data"
          >
            <Icons.Refresh className="w-4 h-4" />
          </button>
        )}

        {actionButton}
      </div>
    </header>
  );
}

