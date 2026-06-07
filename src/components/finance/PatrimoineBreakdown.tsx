import React from 'react';
import { Releve, CategorieFinance, CATEGORIES, aggregateByCategorie, totalReleve, formatEuro } from '@/types/finance';
import { Wallet, PiggyBank, TrendingUp, Briefcase } from 'lucide-react';

const CATEGORIE_META: Record<CategorieFinance, { label: string; icon: React.ElementType; bg: string }> = {
  Cash: { label: 'Cash & Comptes courants', icon: Wallet, bg: 'bg-gray-50' },
  Épargne: { label: 'Épargne', icon: PiggyBank, bg: 'bg-gray-50' },
  Investissement: { label: 'Investissements', icon: TrendingUp, bg: 'bg-gray-50' },
  Pro: { label: 'Fonds professionnels', icon: Briefcase, bg: 'bg-gray-50' },
};

interface Props {
  releve: Releve | null;
}

export default function PatrimoineBreakdown({ releve }: Props) {
  if (!releve) {
    return (
      <div className="bg-white rounded-[2.5rem] p-8">
        <h3 className="text-lg font-bold mb-6">Ventilation patrimoniale</h3>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
            <Briefcase className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-bold text-gray-400">Aucun relevé disponible</p>
          <p className="text-xs text-gray-300 mt-1">Ajoutez votre premier relevé patrimonial</p>
        </div>
      </div>
    );
  }

  const agg = aggregateByCategorie(releve.lignes);
  const total = totalReleve(releve);

  return (
    <div className="bg-white rounded-[2.5rem] p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Ventilation patrimoniale</h3>
        <span className="text-xs text-gray-400">{new Date(releve.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CATEGORIES.map(cat => {
          const meta = CATEGORIE_META[cat];
          const Icon = meta.icon;
          const montant = agg[cat];
          const pct = total > 0 ? Math.round((montant / total) * 100) : 0;
          return (
            <div key={cat} className="bg-gray-50 rounded-[1.5rem] p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <span className="text-xs font-bold text-gray-400">{pct}%</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{cat}</p>
              <p className="text-2xl font-black text-gray-900">{formatEuro(montant)}</p>
              <p className="text-xs text-gray-400 mt-1">{meta.label}</p>
              {/* progress bar */}
              <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
