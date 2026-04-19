"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Plus, Home, Maximize, Trash2, Camera, MapPin, Layers } from "lucide-react";

const formatEuro = (val: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(val);

const GROUP_COLORS = ["#417078", "#c09068"];

const LOT_TYPES = [
  "Appartement",
  "Maison",
  "Combles",
  "Plateaux",
  "Local commercial",
];

const LotsTable = ({
  lots,
  scenarios,
  activeScenarioId,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingLot, setEditingLot] = React.useState<any>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    type: "Appartement",
    level: "",
    surface: "",
    status: "Disponible",
    price: "",
    notes: "",
    isOccupied: false,
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setIsAddOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(editingLot.id, formData);
    setEditingLot(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "Appartement",
      level: "",
      surface: "",
      status: "Disponible",
      price: "",
      notes: "",
      isOccupied: false,
    });
  };

  const openEdit = (lot: any) => {
    setEditingLot(lot);
    setFormData({
      name: lot.name,
      type: lot.type || "Appartement",
      level: lot.level || "",
      surface: lot.surface || "",
      status: lot.status || "Disponible",
      price: lot.prices[activeScenarioId] || "",
      notes: lot.notes || "",
      isOccupied: lot.isOccupied || false,
    });
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
      <div className="p-8 flex items-center justify-between border-b border-gray-50">
        <div>
          <h3 className="text-xl font-bold">Détail des lots</h3>
          <p className="text-sm text-gray-500 mt-1">Prix estimés par scénario</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10 active:scale-[0.98]">
              <Plus className="w-4 h-4" />
              Ajouter un lot
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-8 pb-4 bg-gray-50/50">
              <DialogTitle className="text-2xl font-black">Nouveau Lot</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-bold uppercase text-gray-400">Nom du lot</Label>
                  <Input
                    id="name"
                    placeholder="ex: Lot 05"
                    className="rounded-xl border-gray-100 focus:ring-black"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-[10px] font-bold uppercase text-gray-400">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                  >
                    <SelectTrigger className="rounded-xl border-gray-100 focus:ring-black">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {LOT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="surface" className="text-[10px] font-bold uppercase text-gray-400">Surface (m²)</Label>
                  <Input
                    id="surface"
                    type="number"
                    placeholder="45"
                    className="rounded-xl border-gray-100 focus:ring-black"
                    value={formData.surface}
                    onChange={(e) =>
                      setFormData({ ...formData, surface: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-[10px] font-bold uppercase text-gray-400">Prix de base (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="150000"
                    className="rounded-xl border-gray-100 focus:ring-black"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level" className="text-[10px] font-bold uppercase text-gray-400">Niveau / Étage</Label>
                <Input
                  id="level"
                  placeholder="ex: 1er étage"
                  className="rounded-xl border-gray-100 focus:ring-black"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                />
              </div>

              <DialogFooter className="pt-4">
                <button type="submit" className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-xl shadow-black/20 hover:bg-gray-800 transition-all active:scale-[0.98]">
                  Enregistrer le lot
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold border-b border-gray-50">
              <th className="px-8 py-5">Lot</th>
              <th className="px-8 py-5">Surface</th>
              {scenarios.map((s) => (
                <th key={s.id} className="px-8 py-5 text-center">{s.name}</th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {lots.map((lot) => (
              <tr
                key={lot.id}
                className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                onClick={() => openEdit(lot)}
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 text-gray-500 group-hover:bg-white transition-colors">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{lot.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-gray-400 font-medium">
                          {lot.type} - {lot.level}
                        </p>
                        {lot.isOccupied && (
                          <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-bold rounded uppercase">Occupé</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Maximize className="w-3 h-3 text-gray-400" />
                    {lot.surface} m²
                  </div>
                </td>

                {scenarios.map((s) => {
                  const groupIndex = s.groupedSales?.findIndex((g: any) => g.lotIds.includes(lot.id));
                  const isGrouped = groupIndex !== -1;
                  const group = isGrouped ? s.groupedSales[groupIndex] : null;
                  const groupColor = isGrouped ? (GROUP_COLORS[groupIndex] || GROUP_COLORS[0]) : null;

                  return (
                    <td key={s.id} className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={cn(
                            "text-sm font-bold",
                            s.id === activeScenarioId ? "text-black" : "text-gray-400"
                          )}
                          style={isGrouped ? { color: groupColor } : {}}
                        >
                          {isGrouped
                            ? formatEuro(group.price)
                            : formatEuro(lot.prices[s.id] || 0)}
                        </span>
                        {isGrouped && (
                          <span
                            className="px-1.5 py-0.5 text-white text-[8px] font-black uppercase rounded shadow-sm"
                            style={{ backgroundColor: groupColor }}
                          >
                            Groupé
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog - Styled like Scenario Dialog */}
      <Dialog open={!!editingLot} onOpenChange={(open) => !open && setEditingLot(null)}>
        <DialogContent className="sm:max-w-[850px] rounded-[2.5rem] h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
          {editingLot && (
            <>
              <DialogHeader className="p-8 pb-4 bg-gray-50/50 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                      <Home className="text-white w-5 h-5" />
                    </div>
                    <DialogTitle className="text-2xl font-black">
                      Fiche Lot : {editingLot.name}
                    </DialogTitle>
                  </div>
                  <button 
                    onClick={() => {
                      if(confirm("Voulez-vous vraiment supprimer ce lot ?")) {
                        onDelete(editingLot.id);
                        setEditingLot(null);
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 min-h-0">
                <div className="p-8 space-y-10">
                  {/* Section Description en haut */}
                  <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                    <h4 className="text-sm font-black uppercase tracking-widest text-black mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-black rounded-full" />
                      Description & Notes
                    </h4>
                    <Textarea 
                      placeholder="Ajoutez une description détaillée du lot..."
                      className="rounded-2xl border-gray-200 focus:ring-black min-h-[120px] bg-white text-sm"
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>

                  {/* Détails du lot */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-black rounded-full" />
                        Caractéristiques
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-gray-400">Nom</Label>
                          <Input 
                            className="rounded-xl"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-gray-400">Type</Label>
                          <Select 
                            value={formData.type} 
                            onValueChange={(val) => setFormData({ ...formData, type: val })}
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {LOT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-gray-400">Surface (m²)</Label>
                          <div className="relative">
                            <Input 
                              type="number"
                              className="rounded-xl pr-10"
                              value={formData.surface}
                              onChange={e => setFormData({...formData, surface: e.target.value})}
                            />
                            <Maximize className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-gray-400">Niveau</Label>
                          <div className="relative">
                            <Input 
                              className="rounded-xl pr-10"
                              value={formData.level}
                              onChange={e => setFormData({...formData, level: e.target.value})}
                            />
                            <Layers className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-black rounded-full" />
                        Statut & Commercialisation
                      </h4>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              formData.isOccupied ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                            )}>
                              {formData.isOccupied ? <MapPin className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold">Occupation</span>
                              <span className="text-[10px] text-gray-500">{formData.isOccupied ? 'Lot actuellement occupé' : 'Lot libre de toute occupation'}</span>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, isOccupied: !formData.isOccupied})}
                            className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all",
                              formData.isOccupied ? "bg-amber-600 text-white" : "bg-white text-gray-400 border border-gray-100"
                            )}
                          >
                            {formData.isOccupied ? 'Occupé' : 'Libre'}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-gray-400">Statut Vente</Label>
                            <Select 
                              value={formData.status} 
                              onValueChange={(val) => setFormData({ ...formData, status: val })}
                            >
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="Disponible">Disponible</SelectItem>
                                <SelectItem value="Optionné">Optionné</SelectItem>
                                <SelectItem value="Vendu">Vendu</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-gray-400">Prix de base (€)</Label>
                            <Input 
                              type="number"
                              className="rounded-xl font-bold"
                              value={formData.price}
                              onChange={e => setFormData({...formData, price: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Galerie Photos */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-black rounded-full" />
                        Galerie Photos
                      </h4>
                      <button className="flex items-center gap-1 text-[10px] font-bold uppercase text-black hover:bg-gray-50 px-2 py-1 rounded-lg transition-all">
                        <Camera className="w-3 h-3" />
                        Gérer les photos
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="aspect-square bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex items-center justify-center relative group overflow-hidden">
                          <img 
                            src={`https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&q=80&w=400&index=${i}`} 
                            alt={`Lot ${i}`}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      ))}
                      <button className="aspect-square bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-black hover:border-black transition-all group">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase">Ajouter</span>
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100 shrink-0">
                <button 
                  onClick={handleEditSubmit}
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-xl shadow-black/20 hover:bg-gray-800 transition-all active:scale-[0.98]"
                >
                  Mettre à jour la fiche
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LotsTable;