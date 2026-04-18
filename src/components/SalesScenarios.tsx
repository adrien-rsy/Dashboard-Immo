"use client";

import React, { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Zap, Pencil, MoreVertical, Plus, Check, Calculator, Layers, Trash2, Wallet, Percent, Settings2, Clock } from 'lucide-react';
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

const formatEuro = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

const GROUP_COLORS = ['#417078', '#c09068'];

const SalesScenarios = ({ scenarios, lots, costs, onUpdate, onDeleteScenario, onSetDefault, onAddScenario, onAddSpecificCost, calculateTotals }: any) => {
  const [editingScenario, setEditingScenario] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [showAddCost, setShowAddCost] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newSpecificCost, setNewSpecificCost] = useState({ label: '', value: '' });
  const [newGroup, setNewGroup] = useState({ lotIds: [] as number[], price: '' });
  
  const [innerEditingCost, setInnerEditingCost] = useState<any>(null);

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
      metadata: { 
        name: scenario.name, 
        duration: scenario.duration,
        apport: scenario.apport || 0,
        interestRate: scenario.interestRate || 0,
        agenceRate: scenario.agenceRate || 5,
        isNotaireReduced: scenario.isNotaireReduced || false
      },
      lotPrices: lots.reduce((acc: any, lot: any) => ({ ...acc, [lot.id]: lot.prices[scenario.id] || 0 }), {}),
      costValues: relevantCosts.reduce((acc: any, cost: any) => ({ ...acc, [cost.id]: cost.values[scenario.id] || 0 }), {}),
      groupedSales: scenario.groupedSales || []
    });
  };

  const handleSave = () => {
    onUpdate(editingScenario.id, editForm);
    setEditingScenario(null);
    setEditForm(null);
  };

  const handleAddSpecific = () => {
    if (!newSpecificCost.label || !newSpecificCost.value) return;
    onAddSpecificCost(newSpecificCost, editingScenario.id);
    setNewSpecificCost({ label: '', value: '' });
    setShowAddCost(false);
  };

  const handleCreateGroup = () => {
    if (newGroup.lotIds.length < 2 || !newGroup.price) return;
    const group = {
      id: `group_${Date.now()}`,
      lotIds: newGroup.lotIds,
      price: Number(newGroup.price)
    };
    setEditForm({
      ...editForm,
      groupedSales: [...editForm.groupedSales, group]
    });
    setNewGroup({ lotIds: [], price: '' });
    setShowAddGroup(false);
  };

  const removeGroup = (groupId: string) => {
    setEditForm({
      ...editForm,
      groupedSales: editForm.groupedSales.filter((g: any) => g.id !== groupId)
    });
  };

  const groupedLotIds = new Set(editForm?.groupedSales?.flatMap((g: any) => g.lotIds) || []);

  const handleInnerCostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    if (innerEditingCost.type === 'finance') {
      setEditForm({
        ...editForm,
        metadata: { 
          ...editForm.metadata, 
          apport: innerEditingCost.apport, 
          interestRate: innerEditingCost.interestRate,
          duration: innerEditingCost.duration
        }
      });
    } else if (innerEditingCost.type === 'agence') {
      setEditForm({
        ...editForm,
        metadata: { ...editForm.metadata, agenceRate: innerEditingCost.agenceRate }
      });
    } else if (innerEditingCost.type === 'notaire') {
      setEditForm({
        ...editForm,
        metadata: { ...editForm.metadata, isNotaireReduced: innerEditingCost.isNotaireReduced }
      });
    } else {
      setEditForm({
        ...editForm,
        costValues: { ...editForm.costValues, [innerEditingCost.id]: innerEditingCost.currentValue }
      });
    }
    setInnerEditingCost(null);
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
          const isPositive = profitability >= 0;
          
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
                      <DropdownMenuItem 
                        className="text-red-600 cursor-pointer"
                        onClick={() => onDeleteScenario(s.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
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
                  <span className="text-xs text-gray-400 font-medium">Marge brute (%)</span>
                  <span className={cn(
                    "text-sm font-bold",
                    isPositive ? "text-green-500" : "text-red-500"
                  )}>
                    {isPositive ? '+' : ''}{profitability.toFixed(1)}%
                  </span>
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

      <Dialog open={!!editingScenario} onOpenChange={(open) => { if(!open) { setEditingScenario(null); setEditForm(null); } }}>
        <DialogContent className="sm:max-w-[850px] rounded-[2.5rem] h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
          {editForm ? (
            <>
              <DialogHeader className="p-8 pb-4 bg-gray-50/50 shrink-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                    <Calculator className="text-white w-5 h-5" />
                  </div>
                  <DialogTitle className="text-2xl font-black">Configuration du scénario</DialogTitle>
                </div>
                <p className="text-sm text-gray-500">Ajustez les prix de revente, les coûts et les paramètres financiers.</p>
              </DialogHeader>
              
              <ScrollArea className="flex-1 min-h-0">
                <div className="px-8 py-6 space-y-10">
                  {/* Infos Générales */}
                  <div className="max-w-md">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-gray-400">Nom du scénario</Label>
                      <Input 
                        className="rounded-xl border-gray-100 focus:ring-black"
                        value={editForm.metadata.name} 
                        onChange={e => setEditForm({...editForm, metadata: {...editForm.metadata, name: e.target.value}})}
                      />
                    </div>
                  </div>

                  {/* Groupes de Vente - Conditionnel */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-black rounded-full" />
                        Groupes de vente
                      </h4>
                      <button 
                        onClick={() => setShowAddGroup(!showAddGroup)}
                        className="flex items-center gap-1 text-[10px] font-bold uppercase text-black hover:bg-gray-50 px-2 py-1 rounded-lg transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        Vente groupée
                      </button>
                    </div>

                    {showAddGroup && (
                      <div className="mb-6 p-5 bg-gray-50/50 rounded-2xl space-y-4 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-gray-400">Sélectionner les lots à grouper</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {lots.filter(l => !groupedLotIds.has(l.id)).map(lot => (
                              <div key={lot.id} className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-100">
                                <Checkbox 
                                  id={`group-lot-${lot.id}`}
                                  checked={newGroup.lotIds.includes(lot.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) setNewGroup({...newGroup, lotIds: [...newGroup.lotIds, lot.id]});
                                    else setNewGroup({...newGroup, lotIds: newGroup.lotIds.filter(id => id !== lot.id)});
                                  }}
                                />
                                <label htmlFor={`group-lot-${lot.id}`} className="text-xs font-medium cursor-pointer">{lot.name}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase text-gray-400">Prix global du groupe (€)</Label>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            value={newGroup.price}
                            onChange={e => setNewGroup({...newGroup, price: e.target.value})}
                            className="bg-white border-gray-100 h-9 text-sm"
                          />
                        </div>
                        <button 
                          onClick={handleCreateGroup}
                          disabled={newGroup.lotIds.length < 2 || !newGroup.price}
                          className="w-full py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all shadow-md disabled:opacity-50"
                        >
                          Créer le groupe de vente
                        </button>
                      </div>
                    )}

                    {editForm.groupedSales?.length > 0 && (
                      <div className="space-y-2">
                        {editForm.groupedSales.map((group: any, index: number) => {
                          const groupColor = GROUP_COLORS[index] || GROUP_COLORS[0];
                          return (
                            <div 
                              key={group.id} 
                              className="flex items-center justify-between gap-4 p-4 bg-white border rounded-2xl"
                              style={{ borderColor: `${groupColor}20`, backgroundColor: `${groupColor}05` }}
                            >
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: `${groupColor}20` }}
                                >
                                  <Layers className="w-4 h-4" style={{ color: groupColor }} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold" style={{ color: groupColor }}>
                                    Groupe : {group.lotIds.map(id => lots.find(l => l.id === id)?.name).join(', ')}
                                  </span>
                                  <span className="text-[9px] uppercase font-bold opacity-60" style={{ color: groupColor }}>Vente groupée</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="relative w-28">
                                  <Input 
                                    type="number"
                                    className="pr-7 h-9 text-sm font-bold rounded-lg bg-white"
                                    style={{ borderColor: `${groupColor}40` }}
                                    value={group.price} 
                                    onChange={e => {
                                      const updatedGroups = editForm.groupedSales.map((g: any) => 
                                        g.id === group.id ? { ...g, price: Number(e.target.value) } : g
                                      );
                                      setEditForm({ ...editForm, groupedSales: updatedGroups });
                                    }}
                                  />
                                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-60" style={{ color: groupColor }}>€</span>
                                </div>
                                <button onClick={() => removeGroup(group.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Prix des Lots Individuels */}
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-black mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-black rounded-full" />
                      Ventes individuelles
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {lots.filter(l => !groupedLotIds.has(l.id)).map((lot: any) => (
                        <div key={lot.id} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">{lot.name}</span>
                            <span className="text-[10px] text-gray-400">{lot.surface} m²</span>
                          </div>
                          <div className="relative w-28">
                            <Input 
                              type="number"
                              className="pr-7 h-9 text-sm font-bold rounded-lg border-gray-200"
                              value={editForm.lotPrices[lot.id]} 
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
                      {costs.filter((c: any) => c.isGlobal || c.targetScenarioId === editingScenario?.id).map((cost: any) => {
                        let displayValue = editForm.costValues[cost.id] ?? 0;
                        if (cost.type === 'notaire') displayValue = Math.round((editForm.costValues['acq'] || 0) * (editForm.metadata?.isNotaireReduced ? 0.03 : 0.08));
                        if (cost.type === 'agence') displayValue = Math.round((editForm.costValues['acq'] || 0) * ((editForm.metadata?.agenceRate || 0) / 100));
                        if (cost.type === 'finance') {
                          const acq = editForm.costValues['acq'] || 0;
                          const travaux = editForm.costValues['travaux'] || 0;
                          const others = Object.entries(editForm.costValues || {}).filter(([id]) => !['acq', 'travaux', 'notaire', 'agence', 'finance'].includes(id)).reduce((acc, [_, v]) => acc + (v as number), 0);
                          const notaire = Math.round(acq * (editForm.metadata?.isNotaireReduced ? 0.03 : 0.08));
                          const agence = Math.round(acq * ((editForm.metadata?.agenceRate || 0) / 100));
                          const totalExclFinance = acq + travaux + others + notaire + agence;
                          const financed = Math.max(0, totalExclFinance - (editForm.metadata?.apport || 0));
                          displayValue = Math.round(financed * (editForm.metadata?.duration || 0) * ((editForm.metadata?.interestRate || 0) / 100 / 12));
                        }

                        return (
                          <div 
                            key={cost.id} 
                            className="flex items-center justify-between gap-4 p-3 bg-white border border-gray-100 rounded-2xl hover:shadow-sm transition-all cursor-pointer group"
                            onClick={() => {
                              if (cost.type === 'finance') {
                                setInnerEditingCost({ ...cost, apport: editForm.metadata.apport, interestRate: editForm.metadata.interestRate, duration: editForm.metadata.duration });
                              } else if (cost.type === 'agence') {
                                setInnerEditingCost({ ...cost, agenceRate: editForm.metadata.agenceRate });
                              } else if (cost.type === 'notaire') {
                                setInnerEditingCost({ ...cost, isNotaireReduced: editForm.metadata.isNotaireReduced });
                              } else {
                                setInnerEditingCost({ ...cost, currentValue: editForm.costValues[cost.id] || 0 });
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                cost.isGlobal ? "bg-gray-200" : "bg-blue-400"
                              )} />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-700 group-hover:text-black transition-colors">{cost.label}</span>
                                <div className="flex items-center gap-2">
                                  {cost.type === 'notaire' && <span className="text-[8px] text-gray-400 font-bold uppercase">{editForm.metadata.isNotaireReduced ? 'Frais réduits (3%)' : 'Standard (8%)'}</span>}
                                  {cost.type === 'agence' && <span className="text-[8px] text-gray-400 font-bold uppercase">Taux : {editForm.metadata.agenceRate}%</span>}
                                  {cost.type === 'finance' && <span className="text-[8px] text-gray-400 font-bold uppercase">{editForm.metadata.interestRate}% sur {editForm.metadata.duration} mois</span>}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{formatEuro(displayValue)}</span>
                          </div>
                        );
                      })}
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
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 animate-pulse">Chargement du scénario...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Inner Cost Edit Dialog (Sub-dialog) */}
      <Dialog open={!!innerEditingCost} onOpenChange={(open) => !open && setInnerEditingCost(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] z-[100]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {innerEditingCost?.type === 'finance' ? <Calculator className="w-5 h-5" /> : <Settings2 className="w-5 h-5" />}
              {innerEditingCost?.label}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInnerCostUpdate} className="space-y-6 py-4">
            {innerEditingCost?.type === 'finance' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Clock className="w-3 h-3" /> Durée de portage (mois)</Label>
                  <Input type="number" value={innerEditingCost.duration} onChange={e => setInnerEditingCost({...innerEditingCost, duration: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Wallet className="w-3 h-3" /> Apport personnel (€)</Label>
                  <Input type="number" value={innerEditingCost.apport} onChange={e => setInnerEditingCost({...innerEditingCost, apport: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Percent className="w-3 h-3" /> Taux annuel d'emprunt (%)</Label>
                  <Input type="number" step="0.1" value={innerEditingCost.interestRate} onChange={e => setInnerEditingCost({...innerEditingCost, interestRate: Number(e.target.value)})} />
                </div>
              </div>
            ) : innerEditingCost?.type === 'agence' ? (
              <div className="space-y-4">
                <Label>Taux d'agence (%)</Label>
                <Input type="number" value={innerEditingCost.agenceRate} onChange={e => setInnerEditingCost({...innerEditingCost, agenceRate: Number(e.target.value)})} />
              </div>
            ) : innerEditingCost?.type === 'notaire' ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="space-y-0.5">
                  <Label>Frais réduits</Label>
                  <p className="text-[10px] text-gray-500">Appliquer 3% au lieu de 8%</p>
                </div>
                <Switch checked={innerEditingCost.isNotaireReduced} onCheckedChange={checked => setInnerEditingCost({...innerEditingCost, isNotaireReduced: checked})} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Montant (€)</Label>
                  <Input type="number" value={innerEditingCost?.currentValue || 0} onChange={e => setInnerEditingCost({...innerEditingCost, currentValue: Number(e.target.value)})} />
                </div>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              {!['notaire', 'agence', 'finance', 'acquisition'].includes(innerEditingCost?.type) && (
                <button 
                  type="button"
                  onClick={() => {
                    setEditForm({
                      ...editForm,
                      costValues: Object.fromEntries(Object.entries(editForm.costValues).filter(([id]) => id !== innerEditingCost.id))
                    });
                    setInnerEditingCost(null);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              )}
              <button type="submit" className="flex-1 py-3 bg-black text-white rounded-xl font-bold">Mettre à jour</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesScenarios;