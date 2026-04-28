"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Plus, Building2, MapPin, Calendar, Briefcase, ArrowRight, Trash2, Search } from 'lucide-react';
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
import { showSuccess, showError } from '@/utils/toast';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const INITIAL_SCENARIOS = [
  { id: 'pessimistic', name: 'Pessimiste', description: 'Hypothèse prudente.', icon: 'TrendingDown', isDefault: false, duration: 18, groupedSales: [], apport: 50000, interestRate: 4.5, agenceRate: 5, isNotaireReduced: false },
  { id: 'realistic', name: 'Réaliste', description: 'Scénario de marché.', icon: 'Zap', isDefault: true, duration: 14, groupedSales: [], apport: 80000, interestRate: 4.0, agenceRate: 5, isNotaireReduced: false },
  { id: 'optimistic', name: 'Optimiste', description: 'Scénario favorable.', icon: 'TrendingUp', isDefault: false, duration: 12, groupedSales: [], apport: 100000, interestRate: 3.8, agenceRate: 4, isNotaireReduced: true },
];

const DEFAULT_COSTS = [
  { id: 'acq', label: "Prix d'acquisition net vendeur", category: "Achat", isGlobal: true, type: 'acquisition', values: { pessimistic: 0, realistic: 0, optimistic: 0 } },
  { id: 'notaire', label: "Frais de notaire", category: "Achat", isGlobal: true, type: 'notaire', values: {} },
  { id: 'agence', label: "Frais d'agence", category: "Achat", isGlobal: true, type: 'agence', values: {} },
  { id: 'travaux', label: "Travaux", category: "Travaux", isGlobal: true, type: 'travaux', values: { pessimistic: 0, realistic: 0, optimistic: 0 } },
  { id: 'finance', label: "Frais financiers", category: "Finance", isGlobal: true, type: 'finance', values: {} },
];

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newProject, setNewProject] = useState({
    title: '',
    address: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'À l\'étude',
    description: '',
    acqPrice: '',
    travauxPrice: '',
    lotCount: '1'
  });

  useEffect(() => {
    fetchProjects();

    const conversion = localStorage.getItem('prospection_conversion');
    if (conversion) {
      const data = JSON.parse(conversion);
      setNewProject(prev => ({ ...prev, title: data.title, lotCount: data.lotCount }));
      setIsCreateOpen(true);
      localStorage.removeItem('prospection_conversion');
    }
  }, []);

  const fetchProjects = async () => {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('immo_projects_v9');
      if (saved) setProjects(JSON.parse(saved));
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      const saved = localStorage.getItem('immo_projects_v9');
      if (saved) setProjects(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const initialLots = Array.from({ length: parseInt(newProject.lotCount) || 1 }).map((_, i) => ({
      id: Date.now() + i,
      name: `Lot ${String(i + 1).padStart(2, '0')}`,
      type: 'Appartement',
      level: 'RDC',
      surface: '40',
      status: 'Disponible',
      isOccupied: false,
      photos: [],
      prices: { pessimistic: 150000, realistic: 165000, optimistic: 180000 }
    }));

    const initialCosts = DEFAULT_COSTS.map(c => {
      if (c.type === 'acquisition') return { ...c, values: { pessimistic: Number(newProject.acqPrice), realistic: Number(newProject.acqPrice), optimistic: Number(newProject.acqPrice) } };
      if (c.type === 'travaux') return { ...c, values: { pessimistic: Number(newProject.travauxPrice), realistic: Number(newProject.travauxPrice), optimistic: Number(newProject.travauxPrice) } };
      return c;
    });

    const projectData = {
      metadata: { title: newProject.title, address: newProject.address, startDate: newProject.startDate, status: newProject.status, description: newProject.description },
      lots: initialLots,
      scenarios: INITIAL_SCENARIOS,
      costs: initialCosts
    };

    if (!isSupabaseConfigured()) {
      const id = `project_${Date.now()}`;
      const updated = [{ id, ...projectData }, ...projects];
      setProjects(updated);
      localStorage.setItem('immo_projects_v9', JSON.stringify(updated));
      setIsCreateOpen(false);
      showSuccess("Projet créé avec succès (Local)");
      navigate(`/project/${id}`);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select();

      if (error) throw error;

      setProjects([data[0], ...projects]);
      setIsCreateOpen(false);
      showSuccess("Projet créé avec succès");
      navigate(`/project/${data[0].id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      showError("Erreur lors de la création");
    }
  };

  const deleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Supprimer ce projet ?")) return;

    if (!isSupabaseConfigured()) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      localStorage.setItem('immo_projects_v9', JSON.stringify(updated));
      showSuccess("Projet supprimé (Local)");
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== id));
      showSuccess("Projet supprimé");
    } catch (error) {
      console.error('Error deleting project:', error);
      showError("Erreur lors de la suppression");
    }
  };

  return (
    <div className="flex h-screen bg-[#F4F5F7] text-gray-900 font-sans overflow-hidden">
      <Sidebar className="hidden lg:flex border-r border-gray-100" />
      <main className="flex-1 flex flex-col min-h-0">
        <TopBar />
        <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-0 pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 md:mb-10 md:mt-8">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2">Mes Projets</h1>
              <p className="text-gray-500">Gérez votre portefeuille d'opérations</p>
            </div>
            <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-bold shadow-lg shadow-black/10 hover:bg-gray-800 transition-all active:scale-[0.98]">
              <Plus className="w-5 h-5" /> Nouveau Projet
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.filter(p => p.metadata.title.toLowerCase().includes(searchTerm.toLowerCase())).map((project) => (
              <div key={project.id} onClick={() => navigate(`/project/${project.id}`)} className="group bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer border border-transparent hover:border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => deleteProject(e, project.id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors"><Building2 className="w-7 h-7" /></div>
                  <div>
                    <span className="px-2 py-0.5 bg-gray-100 text-[8px] font-black uppercase tracking-widest rounded-full text-gray-500 mb-1 inline-block">{project.metadata.status}</span>
                    <h3 className="text-xl font-bold leading-tight">{project.metadata.title}</h3>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-500"><MapPin className="w-4 h-4 shrink-0" /><span className="truncate">{project.metadata.address}</span></div>
                  <div className="flex items-center gap-3 text-sm text-gray-500"><Calendar className="w-4 h-4 shrink-0" /><span>Début : {new Date(project.metadata.startDate).toLocaleDateString('fr-FR')}</span></div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-sm font-bold group-hover:translate-x-1 transition-transform">Ouvrir le dashboard <ArrowRight className="w-4 h-4" /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl sm:rounded-[2.5rem] p-0 overflow-y-auto border-none shadow-2xl w-[calc(100%-2rem)] sm:w-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh]">
          <DialogHeader className="p-8 pb-4 bg-gray-50/50"><DialogTitle className="text-2xl font-black">Nouveau Projet</DialogTitle></DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-gray-400">Titre</Label><Input value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="rounded-xl" /></div>
              <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-gray-400">Adresse</Label><Input placeholder="45 Rue..." value={newProject.address} onChange={e => setNewProject({...newProject, address: e.target.value})} className="rounded-xl" /></div>
              <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-gray-400">Description</Label><textarea placeholder="Décrivez l'opération..." value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 resize-none text-sm min-h-[100px]" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-gray-400">Début</Label><Input type="date" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} className="rounded-xl" /></div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-gray-400">Statut</Label>
                  <Select value={newProject.status} onValueChange={val => setNewProject({...newProject, status: val})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="À l'étude">À l'étude</SelectItem>
                      <SelectItem value="Offre envoyée">Offre envoyée</SelectItem>
                      <SelectItem value="Offre acceptée">Offre acceptée</SelectItem>
                      <SelectItem value="Sous compromis">Sous compromis</SelectItem>
                      <SelectItem value="Acté">Acté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4"><button onClick={handleCreate} disabled={!newProject.title} className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-xl shadow-black/20 hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50">Créer le projet</button></DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;