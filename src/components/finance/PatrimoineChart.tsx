import React, { useState } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Releve, CategorieFinance, CATEGORIES, aggregateByCategorie, totalReleve, formatEuro } from '@/types/finance';

type FilterKey = 'global' | 'previsionnel' | CategorieFinance;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'global',        label: 'Global' },
  { key: 'Cash',          label: 'Cash' },
  { key: 'Épargne',       label: 'Épargne' },
  { key: 'Investissement',label: 'Invest.' },
  { key: 'Pro',           label: 'Pro' },
  { key: 'previsionnel',  label: 'Prévis.' },
];

interface Props {
  releves: Releve[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload.find((x: any) => x.value != null);
  if (!p) return null;
  const isPrev = p.dataKey === 'valuePrev';
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-5 py-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-black text-gray-900">{formatEuro(p.value)}</p>
      {isPrev && (
        <p className="text-[10px] font-bold text-violet-500 mt-1 uppercase tracking-wider">Prévisionnel</p>
      )}
    </div>
  );
};

export default function PatrimoineChart({ releves }: Props) {
  const [filter, setFilter] = useState<FilterKey>('global');

  const reels  = [...releves].filter(r => !r.previsionnel).sort((a, b) => a.date.localeCompare(b.date));
  const prevs  = [...releves].filter(r =>  r.previsionnel).sort((a, b) => a.date.localeCompare(b.date));
  const allSorted = [...releves].sort((a, b) => a.date.localeCompare(b.date));

  // ---- Mode "Prévisionnel" : affiche seulement les prévisionnels ----
  if (filter === 'previsionnel') {
    const dataPrev = prevs.map(r => ({
      name: new Date(r.date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      value: totalReleve(r),
    }));
    return (
      <div className="bg-white rounded-[2.5rem] p-5 md:p-8">
        <FilterBar filter={filter} setFilter={setFilter} />
        {dataPrev.length === 0 ? (
          <EmptyState msg="Aucun relevé prévisionnel" sub="Créez un relevé en mode Prévisionnel pour le voir ici" />
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dataPrev} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="prevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} strokeDasharray="6 4" fill="url(#prevGrad)"
                  dot={{ fill: '#7c3aed', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#7c3aed', strokeWidth: 0 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }

  // ---- Modes réels (global / catégorie) : réels en plein + prévisionnels en pointillé ----
  // On fusionne tous les relevés sur l'axe temporel
  // Chaque point : { name, value (réel), valuePrev (prévisionnel) }
  const allDates = Array.from(new Set(allSorted.map(r => r.date))).sort();

  const getValue = (r: Releve) => {
    const agg = aggregateByCategorie(r.lignes);
    return filter === 'global' ? totalReleve(r) : agg[filter as CategorieFinance];
  };

  // Construit une map date → { reel, prev }
  const byDate: Record<string, { reel?: number; prev?: number }> = {};
  allSorted.forEach(r => {
    if (!byDate[r.date]) byDate[r.date] = {};
    if (r.previsionnel) byDate[r.date].prev  = getValue(r);
    else                 byDate[r.date].reel  = getValue(r);
  });

  // Connecte la courbe prévisionnelle au dernier point réel
  // (le premier point prévisionnel reprend la valeur du dernier réel pour que la ligne parte du bon endroit)
  let lastReelValue: number | undefined;
  const data = allDates.map(date => {
    const entry = byDate[date] ?? {};
    if (entry.reel !== undefined) lastReelValue = entry.reel;
    return {
      name: new Date(date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      value:     entry.reel,
      // Le premier point prévisionnel ancre la ligne au dernier réel connu
      valuePrev: entry.prev !== undefined
        ? entry.prev
        : undefined,
      // Point de jonction : si c'est le dernier réel et qu'il y a des prévis à venir,
      // on met aussi valuePrev = reel pour relier les deux lignes
      _isJunction: entry.reel !== undefined && prevs.some(p => p.date > date),
    };
  });

  // Injecte le point de jonction
  const chartData = data.map(d => ({
    ...d,
    valuePrev: d._isJunction ? d.value : d.valuePrev,
  }));

  const hasEnoughReel = reels.length >= 2;
  const hasPrev = prevs.length > 0;

  return (
    <div className="bg-white rounded-[2.5rem] p-5 md:p-8">
      <FilterBar filter={filter} setFilter={setFilter} />
      {!hasEnoughReel && !hasPrev ? (
        <EmptyState msg="Pas encore assez de données" sub="Ajoutez au moins 2 relevés pour voir l'évolution" />
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="patrimoineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#111827" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="prevGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={v => `${Math.round(v / 1000)}k`} />
              <Tooltip content={<CustomTooltip />} />
              {/* Courbe réelle */}
              <Area type="monotone" dataKey="value" stroke="#111827" strokeWidth={2.5}
                fill="url(#patrimoineGrad)" connectNulls
                dot={{ fill: '#111827', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#111827', strokeWidth: 0 }} />
              {/* Courbe prévisionnelle — pointillée violette */}
              {hasPrev && (
                <Line type="monotone" dataKey="valuePrev" stroke="#7c3aed" strokeWidth={2}
                  strokeDasharray="6 4" connectNulls dot={false}
                  activeDot={{ r: 5, fill: '#7c3aed', strokeWidth: 0 }} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
          {hasPrev && (
            <div className="flex items-center gap-4 mt-3 px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-0.5 bg-gray-800 rounded" />
                <span className="text-[10px] font-bold text-gray-400">Réel</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="24" height="4" viewBox="0 0 24 4">
                  <line x1="0" y1="2" x2="24" y2="2" stroke="#7c3aed" strokeWidth="2" strokeDasharray="6 4" />
                </svg>
                <span className="text-[10px] font-bold text-violet-500">Prévisionnel</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FilterBar({ filter, setFilter }: { filter: FilterKey; setFilter: (k: FilterKey) => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8">
      <h3 className="text-base md:text-lg font-bold">Évolution du patrimoine</h3>
      <div className="flex items-center gap-1 bg-gray-50 rounded-2xl p-1 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              filter === f.key
                ? f.key === 'previsionnel'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-black text-white shadow-sm'
                : 'text-gray-500 hover:text-black'
            }`}>
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ msg, sub }: { msg: string; sub: string }) {
  return (
    <div className="h-[280px] flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </div>
      <p className="text-sm font-bold text-gray-400">{msg}</p>
      <p className="text-xs text-gray-300 mt-1">{sub}</p>
    </div>
  );
}
