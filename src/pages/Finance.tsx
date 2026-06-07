import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import PatrimoineChart from '@/components/finance/PatrimoineChart';
import PatrimoineBreakdown from '@/components/finance/PatrimoineBreakdown';
import AddReleveDialog from '@/components/finance/AddReleveDialog';
import ObjectifDialog from '@/components/finance/ObjectifDialog';
import { Releve, ObjectifPatrimoine, totalReleve, formatEuro } from '@/types/finance';
import { TrendingUp, TrendingDown, Minus, Target, Plus, History, Pencil } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const CACHE_KEY = 'immo_finance_v1';
const OBJECTIF_KEY = 'immo_finance_objectif_v1';

function loadReleves(): Releve[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveReleves(releves: Releve[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(releves));
}

function loadObjectif(): ObjectifPatrimoine | null {
  try {
    const raw = localStorage.getItem(OBJECTIF_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveObjectif(obj: ObjectifPatrimoine) {
  localStorage.setItem(OBJECTIF_KEY, JSON.stringify(obj));
}

interface KpiCardProps {
  title: string;
  value: string;
  sub?: React.ReactNode;
  variant?: 'dark' | 'light';
  onClick?: () => void;
  clickable?: boolean;
}

function KpiCard({ title, value, sub, variant = 'light', onClick, clickable }: KpiCardProps) {
  const isDark = variant === 'dark';
  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-[2rem] transition-all duration-300 hover:shadow-lg ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      } ${
        clickable ? 'cursor-pointer active:scale-[0.98]' : ''
      }`}
    >
      <p className={`text-sm mb-4 ${ isDark ? 'text-gray-400' : 'text-gray-500' }`}>{title}</p>
      <h3 className="text-3xl font-black tabular-nums mb-4 leading-none">{value}</h3>
      {sub && <div className="flex items-center gap-2">{sub}</div>}
      {clickable && !sub && (
        <p className={`text-xs mt-2 ${ isDark ? 'text-gray-500' : 'text-gray-400' }`}>Cliquer pour définir</p>
      )}
    </div>
  );
}

function DeltaBadge({ value, isDark }: { value: number; isDark?: boolean }) {
  const isUp = value > 0;
  const isFlat = value === 0;
  const color = isFlat
    ? (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500')
    : isUp
    ? (isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600')
    : (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600');
  const Icon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown;
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${color}`}>
      <Icon className="w-3 h-3" />
      <span>{isFlat ? '—' : `${isUp ? '+' : ''}${value.toFixed(1)}%`}</span>
    </div>
  );
}

export default function Finance() {
  const [releves, setReleves] = useState<Releve[]>(loadReleves);
  const [objectif, setObjectif] = useState<ObjectifPatrimoine | null>(loadObjectif);
  const [addOpen, setAddOpen] = useState(false);
  const [releveToEdit, setReleveToEdit] = useState<Releve | null>(null);
  const [objectifOpen, setObjectifOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const sorted = [...releves].sort((a, b) => b.date.localeCompare(a.date));
  const last = sorted[0] ?? null;
  const prev = sorted[1] ?? null;

  const lastTotal = last ? totalReleve(last) : 0;
  const prevTotal = prev ? totalReleve(prev) : 0;

  const deltaEuro = last && prev ? lastTotal - prevTotal : 0;
  const deltaPct = prev && prevTotal !== 0 ? (deltaEuro / prevTotal) * 100 : 0;
  const remainingToGoal = objectif ? objectif.montant - lastTotal : null;

  const handleAddReleve = (data: Omit<Releve, 'id'>) => {
    const newReleve: Releve = { ...data, id: `r_${Date.now()}` };
    const updated = [newReleve, ...releves];
    setReleves(updated);
    saveReleves(updated);
    showSuccess('Relevé enregistré');
  };

  const handleUpdateReleve = (id: string, data: Omit<Releve, 'id'>) => {
    const updated = releves.map(r => r.id === id ? { ...data, id } : r);
    setReleves(updated);
    saveReleves(updated);
    showSuccess('Relevé mis à jour');
  };

  const handleDeleteReleve = (id: string) => {
    if (!confirm('Supprimer ce relevé ?')) return;
    const updated = releves.filter(r => r.id !== id);
    setReleves(updated);
    saveReleves(updated);
    showSuccess('Relevé supprimé');
  };

  const handleSaveObjectif = (obj: ObjectifPatrimoine) => {
    setObjectif(obj);
    saveObjectif(obj);
    showSuccess('Objectif enregistré');
  };

  const openEdit = (r: Releve) => {
    setReleveToEdit(r);
    setAddOpen(true);
  };

  const handleDialogClose = (v: boolean) => {
    setAddOpen(v);
    if (!v) setReleveToEdit(null);
  };

  return (
    <div className="flex h-screen bg-[#F4F5F7] text-gray-900 font-sans overflow-hidden">
      <Sidebar className="hidden lg:flex border-r border-gray-100" />
      <main className="flex-1 flex flex-col min-h-0">
        <TopBar />
        <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-0 pb-12">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 md:mb-10 md:mt-8">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2">Finance</h1>
              <p className="text-gray-500">Suivi de votre patrimoine personnel</p>
            </div>
            <button
              onClick={() => { setReleveToEdit(null); setAddOpen(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-bold shadow-lg shadow-black/10 hover:bg-gray-800 transition-all active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              {last ? 'Mettre à jour' : 'Ajouter un relevé'}
            </button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <KpiCard
              variant="dark"
              title="Patrimoine net"
              value={last ? formatEuro(lastTotal) : '—'}
              sub={
                last && prev ? (
                  <>
                    <DeltaBadge value={deltaPct} isDark />
                    <span className="text-xs text-gray-500">vs mois préc.</span>
                  </>
                ) : last ? (
                  <span className="text-xs text-gray-500">Premier relevé</span>
                ) : (
                  <span className="text-xs text-gray-500">Aucun relevé</span>
                )
              }
            />
            <KpiCard
              title="Évolution mensuelle"
              value={prev ? `${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(2)}%` : '—'}
              sub={
                prev ? (
                  <DeltaBadge value={deltaPct} />
                ) : (
                  <span className="text-xs text-gray-400">Pas encore de comparaison</span>
                )
              }
            />
            <KpiCard
              title="Variation (€)"
              value={
                prev
                  ? `${deltaEuro >= 0 ? '+' : ''}${formatEuro(deltaEuro)}`
                  : '—'
              }
              sub={
                prev ? (
                  <>
                    <DeltaBadge value={deltaEuro > 0 ? 1 : deltaEuro < 0 ? -1 : 0} />
                    <span className="text-xs text-gray-400">depuis le relevé préc.</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">Pas encore de comparaison</span>
                )
              }
            />
            <KpiCard
              title="Remaining to goal"
              value={
                remainingToGoal !== null
                  ? remainingToGoal <= 0
                    ? '🎯 Atteint'
                    : formatEuro(remainingToGoal)
                  : 'Définir →'
              }
              sub={
                objectif ? (
                  <span className="text-xs text-gray-400">Objectif : {formatEuro(objectif.montant)}</span>
                ) : undefined
              }
              clickable
              onClick={() => setObjectifOpen(true)}
            />
          </div>

          {/* Chart */}
          <div className="mb-6">
            <PatrimoineChart releves={releves} />
          </div>

          {/* Breakdown */}
          <div className="mb-6">
            <PatrimoineBreakdown releve={last} />
          </div>

          {/* Historique */}
          <div className="bg-white rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold">Historique des relevés</h3>
                <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-black uppercase tracking-widest rounded-full text-gray-500">
                  {releves.length}
                </span>
              </div>
              {releves.length > 3 && (
                <button
                  onClick={() => setShowHistory(h => !h)}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-black transition-colors"
                >
                  <History className="w-3.5 h-3.5" />
                  {showHistory ? 'Réduire' : 'Tout voir'}
                </button>
              )}
            </div>

            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                  <History className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-400">Aucun relevé enregistré</p>
                <p className="text-xs text-gray-300 mt-1">Cliquez sur "Ajouter un relevé" pour commencer</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(showHistory ? sorted : sorted.slice(0, 3)).map((r, idx) => {
                  const total = totalReleve(r);
                  const nextR = sorted[idx + 1];
                  const nextTotal = nextR ? totalReleve(nextR) : null;
                  const diff = nextTotal !== null ? total - nextTotal : null;
                  const pct = diff !== null && nextTotal ? (diff / nextTotal) * 100 : null;
                  return (
                    <div
                      key={r.id}
                      onClick={() => openEdit(r)}
                      className="flex items-center justify-between bg-gray-50 rounded-2xl px-5 py-4 group cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${ idx === 0 ? 'bg-black' : 'bg-gray-300' }`} />
                        <div>
                          <p className="text-sm font-bold">
                            {new Date(r.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          {r.note && <p className="text-xs text-gray-400">{r.note}</p>}
                          <p className="text-xs text-gray-400">{r.lignes.length} ligne{r.lignes.length > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {pct !== null && (
                          <DeltaBadge value={pct} />
                        )}
                        <p className="text-base font-black tabular-nums">{formatEuro(total)}</p>
                        {/* Icône édition visible au hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-xl shadow-sm">
                          <Pencil className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteReleve(r.id); }}
                          className="opacity-0 group-hover:opacity-100 p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 transition-all"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>

      <AddReleveDialog
        open={addOpen}
        onOpenChange={handleDialogClose}
        lastReleve={last}
        releveToEdit={releveToEdit}
        onSave={handleAddReleve}
        onUpdate={handleUpdateReleve}
      />
      <ObjectifDialog
        open={objectifOpen}
        onOpenChange={setObjectifOpen}
        current={objectif}
        onSave={handleSaveObjectif}
      />
    </div>
  );
}
