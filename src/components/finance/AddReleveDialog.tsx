import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Releve, LigneCompte, CategorieFinance, CATEGORIES } from '@/types/finance';
import { Plus, Trash2, Pencil, CalendarDays } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lastReleve: Releve | null;
  releveToEdit?: Releve | null;
  onSave: (releve: Omit<Releve, 'id'>) => void;
  onUpdate?: (id: string, releve: Omit<Releve, 'id'>) => void;
}

function newLigne(cat: CategorieFinance = 'Cash'): LigneCompte {
  return { id: `l_${Date.now()}_${Math.random()}`, nom: '', categorie: cat, montant: 0 };
}

/** Formate YYYY-MM-DD en "7 juin 2026" */
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

  // L'input[type=date] est rendu invisible mais toujours dans le DOM
  // Il est déclenché UNIQUEMENT via showPicker() au clic volontaire
  const hiddenDateRef = useRef<HTMLInputElement>(null);
  // Flag: le dialog vient juste de s'ouvrir — bloque tout focus automatique
  const justOpenedRef = useRef(false);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [lignes, setLignes] = useState<LigneCompte[]>([newLigne()]);

  useEffect(() => {
    if (!open) return;

    // Marque l'ouverture pour bloquer tout focus parasite pendant 400ms
    justOpenedRef.current = true;
    const t = setTimeout(() => { justOpenedRef.current = false; }, 400);

    if (isEdit && releveToEdit) {
      setDate(releveToEdit.date);
      setNote(releveToEdit.note ?? '');
      setLignes(releveToEdit.lignes.map(l => ({ ...l })));
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setLignes(
        lastReleve?.lignes.length
          ? lastReleve.lignes.map(l => ({ ...l, id: `l_${Date.now()}_${Math.random()}` }))
          : [newLigne()]
      );
    }

    // S'assure que l'input caché n'a pas le focus au montage
    hiddenDateRef.current?.blur();

    return () => clearTimeout(t);
  }, [open, releveToEdit, isEdit]);

  /** Ouvre le picker natif uniquement sur tap/clic explicite */
  const openDatePicker = () => {
    if (justOpenedRef.current) return; // Ignore si le dialog vient d'ouvrir
    const input = hiddenDateRef.current;
    if (!input) return;
    input.focus({ preventScroll: true });
    // showPicker() est supporté sur iOS 16+, Android Chrome, desktop
    if (typeof (input as any).showPicker === 'function') {
      try { (input as any).showPicker(); } catch (_) { /* ignore */ }
    }
  };

  const updateLigne = (id: string, field: keyof LigneCompte, value: any) =>
    setLignes(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  const removeLigne = (id: string) =>
    setLignes(prev => prev.filter(l => l.id !== id));
  const addLigne = () =>
    setLignes(prev => [...prev, newLigne()]);

  const handleSave = () => {
    const cleanLignes = lignes.filter(l => l.nom.trim() !== '');
    if (cleanLignes.length === 0) return;
    const payload = { date, lignes: cleanLignes, note: note.trim() || undefined };
    if (isEdit && releveToEdit && onUpdate) onUpdate(releveToEdit.id, payload);
    else onSave(payload);
    onOpenChange(false);
  };

  const canSave = lignes.some(l => l.nom.trim() !== '') && !!date;

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
            <div className="min-w-0">
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
            </div>
          </div>
        </DialogHeader>

        {/* Zone scrollable */}
        <div className="overflow-y-auto overscroll-contain flex-1 px-5 py-4 md:px-8 md:py-6 space-y-5">

          {/* Date + Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Champ date : bouton visible + input[date] invisible */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Date du relevé</Label>

              {/* Bouton visible — déclenche showPicker() uniquement au clic */}
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

              {/*
                Input[date] invisible :
                - position:absolute hors du flux pour éviter tout scroll/layout
                - opacity:0 pointer-events:none — ne reçoit jamais de focus accidentel
                - tabIndex=-1 — exclu de la navigation clavier
                - La valeur est lue via onChange, le picker est ouvert via showPicker()
              */}
              <input
                ref={hiddenDateRef}
                type="date"
                value={date}
                tabIndex={-1}
                onChange={e => { if (e.target.value) setDate(e.target.value); }}
                onFocus={e => {
                  // Ferme immédiatement si focus arrivé autrement que par openDatePicker
                  if (justOpenedRef.current) e.currentTarget.blur();
                }}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  pointerEvents: 'none',
                  width: '1px',
                  height: '1px',
                  overflow: 'hidden',
                }}
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

          {/* Lignes */}
          <div className="space-y-2.5">
            <div className="hidden sm:grid grid-cols-12 gap-2 px-1">
              <span className="col-span-5 text-[10px] font-bold uppercase text-gray-400">Compte</span>
              <span className="col-span-3 text-[10px] font-bold uppercase text-gray-400">Catégorie</span>
              <span className="col-span-3 text-[10px] font-bold uppercase text-gray-400">Montant (€)</span>
              <span className="col-span-1" />
            </div>

            {lignes.map((ligne) => (
              <div key={ligne.id} className="bg-gray-50 rounded-2xl p-3 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center">
                <div className="sm:col-span-5">
                  <Label className="sm:hidden text-[10px] font-bold uppercase text-gray-400 mb-1 block">Compte</Label>
                  <Input
                    placeholder="Nom du compte"
                    value={ligne.nom}
                    onChange={e => updateLigne(ligne.id, 'nom', e.target.value)}
                    className="rounded-xl border-0 bg-white shadow-sm text-sm"
                  />
                </div>
                <div className="sm:col-span-3">
                  <Label className="sm:hidden text-[10px] font-bold uppercase text-gray-400 mb-1 block">Catégorie</Label>
                  <Select
                    value={ligne.categorie}
                    onValueChange={val => updateLigne(ligne.id, 'categorie', val as CategorieFinance)}
                  >
                    <SelectTrigger className="rounded-xl border-0 bg-white shadow-sm text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2 sm:contents">
                  <div className="flex-1 sm:col-span-3">
                    <Label className="sm:hidden text-[10px] font-bold uppercase text-gray-400 mb-1 block">Montant (€)</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      value={ligne.montant || ''}
                      onChange={e => updateLigne(ligne.id, 'montant', Number(e.target.value))}
                      className="rounded-xl border-0 bg-white shadow-sm text-sm font-bold tabular-nums"
                    />
                  </div>
                  <div className="shrink-0 sm:col-span-1 flex justify-center pb-0.5 sm:pb-0">
                    <button
                      onClick={() => removeLigne(ligne.id)}
                      className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addLigne}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-400 hover:border-black hover:text-black transition-all duration-200"
            >
              <Plus className="w-4 h-4" /> Ajouter une ligne
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 md:px-8 md:pb-7 pt-2 shrink-0 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-lg shadow-black/20 hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-40"
          >
            {isEdit ? 'Enregistrer les modifications' : 'Enregistrer le relevé'}
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
