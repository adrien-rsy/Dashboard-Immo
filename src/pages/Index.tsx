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

const INITIAL_SCENARIOS = [
  { id: 'pessimistic', name: 'Pessimiste', icon: 'TrendingDown', isDefault: false, duration: 18 },
  { id: 'realistic', name: 'Réaliste', icon: 'Zap', isDefault: true, duration: 14 },
  { id: 'optimistic', name: 'Optimiste', icon: 'TrendingUp', isDefault: false, duration: 12 },
];

const INITIAL_LOTS = [
  { id: 1, name: 'Lot 01', type: 'Appartement', level: '1er étage', surface: '42 m²', status: 'Disponible', notes: 'T2 avec balcon', prices: { pessimistic: 155000, realistic: 168000, optimistic: 175000 } },
  { id: 2, name: 'Lot 02', type: 'Appartement', level: '2e étage', surface: '38 m²', status: 'Optionné', notes: 'T2 traversant', prices: { pessimistic: 145000, realistic: 154000, optimistic: 162000 } },
  { id: 3, name: 'Lot 03', type: 'Combles', level: '3e étage', surface: '30 m²', status: 'Disponible', notes: 'À aménager', prices: { pessimistic: 85000, realistic: 96000, optimistic: 105000 } },
  { id: 4, name: 'Lot 04', type: 'Local Pro', level: 'RDC', surface: '28 m²', status: 'Vendu', notes: 'Vitrine rue', prices: { pessimistic: 105000, realistic: 115000, optimistic: 125000 } },
];

const INITIAL_COSTS = [
  { id: 1, label: "Prix d'acquisition vendeur", category: "Achat", isGlobal: true, values: { pessimistic: 320000, realistic: 320000, optimistic: 320000 } },
  { id: 2, label: "Frais de notaire (estimés)", category: "Achat", isGlobal: true, values: { pessimistic: 25600, realistic: 25600, optimistic: 25600 } },
  { id: 3, label: "Frais d'agence", category: "Achat", isGlobal: true, values: { pessimistic: 18000, realistic: 18000, optimistic: 18000 } },
  { id: 4, label: "Travaux de rénovation", category: "Travaux", isGlobal: true, values: { pessimistic: 160000, realistic: 140000, optimistic: 130000 } },
  { id: 5, label: "Frais administratifs & divers", category: "Gestion", isGlobal: true, values: { pessimistic: 15000, realistic: 12000, optimistic: 10000 } },
  { id: 6, label: "Honoraires (Architecte, Géomètre)", category: "Gestion", isGlobal: true, values: { pessimistic: 8500, realistic: 8500, optimistic: 8500 } },
  { id: 7, label: "Frais financiers (Intérêts)", category: "Finance", isGlobal: true, values: { pessimistic: 20000, realistic: 15000, optimistic: 12000 } },
  { id: 8, label: "Imprévus (5%)", category: "Sécurité", isGlobal: true, values: { pessimistic: 10000, realistic: 7500, optimistic: 5000 } },
];

