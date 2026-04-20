"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { 
  Plus, 
  Phone, 
  Maximize, 
  Link as LinkIcon, 
  Trash2, 
  ExternalLink, 
  Search, 
  MoreVertical,
  Briefcase,
  X
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
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface Prospect {
  id: string;
  phone: string;
  surface: string;
  notes: string;
  link: string;
  status: "À appeler" | "Sans suite" | "Sens 8";
  createdAt: string;
}

const Prospection = () => {
  const navigate = useNavigate();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    phone: '',
    surface: '',
    notes: '',
    link: '',
    status: 'À appeler' as Prospect['status']
  });

  useEffect(() => {
    const saved = localStorage.getItem('immo_prospects_v1');
    if (saved) setProspects(JSON.parse(saved));
  }, []);

  const saveToLocal = (data: Prospect[]) => {
    setProspects(data);
    localStorage.setItem('immo_prospects_v1', JSON.stringify(data));
  };

  const handleAdd = () => {
    const newProspect: Prospect = {
      ...formData,
      id: `prospect_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    saveToLocal([newProspect, ...prospects]);
    setIsAddOpen(false);
    setFormData({ phone: '', surface: '', notes: '', link: '', status: 'À appeler' });
    showSuccess("Prospect ajouté avec succès");
  };

  const handleDelete = (id: string) => {
    if (confirm("Supprimer ce prospect ?")) {
      saveToLocal(prospects.filter(p => p.id !== id));
      showSuccess("Prospect supprimé");
    }
  };

  const handleRemoveLink = (id: string) => {
    saveToLocal(prospects.map(p => p.id === id ? { ...p, link: '' } : p));
    showSuccess("Lien supprimé");
  };

  const handleStatusChange = (id: string, status: Prospect['status']) => {
    saveToLocal(prospects.map(p => p.id === id ? { ...p, status } : p));
  };

  const convertToProject = (prospect: Prospect) => {
    // Stocker temporairement les données du prospect pour la page de création
    localStorage.setItem('prospection_conversion', JSON.stringify({
      title: `Projet - ${prospect.phone}`,
      address: '', // Sera rempli par l'utilisateur
      lotCount: '1',
      acqPrice: '',
      travauxPrice: '',
      notes: prospect.notes
    }));
    navigate('/projects');
  };

  const filteredProspects = prospects.filter(p => 
    p.phone.includes(searchTerm) || 
    p.notes.toLowerCase().includes(searchTerm.toLowerCase())
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
              placeholder="Rechercher par téléphone ou notes..."
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-black transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProspects.map((prospect) => (
              <div 
                key={prospect.id}
                className="group bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all border border-transparent hover:border-gray-100 relative"
              >
                <div className="absolute top-6 right-6 flex items-center gap-2">
                  <button 
                    onClick={() => handleDelete(prospect.id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                    prospect.status === 'À appeler' ? "bg-blue-50 text-blue-600" :
                    prospect.status === 'Sens 8' ? "bg-purple-50 text-purple-600" : "bg-gray-100 text-gray-400"
                  )}>
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold leading-tight">{prospect.phone || "Sans numéro"}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Maximize className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 font-bold">{prospect.surface || '0'} m²</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-gray-600 line-clamp-3 min-h-[60px]">
                    {prospect.notes || "Aucune note particulière..."}
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {prospect.link ? (
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                      <a 
                        href={prospect.link.startsWith('http') ? prospect.link : `https://${prospect.link}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Lien annonce
                      </a>
                      <button 
                        onClick={() => handleRemoveLink(prospect.id)}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 border border-dashed border-gray-200 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Aucun lien</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <Select 
                    value={prospect.status} 
                    onValueChange={(val: Prospect['status']) => handleStatusChange(prospect.id, val)}
                  >
                    <SelectTrigger className="w-32 h-9 text-[10px] font-bold uppercase rounded-xl border-none bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="À appeler">À appeler</SelectItem>
                      <SelectItem value="Sens 8">Sens 8</SelectItem>
                      <SelectItem value="Sans suite">Sans suite</SelectItem>
                    </SelectContent>
                  </Select>

                  <button 
                    onClick={() => convertToProject(prospect)}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-gray-800 transition-all shadow-md active:scale-95"
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

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 pb-4 bg-gray-50/50">
            <DialogTitle className="text-2xl font-black">Nouveau Prospect</DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
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
                <Label className="text-[10px] font-bold uppercase text-gray-400">Surface (m²)</Label>
                <Input 
                  type="number"
                  placeholder="0"
                  value={formData.surface} 
                  onChange={e => setFormData({...formData, surface: e.target.value})}
                  className="rounded-xl"
                />
              </div>
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

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Statut initial</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val: Prospect['status']) => setFormData({...formData, status: val})}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="À appeler">À appeler</SelectItem>
                  <SelectItem value="Sens 8">Sens 8</SelectItem>
                  <SelectItem value="Sans suite">Sans suite</SelectItem>
                </SelectContent>
              </Select>
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
    </div>
  );
};

export default Prospection;