"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ProjectKPIs from '@/components/ProjectKPIs';
import LotsTable from '@/components/LotsTable';
import SalesScenarios from '@/components/SalesScenarios';
import CostBreakdown from '@/components/CostBreakdown';
import { MapPin, Calendar, Share2, Download, Briefcase } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INITIAL_SCENARIOS = [
  { 
    id: 'pessimistic', 
    name: 'Pessimiste', 
    description: 'Hypothèse prudente avec des prix de revente bas et des délais de portage longs.',
    icon: 'TrendingDown', 
    isDefault: false, 
    duration: 18, 
    groupedSales: [],
    apport: 50000,
    interestRate: 4.5,
    agenceRate: 5,
    isNotaireReduced: false
  },
  { 
    id: 'realistic', 
    name: 'Réaliste', 
    description: 'Scénario basé sur les prix du marché actuel et des délais de réalisation standards.',
    icon: 'Zap', 
    isDefault: true, 
    duration: 14, 
    groupedSales: [],
    apport: 80000,
    interestRate: 4.0,
    agenceRate: 5,
    isNotaireReduced: false
  },
  { 
    id: 'optimistic', 
    name: 'Optimiste', 
    description: 'Scénario avec une revente rapide au prix fort et des coûts de travaux optimisés.',
    icon: 'TrendingUp', 
    isDefault: false, 
    duration: 12, 
    groupedSales: [],
    apport: 100000,
    interestRate: 3.8,
    agenceRate: 4,
    isNotaireReduced: true
  },
];

const INITIAL_LOTS = [
  { id: 1, name: 'Lot 01', type: 'Appartement', level: '1er étage', surface: '42', status: 'Disponible', notes: 'T2 avec balcon', prices: { pessimistic: 155000, realistic: 168000, optimistic: 175000 } },
  { id: 2, name: 'Lot 02', type: 'Appartement', level: '2e étage', surface: '38', status: 'Optionné', notes: 'T2 traversant', prices: { pessimistic: 145000, realistic: 154000, optimistic: 162000 } },
];

const INITIAL_COSTS = [
  { id: 'acq', label: "Prix d'acquisition net vendeur", category: "Achat", isGlobal: true, type: 'acquisition', values: { pessimistic: 320000, realistic: 320000, optimistic: 320000 } },
  { id: 'notaire', label: "Frais de notaire", category: "Achat", isGlobal: true, type: 'notaire', values: {} },
  { id: 'agence', label: "Frais d'agence", category: "Achat", isGlobal: true, type: 'agence', values: {} },
  { id: 'travaux', label: "Travaux", category: "Travaux", isGlobal: true, type: 'travaux', values: { pessimistic: 160000, realistic: 140000, optimistic: 130000 } },
  { id: 'finance', label: "Frais financiers", category: "Finance", isGlobal: true, type: 'finance', values: {} },
];