const Index = () => {
  const [scenarios, setScenarios] = useState(() => {
    const saved = localStorage.getItem('immo_scenarios_v3');
    return saved ? JSON.parse(saved) : INITIAL_SCENARIOS;
  });

  const [lots, setLots] = useState(() => {
    const saved = localStorage.getItem('immo_lots_v3');
    return saved ? JSON.parse(saved) : INITIAL_LOTS;
  });

  const [costs, setCosts] = useState(() => {
    const saved = localStorage.getItem('immo_costs_v3');
    return saved ? JSON.parse(saved) : INITIAL_COSTS;
  });

  useEffect(() => {
    localStorage.setItem('immo_scenarios_v3', JSON.stringify(scenarios));
    localStorage.setItem('immo_lots_v3', JSON.stringify(lots));
    localStorage.setItem('immo_costs_v3', JSON.stringify(costs));
  }, [scenarios, lots, costs]);

  const defaultScenario = useMemo(() => scenarios.find(s => s.isDefault) || scenarios[0], [scenarios]);

  const calculateTotals = (scenarioId: string) => {
    const caTotal = lots.reduce((acc, lot) => acc + (lot.prices[scenarioId] || 0), 0);
    // Filter costs: global ones + specific ones for this scenario
    const relevantCosts = costs.filter(c => c.isGlobal || c.targetScenarioId === scenarioId);
    const costTotal = relevantCosts.reduce((acc, cost) => acc + (cost.values[scenarioId] || 0), 0);
    const margin = caTotal - costTotal;
    const profitability = costTotal > 0 ? (margin / costTotal) * 100 : 0;
    return { caTotal, costTotal, margin, profitability };
  };

  const totals = useMemo(() => calculateTotals(defaultScenario.id), [defaultScenario, lots, costs]);

  const handleAddLot = (newLotData) => {
    const newLot = {
      ...newLotData,
      id: Date.now(),
      prices: scenarios.reduce((acc, s) => ({ ...acc, [s.id]: Number(newLotData.price) }), {})
    };
    setLots([...lots, newLot]);
    showSuccess("Lot ajouté");
  };

  const handleAddCost = (newCostData, scenarioId?: string) => {
    const newCost = {
      id: Date.now(),
      label: newCostData.label,
      category: newCostData.category || "Divers",
      isGlobal: !scenarioId,
      targetScenarioId: scenarioId,
      values: scenarioId 
        ? { [scenarioId]: Number(newCostData.value) }
        : scenarios.reduce((acc, s) => ({ ...acc, [s.id]: Number(newCostData.value) }), {})
    };
    setCosts([...costs, newCost]);
    showSuccess(scenarioId ? "Coût spécifique ajouté" : "Poste de coût global ajouté");
  };

  const handleDeleteCost = (id: number) => {
    setCosts(costs.filter(c => c.id !== id));
    showSuccess("Poste de coût supprimé");
  };

  const handleUpdateScenario = (scenarioId: string, updatedData: any) => {
    setScenarios(scenarios.map(s => s.id === scenarioId ? { ...s, ...updatedData.metadata } : s));
    
    if (updatedData.lotPrices) {
      setLots(lots.map(lot => ({
        ...lot,
        prices: { ...lot.prices, [scenarioId]: updatedData.lotPrices[lot.id] }
      })));
    }

    if (updatedData.costValues) {
      setCosts(costs.map(cost => ({
        ...cost,
        values: { ...cost.values, [scenarioId]: updatedData.costValues[cost.id] }
      })));
    }
    
    showSuccess("Scénario mis à jour");
  };

  const handleSetDefaultScenario = (id: string) => {
    setScenarios(scenarios.map(s => ({ ...s, isDefault: s.id === id })));
    showSuccess(`Scénario "${scenarios.find(s => s.id === id)?.name}" défini par défaut`);
  };

  const handleAddScenario = () => {
    const id = `scenario_${Date.now()}`;
    const newScenario = { id, name: 'Nouveau Scénario', icon: 'Zap', isDefault: false, duration: 12 };
    setScenarios([...scenarios, newScenario]);
    
    setLots(lots.map(lot => ({ ...lot, prices: { ...lot.prices, [id]: lot.prices[defaultScenario.id] } })));
    // Only copy global costs to the new scenario
    setCosts(costs.map(cost => cost.isGlobal ? { ...cost, values: { ...cost.values, [id]: cost.values[defaultScenario.id] } } : cost));
    
    showSuccess("Nouveau scénario créé");
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
                  {defaultScenario.name}
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
                  <span>Portage : {defaultScenario.duration} mois</span>
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
              <LotsTable 
                lots={lots} 
                scenarios={scenarios} 
                onAdd={handleAddLot} 
                onDelete={(id) => setLots(lots.filter(l => l.id !== id))} 
              />
              <SalesScenarios 
                scenarios={scenarios}
                lots={lots}
                costs={costs}
                onUpdate={handleUpdateScenario}
                onSetDefault={handleSetDefaultScenario}
                onAddScenario={handleAddScenario}
                onAddSpecificCost={handleAddCost}
                calculateTotals={calculateTotals}
              />
            </div>
            <div className="xl:col-span-1">
              <CostBreakdown 
                costs={costs} 
                scenarioId={defaultScenario.id} 
                onAdd={handleAddCost}
                onDelete={handleDeleteCost}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;