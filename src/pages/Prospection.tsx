"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { 
  Plus, 
  Phone, 
  Link as LinkIcon, 
  Trash2, 
  ExternalLink, 
  Search, 
  Briefcase,
  X,
  Tag,
  Pencil
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
  created_at?: string;
}

const Prospection = () => {
  const navigate = useNavigate();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<Prospect['status'][]>(["À appeler", "À visiter", "À étudier", "En attente"]);

  const [formData, setFormData] = useState({
    title: '',
    phone: '',
    notes: '',
    link: '',
    status: 'À appeler' as Prospect['status']
  });

  useEffect(() => {
    fetchProspects();
  }, []);

  const migrateOldStatuses = (prospects: any[]): Prospect[] => {
    return prospects.map(p => ({
      ...p,
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
        created_at: new Date().toISOString()
      };
      saveToLocal([newProspect, ...prospects]);
      setIsAddOpen(false);
      setFormData({ title: '', phone: '', notes: '', link: '', status: 'À appeler' });
      showSuccess("Prospect ajouté avec succès (Local)");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('prospects')
        .insert([formData])
        .select();

      if (error) throw error;
      
      setProspects([data[0], ...prospects]);
      setIsAddOpen(false);
      setFormData({ title: '', phone: '', notes: '', link: '', status: 'À appeler' });
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
          status: editingProspect.status
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
      address: '',
      lotCount: '1',
      acqPrice: '',
      travauxPrice: '',
      notes: prospect.notes
    }));
    navigate('/projects');
  };

  const toggleStatusFilter = (status: Prospect['status']) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const filteredProspects = prospects.filter(p => 
    (p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) || 
    p.notes.toLowerCase().includes(searchTerm.toLowerCase())) &&
    selectedStatuses.includes(p.status)
  );

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-gray-900 font-sans">
      <Sidebar className="hidden lg:flex border-r border-gray-100" />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto px-4 md:px-10 pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 mt-8">
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

          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher par titre, téléphone ou notes..."
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-black transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            {(['À appeler', 'À visiter', 'À étudier', 'En attente'] as Prospect['status'][]).map((status) => (
              <button
                key={status}
                onClick={() => toggleStatusFilter(status)}
                className={cn(
                  "px-4 py-2 rounded-xl font-bold text-sm transition-all",
                  selectedStatuses.includes(status)
                    ? "bg-black text-white shadow-lg"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                )}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProspects.map((prospect) => (
              <div 
                key={prospect.id}
                onClick={() => setEditingProspect(prospect)}
                className="group bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all border border-transparent hover:border-gray-100 relative cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                    prospect.status === 'A Appeler' ? "bg-blue-50 text-blue-600" :
                    prospect.status === 'A visiter' ? "bg-purple-50 text-purple-600" :
                    prospect.status === 'A etudier' ? "bg-orange-50 text-orange-600" :
                    "bg-gray-100 text-gray-400"
                  )}>
                    <Tag className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold leading-tight truncate">{prospect.title || "Sans titre"}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 font-bold">{prospect.phone || 'Non renseigné'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-gray-600 line-clamp-3 min-h-[60px]">
                    {prospect.notes || "Aucune note particulière..."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50 gap-3">
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
            ))}
          </div>
        </div>
      </main>

      {/* Dialog Ajout */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl sm:rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl w-[calc(100%-2rem)] sm:w-auto">
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
        <DialogContent className="sm:max-w-[550px] rounded-2xl sm:rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl w-[calc(100%-2rem)] sm:w-auto">
          {editingProspect && (
            <>
              <DialogHeader className="p-8 pb-4 bg-gray-50/50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                    <Tag className="text-white w-5 h-5" />
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prospection;