import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Releve, LigneCompte, CategorieFinance, CATEGORIES } from '@/types/finance';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lastReleve: Releve | null;
  onSave: (releve: Omit<Releve, 'id'>) => void;
}

function newLigne(cat: CategorieFinance = 'Cash'): LigneCompte {
  return { id: `l_${Date.now()}_${Math.random()}`, nom: '', categorie: cat, montant: 0 };
}

export default function AddReleveDialog({ open, onOpenChange, lastReleve, onSave }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [lignes, setLignes] = useState<LigneCompte[]>([newLigne()]);

  useEffect(() => {
    if (open) {
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      if (lastReleve && lastReleve.lignes.length > 0) {
        // Pre-fill with last releve lines (deep copy, new ids)
        setLignes(lastReleve.lignes.map(l => ({ ...l, id: `l_${Date.now()}_${Math.random()}` })));
      } else {
        setLignes([newLigne()]);
      }
    }
  }, [open, lastReleve]);

  const updateLigne = (id: string, field: keyof LigneCompte, value: any) => {
    setLignes(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const removeLigne = (id: string) => {
    setLignes(prev => prev.filter(l => l.id !== id));
  };

  const addLigne = () => {
    setLignes(prev => [...prev, newLigne()]);
  };

  const handleSave = () => {
    const cleanLignes = lignes.filter(l => l.nom.trim() !== '');
    if (cleanLignes.length === 0) return;
    onSave({ date, lignes: cleanLignes, note: note.trim() || undefined });
    onOpenChange(false);
  };

  const canSave = lignes.some(l => l.nom.trim() !== '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] rounded-2xl p-0 border-none shadow-2xl max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-[700px] sm:rounded-[2.5rem] sm:max-h-[90vh]">
        <DialogHeader className="p-8 pb-4 bg-gray-50/50 sticky top-0 z-10">
          <DialogTitle className="text-2xl font-black">Nouveau relevé patrimonial</DialogTitle>
          {lastReleve && (
            <p className="text-xs text-gray-400 mt-1">Les lignes du dernier relevé sont pré-remplies — ajustez les montants.</p>
          )}
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Date du relevé</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Note (optionnel)</Label>
              <Input placeholder="Ex : fin de mois, après vente..." value={note} onChange={e => setNote(e.target.value)} className="rounded-xl" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 px-1">
              <span className="col-span-5 text-[10px] font-bold uppercase text-gray-400">Compte</span>
              <span className="col-span-3 text-[10px] font-bold uppercase text-gray-400">Catégorie</span>
              <span className="col-span-3 text-[10px] font-bold uppercase text-gray-400">Montant (€)</span>
              <span className="col-span-1" />
            </div>

            {lignes.map((ligne) => (
              <div key={ligne.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-2xl px-3 py-3">
                <div className="col-span-5">
                  <Input
                    placeholder="Nom du compte"
                    value={ligne.nom}
                    onChange={e => updateLigne(ligne.id, 'nom', e.target.value)}
                    className="rounded-xl border-0 bg-white shadow-sm text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <Select value={ligne.categorie} onValueChange={val => updateLigne(ligne.id, 'categorie', val as CategorieFinance)}>
                    <SelectTrigger className="rounded-xl border-0 bg-white shadow-sm text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder="0"
                    value={ligne.montant || ''}
                    onChange={e => updateLigne(ligne.id, 'montant', Number(e.target.value))}
                    className="rounded-xl border-0 bg-white shadow-sm text-sm font-bold tabular-nums"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => removeLigne(ligne.id)}
                    className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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

          <DialogFooter className="pt-2">
            <button
              onClick={handleSave}
              disabled={!canSave || !date}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-xl shadow-black/20 hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-40"
            >
              Enregistrer le relevé
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
