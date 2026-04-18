"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ProjectKPIs from '@/components/ProjectKPIs';
import LotsTable from '@/components/LotsTable';
import SalesScenarios from '@/components/SalesScenarios';
import CostBreakdown from '@/components/CostBreakdown';
import { MapPin, Calendar, Share2, Download } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const INITIAL_SCENARIOS = [
  { id: 'pessimistic', name: 'Pessimiste', icon: 'TrendingDown', isDefault: false, duration: 18, groupedSales: [] },
  { id: 'realistic', name: 'Réaliste', icon: 'Zap', isDefault: true, duration: 14, groupedSales: [] },
  { id: 'optimistic', name: 'Optimiste', icon: 'TrendingUp', isDefault: false, duration: 12, groupedSales: [] },
];

const INITIAL_LOTS = [
  { id: 1, name: 'Lot 01', type: 'Appartement', level: '1er étage', surface: '42', status: 'Disponible', notes: 'T2 avec balcon', prices: { pessimistic: 155000, realistic: 168000, optimistic: 175000 } },
  { id: 2, name: 'Lot 02', type: 'Appartement', level: '2e étage', surface: '38', status: 'Optionné', notes: 'T2 traversant', prices: { pessimistic: 145000, realistic: 154000, optimistic: 162000 } },
];

const INITIAL_COSTS = [
  { id: 'acq', label: "Prix d'acquisition net vendeur", category: "Achat", isGlobal: true, type: 'acquisition', values: { pessimistic: 320000, realistic: 320000, optimistic: 320000 } },
  { id: 'notaire', label: "Frais de notaire", category: "Achat", isGlobal: true, type: 'notaire', isReduced: false, values: { pessimistic: 25600, realistic: 25600, optimistic: 25600 } },
  { id: 'agence', label: "Frais d'agence", category: "Achat", isGlobal: true, type: 'agence', percentage: 5, values: { pessimistic: 16000, realistic: 16000, optimistic: 16000 } },
  { id: 'travaux', label: "Travaux", category: "Travaux", isGlobal: true, values: { pessimistic: 160000, realistic: 140000, optimistic: 130000 } },
  { id: 'finance', label: "Frais financiers", category: "Finance", isGlobal: true, values: { pessimistic: 20000, realistic: 15000, optimistic: 12000 } },
];

