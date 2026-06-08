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
import { Releve, CategorieFinance, aggregateByCategorie, totalReleve, formatEuro } from '@/types/finance';
import { Clock } from 'lucide-react';

type FilterKey = 'global' | CategorieFinance;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'global',         label: 'Global' },
  { key: 'Cash',           label: 'Cash' },
  { key: '\u00c9pargne',        label: '\u00c9pargne' },
  { key: 'Investissement', label: 'Invest.' },
  { key: 'Pro',            label: 'Pro' },
];

interface Props {
  releves: Releve[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  // Affiche les deux valeurs si disponibles
  const reel = payload.find((x: any) => x.dataKey === 'value' && x.value != null);
  const prev = payload.find((x: any) => x.dataKey === 'valuePrev' && x.value != null);
  if (!reel && !prev) return null;
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-5 py-4 space-y-2">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
      {reel && (
        <div>
          <p className="text-xl font-black text-gray-900">{formatEuro(reel.value)}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">R\u00e9el</p>
        </div>
      )}
      {prev && (
        <div>
          <p className="text-xl font-black text-violet-700">{formatEuro(prev.value)}</p>
          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Pr\u00e9visionnel</p>
        </div>
      )}
    </div>
  );
};

export default function PatrimoineChart({ releves }: Props) {
  const [filter, setFilter] = useState<FilterKey>('global');
  const [showPrev, setShowPrev] = useState(false);

  const reels = [...releves].filter(r => !r.previsionnel).sort((a, b) => a.date.localeCompare(b.date));
  const prevs = [...releves].filter(r =>  r.previsionnel).sort((a, b) => a.date.localeCompare(b.date));

  const getValue = (r: Releve) => {
    const agg = aggregateByCategorie(r.lignes);
    return filter === 'global' ? totalReleve(r) : agg[filter as CategorieFinance];
  };

  // Construit l'axe temporel : r\u00e9els toujours pr\u00e9sents, pr\u00e9visionnels ajout\u00e9s si showPrev
  const relevantDates = Array.from(new Set([
    ...reels.map(r => r.date),
    ...(showPrev ? prevs.map(r => r.date) : []),
  ])).sort();

  // Map date \u2192 valeurs
  const byDate: Record<string, { reel?: number; prev?: number }> = {};
  reels.forEach(r => {
    if (!byDate[r.date]) byDate[r.date] = {};
    byDate[r.date].reel = getValue(r);
  });
  if (showPrev) {
    prevs.forEach(r => {
      if (!byDate[r.date]) byDate[r.date] = {};
      byDate[r.date].prev = getValue(r);
    });
  }

  // Point de jonction : le dernier r\u00e9el re\u00e7oit aussi valuePrev pour que la ligne parte de l\u00e0
  let lastReelDate: string | undefined;
  reels.forEach(r => { lastReelDate = r.date; });

  const chartData = relevantDates.map(date => {
    const entry = byDate[date] ?? {};
    const isJunction = showPrev && date === lastReelDate && prevs.some(p => p.date > date);
    return {
      name: new Date(date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      value:     entry.reel,
      valuePrev: isJunction ? entry.reel : entry.prev,
    };
  });

  const hasEnoughReel = reels.length >= 2;
  const hasPrevData   = showPrev && prevs.length > 0;

  return (
    <div className="bg-white rounded-[2.5rem] p-5 md:p-8">
      {/* Barre de filtres + toggle pr\u00e9visionnel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8">
        <h3 className="text-base md:text-lg font-bold">\u00c9volution du patrimoine</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtres cat\u00e9gories */}
          <div className="flex items-center gap-1 bg-gray-50 rounded-2xl p-1">
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  filter === f.key ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-black'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
          {/* Toggle pr\u00e9visionnel — s\u00e9par\u00e9 visuellement */}
          <button
            onClick={() => setShowPrev(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
              showPrev
                ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-200'
                : 'bg-white text-gray-400 border-gray-200 hover:border-violet-300 hover:text-violet-500'
            }`}
            title="Afficher les pr\u00e9visionnels"
          >
            <Clock className="w-3.5 h-3.5" />
            Pr\u00e9vis.
          </button>
        </div>
      </div>

      {!hasEnoughReel ? (
        <EmptyState msg="Pas encore assez de donn\u00e9es" sub="Ajoutez au moins 2 relev\u00e9s pour voir l'\u00e9volution" />
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="patrimoineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#111827" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={v => `${Math.round(v / 1000)}k`} />
              <Tooltip content={<CustomTooltip />} />
              {/* Courbe r\u00e9elle */}
              <Area type="monotone" dataKey="value" stroke="#111827" strokeWidth={2.5}
                fill="url(#patrimoineGrad)" connectNulls
                dot={{ fill: '#111827', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#111827', strokeWidth: 0 }} />
              {/* Courbe pr\u00e9visionnelle — visible uniquement si toggle actif */}
              {hasPrevData && (
                <Line type="monotone" dataKey="valuePrev" stroke="#7c3aed" strokeWidth={2}
                  strokeDasharray="6 4" connectNulls dot={false}
                  activeDot={{ r: 5, fill: '#7c3aed', strokeWidth: 0 }} />
              )}
            </ComposedChart>
          </ResponsiveContainer>

          {/* L\u00e9gende — appara\u00eet seulement si pr\u00e9visionnel actif */}
          {hasPrevData && (
            <div className="flex items-center gap-4 mt-3 px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-0.5 bg-gray-800 rounded" />
                <span className="text-[10px] font-bold text-gray-400">R\u00e9el</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="24" height="4" viewBox="0 0 24 4">
                  <line x1="0" y1="2" x2="24" y2="2" stroke="#7c3aed" strokeWidth="2" strokeDasharray="6 4" />
                </svg>
                <span className="text-[10px] font-bold text-violet-500">Pr\u00e9visionnel</span>
              </div>
            </div>
          )}
        </div>
      )}
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
