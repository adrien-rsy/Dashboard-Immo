import React, { useState } from 'react';
import { Plus, Trash2, Calculator, TrendingUp, Home, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LotRevente {
  id: string;
  nom: string;
  prix: number | '';
}

export interface ChiffrageData {
  lots: LotRevente[];
  prixAcquisition: number | '';
  fraisNotaireReduit: boolean;
  travaux: number | '';
  autresFrais: number | '';
}

export const defaultChiffrage = (): ChiffrageData => ({
  lots: [],
  prixAcquisition: '',
  fraisNotaireReduit: true,
  travaux: '',
  autresFrais: '',
});

interface Props {
  data: ChiffrageData;
  onChange: (data: ChiffrageData) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const parseNum = (v: number | ''): number => (v === '' ? 0 : Number(v));

const NumInput = ({
  value,
  onChange,
  placeholder,
  prefix,
}: {
  value: number | '';
  onChange: (v: number | '') => void;
  placeholder?: string;
  prefix?: React.ReactNode;
}) => (
  <div className="relative">
    {prefix && (
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{prefix}</span>
    )}
    <input
      type="number"
      min={0}
      placeholder={placeholder ?? '0'}
      value={value === '' ? '' : value}
      onChange={e => onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
      className={cn(
        'w-full bg-white border border-gray-100 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300 py-2.5',
        prefix ? 'pl-8 pr-3' : 'px-3'
      )}
    />
  </div>
);

const ProspectChiffrage: React.FC<Props> = ({ data, onChange }) => {
  const [newLotNom, setNewLotNom] = useState('');
  const [newLotPrix, setNewLotPrix] = useState<number | ''>('');

  const totalCA = data.lots.reduce((s, l) => s + parseNum(l.prix), 0);
  const acq = parseNum(data.prixAcquisition);
  const tauxNotaire = data.fraisNotaireReduit ? 0.03 : 0.08;
  const fraisNotaire = Math.round(acq * tauxNotaire);
  const travaux = parseNum(data.travaux);
  const autresFrais = parseNum(data.autresFrais);
  const totalCout = acq + fraisNotaire + travaux + autresFrais;
  const marge = totalCout > 0 ? ((totalCA - totalCout) / totalCout) * 100 : null;
  const margeAbs = totalCA - totalCout;
  const margePositive = margeAbs >= 0;

  const addLot = () => {
    const nom = newLotNom.trim();
    if (!nom) return;
    const newLot: LotRevente = {
      id: `lot_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      nom,
      prix: newLotPrix,
    };
    onChange({ ...data, lots: [...data.lots, newLot] });
    setNewLotNom('');
    setNewLotPrix('');
  };

  const removeLot = (id: string) => {
    onChange({ ...data, lots: data.lots.filter(l => l.id !== id) });
  };

  const updateLot = (id: string, field: 'nom' | 'prix', value: string | number | '') => {
    onChange({
      ...data,
      lots: data.lots.map(l => (l.id === id ? { ...l, [field]: value } : l)),
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Calculator className="w-4 h-4 text-gray-400" />
        <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Chiffrage</span>
      </div>

      {/* ——— REVENTE ——— */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Revente</span>
        </div>

        {/* Lots existants */}
        {data.lots.length > 0 && (
          <div className="space-y-2">
            {data.lots.map(lot => (
              <div key={lot.id} className="group flex items-center gap-2">
                <input
                  type="text"
                  value={lot.nom}
                  onChange={e => updateLot(lot.id, 'nom', e.target.value)}
                  placeholder="Nom du lot"
                  className="flex-1 bg-white border border-gray-100 rounded-xl text-base sm:text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                />
                <div className="relative w-36">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">€</span>
                  <input
                    type="number"
                    min={0}
                    value={lot.prix === '' ? '' : lot.prix}
                    onChange={e => updateLot(lot.id, 'prix', e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0"
                    className="w-full bg-white border border-gray-100 rounded-xl text-base sm:text-sm pl-7 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLot(lot.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 rounded-xl transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Ajouter un lot */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nom du lot (ex: T3 Lot 1)"
            value={newLotNom}
            onChange={e => setNewLotNom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLot())}
            className="flex-1 bg-white border border-gray-100 rounded-xl text-base sm:text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
          />
          <div className="relative w-36">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">€</span>
            <input
              type="number"
              min={0}
              placeholder="Prix"
              value={newLotPrix === '' ? '' : newLotPrix}
              onChange={e => setNewLotPrix(e.target.value === '' ? '' : parseFloat(e.target.value))}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLot())}
              className="w-full bg-white border border-gray-100 rounded-xl text-base sm:text-sm pl-7 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
            />
          </div>
          <button
            type="button"
            onClick={addLot}
            disabled={!newLotNom.trim()}
            className="p-2.5 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Total CA */}
        <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-3">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">CA total (revente)</span>
          <span className="text-sm font-black text-emerald-700">{fmt(totalCA)}</span>
        </div>
      </div>

      {/* Séparateur */}
      <div className="border-t border-gray-100" />

      {/* ——— COÛTS ——— */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Coûts</span>
        </div>

        {/* Prix acquisition */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Prix d'acquisition FAI</label>
          <NumInput
            value={data.prixAcquisition}
            onChange={v => onChange({ ...data, prixAcquisition: v })}
            placeholder="ex: 180000"
            prefix={<span className="text-sm">€</span>}
          />
        </div>

        {/* Frais de notaire */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
              Frais de notaire
              <span className="ml-2 text-gray-500 font-black">({data.fraisNotaireReduit ? '3%' : '8%'})</span>
            </label>
            <button
              type="button"
              onClick={() => onChange({ ...data, fraisNotaireReduit: !data.fraisNotaireReduit })}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all',
                data.fraisNotaireReduit
                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  : 'bg-orange-50 text-orange-500 hover:bg-orange-100'
              )}
            >
              {data.fraisNotaireReduit ? 'Frais réduits (3%)' : 'Frais pleins (8%)'}
            </button>
          </div>
          <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
            <span className="text-gray-400 text-sm mr-2">€</span>
            <span className="text-sm font-semibold text-gray-500">
              {acq > 0 ? fmt(fraisNotaire) : '—'}
            </span>
            <span className="ml-auto text-[10px] text-gray-300 font-medium">calculé automatiquement</span>
          </div>
        </div>

        {/* Travaux */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Travaux</label>
          <NumInput
            value={data.travaux}
            onChange={v => onChange({ ...data, travaux: v })}
            placeholder="Budget travaux"
            prefix={<span className="text-sm">€</span>}
          />
        </div>

        {/* Autres frais */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Autres frais</label>
          <NumInput
            value={data.autresFrais}
            onChange={v => onChange({ ...data, autresFrais: v })}
            placeholder="Honoraires, géomètre..."
            prefix={<span className="text-sm">€</span>}
          />
        </div>

        {/* Total coûts */}
        <div className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-3">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Coût total opération</span>
          <span className="text-sm font-black text-orange-600">{fmt(totalCout)}</span>
        </div>
      </div>

      {/* ——— RÉSULTAT ——— */}
      {(totalCA > 0 || totalCout > 0) && (
        <>
          <div className="border-t border-gray-100" />
          <div className={cn(
            'rounded-2xl px-5 py-4 space-y-2',
            margePositive ? 'bg-emerald-50' : 'bg-red-50'
          )}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className={cn('w-4 h-4', margePositive ? 'text-emerald-600' : 'text-red-500')} />
              <span className={cn('text-[10px] font-bold uppercase tracking-wider', margePositive ? 'text-emerald-600' : 'text-red-500')}>
                Résultat prévisionnel
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={cn('text-xs font-semibold', margePositive ? 'text-emerald-700' : 'text-red-600')}>Marge brute</span>
              <span className={cn('text-sm font-black', margePositive ? 'text-emerald-700' : 'text-red-600')}>
                {fmt(margeAbs)}
              </span>
            </div>
            {marge !== null && (
              <div className="flex items-center justify-between">
                <span className={cn('text-xs font-semibold', margePositive ? 'text-emerald-700' : 'text-red-600')}>% sur coût</span>
                <span className={cn('text-lg font-black', margePositive ? 'text-emerald-700' : 'text-red-600')}>
                  {marge > 0 ? '+' : ''}{marge.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProspectChiffrage;
