"use client";

import React, { useState } from 'react';
import { TrendingDown, TrendingUp, Zap, Pencil, MoreVertical, Plus, Check } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { ScrollArea } from "@/components/ui/scroll-area";

const formatEuro = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

const SalesScenarios = ({ scenarios, lots, costs, onUpdate, onSetDefault, onAddScenario, calculateTotals }: any) => {
  const [editingScenario, setEditingScenario] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);

  const handleOpenEdit = (scenario: any) => {
    setEditingScenario(scenario);
    setEditForm({
      metadata: { name: scenario.name, duration: scenario.duration },
      lotPrices: lots.reduce((acc: any, lot: any) => ({ ...acc, [lot.id]: lot.prices[scenario.id] }), {}),
      costValues: costs.reduce((acc: any, cost: any) => ({ ...acc, [cost.id]: cost.values[scenario.id] }), {})
    });
  };

  const handleSave = () => {
    onUpdate(editingScenario.id, editForm);
    setEditingScenario(null);
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold">Scénarios de vente</h3>
          <p className="text-sm text-gray-500 mt-1">Gérez vos hypothèses de revente et coûts</p>
        </div>
        <button 
          onClick={onAddScenario}
          className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((s: any) => {
          const { caTotal, costTotal, margin, profitability } = calculateTotals(s.id);
          const Icon = s.icon === 'TrendingDown' ? TrendingDown : s.icon === 'TrendingUp' ? TrendingUp : Zap;
          
          return (
            <div 
              key={s.id} 
              className={cn(
                "p-6 rounded-3xl border-2 transition-all duration-300 relative group",
                s.isDefault ? "border-black bg-gray-50/50 scale-[1.02]" : "border-gray-50 hover:border-gray-200"
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl",
                    s.id === 'pessimistic' ? "bg-red-50 text-red-500" : 
                    s.id === 'optimistic' ? "bg-green-50 text-green-500" : "bg-blue-50 text-blue-500"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm">{s.name}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleOpenEdit(s)}
                    className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-black transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-black transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => onSetDefault(s.id)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Définir par défaut
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-medium">Prix de vente</span>
                  <span className="text-sm font-bold">{formatEuro(caTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-medium">Marge brute</span>
                  <span className="text-sm font-bold text-gray-900">{formatEuro(margin)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-medium">Rentabilité</span>
                  <span className={cn(
                    "text-sm font-bold",
                    profitability > 15 ? "text-green-500" : profitability > 10 ? "text-blue-500" : "text-red-500"
                  )}>{profitability.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-medium">Portage</span>
                  <span className="text-xs font-bold text-gray-600">{s.duration} mois</span>
                </div>
              </div>
              
              {s.isDefault && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black text-white text-[8px] font-bold uppercase tracking-widest rounded-full">
                  Par défaut
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Scenario Editor Dialog */}
      <Dialog open={!!editingScenario} onOpenChange={() => setEditingScenario(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-2xl font-black">Éditer le scénario : {editingScenario?.name}</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-8">
            <div className="space-y-8 py-4">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom du scénario</Label>
                  <Input 
                    value={editForm?.metadata.name} 
                    onChange={e => setEditForm({...editForm, metadata: {...editForm.metadata, name: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Durée portage (mois)</Label>
                  <Input 
                    type="number"
                    value={editForm?.metadata.duration} 
                    onChange={e => setEditForm({...editForm, metadata: {...editForm.metadata, duration: Number(e.target.value)}})}
                  />
                </div>
              </div>

              {/* Lot Prices */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Prix de vente des lots</h4>
                <div className="space-y-3">
                  {lots.map((lot: any) => (
                    <div key={lot.id} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-2xl">
                      <span className="text-sm font-bold">{lot.name}</span>
                      <div className="relative w-40">
                        <Input 
                          type="number"
                          className="pr-8"
                          value={editForm?.lotPrices[lot.id]} 
                          onChange={e => setEditForm({...editForm, lotPrices: {...editForm.lotPrices, [lot.id]: Number(e.target.value)}})}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Costs */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Structure des coûts</h4>
                <div className="space-y-3">
                  {costs.map((cost: any) => (
                    <div key={cost.id} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-2xl">
                      <span className="text-sm font-medium text-gray-600">{cost.label}</span>
                      <div className="relative w-40">
                        <Input 
                          type="number"
                          className="pr-8"
                          value={editForm?.costValues[cost.id]} 
                          onChange={e => setEditForm({...editForm, costValues: {...editForm.costValues, [cost.id]: Number(e.target.value)}})}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-8 pt-4 border-t border-gray-50">
            <button 
              onClick={handleSave}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-lg shadow-black/10 hover:bg-gray-800 transition-all"
            >
              Enregistrer les modifications
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesScenarios;