import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Releve, LigneCompte, CategorieFinance, CATEGORIES } from '@/types/finance';
import { Plus, Trash2, Pencil, CalendarDays, CheckCircle2, Clock } from 'lucide-react';

const PREV_COLOR = '#417078';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lastReleve: Releve | null;
  releveToEdit?: Releve | null;
  onSave: (releve: Omit<Releve, 'id'>) => void;
  onUpdate?: (id: string, releve: Omit<Releve, 'id'>) => void;
}

const CAT_STYLE: Record<CategorieFinance, { row: string; dot: string; label: string }> = {
  Cash:           { row: 'bg-emerald-50/70',  dot: 'bg-emerald-400', label: 'text-emerald-600' },
  'Épargne':      { row: 'bg-blue-50/70',     dot: 'bg-blue-400',    label: 'text-blue-600'    },
  Investissement: { row: 'bg-amber-50/70',    dot: 'bg-amber-400',   label: 'text-amber-600'   },
  Pro:            { row: 'bg-orange-50/70',   dot: 'bg-orange-400',  label: 'text-orange-600'  },
};

function newLigne(cat: CategorieFinance = 'Cash'): LigneCompte {
  return { id: `l_${Date.now()}_${Math.random()}`, nom: '', categorie: cat, montant: 0 };
}

