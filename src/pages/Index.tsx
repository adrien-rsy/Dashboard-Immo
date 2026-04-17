"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ProjectKPIs from '@/components/ProjectKPIs';
import LotsTable from '@/components/LotsTable';
import SalesScenarios from '@/components/SalesScenarios';
import CostBreakdown from '@/components/CostBreakdown';
import { MapPin, Calendar, Share2, Download } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const INITIAL_LOTS = [
  { id: 1, name: 'Lot 01', type: 'Appartement', level: '1er étage', surface: '42 m²', status: 'Disponible', price: 168000, notes: 'T2 avec balcon' },
  { id: 2, name: 'Lot 02', type: 'Appartement', level: '2e étage', surface: '38 m²', status: 'Optionné', price: 154000, notes: 'T2 traversant' },
  { id: 3, name: 'Lot 03', type: 'Combles', level: '3e étage', surface: '30 m²', status: 'Disponible', price: 96000, notes: 'À aménager' },
  { id: 4, name: 'Lot 04', type: 'Local Pro', level: 'RDC', surface: '28 m²', status: 'Vendu', price: 115000, notes: 'Vitrine rue' },
];

const INITIAL_COSTS = [
  { id: 1, label: "Prix d'acquisition vendeur", value: 320000, category: "Achat" },
  { id: 2, label: "Frais de notaire (estimés)", value: 25600, category: "Achat" },
  { id: 3, label: "Frais d'agence", value: 18000, category: "Achat" },
  { id: 4, label: "Travaux de rénovation", value: 140000, category: "Travaux" },
  { id: 5, label: "Frais administratifs & divers", value: 12000, category: "Gestion" },
  { id: 6, label: "Honoraires (Architecte, Géomètre)", value: 8500, category: "Gestion" },
  { id: 7, label: "Frais financiers (Intérêts)", value: 15000, category: "Finance" },
  { id: 8, label: "Imprévus (5%)", value: 7500, category: "Sécurité" },
];

const Index = () => {
  const [lots, setLots] = useState(() => {
    const saved = localStorage.getItem('immo_lots');
    return saved ? JSON.parse(saved) : INITIAL_LOTS;
  });

  const [costs, setCosts] = useState(() => {
    const saved = localStorage.getItem('immo_costs');
    return saved ? JSON.parse(saved) : INITIAL_COSTS;
  });

  useEffect(() => {
    localStorage.setItem('immo_lots', JSON.stringify(lots));
    localStorage.setItem('immo_costs', JSON.stringify(costs));
  }, [lots, costs]);

  const totals = useMemo(() => {
    const caTotal = lots.reduce((acc, lot) => acc + lot.price, 0);
    const costTotal = costs.reduce((acc, cost) => acc + cost.value, 0);
    const margin = caTotal - costTotal;
    const profitability = caTotal > 0 ? (margin / caTotal) * 100 : 0;

    return { caTotal, costTotal, margin, profitability };
  }, [lots, costs]);

  const handleAddLot = (newLot) => {
    setLots([...lots, { ...newLot, id: Date.now() }]);
    showSuccess("Lot ajouté avec succès");
  };

  const handleDeleteLot = (id) => {
    setLots(lots.filter(l => l.id !== id));
    showSuccess("Lot supprimé");
  };

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-gray-900 font-sans selection:bg-black selection:text-white">
      <Sidebar className="hidden lg:flex border-r border-gray-100" />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <div className="flex-1 overflow-y-auto px-4 md:px-10 pb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 mt-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                  En cours
                </span>
                <span className="text-xs text-gray-400 font-medium">Réf: OP-2024-082</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-3">Immeuble "Le Renaissance"</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>12 Rue de la République, 69002 Lyon</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Début : Septembre 2024</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-600">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-600">
                <Download className="w-5 h-5" />
              </button>
              <button className="px-6 py-3 bg-black text-white rounded-2xl font-bold shadow-lg shadow-black/10 hover:bg-gray-800 transition-all">
                Éditer l'opération
              </button>
            </div>
          </div>

          <ProjectKPIs totals={totals} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            <div className="xl:col-span-2 space-y-8">
              <LotsTable lots={lots} onAdd={handleAddLot} onDelete={handleDeleteLot} />
              <SalesScenarios caBase={totals.caTotal} costTotal={totals.costTotal} />
            </div>
            <div className="xl:col-span-1">
              <CostBreakdown costs={costs} total={totals.costTotal} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;