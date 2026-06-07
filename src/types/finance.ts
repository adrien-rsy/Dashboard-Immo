export type CategorieFinance = 'Cash' | 'Épargne' | 'Investissement' | 'Pro';

export interface LigneCompte {
  id: string;
  nom: string;
  categorie: CategorieFinance;
  montant: number;
}

export interface Releve {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  lignes: LigneCompte[];
  note?: string;
}

export interface ObjectifPatrimoine {
  montant: number;
}

export const CATEGORIES: CategorieFinance[] = ['Cash', 'Épargne', 'Investissement', 'Pro'];

export const CATEGORIE_COLORS: Record<CategorieFinance, string> = {
  Cash: '#374151',
  Épargne: '#6B7280',
  Investissement: '#111827',
  Pro: '#9CA3AF',
};

export function aggregateByCategorie(lignes: LigneCompte[]): Record<CategorieFinance, number> {
  return CATEGORIES.reduce((acc, cat) => {
    acc[cat] = lignes.filter(l => l.categorie === cat).reduce((s, l) => s + l.montant, 0);
    return acc;
  }, {} as Record<CategorieFinance, number>);
}

export function totalReleve(releve: Releve): number {
  return releve.lignes.reduce((s, l) => s + l.montant, 0);
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}
