import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ProspectChecklist from '@/components/ProspectChecklist';
import { ChecklistItem } from '@/types/checklist';
import { 
  Plus, 
  Phone, 
  FileText, 
  Link as LinkIcon, 
  MoreHorizontal, 
  Search,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Euro,
  LayoutGrid,
  List,
  ChevronDown,
  GripVertical,
  Building2,
  Calendar,
  X,
  Save,
  CheckCircle2,
  Clock3,
  Eye,
  ListChecks
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Prospect {
  id: string;
  title: string;
  phone: string;
  notes: string;
  link: string;
  status: "À appeler" | "À visiter" | "À étudier" | "En attente";
  created_at?: string;
  checklist?: ChecklistItem[];
}

const statusConfig: Record<Prospect['status'], {
  label: string;
  color: string;
  dot: string;
  icon: React.ElementType;
}> = {
  'À appeler': { label: 'À appeler', color: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-400', icon: Phone },
  'À visiter': { label: 'À visiter', color: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-400', icon: Eye },
  'À étudier': { label: 'À étudier', color: 'bg-violet-50 text-violet-700 border-violet-100', dot: 'bg-violet-400', icon: FileText },
  'En attente': { label: 'En attente', color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400', icon: Clock3 },
};

const statusOrder: Prospect['status'][] = ['À appeler', 'À visiter', 'À étudier', 'En attente'];

const storageKey = 'immo_prospects';

const loadLocalProspects = (): Prospect[] => {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveLocalProspects = (prospects: Prospect[]) => {
  localStorage.setItem(storageKey, JSON.stringify(prospects));
};

const Prospection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [formData, setFormData] = useState<Omit<Prospect, 'id' | 'created_at' | 'checklist'>>({
    title: '',
    phone: '',
    notes: '',
    link: '',
    status: 'À appeler',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const [draggedProspectId, setDraggedProspectId] = useState<string | null>(null);

  const showSuccess = (description: string) => toast({ title: 'Succès', description });
  const showError = (description: string) => toast({ title: 'Erreur', description, variant: 'destructive' });

  const migrateOldStatuses = (items: any[]): Prospect[] => {
    return items.map(item => ({
      ...item,
      checklist: (item.checklist ?? []).map((checklistItem: ChecklistItem & { checked?: boolean }) => ({
        id: checklistItem.id,
        label: checklistItem.label,
        response: checklistItem.response ?? '',
      })),
      status:
        item.status === 'À appeler' ? 'À appeler' :
        item.status === 'Sans suite' ? 'En attente' :
        item.status === 'À visiter' ? 'À visiter' :
        item.status === 'À étudier' ? 'À étudier' : 'En attente',
    }));
  };

  const persistProspects = async (nextProspects: Prospect[]) => {
    saveLocalProspects(nextProspects);
  };

  useEffect(() => {
    const loadProspects = async () => {
      const localProspects = migrateOldStatuses(loadLocalProspects());
      setProspects(localProspects);

      try {
        const { data, error } = await supabase.from('prospects').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (data) {
          const remoteProspects = migrateOldStatuses(data as Prospect[]);
          setProspects(remoteProspects);
          saveLocalProspects(remoteProspects);
        }
      } catch {
        // Le fallback local est volontaire si Supabase n'est pas configuré ou indisponible.
      }
    };

    loadProspects();
  }, []);

  const handleAddProspect = async () => {
    if (!formData.title.trim()) {
      showError('Veuillez renseigner un titre pour le prospect.');
      return;
    }

    const newProspect: Prospect = {
      ...formData,
      id: `prospect_${Date.now()}`,
      created_at: new Date().toISOString(),
      checklist: [],
    };

    const nextProspects = [newProspect, ...prospects];
    setProspects(nextProspects);
    saveLocalProspects(nextProspects);

    try {
      const { data, error } = await supabase.from('prospects').insert([{ ...formData, checklist: [] }]).select();
      if (error) throw error;

      if (data?.[0]) {
        const savedProspect = migrateOldStatuses([data[0]])[0];
        const syncedProspects = [savedProspect, ...prospects];
        setProspects(syncedProspects);
        saveLocalProspects(syncedProspects);
      }
    } catch {
      // Le prospect reste disponible localement si la synchronisation distante échoue.
    }

    setFormData({ title: '', phone: '', notes: '', link: '', status: 'À appeler' });
    setIsAddOpen(false);
    showSuccess('Prospect ajouté avec succès.');
  };

  const handleSaveProspect = async () => {
    if (!editingProspect) return;

    const normalizedProspect: Prospect = {
      ...editingProspect,
      checklist: (editingProspect.checklist ?? []).map(item => ({
        id: item.id,
        label: item.label,
        response: item.response ?? '',
      })),
    };

    const nextProspects = prospects.map(prospect => prospect.id === normalizedProspect.id ? normalizedProspect : prospect);
    setProspects(nextProspects);
    saveLocalProspects(nextProspects);

    try {
      const { error } = await supabase
        .from('prospects')
        .update({
          title: normalizedProspect.title,
          phone: normalizedProspect.phone,
          notes: normalizedProspect.notes,
          link: normalizedProspect.link,
          status: normalizedProspect.status,
          checklist: normalizedProspect.checklist,
        })
        .eq('id', normalizedProspect.id);
      if (error) throw error;
    } catch {
      // La sauvegarde locale reste la source de repli.
    }

    setEditingProspect(null);
    showSuccess('Prospect mis à jour avec succès.');
  };

  const handleDeleteProspect = async (prospect: Prospect) => {
    const nextProspects = prospects.filter(item => item.id !== prospect.id);
    setProspects(nextProspects);
    saveLocalProspects(nextProspects);

    try {
      const { error } = await supabase.from('prospects').delete().eq('id', prospect.id);
      if (error) throw error;
    } catch {
      // La suppression reste effective dans le fallback local.
    }

    if (editingProspect?.id === prospect.id) setEditingProspect(null);
    showSuccess('Prospect supprimé.');
  };

  const updateProspectStatus = async (prospectId: string, status: Prospect['status']) => {
    const nextProspects = prospects.map(prospect => prospect.id === prospectId ? { ...prospect, status } : prospect);
    setProspects(nextProspects);
    saveLocalProspects(nextProspects);

    try {
      const { error } = await supabase.from('prospects').update({ status }).eq('id', prospectId);
      if (error) throw error;
    } catch {
      // La mise à jour locale garantit la continuité d'usage.
    }
  };

  const filteredProspects = prospects.filter(prospect =>
    [prospect.title, prospect.phone, prospect.notes, prospect.status]
      .filter(Boolean)
      .some(value => value.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const getChecklistCompletion = (prospect: Prospect) => {
    const checklist = prospect.checklist ?? [];
    const answered = checklist.filter(item => item.response?.trim()).length;
    return { total: checklist.length, answered };
  };

  const renderProspectCard = (prospect: Prospect) => {
    const cfg = statusConfig[prospect.status] ?? statusConfig['En attente'];
    const StatusIcon = cfg.icon;
    const { total: checklistTotal, answered: checklistAnswered } = getChecklistCompletion(prospect);

    return (
      <div
        key={prospect.id}
        draggable={viewMode === 'kanban'}
        onDragStart={() => setDraggedProspectId(prospect.id)}
        onDragEnd={() => setDraggedProspectId(null)}
        className="group bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:shadow-gray-100/70 transition-all cursor-pointer"
        onClick={() => setEditingProspect(prospect)}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 leading-snug line-clamp-2">{prospect.title}</h3>
            {prospect.phone && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Phone className="w-3 h-3" />{prospect.phone}</p>}
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold whitespace-nowrap ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </div>
        </div>

        <div className="bg-gray-50/50 rounded-2xl p-4 mb-4">
          <p className="text-sm text-gray-600 line-clamp-3 min-h-[60px]">{prospect.notes || 'Aucune note particulière...'}</p>
        </div>

        {checklistTotal > 0 && (
          <div className="mb-4 px-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider flex items-center gap-1"><ListChecks className="w-3 h-3" />Checklist</span>
              <span className="text-[10px] font-bold text-gray-400">{checklistAnswered}/{checklistTotal}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.round((checklistAnswered / checklistTotal) * 100)}%` }} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-50 gap-3">
          {prospect.link ? (
            <a
              href={prospect.link.startsWith('http') ? prospect.link : `https://${prospect.link}`}
              target="_blank"
              rel="noreferrer"
              onClick={event => event.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />Annonce
            </a>
          ) : <span />}
          <button
            type="button"
            onClick={event => {
              event.stopPropagation();
              setEditingProspect(prospect);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />Modifier
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <TopBar title="Prospection" />
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm text-gray-400">Pilotez vos opportunités d'acquisition et centralisez vos analyses.</p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="rounded-xl bg-black hover:bg-gray-800 text-white gap-2">
              <Plus className="w-4 h-4" />Ajouter un prospect
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Rechercher un prospect..." className="pl-9 rounded-xl" />
            </div>
            <div className="flex bg-white border border-gray-100 rounded-xl p-1">
              <button type="button" onClick={() => setViewMode('grid')} className={cn('px-3 py-2 rounded-lg text-xs font-bold transition-colors', viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-700')}><LayoutGrid className="w-4 h-4" /></button>
              <button type="button" onClick={() => setViewMode('kanban')} className={cn('px-3 py-2 rounded-lg text-xs font-bold transition-colors', viewMode === 'kanban' ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-700')}><List className="w-4 h-4" /></button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            filteredProspects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">{filteredProspects.map(renderProspectCard)}</div>
            ) : (
              <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-20 text-center"><Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="font-bold text-gray-600">Aucun prospect trouvé</p><p className="text-sm text-gray-400 mt-1">Ajoutez une première opportunité pour démarrer.</p></div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
              {statusOrder.map(status => {
                const cfg = statusConfig[status];
                const statusProspects = filteredProspects.filter(prospect => prospect.status === status);
                return (
                  <section
                    key={status}
                    onDragOver={event => event.preventDefault()}
                    onDrop={() => {
                      if (draggedProspectId) updateProspectStatus(draggedProspectId, status);
                    }}
                    className="bg-gray-100/60 rounded-3xl p-3 min-h-[260px]"
                  >
                    <div className="flex items-center justify-between px-2 py-2 mb-2"><div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${cfg.dot}`} /><span className="text-xs font-black text-gray-600">{cfg.label}</span></div><span className="text-xs font-bold text-gray-400">{statusProspects.length}</span></div>
                    <div className="space-y-3">{statusProspects.map(renderProspectCard)}</div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>Ajouter un prospect</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><label className="text-sm font-medium">Titre</label><Input value={formData.title} onChange={event => setFormData({ ...formData, title: event.target.value })} placeholder="Ex. Immeuble centre-ville" className="mt-1" /></div>
            <div><label className="text-sm font-medium">Téléphone</label><Input value={formData.phone} onChange={event => setFormData({ ...formData, phone: event.target.value })} placeholder="06…" className="mt-1" /></div>
            <div><label className="text-sm font-medium">Lien de l'annonce</label><Input value={formData.link} onChange={event => setFormData({ ...formData, link: event.target.value })} placeholder="https://…" className="mt-1" /></div>
            <div><label className="text-sm font-medium">Statut</label><select value={formData.status} onChange={event => setFormData({ ...formData, status: event.target.value as Prospect['status'] })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option>À appeler</option><option>À visiter</option><option>À étudier</option><option>En attente</option></select></div>
            <div><label className="text-sm font-medium">Notes</label><Textarea value={formData.notes} onChange={event => setFormData({ ...formData, notes: event.target.value })} placeholder="Informations utiles, points à vérifier…" className="mt-1 min-h-[120px]" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button><Button onClick={handleAddProspect}>Ajouter</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingProspect)} onOpenChange={open => !open && setEditingProspect(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modifier le prospect</DialogTitle></DialogHeader>
          {editingProspect && (
            <div className="space-y-5 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Titre</label><Input value={editingProspect.title} onChange={event => setEditingProspect({ ...editingProspect, title: event.target.value })} className="mt-1" /></div>
                <div><label className="text-sm font-medium">Téléphone</label><Input value={editingProspect.phone} onChange={event => setEditingProspect({ ...editingProspect, phone: event.target.value })} className="mt-1" /></div>
              </div>
              <div><label className="text-sm font-medium">Lien de l'annonce</label><Input value={editingProspect.link} onChange={event => setEditingProspect({ ...editingProspect, link: event.target.value })} className="mt-1" /></div>
              <div><label className="text-sm font-medium">Statut</label><select value={editingProspect.status} onChange={event => setEditingProspect({ ...editingProspect, status: event.target.value as Prospect['status'] })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option>À appeler</option><option>À visiter</option><option>À étudier</option><option>En attente</option></select></div>
              <div><label className="text-sm font-medium">Notes</label><Textarea value={editingProspect.notes} onChange={event => setEditingProspect({ ...editingProspect, notes: event.target.value })} className="mt-1 min-h-[120px]" /></div>
              <div className="bg-gray-50/60 rounded-2xl p-5"><ProspectChecklist items={editingProspect.checklist ?? []} onChange={items => setEditingProspect({ ...editingProspect, checklist: items })} /></div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-3"><Button variant="outline" onClick={() => editingProspect && handleDeleteProspect(editingProspect)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4 mr-2" />Supprimer</Button><div className="flex-1" /><Button variant="outline" onClick={() => setEditingProspect(null)}>Annuler</Button><Button onClick={handleSaveProspect}><Save className="w-4 h-4 mr-2" />Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prospection;
