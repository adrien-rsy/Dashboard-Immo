"use client";

import React, { useState } from 'react';
import { PieChart, Plus, Trash2, MoreVertical } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatEuro = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

const CostBreakdown = ({ costs, scenarioId, onAdd, onDelete }: { costs: any[], scenarioId: string, onAdd: (cost: any) => void, onDelete: (id: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCost, setNewCost] = useState({ label: '', value: '', category: 'Divers' });

  // Filter costs: global ones + specific ones for this scenario
  const relevantCosts = costs.filter(c => c.isGlobal || c.targetScenarioId === scenarioId);
  const total = relevantCosts.reduce((acc, cost) => acc + (cost.values[scenarioId] || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newCost);
    setIsOpen(false);
    setNewCost({ label: '', value: '', category: 'Divers' });
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold">Structure des coûts</h3>
          <p className="text-sm text-gray-500 mt-1">Détail du scénario actif</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-600">
              <Plus className="w-5 h-5" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
            <DialogHeader>
              <DialogTitle>Nouveau poste de coût global</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="label">Libellé du coût</Label>
                <Input id="label" placeholder="ex: Assurance DO" value={newCost.label} onChange={e => setNewCost({...newCost, label: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Montant de base (€)</Label>
                  <Input id="value" type="number" placeholder="5000" value={newCost.value} onChange={e => setNewCost({...newCost, value: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Input id="category" placeholder="ex: Gestion" value={newCost.category} onChange={e => setNewCost({...newCost, category: e.target.value})} />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic">Ce coût sera ajouté à TOUS les scénarios.</p>
              <DialogFooter>
                <button type="submit" className="w-full py-3 bg-black text-white rounded-xl font-bold">Ajouter partout</button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 space-y-4">
        {relevantCosts.map((cost) => (
          <div key={cost.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                cost.isGlobal ? "bg-gray-200 group-hover:bg-black" : "bg-blue-400"
              )} />
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 group-hover:text-black transition-colors">{cost.label}</span>
                {!cost.isGlobal && <span className="text-[8px] text-blue-500 font-bold uppercase">Spécifique</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-900">{formatEuro(cost.values[scenarioId] || 0)}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-50 rounded-lg transition-all">
                    <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => onDelete(cost.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between p-5 bg-gray-50 rounded-[2rem]">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Coûts</p>
            <p className="text-2xl font-black text-black">{formatEuro(total)}</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <PieChart className="w-6 h-6 text-black" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostBreakdown;