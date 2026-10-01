import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ListChecks, Settings } from 'lucide-react';
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

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const updateResponse = (id: string, response: string) => {
    onChange(items.map(item => item.id === id ? { ...item, response } : item));
  };

  const addItem = () => {
    const label = newLabel.trim();
    if (!label) return;

    onChange([
      ...items,
      {
        id: `ci_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        label,
        response: '',
      },
    ]);
    setNewLabel('');
  };

  const applyTemplate = (template: ChecklistTemplate) => {
    const existingLabels = new Set(items.map(item => item.label.toLowerCase()));
    const newItems: ChecklistItem[] = template.items
      .filter(item => !existingLabels.has(item.label.toLowerCase()))
      .map(item => ({
        id: `ci_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        label: item.label,
        response: '',
      }));

    onChange([...items, ...newItems]);
    setShowTemplates(false);
  };

  const clearAll = () => {
    if (items.length > 0) onChange([]);
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Checklist</span>
            {items.length > 0 && (
              <span className="text-[10px] font-bold text-gray-400">{items.length} critère{items.length > 1 ? 's' : ''}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTemplates(value => !value)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-[10px] font-bold uppercase text-gray-500 transition-colors"
              >
                Templates
                <ChevronDown className={cn('w-3 h-3 transition-transform', showTemplates && 'rotate-180')} />
              </button>

              {showTemplates && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-700 flex items-center justify-between gap-2 transition-colors"
                    >
                      <span>{template.name}</span>
                      <span className="text-[10px] text-gray-400 font-normal">{template.items.length} critères</span>
                    </button>
                  ))}
                  <div className="border-t border-gray-100" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowTemplates(false);
                      setShowEditor(true);
                    }}
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

        {items.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {items.map(item => (
              <div key={item.id} className="group rounded-xl border border-gray-100 bg-white px-3 py-2.5 transition-colors hover:border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <label htmlFor={`checklist-response-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1.5">
                      {item.label}
                    </label>
                    <input
                      id={`checklist-response-${item.id}`}
                      type="text"
                      placeholder="Saisir une réponse…"
                      value={item.response ?? ''}
                      onChange={event => updateResponse(item.id, event.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-base sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Supprimer le critère ${item.label}`}
                    className="mt-0.5 p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-gray-300">
            <ListChecks className="w-8 h-8 mb-2" />
            <p className="text-xs font-semibold">Aucun critère — choisissez un template ou ajoutez-en un manuellement</p>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ajouter un critère..."
            value={newLabel}
            onChange={event => setNewLabel(event.target.value)}
            onKeyDown={event => event.key === 'Enter' && (event.preventDefault(), addItem())}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
          />
          <button
            type="button"
            onClick={addItem}
            disabled={!newLabel.trim()}
            aria-label="Ajouter le critère"
            className="p-2.5 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showEditor && (
        <ChecklistTemplateEditor
          onClose={() => setShowEditor(false)}
          onSaved={updatedTemplates => setTemplates(updatedTemplates)}
        />
      )}
    </>
  );
};

export default ProspectChecklist;
