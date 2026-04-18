"use client";

import React, { useState } from 'react';
import { Plus, MoreHorizontal, Home, Maximize, Trash2, Pencil, Layers } from 'lucide-react';
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

const LotsTable = ({ lots, scenarios, activeScenarioId, onAdd, onUpdate, onDelete }: { lots: any[], scenarios: any[], activeScenarioId: string, onAdd: (lot: any) => void, onUpdate: (id: number, lot: any) => void, onDelete: (id: number) => void }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Appartement',
    level: '',
    surface: '',
    status: 'Disponible',
    price: '',
    notes: ''
  });

  const activeScenario = scenarios.find(s => s.id === activeScenarioId);
  const groupedLotIds = new Set(activeScenario?.groupedSales?.flatMap(g => g.lotIds) || []);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setIsAddOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(editingLot.id, formData);
    setEditingLot(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'Appartement', level: '', surface: '', status: 'Disponible', price: '', notes: '' });
  };

  const openEdit = (lot: any) => {
    setEditingLot(lot);
    setFormData({
      name: lot.name,
      type: lot.type,
      level: lot.level,
      surface: lot.surface,
      status: lot.status,
      price: lot.prices[activeScenarioId],
      notes: lot.notes || ''
    });
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
      <div className="p-8 flex items-center justify-between border-b border-gray-50">
        <div>
          <h3 className="text-xl font-bold">Détail des lots</h3>
          <p className="text-sm text-gray-500 mt-1">Prix estimés par scénario</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
              <Plus className="w-4 h-4" />
              Ajouter un lot
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
            <DialogHeader>
              <DialogTitle>Nouveau Lot</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du lot</Label>
                  <Input id="name" placeholder="ex: Lot 05" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input id="type" placeholder="ex: T3" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="surface">Surface (m²)</Label>
                  <Input id="surface" type="number" placeholder="45" value={formData.surface} onChange={e => setFormData({...formData, surface: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Prix de base (€)</Label>
                  <Input id="price" type="number" placeholder="150000" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Niveau / Étage</Label>
                <Input id="level" placeholder="ex: 1er étage" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} />
              </div>
              <DialogFooter>
                <button type="submit" className="w-full py-3 bg-black text-white rounded-xl font-bold">Enregistrer le lot</button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
              <th className="px-8 py-5">Lot</th>
              <th className="px-8 py-5">Surface</th>
              {scenarios.map(s => (
                <th key={s.id} className="px-8 py-5 text-center">{s.name}</th>
              ))}
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {lots.map((lot) => {
              const isGroupedInActive = groupedLotIds.has(lot.id);
              
              return (
                <tr key={lot.id} className={cn(
                  "group transition-colors",
                  isGroupedInActive ? "bg-purple-50/30 hover:bg-purple-50/50" : "hover:bg-gray-50/50"
                )}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        isGroupedInActive ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500 group-hover:bg-white"
                      )}>
                        {isGroupedInActive ? <Layers className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold">{lot.name}</p>
                          {isGroupedInActive && (
                            <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[8px] font-black uppercase rounded">Groupé</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">{lot.type} - {lot.level}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Maximize className="w-3 h-3 text-gray-400" />
                      {lot.surface} m²
                    </div>
                  </td>
                  {scenarios.map(s => {
                    const isLotGroupedInThisScenario = new Set(s.groupedSales?.flatMap(g => g.lotIds) || []).has(lot.id);
                    
                    return (
                      <td key={s.id} className="px-8 py-5 text-center">
                        <span className={cn(
                          "text-sm font-bold",
                          s.id === activeScenarioId ? "text-black" : "text-gray-400",
                          isLotGroupedInThisScenario && "text-purple-600 italic"
                        )}>
                          {isLotGroupedInThisScenario ? "Prix groupé" : formatEuro(lot.prices[s.id] || 0)}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-8 py-5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => openEdit(lot)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => onDelete(lot.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingLot} onOpenChange={(open) => !open && setEditingLot(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>Modifier le Lot : {editingLot?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom du lot</Label>
                <Input id="edit-name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Input id="edit-type" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-surface">Surface (m²)</Label>
                <Input id="edit-surface" type="number" value={formData.surface} onChange={e => setFormData({...formData, surface: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-level">Niveau / Étage</Label>
                <Input id="edit-level" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <button type="submit" className="w-full py-3 bg-black text-white rounded-xl font-bold">Mettre à jour le lot</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LotsTable;