function formatDateFR(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function AddReleveDialog({
  open, onOpenChange, lastReleve, releveToEdit, onSave, onUpdate,
}: Props) {
  const isEdit = !!releveToEdit;
  const hiddenDateRef = useRef<HTMLInputElement>(null);
  const justOpenedRef = useRef(false);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [previsionnel, setPrevisionnel] = useState(false);
  const [lignes, setLignes] = useState<LigneCompte[]>([newLigne()]);

  useEffect(() => {
    if (!open) return;
    justOpenedRef.current = true;
    const t = setTimeout(() => { justOpenedRef.current = false; }, 400);
    if (isEdit && releveToEdit) {
      setDate(releveToEdit.date);
      setNote(releveToEdit.note ?? '');
      setPrevisionnel(releveToEdit.previsionnel ?? false);
      setLignes(releveToEdit.lignes.map(l => ({ ...l })));
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setPrevisionnel(false);
      setLignes(
        lastReleve?.lignes.length
          ? lastReleve.lignes.map(l => ({ ...l, id: `l_${Date.now()}_${Math.random()}` }))
          : [newLigne()]
      );
    }
    hiddenDateRef.current?.blur();
    return () => clearTimeout(t);
  }, [open, releveToEdit, isEdit]);

  const openDatePicker = () => {
    if (justOpenedRef.current) return;
    const input = hiddenDateRef.current;
    if (!input) return;
    input.focus({ preventScroll: true });
    if (typeof (input as any).showPicker === 'function') {
      try { (input as any).showPicker(); } catch (_) { /* ignore */ }
    }
  };

  const updateLigne = (id: string, field: keyof LigneCompte, value: any) =>
    setLignes(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  const removeLigne = (id: string) =>
    setLignes(prev => prev.filter(l => l.id !== id));
  const addLigne = () => {
    const lastCat = lignes.length > 0 ? lignes[lignes.length - 1].categorie : 'Cash';
    setLignes(prev => [...prev, newLigne(lastCat)]);
  };

  const handleSave = () => {
    const cleanLignes = lignes.filter(l => l.nom.trim() !== '');
    if (cleanLignes.length === 0) return;
    const payload = { date, lignes: cleanLignes, note: note.trim() || undefined, previsionnel };
    if (isEdit && releveToEdit && onUpdate) onUpdate(releveToEdit.id, payload);
    else onSave(payload);
    onOpenChange(false);
  };

  const canSave = lignes.some(l => l.nom.trim() !== '') && !!date;

  const lignesParCat = CATEGORIES.reduce<Record<CategorieFinance, LigneCompte[]>>(
    (acc, cat) => ({ ...acc, [cat]: [] }),
    {} as Record<CategorieFinance, LigneCompte[]>
  );
  lignes.forEach(l => lignesParCat[l.categorie].push(l));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[700px] rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl p-0 max-h-[92dvh] flex flex-col overflow-hidden">

        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4 md:px-8 md:pt-7 bg-gray-50/80 backdrop-blur-sm shrink-0">
          <div className="flex items-start gap-3 pr-8">
            {isEdit && (
              <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <Pencil className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg md:text-2xl font-black leading-tight">
                {isEdit ? 'Modifier le relevé' : 'Nouveau relevé'}
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                {isEdit
                  ? 'Modifiez les lignes, montants ou la date.'
                  : lastReleve
                  ? 'Lignes pré-remplies depuis le dernier relevé.'
                  : 'Ajoutez vos comptes et leurs montants.'}
              </p>

              {/* Toggle Réel / Prévisionnel */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setPrevisionnel(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    !previsionnel
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Réel
                </button>
                <button
                  type="button"
                  onClick={() => setPrevisionnel(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
                  style={previsionnel
                    ? { backgroundColor: PREV_COLOR, color: 'white', boxShadow: `0 1px 3px ${PREV_COLOR}40` }
                    : { backgroundColor: '#F3F4F6', color: '#6B7280' }
                  }
                >
                  <Clock className="w-3.5 h-3.5" />
                  Prévisionnel
                </button>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Bandeau prévisionnel */}
        {previsionnel && (
          <div
            className="mx-5 md:mx-8 mt-2 px-4 py-2.5 rounded-2xl flex items-center gap-2 shrink-0"
            style={{ backgroundColor: `${PREV_COLOR}12`, border: `1px solid ${PREV_COLOR}30` }}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: PREV_COLOR }} />
            <p className="text-xs font-medium" style={{ color: PREV_COLOR }}>
              Ce relevé sera affiché en pointillé sur le graphique et exclu des KPIs patrimoniaux.
            </p>
          </div>
        )}

        {/* Zone scrollable */}
        <div className="overflow-y-auto overscroll-contain flex-1 px-5 py-4 md:px-8 md:py-6 space-y-5">

          {/* Date + Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Date du relevé</Label>
              <button
                type="button"
                onClick={openDatePicker}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-left flex items-center justify-between gap-2 hover:border-gray-400 transition-colors"
              >
                <span className={date ? 'text-gray-900' : 'text-gray-400'}>
                  {date ? formatDateFR(date) : 'Choisir une date'}
                </span>
                <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
              </button>
              <input
                ref={hiddenDateRef}
                type="date"
                value={date}
                tabIndex={-1}
                onChange={e => { if (e.target.value) setDate(e.target.value); }}
                onFocus={e => { if (justOpenedRef.current) e.currentTarget.blur(); }}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px', overflow: 'hidden' }}
                aria-hidden="true"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Note (optionnel)</Label>
              <Input
                placeholder="Ex : fin de mois, après vente..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Lignes groupées par catégorie */}
          <div className="space-y-4">
            {CATEGORIES.map(cat => {
              const group = lignesParCat[cat];
              const style = CAT_STYLE[cat];
              if (group.length === 0) return null;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${style.label}`}>{cat}</span>
                  </div>
                  <div className="hidden sm:grid grid-cols-12 gap-2 px-1 mb-1">
                    <span className="col-span-5 text-[10px] font-bold uppercase text-gray-300">Compte</span>
                    <span className="col-span-3 text-[10px] font-bold uppercase text-gray-300">Catégorie</span>
                    <span className="col-span-3 text-[10px] font-bold uppercase text-gray-300">Montant (€)</span>
                    <span className="col-span-1" />
                  </div>
                  <div className="space-y-2">
                    {group.map(ligne => (
                      <div key={ligne.id} className={`${style.row} rounded-2xl p-3 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center`}>
                        <div className="sm:col-span-5">
                          <Label className="sm:hidden text-[10px] font-bold uppercase text-gray-400 mb-1 block">Compte</Label>
                          <Input placeholder="Nom du compte" value={ligne.nom} onChange={e => updateLigne(ligne.id, 'nom', e.target.value)} className="rounded-xl border-0 bg-white shadow-sm text-sm" />
                        </div>
                        <div className="sm:col-span-3">
                          <Label className="sm:hidden text-[10px] font-bold uppercase text-gray-400 mb-1 block">Catégorie</Label>
                          <Select value={ligne.categorie} onValueChange={val => updateLigne(ligne.id, 'categorie', val as CategorieFinance)}>
                            <SelectTrigger className="rounded-xl border-0 bg-white shadow-sm text-sm w-full"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end gap-2 sm:contents">
                          <div className="flex-1 sm:col-span-3">
                            <Label className="sm:hidden text-[10px] font-bold uppercase text-gray-400 mb-1 block">Montant (€)</Label>
                            <Input type="number" inputMode="decimal" placeholder="0" value={ligne.montant || ''} onChange={e => updateLigne(ligne.id, 'montant', Number(e.target.value))} className="rounded-xl border-0 bg-white shadow-sm text-sm font-bold tabular-nums" />
                          </div>
                          <div className="shrink-0 sm:col-span-1 flex justify-center pb-0.5 sm:pb-0">
                            <button onClick={() => removeLigne(ligne.id)} className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <button onClick={addLigne} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-400 hover:border-black hover:text-black transition-all duration-200">
              <Plus className="w-4 h-4" /> Ajouter une ligne
            </button>
          </div>
        </div>

        {/* Footer — bouton prévisionnel en #417078 */}
        <div className="px-5 pb-5 md:px-8 md:pb-7 pt-2 shrink-0 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-40"
            style={previsionnel
              ? { backgroundColor: PREV_COLOR, color: 'white', boxShadow: `0 4px 14px ${PREV_COLOR}40` }
              : { backgroundColor: '#111827', color: 'white', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }
            }
          >
            {isEdit ? 'Enregistrer les modifications' : previsionnel ? 'Enregistrer le prévisionnel' : 'Enregistrer le relevé'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
