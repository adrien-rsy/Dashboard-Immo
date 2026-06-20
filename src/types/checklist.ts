export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  items: Omit<ChecklistItem, 'checked'>[];
}

export const DEFAULT_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'visite',
    name: 'Visite terrain',
    items: [
      { id: 'v1', label: 'État général de la façade' },
      { id: 'v2', label: 'Toiture / charpente à vérifier' },
      { id: 'v3', label: 'Humidité visible dans les pièces' },
      { id: 'v4', label: 'Installation électrique aux normes' },
      { id: 'v5', label: 'Plomberie fonctionnelle' },
      { id: 'v6', label: 'Cave / sous-sol accessibles' },
      { id: 'v7', label: 'Parties communes en bon état' },
      { id: 'v8', label: 'DPE et diagnostics obtenus' },
    ]
  },
  {
    id: 'financier',
    name: 'Due diligence financière',
    items: [
      { id: 'f1', label: 'Prix de vente cohérent avec le marché' },
      { id: 'f2', label: 'Estimation travaux réalisée' },
      { id: 'f3', label: 'Frais de notaire calculés' },
      { id: 'f4', label: 'Marge brute > 15%' },
      { id: 'f5', label: 'Financement bancaire envisagé' },
      { id: 'f6', label: 'Charges de copropriété vérifiées' },
      { id: 'f7', label: 'Taxe foncière estimée' },
    ]
  },
  {
    id: 'juridique',
    name: 'Analyse juridique',
    items: [
      { id: 'j1', label: 'Titre de propriété vérifié' },
      { id: 'j2', label: 'Servitudes identifiées' },
      { id: 'j3', label: 'Règlement de copropriété lu' },
      { id: 'j4', label: 'PV AG des 3 dernières années' },
      { id: 'j5', label: 'Absence de procédures en cours' },
      { id: 'j6', label: 'Permis de construire/diviser vérifié' },
    ]
  },
  {
    id: 'travaux',
    name: 'Analyse travaux',
    items: [
      { id: 't1', label: 'Devis entreprise gros œuvre' },
      { id: 't2', label: 'Devis plomberie' },
      { id: 't3', label: 'Devis électricité' },
      { id: 't4', label: 'Devis menuiseries' },
      { id: 't5', label: 'Devis ravalement' },
      { id: 't6', label: 'Planning de chantier estimé' },
      { id: 't7', label: 'Maître d\'œuvre identifié' },
    ]
  }
];
