import React, { useState } from 'react';
import { Releve, CategorieFinance, CATEGORIES, aggregateByCategorie, totalReleve, formatEuro } from '@/types/finance';
import { Wallet, PiggyBank, TrendingUp, Briefcase } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CATEGORIE_META: Record<CategorieFinance, { label: string; icon: React.ElementType }> = {
  Cash:          { label: 'Cash & Comptes courants', icon: Wallet },
  Épargne:       { label: 'Épargne',                 icon: PiggyBank },
  Investissement: { label: 'Investissements',         icon: TrendingUp },
  Pro:           { label: 'Fonds professionnels',    icon: Briefcase },
};

interface Props {
  releve: Releve | null;
}

export default function PatrimoineBreakdown({ releve }: Props) {
  const [selectedCat, setSelectedCat] = useState<CategorieFinance | null>(null);

  /* État vide */
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

  const agg   = aggregateByCategorie(releve.lignes);
  const total = totalReleve(releve);

  /* Lignes de la catégorie sélectionnée */
  const selectedLines = selectedCat
    ? releve.lignes.filter(l => l.categorie === selectedCat)
    : [];
  const selectedMeta  = selectedCat ? CATEGORIE_META[selectedCat] : null;
  const selectedTotal = selectedLines.reduce((s, l) => s + l.montant, 0);

  return (
    <>
      {/* Grille des catégories */}
      <div className="bg-white rounded-[2.5rem] p-5 md:p-8">
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <h3 className="text-base md:text-lg font-bold">Ventilation patrimoniale</h3>
          <span className="text-xs text-gray-400">
            {new Date(releve.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {CATEGORIES.map(cat => {
            const meta  = CATEGORIE_META[cat];
            const Icon  = meta.icon;
            const montant = agg[cat];
            const pct   = total > 0 ? Math.round((montant / total) * 100) : 0;
            const count = releve.lignes.filter(l => l.categorie === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className="text-left bg-gray-50 rounded-[1.5rem] p-5 md:p-6 hover:bg-gray-100 active:scale-[0.98] transition-all duration-200 cursor-pointer group w-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex items-center gap-2">
                    {count > 0 && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 bg-white px-2 py-0.5 rounded-full">
                        {count} compte{count > 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="text-xs font-bold text-gray-400">{pct}%</span>
                  </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{cat}</p>
                <p className="text-xl md:text-2xl font-black text-gray-900 tabular-nums">{formatEuro(montant)}</p>
                <p className="text-xs text-gray-400 mt-1">{meta.label}</p>
                <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dialog détail catégorie */}
      <Dialog open={!!selectedCat} onOpenChange={v => { if (!v) setSelectedCat(null); }}>
        <DialogContent className="w-[92vw] max-w-[500px] rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl p-0 max-h-[85dvh] flex flex-col overflow-hidden">

          {/* Header */}
          <DialogHeader className="px-5 pt-5 pb-4 md:px-8 md:pt-7 bg-gray-50/80 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3 pr-8">
              {selectedMeta && (
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0">
                  <selectedMeta.icon className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="min-w-0">
                <DialogTitle className="text-lg md:text-xl font-black leading-tight">
                  {selectedCat}
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedMeta?.label} · {selectedLines.length} compte{selectedLines.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Liste des comptes */}
          <div className="overflow-y-auto overscroll-contain flex-1 px-5 py-4 md:px-8 md:py-6 space-y-2">
            {selectedLines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm font-bold text-gray-400">Aucun compte dans cette catégorie</p>
                <p className="text-xs text-gray-300 mt-1">Ajoutez des lignes dans votre relevé</p>
              </div>
            ) : (
              selectedLines.map((ligne, idx) => {
                const pct = selectedTotal > 0 ? Math.round((ligne.montant / selectedTotal) * 100) : 0;
                return (
                  <div
                    key={ligne.id ?? idx}
                    className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-4 gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate">{ligne.nom}</p>
                      <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-black tabular-nums">{formatEuro(ligne.montant)}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">{pct}%</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer total */}
          <div className="px-5 pb-5 md:px-8 md:pb-7 pt-3 shrink-0 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total {selectedCat}</span>
              <span className="text-xl font-black tabular-nums">{formatEuro(selectedTotal)}</span>
            </div>
          </div>

        </DialogContent>
      </Dialog>
    </>
  );
}