const Index = () => {
  const [scenarios, setScenarios] = useState(() => {
    const saved = localStorage.getItem('immo_scenarios_v7');
    return saved ? JSON.parse(saved) : INITIAL_SCENARIOS;
  });

  const [lots, setLots] = useState(() => {
    const saved = localStorage.getItem('immo_lots_v7');
    return saved ? JSON.parse(saved) : INITIAL_LOTS;
  });

  const [costs, setCosts] = useState(() => {
    const saved = localStorage.getItem('immo_costs_v7');
    return saved ? JSON.parse(saved) : INITIAL_COSTS;
  });

  useEffect(() => {
    localStorage.setItem('immo_scenarios_v7', JSON.stringify(scenarios));
    localStorage.setItem('immo_lots_v7', JSON.stringify(lots));
    localStorage.setItem('immo_costs_v7', JSON.stringify(costs));
  }, [scenarios, lots, costs]);

  const defaultScenario = useMemo(() => scenarios.find(s => s.isDefault) || scenarios[0], [scenarios]);

  // Logic to sync Notaire and Agence costs when Acquisition changes
  const syncCalculatedCosts = (updatedCosts: any[]) => {
    const acqCost = updatedCosts.find(c => c.type === 'acquisition');
    if (!acqCost) return updatedCosts;

    return updatedCosts.map(cost => {
      if (cost.type === 'notaire') {
        const rate = cost.isReduced ? 0.03 : 0.08;
        const newValues = { ...cost.values };
        Object.keys(acqCost.values).forEach(sid => {
          newValues[sid] = Math.round(acqCost.values[sid] * rate);
        });
        return { ...cost, values: newValues };
      }
      if (cost.type === 'agence') {
        const rate = (cost.percentage || 5) / 100;
        const newValues = { ...cost.values };
        Object.keys(acqCost.values).forEach(sid => {
          newValues[sid] = Math.round(acqCost.values[sid] * rate);
        });
        return { ...cost, values: newValues };
      }
      return cost;
    });
  };

  const calculateTotals = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    const groupedLotIds = new Set(scenario?.groupedSales?.flatMap(g => g.lotIds) || []);
    const individualCa = lots.filter(lot => !groupedLotIds.has(lot.id)).reduce((acc, lot) => acc + (lot.prices[scenarioId] || 0), 0);
    const groupedCa = scenario?.groupedSales?.reduce((acc, g) => acc + (Number(g.price) || 0), 0) || 0;
    const caTotal = individualCa + groupedCa;
    const relevantCosts = costs.filter(c => c.isGlobal || c.targetScenarioId === scenarioId);
    const costTotal = relevantCosts.reduce((acc, cost) => acc + (cost.values[scenarioId] || 0), 0);
    const margin = caTotal - costTotal;
    const profitability = costTotal > 0 ? (margin / costTotal) * 100 : 0;
    return { caTotal, costTotal, margin, profitability };
  };

  const totals = useMemo(() => calculateTotals(defaultScenario.id), [defaultScenario, lots, costs, scenarios]);

  const handleUpdateCost = (updatedCost: any) => {
    let newCosts = costs.map(c => c.id === updatedCost.id ? updatedCost : c);
    if (updatedCost.type === 'acquisition' || updatedCost.type === 'notaire' || updatedCost.type === 'agence') {
      newCosts = syncCalculatedCosts(newCosts);
    }
    setCosts(newCosts);
    showSuccess("Coût mis à jour");
  };

  const handleAddCost = (newCostData, scenarioId?: string) => {
    const newCost = {
      id: Date.now().toString(),
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

  const handleDeleteScenario = (id: string) => {
    if (scenarios.length <= 1) {
      showError("Impossible de supprimer le dernier scénario");
      return;
    }
    const newScenarios = scenarios.filter(s => s.id !== id);
    if (defaultScenario.id === id) {
      newScenarios[0].isDefault = true;
    }
    setScenarios(newScenarios);
    showSuccess("Scénario supprimé");
  };

  const handleUpdateScenario = (scenarioId: string, updatedData: any) => {
    setScenarios(scenarios.map(s => s.id === scenarioId ? { 
      ...s, 
      ...updatedData.metadata,
      groupedSales: updatedData.groupedSales || s.groupedSales || []
    } : s));
    
    if (updatedData.lotPrices) {
      setLots(lots.map(lot => ({
        ...lot,
        prices: { ...lot.prices, [scenarioId]: updatedData.lotPrices[lot.id] }
      })));
    }

    if (updatedData.costValues) {
      let newCosts = costs.map(cost => ({
        ...cost,
        values: { ...cost.values, [scenarioId]: updatedData.costValues[cost.id] }
      }));
      // If acquisition changed in this scenario, sync calculated costs
      newCosts = syncCalculatedCosts(newCosts);
      setCosts(newCosts);
    }
    showSuccess("Scénario mis à jour");
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
                activeScenarioId={defaultScenario.id}
                onAdd={(data) => setLots([...lots, { ...data, id: Date.now(), prices: scenarios.reduce((acc, s) => ({ ...acc, [s.id]: Number(data.price) }), {}) }])} 
                onUpdate={(id, data) => setLots(lots.map(l => l.id === id ? { ...l, ...data, prices: { ...l.prices, [defaultScenario.id]: Number(data.price) } } : l))}
                onDelete={(id) => setLots(lots.filter(l => l.id !== id))} 
              />
              <SalesScenarios 
                scenarios={scenarios}
                lots={lots}
                costs={costs}
                onUpdate={handleUpdateScenario}
                onDeleteScenario={handleDeleteScenario}
                onSetDefault={(id) => setScenarios(scenarios.map(s => ({ ...s, isDefault: s.id === id })))}
                onAddScenario={() => {
                  const id = `scenario_${Date.now()}`;
                  setScenarios([...scenarios, { id, name: 'Nouveau Scénario', icon: 'Zap', isDefault: false, duration: 12, groupedSales: [] }]);
                  setLots(lots.map(l => ({ ...l, prices: { ...l.prices, [id]: l.prices[defaultScenario.id] } })));
                  setCosts(costs.map(c => ({ ...c, values: { ...c.values, [id]: c.values[defaultScenario.id] } })));
                }}
                onAddSpecificCost={handleAddCost}
                calculateTotals={calculateTotals}
              />
            </div>
            <div className="xl:col-span-1">
              <CostBreakdown 
                costs={costs} 
                scenarioId={defaultScenario.id} 
                onAdd={handleAddCost}
                onUpdate={handleUpdateCost}
                onDelete={(id) => setCosts(costs.filter(c => c.id !== id))}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;