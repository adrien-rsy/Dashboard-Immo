"use client";

import React from 'react';
import { PieChart, ArrowRight } from 'lucide-react';

const costs = [
  { label: "Prix d'acquisition vendeur", value: "320 000 €", category: "Achat" },
  { label: "Frais de notaire (estimés)", value: "25 600 €", category: "Achat" },
  { label: "Frais d'agence", value: "18 000 €", category: "Achat" },
  { label: "Travaux de rénovation", value: "140 000 €", category: "Travaux" },
  { label: "Frais administratifs & divers", value: "12 000 €", category: "Gestion" },
  { label: "Honoraires (Architecte, Géomètre)", value: "8 500 €", category: "Gestion" },
  { label: "Frais financiers (Intérêts)", value: "15 000 €", category: "Finance" },
  { label: "Imprévus (5%)", value: "7 500 €", category: "Sécurité" },
];

const CostBreakdown = () => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold">Structure des coûts</h3>
          <p className="text-sm text-gray-500 mt-1">Détail des dépenses engagées</p>
        </div>
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
          <PieChart className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      <div className="space-y-4">
        {costs.map((cost, idx) => (
          <div key={idx} className="flex items-center justify-between group cursor-default">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-black transition-colors" />
              <span className="text-sm text-gray-600 group-hover:text-black transition-colors">{cost.label}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{cost.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Général</p>
            <p className="text-2xl font-black text-black">516 600 €</p>
          </div>
          <button className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
            <ArrowRight className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CostBreakdown;