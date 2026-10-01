// Types pour la checklist de prospection

export interface ChecklistItem {
  id: string;
  label: string;
  response?: string; // Réponse texte au critère (remplace checked: boolean)
}

export interface ChecklistTemplateItem {
  id: string;
  label: string;
}

export interface ProspectChecklistData {
  items: ChecklistItem[];
  templateId?: string;
}
