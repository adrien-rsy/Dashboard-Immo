"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ProjectKPIs from '@/components/ProjectKPIs';
import LotsTable from '@/components/LotsTable';
import SalesScenarios from '@/components/SalesScenarios';
import CostBreakdown from '@/components/CostBreakdown';
import { MapPin, Calendar, Share2, Download, Briefcase } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const ProjectDashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedProjects = localStorage.getItem('immo_projects_v9');
    if (savedProjects) {
      const projects = JSON.parse(savedProjects);
      // If no ID is provided (Index page), take the last one or default
      const currentId = projectId || projects[0]?.id;
      const found = projects.find((p: any) => p.id === currentId);
      if (found) {
        setProject(found);
      } else if (!projectId && projects.length === 0) {
        // Redirect to projects if no data exists
        navigate('/projects');
      }
    } else {
      navigate('/projects');
    }
    setLoading(false);
  }, [projectId]);

  const saveProject = (updatedProject: any) => {
    const savedProjects = JSON.parse(localStorage.getItem('immo_projects_v9') || '[]');
    const newProjects = savedProjects.map((p: any) => p.id === updatedProject.id ? updatedProject : p);
    localStorage.setItem('immo_projects_v9', JSON.stringify(newProjects));
    setProject(updatedProject);
  };

  const defaultScenario = useMemo(() => 
    project?.scenarios?.find((s: any) => s.isDefault) || project?.scenarios?.[0]
  , [project]);

  const calculateTotals = (scenarioId: string) => {
    if (!project) return { caTotal: 0, costTotal: 0, margin: 0, profitability: 0, calculatedCosts: {} };
    
    const scenario = project.scenarios.find((s: any) => s.id === scenarioId);
    if (!scenario) return { caTotal: 0, costTotal: 0, margin: 0, profitability: 0, calculatedCosts: {} };

    const groupedLotIds = new Set(scenario.groupedSales?.flatMap((g: any) => g.lotIds) || []);
    const individualCa = project.lots.filter((lot: any) => !groupedLotIds.has(lot.id)).reduce((acc: number, lot: any) => acc + (lot.prices[scenarioId] || 0), 0);
    const groupedCa = scenario.groupedSales?.reduce((acc: number, g: any) => acc + (Number(g.price) || 0), 0) || 0;
    const caTotal = individualCa + groupedCa;

    const acqPrice = project.costs.find((c: any) => c.type === 'acquisition')?.values[scenarioId] || 0;
    const travauxPrice = project.costs.find((c: any) => c.type === 'travaux')?.values[scenarioId] || 0;
    
    const relevantCosts = project.costs.filter((c: any) => c.isGlobal || c.targetScenarioId === scenarioId);
    const otherCosts = relevantCosts.filter((c: any) => !['acquisition', 'notaire', 'agence', 'finance', 'travaux'].includes(c.type))
                            .reduce((acc: number, c: any) => acc + (c.values[scenarioId] || 0), 0);

    const notairePrice = Math.round(acqPrice * (scenario.isNotaireReduced ? 0.03 : 0.08));
    const agencePrice = Math.round(acqPrice * ((scenario.agenceRate || 0) / 100));

    const totalCostsExclFinance = acqPrice + travauxPrice + otherCosts + notairePrice + agencePrice;
    const totalFinanced = Math.max(0, totalCostsExclFinance - (scenario.apport || 0));
    const financialFees = Math.round(totalFinanced * (scenario.duration || 0) * ((scenario.interestRate || 0) / 100 / 12));

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

  const totals = useMemo(() => calculateTotals(defaultScenario?.id), [project, defaultScenario]);

  const displayCosts = useMemo(() => {
    if (!project || !defaultScenario) return [];
    return project.costs
      .filter((c: any) => c.isGlobal || c.targetScenarioId === defaultScenario.id)
      .map((cost: any) => {
        if (cost.type === 'notaire') return { ...cost, values: { [defaultScenario.id]: totals.calculatedCosts.notaire } };
        if (cost.type === 'agence') return { ...cost, values: { [defaultScenario.id]: totals.calculatedCosts.agence } };
        if (cost.type === 'finance') return { ...cost, values: { [defaultScenario.id]: totals.calculatedCosts.finance } };
        return cost;
      });
  }, [project, totals, defaultScenario]);

  if (loading) return null;
  if (!project) return <div className="p-10 text-center">Projet non trouvé</div>;

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-gray-900 font-sans">
      <Sidebar className="hidden lg:flex border-r border-gray-100" />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto px-4 md:px-10 pb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 mt-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                  {defaultScenario?.name}
                </span>
                <span className="text-xs text-gray-400 font-medium">OP-{project.id.split('_')[1]?.slice(-4)}</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-3">{project.metadata.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{project.metadata.address || "Adresse non renseignée"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Début : {new Date(project.metadata.startDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="font-bold text-black">{project.metadata.status}</span>
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
                lots={project.lots} 
                scenarios={project.scenarios} 
                activeScenarioId={defaultScenario?.id}
                onAdd={(data: any) => {
                  const newLot = { ...data, id: Date.now(), prices: project.scenarios.reduce((acc: any, s: any) => ({ ...acc, [s.id]: Number(data.price) }), {}) };
                  saveProject({ ...project, lots: [...project.lots, newLot] });
                }} 
                onUpdate={(id: number, data: any) => {
                  const updatedLots = project.lots.map((l: any) => l.id === id ? { ...l, ...data, prices: { ...l.prices, [defaultScenario.id]: Number(data.price) } } : l);
                  saveProject({ ...project, lots: updatedLots });
                }}
                onDelete={(id: number) => {
                  saveProject({ ...project, lots: project.lots.filter((l: any) => l.id !== id) });
                }} 
              />
              <SalesScenarios 
                scenarios={project.scenarios}
                lots={project.lots}
                costs={project.costs}
                onUpdate={(scenarioId: string, updatedData: any) => {
                  const updatedScenarios = project.scenarios.map((s: any) => s.id === scenarioId ? { ...s, ...updatedData.metadata, groupedSales: updatedData.groupedSales || [] } : s);
                  const updatedLots = project.lots.map((lot: any) => ({ ...lot, prices: { ...lot.prices, [scenarioId]: updatedData.lotPrices[lot.id] } }));
                  const updatedCosts = project.costs.map((cost: any) => ({ ...cost, values: { ...cost.values, [scenarioId]: updatedData.costValues[cost.id] } }));
                  saveProject({ ...project, scenarios: updatedScenarios, lots: updatedLots, costs: updatedCosts });
                }}
                onDeleteScenario={(id: string) => {
                  if (project.scenarios.length <= 1) return;
                  const newScenarios = project.scenarios.filter((s: any) => s.id !== id);
                  if (defaultScenario.id === id) newScenarios[0].isDefault = true;
                  saveProject({ ...project, scenarios: newScenarios });
                }}
                onSetDefault={(id: string) => {
                  saveProject({ ...project, scenarios: project.scenarios.map((s: any) => ({ ...s, isDefault: s.id === id })) });
                }}
                onAddScenario={() => {
                  const id = `scenario_${Date.now()}`;
                  const newScenario = { id, name: 'Nouveau Scénario', icon: 'Zap', isDefault: false, duration: 12, apport: 50000, interestRate: 4.0, agenceRate: 5, isNotaireReduced: false };
                  const updatedLots = project.lots.map((l: any) => ({ ...l, prices: { ...l.prices, [id]: l.prices[defaultScenario.id] } }));
                  const updatedCosts = project.costs.map((c: any) => ({ ...c, values: { ...c.values, [id]: c.values[defaultScenario.id] } }));
                  saveProject({ ...project, scenarios: [...project.scenarios, newScenario], lots: updatedLots, costs: updatedCosts });
                }}
                onAddSpecificCost={(newCostData: any, scenarioId: string) => {
                  const newCost = { id: newCostData.id, label: newCostData.label, category: "Divers", isGlobal: false, targetScenarioId: scenarioId, values: { [scenarioId]: Number(newCostData.value) } };
                  saveProject({ ...project, costs: [...project.costs, newCost] });
                }}
                calculateTotals={calculateTotals}
              />
            </div>
            <div className="xl:col-span-1">
              <CostBreakdown 
                costs={displayCosts} 
                scenario={defaultScenario} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDashboard;