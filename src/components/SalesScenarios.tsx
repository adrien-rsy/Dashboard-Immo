"use client";

import React from 'react';
import { TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";

const scenarios = [
  {
    title: 'Pessimiste',
    icon: TrendingDown,
    price: '565 000 €',
    margin: '48 400 €',
    percent: '8.5%',
    duration: '18 mois',
    color: 'text-red-500',
    bg: 'bg-red-50'
  },
  {
    title: 'Réaliste',
    icon: Zap,
    price: '610 000 €',
    margin: '93 400 €',
    percent: '15.3%',
    duration: '14 mois',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    active: true
  },
  {
    title: 'Optimiste',
    icon: TrendingUp,
    price: '645 000 €',
    margin: '128 400 €',
    percent: '19.9%',
    duration: '12 mois',
    color: 'text-green-500',
    bg: 'bg-green-50'
  }
];

const SalesScenarios = () => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm h-full">
      <div className="mb-8">
        <h3 className="text-xl font-bold">Scénarios de vente</h3>
        <p className="text-sm text-gray-500 mt-1">Analyse comparative de rentabilité</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((s) => (
          <div 
            key={s.title} 
            className={cn(
              "p-6 rounded-3xl border-2 transition-all duration-300",
              s.active ? "border-black bg-gray-50/50 scale-[1.02]" : "border-gray-50 hover:border-gray-200"
            )}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={cn("p-2 rounded-xl", s.bg)}>
                <s.icon className={cn("w-5 h-5", s.color)} />
              </div>
              <span className="font-bold text-sm">{s.title}</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-medium">Prix de vente</span>
                <span className="text-sm font-bold">{s.price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-medium">Marge brute</span>
                <span className="text-sm font-bold text-gray-900">{s.margin}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-medium">Rentabilité</span>
                <span className={cn("text-sm font-bold", s.color)}>{s.percent}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Portage</span>
                <span className="text-xs font-bold text-gray-600">{s.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesScenarios;