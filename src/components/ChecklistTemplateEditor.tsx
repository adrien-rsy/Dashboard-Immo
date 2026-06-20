import React, { useState } from 'react';
import { Plus, Trash2, X, Pencil, Check, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { ChecklistTemplate, DEFAULT_TEMPLATES } from '@/types/checklist';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'immo_checklist_templates';

function loadTemplates(): ChecklistTemplate[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

function saveTemplates(tpls: ChecklistTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tpls));
}

interface Props {
  onClose: () => void;
  onSaved: (templates: ChecklistTemplate[]) => void;
}

const ChecklistTemplateEditor: React.FC<Props> = ({ onClose, onSaved }) => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(loadTemplates);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<{ id: string; value: string } | null>(null);
  const [newItemLabels, setNewItemLabels] = useState<Record<string, string>>({});
  const [newTplName, setNewTplName] = useState('');

  const update = (tpls: ChecklistTemplate[]) => {
    setTemplates(tpls);
  };

  const save = () => {
    saveTemplates(templates);
    onSaved(templates);
    onClose();
  };

  // --- Template-level actions ---
  const addTemplate = () => {
    const name = newTplName.trim();
    if (!name) return;
    const newTpl: ChecklistTemplate = {
      id: `tpl_${Date.now()}`,
      name,
      items: []
    };
    const updated = [...templates, newTpl];
    update(updated);
    setExpandedId(newTpl.id);
    setNewTplName('');
  };

  const deleteTemplate = (id: string) => {
    update(templates.filter(t => t.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const startRename = (tpl: ChecklistTemplate) => {
    setEditingName({ id: tpl.id, value: tpl.name });
  };

  const confirmRename = () => {
    if (!editingName) return;
    const trimmed = editingName.value.trim();
    if (!trimmed) { setEditingName(null); return; }
    update(templates.map(t => t.id === editingName.id ? { ...t, name: trimmed } : t));
    setEditingName(null);
  };

  // --- Item-level actions ---
  const addItemToTemplate = (tplId: string) => {
    const label = (newItemLabels[tplId] ?? '').trim();
    if (!label) return;
    update(templates.map(t => t.id !== tplId ? t : {
      ...t,
      items: [...t.items, { id: `ti_${Date.now()}_${Math.random().toString(36).slice(2)}`, label }]
    }));
    setNewItemLabels(prev => ({ ...prev, [tplId]: '' }));
  };

  const removeItemFromTemplate = (tplId: string, itemId: string) => {
    update(templates.map(t => t.id !== tplId ? t : {
      ...t,
      items: t.items.filter(i => i.id !== itemId)
    }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg bg-white sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-black">Gérer les templates</h2>
            <p className="text-xs text-gray-400 mt-0.5">{templates.length} template{templates.length > 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {templates.map(tpl => (
            <div key={tpl.id} className="rounded-2xl border border-gray-100 overflow-hidden">
              {/* Template header row */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50/80">
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === tpl.id ? null : tpl.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {expandedId === tpl.id
                    ? <ChevronDown className="w-4 h-4" />
                    : <ChevronRight className="w-4 h-4" />}
                </button>

                {editingName?.id === tpl.id ? (
                  <input
                    autoFocus
                    value={editingName.value}
                    onChange={e => setEditingName({ ...editingName, value: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setEditingName(null); }}
                    onBlur={confirmRename}
                    className="flex-1 text-sm font-bold bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                ) : (
                  <span className="flex-1 text-sm font-bold text-gray-800">{tpl.name}</span>
                )}

                <span className="text-[10px] text-gray-400 font-semibold">{tpl.items.length} critères</span>

                <button
                  type="button"
                  onClick={() => startRename(tpl)}
                  className="p-1.5 text-gray-300 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteTemplate(tpl.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Items (expanded) */}
              {expandedId === tpl.id && (
                <div className="px-4 py-3 space-y-1.5 bg-white">
                  {tpl.items.length === 0 && (
                    <p className="text-xs text-gray-300 italic py-2 text-center">Aucun critère — ajoutez-en ci-dessous</p>
                  )}
                  {tpl.items.map(item => (
                    <div key={item.id} className="group flex items-center gap-2 py-1.5">
                      <GripVertical className="w-3.5 h-3.5 text-gray-200 flex-shrink-0" />
                      <span className="flex-1 text-sm text-gray-700">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => removeItemFromTemplate(tpl.id, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {/* Add item to template */}
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="Nouveau critère..."
                      value={newItemLabels[tpl.id] ?? ''}
                      onChange={e => setNewItemLabels(prev => ({ ...prev, [tpl.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItemToTemplate(tpl.id))}
                      className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => addItemToTemplate(tpl.id)}
                      disabled={!(newItemLabels[tpl.id] ?? '').trim()}
                      className="p-2 bg-black text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add template */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nom du nouveau template..."
              value={newTplName}
              onChange={e => setNewTplName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTemplate())}
              className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={addTemplate}
              disabled={!newTplName.trim()}
              className="px-4 py-2.5 bg-black text-white rounded-xl text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Créer
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-200 transition-all"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={save}
            className="flex-1 py-3 bg-black text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChecklistTemplateEditor;
