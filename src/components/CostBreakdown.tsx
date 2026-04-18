"use client";

import React, { useState } from 'react';
import { PieChart, Plus, Trash2, MoreVertical, Calculator, Wallet, Percent, Calendar, Settings2 } from 'lucide-react';
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
import { Switch } from "@/components/ui/switch";

const formatEuro = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

const CostBreakdown = ({ costs, scenario, onAdd, onUpdate, onDelete, onUpdateScenario, financeDetails }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<any>(null);
  const [newCost, setNewCost] = useState({ label: '', value: '', category: 'Divers' });

  const total = costs.reduce((acc, cost) => acc + (cost.values[scenario.id] || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newCost);
    setIsOpen(false);
    setNewCost({ label: '', value: '', category: 'Divers' });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCost.type === 'finance') {
      onUpdateScenario({
        apport: editingCost.apport,
        interestRate: editingCost.interestRate,
        duration: editingCost.duration
      });
    } else if (editingCost.type === 'agence') {
      onUpdateScenario({ agenceRate: editingCost.agenceRate });
    } else if (editingCost.type === 'notaire') {
      onUpdateScenario({ isNotaireReduced: editingCost.isNotaireReduced });
    } else {
      onUpdate(editingCost);
    }
    setEditingCost(null);
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
              <DialogFooter>
                <button type="submit" className="w-full py-3 bg-black text-white rounded-xl font-bold">Ajouter partout</button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 space-y-4">
        {costs.map((cost) => (
          <div 
            key={cost.id} 
            className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded-xl transition-all"
            onClick={() => {
              if (cost.type === 'finance') {
                setEditingCost({ ...cost, apport: scenario.apport, interestRate: scenario.interestRate, duration: scenario.duration });
              } else if (cost.type === 'agence') {
                setEditingCost({ ...cost, agenceRate: scenario.agenceRate });
              } else if (cost.type === 'notaire') {
                setEditingCost({ ...cost, isNotaireReduced: scenario.isNotaireReduced });
              } else {
                setEditingCost(cost);
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                cost.isGlobal ? "bg-gray-200 group-hover:bg-black" : "bg-blue-400"
              )} />
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 group-hover:text-black transition-colors">{cost.label}</span>
                {cost.type === 'notaire' && <span className="text-[8px] text-gray-400 font-bold uppercase">{scenario.isNotaireReduced ? 'Frais réduits (3%)' : 'Standard (8%)'}</span>}
                {cost.type === 'agence' && <span className="text-[8px] text-gray-400 font-bold uppercase">Taux : {scenario.agenceRate}%</span>}
                {cost.type === 'finance' && <span className="text-[8px] text-gray-400 font-bold uppercase">{scenario.interestRate}% sur {scenario.duration} mois</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-900">{formatEuro(cost.values[scenario.id] || 0)}</span>
              {!['notaire', 'agence', 'finance', 'acquisition'].includes(cost.type) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all">
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
              )}
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

      {/* Edit Cost Dialog */}
      <Dialog open={!!editingCost} onOpenChange={(open) => !open && setEditingCost(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingCost?.type === 'finance' ? <Calculator className="w-5 h-5" /> : <Settings2 className="w-5 h-5" />}
              {editingCost?.label}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-6 py-4">
            {editingCost?.type === 'finance' ? (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs font-bold text-blue-600 uppercase">
                    <span>Total Financé</span>
                    <span>{formatEuro(financeDetails.totalFinanced)}</span>
                  </div>
                  <p className="text-[10px] text-blue-400">Calculé sur (Coûts totaux - Apport)</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Wallet className="w-3 h-3" /> Apport personnel (€)</Label>
                    <Input type="number" value={editingCost.apport} onChange={e => setEditingCost({...editingCost, apport: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Durée de portage (mois)</Label>
                    <Input type="number" value={editingCost.duration} onChange={e => setEditingCost({...editingCost, duration: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Percent className="w-3 h-3" /> Taux annuel d'emprunt (%)</Label>
                    <Input type="number" step="0.1" value={editingCost.interestRate} onChange={e => setEditingCost({...editingCost, interestRate: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
            ) : editingCost?.type === 'agence' ? (
              <div className="space-y-4">
                <Label>Taux d'agence (%)</Label>
                <Input type="number" value={editingCost.agenceRate} onChange={e => setEditingCost({...editingCost, agenceRate: Number(e.target.value)})} />
              </div>
            ) : editingCost?.type === 'notaire' ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="space-y-0.5">
                  <Label>Frais réduits</Label>
                  <p className="text-[10px] text-gray-500">Appliquer 3% au lieu de 8%</p>
                </div>
                <Switch checked={editingCost.isNotaireReduced} onCheckedChange={checked => setEditingCost({...editingCost, isNotaireReduced: checked})} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Libellé</Label>
                  <Input value={editingCost?.label || ''} onChange={e => setEditingCost({...editingCost, label: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Montant (€)</Label>
                  <Input type="number" value={editingCost?.values[scenario.id] || 0} onChange={e => setEditingCost({...editingCost, values: { ...editingCost.values, [scenario.id]: Number(e.target.value) }})} />
                </div>
              </div>
            )}

            <DialogFooter>
              <button type="submit" className="w-full py-3 bg-black text-white rounded-xl font-bold">Enregistrer les paramètres</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CostBreakdown;