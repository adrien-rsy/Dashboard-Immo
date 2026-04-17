"use client";

import React, { useState } from 'react';
import { Plus, MoreHorizontal, Home, Maximize, Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
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

const LotsTable = ({ lots, onAdd, onDelete }: { lots: any[], onAdd: (lot: any) => void, onDelete: (id: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newLot, setNewLot] = useState({
    name: '',
    type: 'Appartement',
    level: '',
    surface: '',
    status: 'Disponible',
    price: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...newLot,
      price: Number(newLot.price),
      surface: `${newLot.surface} m²`
    });
    setIsOpen(false);
    setNewLot({ name: '', type: 'Appartement', level: '', surface: '', status: 'Disponible', price: '', notes: '' });
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
      <div className="p-8 flex items-center justify-between border-b border-gray-50">
        <div>
          <h3 className="text-xl font-bold">Détail des lots</h3>
          <p className="text-sm text-gray-500 mt-1">Inventaire des unités de l'opération</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du lot</Label>
                  <Input id="name" placeholder="ex: Lot 05" value={newLot.name} onChange={e => setNewLot({...newLot, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input id="type" placeholder="ex: T3" value={newLot.type} onChange={e => setNewLot({...newLot, type: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="surface">Surface (m²)</Label>
                  <Input id="surface" type="number" placeholder="45" value={newLot.surface} onChange={e => setNewLot({...newLot, surface: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Prix estimé (€)</Label>
                  <Input id="price" type="number" placeholder="150000" value={newLot.price} onChange={e => setNewLot({...newLot, price: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Niveau / Étage</Label>
                <Input id="level" placeholder="ex: 1er étage" value={newLot.level} onChange={e => setNewLot({...newLot, level: e.target.value})} />
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
              <th className="px-8 py-5">Type & Niveau</th>
              <th className="px-8 py-5">Surface</th>
              <th className="px-8 py-5">Statut</th>
              <th className="px-8 py-5">Prix Estimé</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {lots.map((lot) => (
              <tr key={lot.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                      <Home className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{lot.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{lot.notes}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">{lot.type}</span>
                    <span className="text-xs text-gray-400">{lot.level}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Maximize className="w-3 h-3 text-gray-400" />
                    {lot.surface}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <Badge variant="outline" className={cn(
                    "rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-none",
                    lot.status === 'Disponible' ? "bg-green-50 text-green-600" : 
                    lot.status === 'Optionné' ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"
                  )}>
                    {lot.status}
                  </Badge>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-bold text-gray-900">{formatEuro(lot.price)}</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => onDelete(lot.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LotsTable;