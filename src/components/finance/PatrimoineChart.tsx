import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Releve, CategorieFinance, CATEGORIES, aggregateByCategorie, totalReleve, formatEuro } from '@/types/finance';

type FilterKey = 'global' | CategorieFinance;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'global', label: 'Global' },
  { key: 'Cash', label: 'Cash' },
  { key: 'Épargne', label: 'Épargne' },
  { key: 'Investissement', label: 'Invest.' },
  { key: 'Pro', label: 'Pro' },
];

interface Props {
  releves: Releve[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
        <p className="text-xl font-black text-gray-900">{formatEuro(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function PatrimoineChart({ releves }: Props) {
  const [filter, setFilter] = useState<FilterKey>('global');

  const sorted = [...releves].sort((a, b) => a.date.localeCompare(b.date));

  const data = sorted.map(r => {
    const agg = aggregateByCategorie(r.lignes);
    const value = filter === 'global' ? totalReleve(r) : agg[filter as CategorieFinance];
    return {
      name: new Date(r.date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      value,
    };
  });

  return (
    <div className="bg-white rounded-[2.5rem] p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h3 className="text-lg font-bold">Évolution du patrimoine</h3>
        <div className="flex items-center gap-1 bg-gray-50 rounded-2xl p-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                filter === f.key
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {data.length < 2 ? (
        <div className="h-[280px] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
          </div>
          <p className="text-sm font-bold text-gray-400">Pas encore assez de données</p>
          <p className="text-xs text-gray-300 mt-1">Ajoutez au moins 2 relevés pour voir l'évolution</p>
        </div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="patrimoineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111827" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={v => `${Math.round(v / 1000)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#111827"
                strokeWidth={2.5}
                fill="url(#patrimoineGrad)"
                dot={{ fill: '#111827', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#111827', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
