import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ObjectifPatrimoine } from '@/types/finance';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  current: ObjectifPatrimoine | null;
  onSave: (obj: ObjectifPatrimoine) => void;
}

export default function ObjectifDialog({ open, onOpenChange, current, onSave }: Props) {
  const [montant, setMontant] = useState(current ? String(current.montant) : '');

  const handleSave = () => {
    const val = Number(montant.replace(/\s/g, '').replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      onSave({ montant: val });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] rounded-2xl p-0 border-none shadow-2xl sm:max-w-[440px] sm:rounded-[2rem]">
        <DialogHeader className="p-8 pb-4 bg-gray-50/50">
          <DialogTitle className="text-2xl font-black">Objectif patrimonial</DialogTitle>
        </DialogHeader>
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-gray-400">Objectif de patrimoine net (€)</Label>
            <Input
              type="number"
              placeholder="500000"
              value={montant}
              onChange={e => setMontant(e.target.value)}
              className="rounded-xl text-lg font-bold"
            />
          </div>
          <DialogFooter>
            <button
              onClick={handleSave}
              disabled={!montant || isNaN(Number(montant))}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-xl shadow-black/20 hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-40"
            >
              Enregistrer l'objectif
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
