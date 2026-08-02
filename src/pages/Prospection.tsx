"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ProspectChecklist from '@/components/ProspectChecklist';
import { ChecklistItem } from '@/types/checklist';
import { 
  Plus, 
  Phone, 
  Link as LinkIcon, 
  Trash2, 
  ExternalLink, 
  Search, 
  Briefcase,
  X,
  MapPin,
  Clock,
  Pencil,
  Euro,
  LayoutGrid,
  Columns3
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface Prospect {
  id: string;
  title: string;
  phone: string;
  notes: string;
  link: string;
  status: "À appeler" | "À visiter" | "À étudier" | "En attente";
  prix?: string;
  ville?: string;
  created_at?: string;
  checklist?: ChecklistItem[];
}

type ViewMode = 'gallery' | 'kanban';

const statusConfig: Record<Prospect['status'], {
  icon: React.ElementType;
  bg: string;
  text: string;
  border: string;
  header: string;
}> = {
  "À appeler": {
    icon: Phone,
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
    header: "bg-blue-50 border-blue-100",
  },
  "À visiter": {
    icon: MapPin,
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-100",
    header: "bg-violet-50 border-violet-100",
  },
  "En attente": {
    icon: Clock,
    bg: "bg-orange-50",
    text: "text-orange-500",
    border: "border-orange-100",
    header: "bg-orange-50 border-orange-100",
  },
  "À étudier": {
    icon: Search,
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    header: "bg-emerald-50 border-emerald-100",
  },
};

const KANBAN_COLUMNS: Prospect['status'][] = ["À appeler", "À étudier", "À visiter", "En attente"];

const formatPrix = (prix?: string) => {
  if (!prix) return null;
  const num = parseInt(prix.replace(/\s/g, '').replace(/[^0-9]/g, ''));
  if (isNaN(num)) return prix;
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num);
};