const Index = () => {
  const [scenarios, setScenarios] = useState(() => {
    const saved = localStorage.getItem('immo_scenarios_v8');
    return saved ? JSON.parse(saved) : INITIAL_SCENARIOS;
  });

  const [lots, setLots] = useState(() => {
    const saved = localStorage.getItem('immo_lots_v8');
    return saved ? JSON.parse(saved) : INITIAL_LOTS;
  });

  const [costs, setCosts] = useState(() => {
    const saved = localStorage.getItem('immo_costs_v8');
    return saved ? JSON.parse(saved) : INITIAL_COSTS;
  });

  const [projectData, setProjectData] = useState({
    title: 'Immeuble "Le Renaissance"',
    address: '12 Rue de la République, 69002 Lyon',
    startDate: '2024-01-01',
    status: 'À étudier'
  });

  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('immo_scenarios_v8', JSON.stringify(scenarios));
    localStorage.setItem('immo_lots_v8', JSON.stringify(lots));
    localStorage.setItem('immo_costs_v8', JSON.stringify(costs));
    localStorage.setItem('immo_project_v8', JSON.stringify(projectData));
  }, [scenarios, lots, costs, projectData]);

  // Update initializer for projectData to check localStorage
  useEffect(() => {
    const saved = localStorage.getItem('immo_project_v8');
    if (saved) setProjectData(JSON.parse(saved));
  }, []);

  const defaultScenario = useMemo(() => scenarios.find(s => s.isDefault) || scenarios[0], [scenarios]);

  const calculateTotals = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return { caTotal: 0, costTotal: 0, margin: 0, profitability: 0, financeDetails: {} };

    // 1. CA Total
    const groupedLotIds = new Set(scenario.groupedSales?.flatMap(g => g.lotIds) || []);
    const individualCa = lots.filter(lot => !groupedLotIds.has(lot.id)).reduce((acc, lot) => acc + (lot.prices[scenarioId] || 0), 0);
    const groupedCa = scenario.groupedSales?.reduce((acc, g) => acc + (Number(g.price) || 0), 0) || 0;
    const caTotal = individualCa + groupedCa;

    // 2. Coûts de base (Acquisition, Travaux, Divers)
    const acqPrice = costs.find(c => c.type === 'acquisition')?.values[scenarioId] || 0;
    const travauxPrice = costs.find(c => c.type === 'travaux')?.values[scenarioId] || 0;
    
    // Filtrer les coûts pour ne prendre que ceux du scénario ou globaux
    const relevantCosts = costs.filter(c => c.isGlobal || c.targetScenarioId === scenarioId);
    
    const otherCosts = relevantCosts.filter(c => !['acquisition', 'notaire', 'agence', 'finance', 'travaux'].includes(c.type))
                            .reduce((acc, c) => acc + (c.values[scenarioId] || 0), 0);

    // 3. Coûts calculés (Notaire, Agence)
    const notairePrice = Math.round(acqPrice * (scenario.isNotaireReduced ? 0.03 : 0.08));
    const agencePrice = Math.round(acqPrice * (scenario.agenceRate / 100));

    // 4. Frais Financiers
    const totalCostsExclFinance = acqPrice + travauxPrice + otherCosts + notairePrice + agencePrice;
    const totalFinanced = Math.max(0, totalCostsExclFinance - scenario.apport);
    const financialFees = Math.round(totalFinanced * scenario.duration * (scenario.interestRate / 100 / 12));

    const costTotal = totalCostsExclFinance + financialFees;
    const margin = caTotal - costTotal;
    const profitability = costTotal > 0 ? (margin / costTotal) * 100 : 0;

    return { 
      caTotal, 
      costTotal, 
      margin, 
      profitability,
      calculatedCosts: {
        notaire: notairePrice,
        agence: agencePrice,
        finance: financialFees,
        totalFinanced
      }
    };
  };

  const totals = useMemo(() => calculateTotals(defaultScenario.id), [defaultScenario, lots, costs, scenarios]);

  // Inject calculated values into costs for display in CostBreakdown
  const displayCosts = useMemo(() => {
    return costs
      .filter(c => c.isGlobal || c.targetScenarioId === defaultScenario.id)
      .map(cost => {
        if (cost.type === 'notaire') return { ...cost, values: { [defaultScenario.id]: totals.calculatedCosts.notaire } };
        if (cost.type === 'agence') return { ...cost, values: { [defaultScenario.id]: totals.calculatedCosts.agence } };
        if (cost.type === 'finance') return { ...cost, values: { [defaultScenario.id]: totals.calculatedCosts.finance } };
        return cost;
      });
  }, [costs, totals, defaultScenario.id]);

  const handleUpdateCost = (updatedCost: any) => {
    setCosts(costs.map(c => c.id === updatedCost.id ? updatedCost : c));
    showSuccess("Coût mis à jour");
  };

  const handleAddCost = (newCostData, scenarioId?: string) => {
    const newCost = {
      id: newCostData.id || Date.now().toString(),
      label: newCostData.label,
      category: newCostData.category || "Divers",
      isGlobal: !scenarioId,
      targetScenarioId: scenarioId,
      values: scenarioId 
        ? { [scenarioId]: Number(newCostData.value) }
        : scenarios.reduce((acc, s) => ({ ...acc, [s.id]: Number(newCostData.value) }), {})
    };
    setCosts([...costs, newCost]);
    showSuccess("Poste de coût ajouté");
  };

  // NEW: delete a specific cost completely
  const handleDeleteCost = (costId: string) => {
    setCosts(costs.filter(c => c.id !== costId));
    showSuccess("Coût supprimé");
  };

  const handleDeleteScenario = (id: string) => {
    if (scenarios.length <= 1) return;
    const newScenarios = scenarios.filter(s => s.id !== id);
    if (defaultScenario.id === id) newScenarios[0].isDefault = true;
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
      setCosts(costs.map(cost => ({
        ...cost,
        values: { ...cost.values, [scenarioId]: updatedData.costValues[cost.id] }
      })));
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
              <h1 className="text-4xl font-black tracking-tight mb-3">{projectData.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{projectData.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Début : {new Date(projectData.startDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="font-bold text-black">{projectData.status}</span>
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
              <button
                onClick={() => setIsEditProjectOpen(true)}
                className="px-6 py-3 bg-black text-white rounded-2xl font-bold shadow-lg shadow-black/10 hover:bg-gray-800 transition-all"
              >
                Éditer l'opération
              </button>
            </div>
          </div>

          <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
              <DialogHeader className="p-8 pb-4 bg-gray-50/50">
                <DialogTitle className="text-2xl font-black">Éditer l'opération</DialogTitle>
              </DialogHeader>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-gray-400">Titre de l'opération</Label>
                  <Input
                    value={projectData.title}
                    onChange={e => setProjectData({...projectData, title: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-gray-400">Adresse</Label>
                  <Input
                    value={projectData.address}
                    onChange={e => setProjectData({...projectData, address: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-gray-400">Date de début</Label>
                    <Input
                      type="date"
                      value={projectData.startDate}
                      onChange={e => setProjectData({...projectData, startDate: e.target.value})}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-gray-400">Statut</Label>
                    <Select
                      value={projectData.status}
                      onValueChange={val => setProjectData({...projectData, status: val})}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="À étudier">À étudier</SelectItem>
                        <SelectItem value="Offre envoyée">Offre envoyée</SelectItem>
                        <SelectItem value="Offre acceptée">Offre acceptée</SelectItem>
                        <SelectItem value="Sous compromis">Sous compromis</SelectItem>
                        <SelectItem value="Acheté">Acheté</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <button
                    onClick={() => {
                      setIsEditProjectOpen(false);
                      showSuccess("Opération mise à jour");
                    }}
                    className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-xl shadow-black/20 hover:bg-gray-800 transition-all active:scale-[0.98]"
                  >
                    Enregistrer les modifications
                  </button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

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
                  setScenarios([...scenarios, { 
                    id, 
                    name: 'Nouveau Scénario', 
                    description: '',
                    icon: 'Zap', 
                    isDefault: false, 
                    duration: 12, 
                    groupedSales: [],
                    apport: 50000,
                    interestRate: 4.0,
                    agenceRate: 5,
                    isNotaireReduced: false
                  }]);
                  setLots(lots.map(l => ({ ...l, prices: { ...l.prices, [id]: l.prices[defaultScenario.id] } })));
                  setCosts(costs.map(c => ({ ...c, values: { ...c.values, [id]: c.values[defaultScenario.id] } })));
                }}
                onAddSpecificCost={handleAddCost}
                onDeleteSpecificCost={handleDeleteCost}   {/* NEW PROP */}
                calculateTotals={calculateTotals}
              />
            </div>
            <div className="xl:col-span-1">
              <CostBreakdown 
                costs={displayCosts} 
                scenario={defaultScenario} 
                onAdd={handleAddCost}
                onUpdate={handleUpdateCost}
                onUpdateScenario={(data) => handleUpdateScenario(defaultScenario.id, { metadata: data })}
                onDelete={(id) => setCosts(costs.filter(c => c.id !== id))}
                financeDetails={totals.calculatedCosts}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;