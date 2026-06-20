import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, CheckSquare, Square, ListChecks, Settings } from 'lucide-react';
import { ChecklistItem, ChecklistTemplate, DEFAULT_TEMPLATES } from '@/types/checklist';
import { cn } from '@/lib/utils';
import ChecklistTemplateEditor from './ChecklistTemplateEditor';

const STORAGE_KEY = 'immo_checklist_templates';

function loadTemplates(): ChecklistTemplate[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

interface ProspectChecklistProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

const ProspectChecklist: React.FC<ProspectChecklistProps> = ({ items, onChange }) => {
  const [newLabel, setNewLabel] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(loadTemplates);

  const checked = items.filter(i => i.checked).length;
  const total = items.length;
  const progress = total > 0 ? Math.round((checked / total) * 100) : 0;

  const toggle = (id: string) => {
    onChange(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const addItem = () => {
    const label = newLabel.trim();
    if (!label) return;
    const newItem: ChecklistItem = {
      id: `ci_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      label,
      checked: false,
    };
    onChange([...items, newItem]);
    setNewLabel('');
  };

  const applyTemplate = (template: ChecklistTemplate) => {
    const existingLabels = new Set(items.map(i => i.label.toLowerCase()));
    const newItems: ChecklistItem[] = template.items
      .filter(ti => !existingLabels.has(ti.label.toLowerCase()))
      .map(ti => ({ id: `ci_${Date.now()}_${Math.random().toString(36).slice(2)}`, label: ti.label, checked: false }));
    onChange([...items, ...newItems]);
    setShowTemplates(false);
  };

  const clearAll = () => {
    if (items.length === 0) return;
    onChange([]);
  };

  return (
    <>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Checklist</span>
            {total > 0 && (
              <span className="text-[10px] font-bold text-gray-400">{checked}/{total}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Templates dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTemplates(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-[10px] font-bold uppercase text-gray-500 transition-colors"
              >
                Templates
                <ChevronDown className={cn("w-3 h-3 transition-transform", showTemplates && "rotate-180")} />
              </button>
              {showTemplates && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  {templates.map(tpl => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-700 flex items-center justify-between gap-2 transition-colors"
                    >
                      <span>{tpl.name}</span>
                      <span className="text-[10px] text-gray-400 font-normal">{tpl.items.length} critères</span>
                    </button>
                  ))}
                  {/* Separator + manage */}
                  <div className="border-t border-gray-100" />
                  <button
                    type="button"
                    onClick={() => { setShowTemplates(false); setShowEditor(true); }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-xs font-bold uppercase text-gray-400 tracking-wider flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Gérer les templates
                  </button>
                </div>
              )}
            </div>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-wider transition-colors"
              >
                Vider
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-gray-400 w-8 text-right">{progress}%</span>
          </div>
        )}

        {/* Items */}
        {items.length > 0 ? (
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {items.map(item => (
              <div
                key={item.id}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {item.checked
                    ? <CheckSquare className="w-5 h-5 text-emerald-500" />
                    : <Square className="w-5 h-5" />}
                </button>
                <span className={cn(
                  "flex-1 text-sm transition-colors",
                  item.checked ? "line-through text-gray-300" : "text-gray-700"
                )}>
                  {item.label}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 rounded-lg transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-gray-300">
            <ListChecks className="w-8 h-8 mb-2" />
            <p className="text-xs font-semibold">Aucun critère — choisissez un template ou ajoutez manuellement</p>
          </div>
        )}

        {/* Add item */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ajouter un critère..."
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem())}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
          />
          <button
            type="button"
            onClick={addItem}
            disabled={!newLabel.trim()}
            className="p-2.5 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Template editor modal */}
      {showEditor && (
        <ChecklistTemplateEditor
          onClose={() => setShowEditor(false)}
          onSaved={(updated) => setTemplates(updated)}
        />
      )}
    </>
  );
};

export default ProspectChecklist;
