import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Releve, LigneCompte, CategorieFinance, CATEGORIES } from '@/types/finance';
import { Plus, Trash2, Pencil } from 'lucide-react';

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

export default function AddReleveDialog({
  open, onOpenChange, lastReleve, releveToEdit, onSave, onUpdate,
}: Props) {
  const isEdit = !!releveToEdit;
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [lignes, setLignes] = useState<LigneCompte[]>([newLigne()]);

  useEffect(() => {
    if (!open) return;
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
    // Empêche l'ouverture automatique du picker de date sur mobile
    setTimeout(() => { dateInputRef.current?.blur(); }, 50);
  }, [open, releveToEdit, isEdit]);

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
      {/*
        - w-[92vw] + max-w + overflow-hidden → garantit que rien ne déborde sur mobile
        - [&>button]:hidden masque la croix native shadcn (on garde la nôtre via onOpenChange)
        - La croix native shadcn est conservée fonctionnellement via onOpenChange du Dialog
      */}
      <DialogContent
        className="w-[92vw] max-w-[700px] rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl p-0 max-h-[92dvh] flex flex-col overflow-hidden"
      >
        {/* Header sticky */}
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
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Date du relevé</Label>
              <input
                ref={dateInputRef}
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                onFocus={e => {
                  if (window.matchMedia('(pointer: coarse)').matches) {
                    e.currentTarget.blur();
                    setTimeout(() => e.currentTarget.focus(), 100);
                  }
                }}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            {/* En-têtes colonnes — desktop uniquement */}
            <div className="hidden sm:grid grid-cols-12 gap-2 px-1">
              <span className="col-span-5 text-[10px] font-bold uppercase text-gray-400">Compte</span>
              <span className="col-span-3 text-[10px] font-bold uppercase text-gray-400">Catégorie</span>
              <span className="col-span-3 text-[10px] font-bold uppercase text-gray-400">Montant (€)</span>
              <span className="col-span-1" />
            </div>

            {lignes.map((ligne) => (
              <div key={ligne.id} className="bg-gray-50 rounded-2xl p-3 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center">
                {/* Nom */}
                <div className="sm:col-span-5">
                  <Label className="sm:hidden text-[10px] font-bold uppercase text-gray-400 mb-1 block">Compte</Label>
                  <Input
                    placeholder="Nom du compte"
                    value={ligne.nom}
                    onChange={e => updateLigne(ligne.id, 'nom', e.target.value)}
                    className="rounded-xl border-0 bg-white shadow-sm text-sm"
                  />
                </div>
                {/* Catégorie */}
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
                {/* Montant + supprimer */}
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

        {/* Footer fixe */}
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