const Prospection = () => {
  const navigate = useNavigate();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');

  const [formData, setFormData] = useState({
    title: '',
    phone: '',
    notes: '',
    link: '',
    prix: '',
    ville: '',
    status: 'À appeler' as Prospect['status']
  });

  useEffect(() => {
    fetchProspects();
  }, []);

  const migrateOldStatuses = (prospects: any[]): Prospect[] => {
    return prospects.map(p => ({
      ...p,
      checklist: p.checklist ?? [],
      prix: p.prix ?? '',
      ville: p.ville ?? '',
      status: 
        p.status === 'À appeler' ? 'À appeler' :
        p.status === 'Sans suite' ? 'En attente' :
        p.status === 'A Appeler' ? 'À appeler' :
        p.status === 'A visiter' ? 'À visiter' :
        p.status === 'A etudier' ? 'À étudier' :
        p.status
    }));
  };

  const fetchProspects = async () => {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('immo_prospects_v2');
      if (saved) {
        const migrated = migrateOldStatuses(JSON.parse(saved));
        setProspects(migrated);
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const migrated = migrateOldStatuses(data || []);
      setProspects(migrated);
    } catch (error) {
      console.error('Error fetching prospects:', error);
      const saved = localStorage.getItem('immo_prospects_v2');
      if (saved) {
        const migrated = migrateOldStatuses(JSON.parse(saved));
        setProspects(migrated);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveToLocal = (data: Prospect[]) => {
    setProspects(data);
    localStorage.setItem('immo_prospects_v2', JSON.stringify(data));
  };

  const handleAdd = async () => {
    if (!isSupabaseConfigured()) {
      const newProspect: Prospect = {
        ...formData,
        id: `prospect_${Date.now()}`,
        created_at: new Date().toISOString(),
        checklist: []
      };
      saveToLocal([newProspect, ...prospects]);
      setIsAddOpen(false);
      setFormData({ title: '', phone: '', notes: '', link: '', prix: '', ville: '', status: 'À appeler' });
      showSuccess("Prospect ajouté avec succès (Local)");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('prospects')
        .insert([{ ...formData, checklist: [] }])
        .select();

      if (error) throw error;
      
      setProspects([{ ...data[0], checklist: [] }, ...prospects]);
      setIsAddOpen(false);
      setFormData({ title: '', phone: '', notes: '', link: '', prix: '', ville: '', status: 'À appeler' });
      showSuccess("Prospect ajouté avec succès");
    } catch (error) {
      console.error('Error adding prospect:', error);
      showError("Erreur lors de l'ajout");
    }
  };

  const handleUpdate = async () => {
    if (!editingProspect) return;

    if (!isSupabaseConfigured()) {
      const updated = prospects.map(p => p.id === editingProspect.id ? editingProspect : p);
      saveToLocal(updated);
      setEditingProspect(null);
      showSuccess("Prospect mis à jour (Local)");
      return;
    }

    try {
      const { error } = await supabase
        .from('prospects')
        .update({
          title: editingProspect.title,
          phone: editingProspect.phone,
          notes: editingProspect.notes,
          link: editingProspect.link,
          status: editingProspect.status,
          prix: editingProspect.prix ?? '',
          ville: editingProspect.ville ?? '',
          checklist: editingProspect.checklist ?? []
        })
        .eq('id', editingProspect.id);

      if (error) throw error;

      setProspects(prospects.map(p => p.id === editingProspect.id ? editingProspect : p));
      setEditingProspect(null);
      showSuccess("Prospect mis à jour");
    } catch (error) {
      console.error('Error updating prospect:', error);
      showError("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce prospect ?")) return;

    if (!isSupabaseConfigured()) {
      saveToLocal(prospects.filter(p => p.id !== id));
      setEditingProspect(null);
      showSuccess("Prospect supprimé (Local)");
      return;
    }

    try {
      const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProspects(prospects.filter(p => p.id !== id));
      setEditingProspect(null);
      showSuccess("Prospect supprimé");
    } catch (error) {
      console.error('Error deleting prospect:', error);
      showError("Erreur lors de la suppression");
    }
  };

  const handleStatusChange = async (id: string, status: Prospect['status'], e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (!isSupabaseConfigured()) {
      saveToLocal(prospects.map(p => p.id === id ? { ...p, status } : p));
      return;
    }

    try {
      const { error } = await supabase
        .from('prospects')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setProspects(prospects.map(p => p.id === id ? { ...p, status } : p));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const convertToProject = (prospect: Prospect, e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem('prospection_conversion', JSON.stringify({
      title: prospect.title || `Projet - ${prospect.phone}`,
      address: prospect.ville || '',
      lotCount: '1',
      acqPrice: prospect.prix || '',
      travauxPrice: '',
      notes: prospect.notes
    }));
    navigate('/projects');
  };

  const filteredProspects = prospects.filter(p => 
    (p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) || 
    p.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.ville || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // ——— KANBAN CARD ———
  const KanbanCard = ({ prospect }: { prospect: Prospect }) => {
    const cfg = statusConfig[prospect.status] ?? statusConfig["En attente"];
    const StatusIcon = cfg.icon;
    const prixFormate = formatPrix(prospect.prix);
    const checklistTotal = prospect.checklist?.length ?? 0;
    const checklistDone = prospect.checklist?.filter(i => i.checked).length ?? 0;

    return (
      <div
        onClick={() => setEditingProspect(prospect)}
        className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer group active:scale-[0.99]"
      >
        <div className="flex items-start gap-3 mb-3">
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", cfg.bg, cfg.text)}>
            <StatusIcon className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold leading-snug text-gray-900 flex-1 min-w-0">
            {prospect.title || "Sans titre"}
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {prixFormate ? (
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-lg px-2 py-1 text-[10px] font-bold">
              <Euro className="w-3 h-3" />{prixFormate}
            </span>
          ) : null}
          {prospect.ville ? (
            <span className="flex items-center gap-1 bg-blue-50 text-blue-600 rounded-lg px-2 py-1 text-[10px] font-bold truncate max-w-[120px]">
              <MapPin className="w-3 h-3 flex-shrink-0" />{prospect.ville}
            </span>
          ) : null}
        </div>

        {prospect.notes ? (
          <p className="text-[11px] text-gray-400 line-clamp-2 mb-3 leading-relaxed">
            {prospect.notes}
          </p>
        ) : null}

        {checklistTotal > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold uppercase text-gray-300 tracking-wider">Checklist</span>
              <span className="text-[9px] font-bold text-gray-300">{checklistDone}/{checklistTotal}</span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.round((checklistDone / checklistTotal) * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          {prospect.phone ? (
            <span className="text-[10px] text-gray-400 font-medium">{prospect.phone}</span>
          ) : <span />}
          <button
            onClick={(e) => convertToProject(prospect, e)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-black text-white rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-gray-800 transition-all active:scale-95 opacity-0 group-hover:opacity-100"
          >
            <Briefcase className="w-2.5 h-2.5" />
            Projet
          </button>
        </div>
      </div>
    );
  };

  // ——— KANBAN VIEW ———
  // Colonnes en hauteur naturelle, pas de scroll interne.
  // Le scroll se fait sur la page entière via le body/html.
  const KanbanView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      {KANBAN_COLUMNS.map((colStatus) => {
        const cfg = statusConfig[colStatus];
        const StatusIcon = cfg.icon;
        const colProspects = filteredProspects.filter(p => p.status === colStatus);

        return (
          <div key={colStatus} className="flex flex-col">
            {/* Column header */}
            <div className={cn(
              "flex items-center justify-between px-4 py-3 rounded-2xl border mb-3",
              cfg.header
            )}>
              <div className="flex items-center gap-2">
                <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center", cfg.bg, cfg.text)}>
                  <StatusIcon className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-gray-800">{colStatus}</span>
              </div>
              <span className={cn(
                "text-xs font-black px-2 py-0.5 rounded-full",
                cfg.bg, cfg.text
              )}>
                {colProspects.length}
              </span>
            </div>

            {/* Cards — hauteur naturelle, pas de overflow-y-auto */}
            <div className="flex flex-col gap-3">
              {colProspects.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-xs text-gray-300 font-medium text-center">Aucun prospect</p>
                </div>
              ) : (
                colProspects.map(prospect => (
                  <KanbanCard key={prospect.id} prospect={prospect} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-gray-900 font-sans">
      <Sidebar className="hidden lg:flex border-r border-gray-100" />
      {/* main sans flex-1 flex flex-col pour ne pas piéger le scroll */}
      <main className="flex-1 min-w-0">
        <TopBar />
        <div className="px-4 md:px-10 py-6 md:py-0 pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 md:mb-10 md:mt-8">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2">Prospection</h1>
              <p className="text-gray-500">Gérez vos opportunités avant d'en faire des projets</p>
            </div>
            <button 
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-bold shadow-lg shadow-black/10 hover:bg-gray-800 transition-all active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              Nouveau Prospect
            </button>
          </div>

          {/* Search + View Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher par titre, ville, téléphone ou notes..."
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-black transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* View switcher toggle */}
            <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 shadow-sm flex-shrink-0">
              <button
                onClick={() => setViewMode('gallery')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all",
                  viewMode === 'gallery'
                    ? "bg-black text-white shadow-md"
                    : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Galerie</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all",
                  viewMode === 'kanban'
                    ? "bg-black text-white shadow-md"
                    : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                <Columns3 className="w-4 h-4" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
            </div>
          </div>

          {/* Views */}
          {viewMode === 'gallery' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProspects.map((prospect) => {
                const cfg = statusConfig[prospect.status] ?? statusConfig["En attente"];
                const StatusIcon = cfg.icon;
                const checklistTotal = prospect.checklist?.length ?? 0;
                const checklistDone = prospect.checklist?.filter(i => i.checked).length ?? 0;
                const prixFormate = formatPrix(prospect.prix);
                return (
                  <div 
                    key={prospect.id}
                    onClick={() => setEditingProspect(prospect)}
                    className="group bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all border border-transparent hover:border-gray-100 relative cursor-pointer"
                  >
                    <div className="flex items-center gap-4 mb-5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0",
                        cfg.bg,
                        cfg.text
                      )}>
                        <StatusIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold leading-tight truncate">{prospect.title || "Sans titre"}</h3>
                      </div>
                    </div>

                    {/* Prix + Ville */}
                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                      {prixFormate ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-xl px-3 py-1.5">
                          <Euro className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="text-xs font-bold">{prixFormate}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-gray-50 text-gray-400 rounded-xl px-3 py-1.5">
                          <Euro className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="text-xs font-medium">Prix non renseigné</span>
                        </div>
                      )}
                      {prospect.ville ? (
                        <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 rounded-xl px-3 py-1.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="text-xs font-bold truncate">{prospect.ville}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-gray-50 text-gray-400 rounded-xl px-3 py-1.5">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="text-xs font-medium">Ville non renseignée</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50/50 rounded-2xl p-4 mb-4">
                      <p className="text-sm text-gray-600 line-clamp-3 min-h-[60px]">
                        {prospect.notes || "Aucune note particulière..."}
                      </p>
                    </div>

                    {checklistTotal > 0 && (
                      <div className="mb-4 px-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Checklist</span>
                          <span className="text-[10px] font-bold text-gray-400">{checklistDone}/{checklistTotal}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${Math.round((checklistDone / checklistTotal) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 gap-3">
                      {prospect.link && (
                        <a 
                          href={prospect.link.startsWith('http') ? prospect.link : `https://${prospect.link}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors flex-shrink-0"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                      <Select 
                        value={prospect.status} 
                        onValueChange={(val: Prospect['status']) => handleStatusChange(prospect.id, val)}
                      >
                        <SelectTrigger 
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 h-9 text-[10px] font-bold uppercase rounded-xl border-none bg-gray-50"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="À appeler">À appeler</SelectItem>
                          <SelectItem value="À visiter">À visiter</SelectItem>
                          <SelectItem value="À étudier">À étudier</SelectItem>
                          <SelectItem value="En attente">En attente</SelectItem>
                        </SelectContent>
                      </Select>

                      <button 
                        onClick={(e) => convertToProject(prospect, e)}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-gray-800 transition-all shadow-md active:scale-95 flex-shrink-0"
                      >
                        <Briefcase className="w-3 h-3" />
                        Créer projet
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <KanbanView />
          )}
        </div>
      </main>

      {/* Dialog Ajout */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] rounded-2xl p-0 border-none shadow-2xl max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-[850px] sm:w-[850px] sm:rounded-[2.5rem] sm:max-h-[90vh]">
          <DialogHeader className="p-8 pb-4 bg-gray-50/50">
            <DialogTitle className="text-2xl font-black">Nouveau Prospect</DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Titre du bien</Label>
              <Input 
                placeholder="ex: Immeuble de rapport Lyon 3"
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="rounded-xl"
              />
            </div>

            {/* Prix + Ville */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-gray-400">Prix affiché</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="ex: 180000"
                    value={formData.prix} 
                    onChange={e => setFormData({...formData, prix: e.target.value})}
                    className="rounded-xl pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-gray-400">Ville</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="ex: Dijon"
                    value={formData.ville} 
                    onChange={e => setFormData({...formData, ville: e.target.value})}
                    className="rounded-xl pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Téléphone</Label>
              <Input 
                placeholder="06 00 00 00 00"
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Lien de l'annonce</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="LBC, SeLoger..."
                  value={formData.link} 
                  onChange={e => setFormData({...formData, link: e.target.value})}
                  className="rounded-xl pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Notes & Commentaires</Label>
              <Textarea 
                placeholder="Détails du bien, contact agence..."
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="rounded-xl min-h-[100px]"
              />
            </div>
            <DialogFooter className="pt-4">
              <button 
                onClick={handleAdd}
                className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-xl shadow-black/20 hover:bg-gray-800 transition-all active:scale-[0.98]"
              >
                Ajouter à ma prospection
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Edition / Détails */}
      <Dialog open={!!editingProspect} onOpenChange={(open) => !open && setEditingProspect(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] rounded-2xl p-0 border-none shadow-2xl max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-[850px] sm:w-[850px] sm:rounded-[2.5rem] sm:max-h-[90vh]">
          {editingProspect && (() => {
            const cfg = statusConfig[editingProspect.status] ?? statusConfig["En attente"];
            const StatusIcon = cfg.icon;
            return (
              <>
                <DialogHeader className="p-8 pb-4 bg-gray-50/50 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", cfg.bg, cfg.text)}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <DialogTitle className="text-2xl font-black">Détails du Prospect</DialogTitle>
                  </div>
                  <button 
                    onClick={() => handleDelete(editingProspect.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </DialogHeader>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-gray-400">Titre du bien</Label>
                    <Input 
                      value={editingProspect.title} 
                      onChange={e => setEditingProspect({...editingProspect, title: e.target.value})}
                      className="rounded-xl"
                    />
                  </div>

                  {/* Prix + Ville */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-gray-400">Prix affiché</Label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          placeholder="ex: 180000"
                          value={editingProspect.prix ?? ''} 
                          onChange={e => setEditingProspect({...editingProspect, prix: e.target.value})}
                          className="rounded-xl pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-gray-400">Ville</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          placeholder="ex: Dijon"
                          value={editingProspect.ville ?? ''} 
                          onChange={e => setEditingProspect({...editingProspect, ville: e.target.value})}
                          className="rounded-xl pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-gray-400">Téléphone</Label>
                      <Input 
                        value={editingProspect.phone} 
                        onChange={e => setEditingProspect({...editingProspect, phone: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-gray-400">Statut</Label>
                      <Select 
                        value={editingProspect.status} 
                        onValueChange={(val: Prospect['status']) => setEditingProspect({...editingProspect, status: val})}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="À appeler">À appeler</SelectItem>
                          <SelectItem value="À visiter">À visiter</SelectItem>
                          <SelectItem value="À étudier">À étudier</SelectItem>
                          <SelectItem value="En attente">En attente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-gray-400">Lien de l'annonce</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={editingProspect.link} 
                        onChange={e => setEditingProspect({...editingProspect, link: e.target.value})}
                        className="rounded-xl"
                      />
                      {editingProspect.link && (
                        <a 
                          href={editingProspect.link.startsWith('http') ? editingProspect.link : `https://${editingProspect.link}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-gray-400">Notes & Commentaires</Label>
                    <Textarea 
                      value={editingProspect.notes} 
                      onChange={e => setEditingProspect({...editingProspect, notes: e.target.value})}
                      className="rounded-xl min-h-[120px]"
                    />
                  </div>

                  {/* ——— CHECKLIST ——— */}
                  <div className="bg-gray-50/60 rounded-2xl p-5">
                    <ProspectChecklist
                      items={editingProspect.checklist ?? []}
                      onChange={(items) => setEditingProspect({ ...editingProspect, checklist: items })}
                    />
                  </div>

                  <DialogFooter className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setEditingProspect(null)}
                      className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={handleUpdate}
                      className="flex-2 px-10 py-4 bg-black text-white rounded-2xl font-bold shadow-xl shadow-black/20 hover:bg-gray-800 transition-all active:scale-[0.98]"
                    >
                      Enregistrer les modifications
                    </button>
                  </DialogFooter>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prospection;
