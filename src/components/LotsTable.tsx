"use client";

import React from 'react';
import { Plus, MoreHorizontal, Home, Layers, Maximize } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const lots = [
  { id: 1, name: 'Lot 01', type: 'Appartement', level: '1er étage', surface: '42 m²', status: 'Disponible', price: '168 000 €', notes: 'T2 avec balcon' },
  { id: 2, name: 'Lot 02', type: 'Appartement', level: '2e étage', surface: '38 m²', status: 'Optionné', price: '154 000 €', notes: 'T2 traversant' },
  { id: 3, name: 'Lot 03', type: 'Combles', level: '3e étage', surface: '30 m²', status: 'Disponible', price: '96 000 €', notes: 'À aménager' },
  { id: 4, name: 'Lot 04', type: 'Local Pro', level: 'RDC', surface: '28 m²', status: 'Vendu', price: '115 000 €', notes: 'Vitrine rue' },
];

const LotsTable = () => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
      <div className="p-8 flex items-center justify-between border-b border-gray-50">
        <div>
          <h3 className="text-xl font-bold">Détail des lots</h3>
          <p className="text-sm text-gray-500 mt-1">Inventaire des unités de l'opération</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
          <Plus className="w-4 h-4" />
          Ajouter un lot
        </button>
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
                  <span className="text-sm font-bold text-gray-900">{lot.price}</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </button>
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