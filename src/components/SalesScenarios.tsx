"use client";

import React, { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Zap, Pencil, MoreVertical, Plus, Check, Calculator } from 'lucide-react';
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

const SalesScenarios = ({ scenarios, lots, costs, onUpdate, onSetDefault, onAddScenario, onAddSpecificCost, calculateTotals }: any) => {
  const [editingScenario, setEditingScenario] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [showAddCost, setShowAddCost] = useState(false);
  const [newSpecificCost, setNewSpecificCost] = useState({ label: '', value: '' });

  useEffect(() => {
    const lastScenario = scenarios[scenarios.length - 1];
    if (lastScenario && lastScenario.id.startsWith('scenario_') && !editingScenario && (Date.now() - parseInt(lastScenario.id.split('_')[1])) < 2000) {
      handleOpenEdit(lastScenario);
    }
  }, [scenarios.length]);

  const handleOpenEdit = (scenario: any) => {
    setEditingScenario(scenario);
    const relevantCosts = costs.filter((c: any) => c.isGlobal || c.targetScenarioId === scenario.id);
    
    setEditForm({
      metadata: { name: scenario.name, duration: scenario.duration },
      lotPrices: lots.reduce((acc: any, lot: any) => ({ ...acc, [lot.id]: lot.prices[scenario.id] || 0 }), {}),
      costValues: relevantCosts.reduce((acc: any, cost: any) => ({ ...acc, [cost.id]: cost.values[scenario.id] || 0 }), {})
    });
  };

  const handleSave = () => {
    onUpdate(editingScenario.id, editForm);
    setEditingScenario(null);
  };

  const handleAddSpecific = () => {
    if (!newSpecificCost.label || !newSpecificCost.value) return;
    onAddSpecificCost(newSpecificCost, editingScenario.id);
    setNewSpecificCost({ label: '', value: '' });
    setShowAddCost(false);
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold">Scénarios de vente</h3>
          <p className="text-sm text-gray-500 mt-1">Hypothèses de revente et coûts</p>
        </div>
        <button 
          onClick={onAddScenario}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
        >
          <Plus className="w-4 h-4" />
          Nouveau scénario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((s: any) => {
          const { caTotal, margin, profitability } = calculateTotals(s.id);
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
                  <span className="text-xs text-gray-400 font-medium">CA Estimé</span>
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
              </div>
              
              {s.isDefault && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black text-white text-[8px] font-bold uppercase tracking-widest rounded-full">
                  Actif
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={!!editingScenario} onOpenChange={() => setEditingScenario(null)}>
        <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 pb-4 bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <Calculator className="text-white w-5 h-5" />
              </div>
              <DialogTitle className="text-2xl font-black">Configuration du scénario</DialogTitle>
            </div>
            <p className="text-sm text-gray-500">Ajustez les prix de revente et les coûts pour cette simulation.</p>
          </DialogHeader>
          
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-8 py-6 space-y-10">
              {/* Infos Générales */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-400">Nom du scénario</Label>
                  <Input 
                    className="rounded-xl border-gray-100 focus:ring-black"
                    value={editForm?.metadata.name} 
                    onChange={e => setEditForm({...editForm, metadata: {...editForm.metadata, name: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-400">Durée portage (mois)</Label>
                  <Input 
                    type="number"
                    className="rounded-xl border-gray-100 focus:ring-black"
                    value={editForm?.metadata.duration} 
                    onChange={e => setEditForm({...editForm, metadata: {...editForm.metadata, duration: Number(e.target.value)}})}
                  />
                </div>
              </div>

              {/* Prix des Lots */}
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-black mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-black rounded-full" />
                  Prix de revente par lot
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lots.map((lot: any) => (
                    <div key={lot.id} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{lot.name}</span>
                        <span className="text-[10px] text-gray-400">{lot.surface} m²</span>
                      </div>
                      <div className="relative w-28">
                        <Input 
                          type="number"
                          className="pr-7 h-9 text-sm font-bold rounded-lg border-gray-200"
                          value={editForm?.lotPrices[lot.id]} 
                          onChange={e => setEditForm({...editForm, lotPrices: {...editForm.lotPrices, [lot.id]: Number(e.target.value)}})}
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">€</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Structure des Coûts */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-black rounded-full" />
                    Structure des coûts
                  </h4>
                  <button 
                    onClick={() => setShowAddCost(!showAddCost)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    Coût spécifique
                  </button>
                </div>

                {showAddCost && (
                  <div className="mb-6 p-5 bg-blue-50/50 rounded-2xl space-y-4 border border-blue-100 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-blue-600">Libellé</Label>
                        <Input 
                          placeholder="ex: Aléa technique" 
                          value={newSpecificCost.label}
                          onChange={e => setNewSpecificCost({...newSpecificCost, label: e.target.value})}
                          className="bg-white border-blue-100 h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-blue-600">Montant (€)</Label>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          value={newSpecificCost.value}
                          onChange={e => setNewSpecificCost({...newSpecificCost, value: e.target.value})}
                          className="bg-white border-blue-100 h-9 text-sm"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleAddSpecific}
                      className="w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                    >
                      Ajouter au scénario
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {costs.filter((c: any) => c.isGlobal || c.targetScenarioId === editingScenario?.id).map((cost: any) => (
                    <div key={cost.id} className="flex items-center justify-between gap-4 p-3 bg-white border border-gray-100 rounded-2xl hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          cost.isGlobal ? "bg-gray-200" : "bg-blue-400"
                        )} />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-700">{cost.label}</span>
                          <span className="text-[9px] text-gray-400 uppercase font-medium">{cost.category}</span>
                        </div>
                      </div>
                      <div className="relative w-28">
                        <Input 
                          type="number"
                          className="pr-7 h-9 text-sm font-bold rounded-lg border-gray-200"
                          value={editForm?.costValues[cost.id] ?? 0} 
                          onChange={e => setEditForm({...editForm, costValues: {...editForm.costValues, [cost.id]: Number(e.target.value)}})}
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">€</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100 shrink-0">
            <button 
              onClick={handleSave}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-xl shadow-black/20 hover:bg-gray-800 transition-all active:scale-[0.98]"
            >
              Valider les hypothèses
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesScenarios;