"use client";

import React from 'react';
import { PieChart } from 'lucide-react';
import { cn } from "@/lib/utils";

const formatEuro = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

const CostBreakdown = ({ costs, scenario }: any) => {
  const total = costs.reduce((acc: number, cost: any) => acc + (cost.values[scenario.id] || 0), 0);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold">Structure des coûts</h3>
          <p className="text-sm text-gray-500 mt-1">Vue du scénario : <span className="font-bold text-black">{scenario.name}</span></p>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {costs.map((cost: any) => (
          <div 
            key={cost.id} 
            className="flex items-center justify-between -mx-4 px-4 py-3 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                cost.isGlobal ? "bg-gray-200" : "bg-blue-400"
              )} />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-700">{cost.label}</span>
                <div className="flex items-center gap-2">
                  {cost.type === 'notaire' && <span className="text-[9px] text-gray-400 font-bold uppercase">{scenario.isNotaireReduced ? 'Frais réduits (3%)' : 'Standard (8%)'}</span>}
                  {cost.type === 'agence' && <span className="text-[9px] text-gray-400 font-bold uppercase">Taux : {scenario.agenceRate}%</span>}
                  {cost.type === 'finance' && <span className="text-[9px] text-gray-400 font-bold uppercase">{scenario.interestRate}% sur {scenario.duration} mois</span>}
                </div>
              </div>
            </div>
            <span className="text-sm font-bold text-gray-900">{formatEuro(cost.values[scenario.id] || 0)}</span>
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