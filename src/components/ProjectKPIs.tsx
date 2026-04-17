"use client";

import React from 'react';
import { TrendingUp, Wallet, BarChart3 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface KPIProps {
  label: string;
  value: string;
  subValue?: string;
  icon?: React.ElementType;
  variant?: 'dark' | 'white';
}

const KPICard = ({ label, value, subValue, icon: Icon, variant = 'white' }: KPIProps) => (
  <div className={cn(
    "p-6 rounded-[2rem] transition-all duration-300 hover:shadow-xl flex flex-col justify-between min-h-[160px]",
    variant === 'dark' ? "bg-[#1A1A1A] text-white shadow-2xl shadow-black/20" : "bg-white text-black shadow-sm"
  )}>
    <div className="flex justify-between items-start">
      <p className={cn("text-xs font-bold uppercase tracking-widest", variant === 'dark' ? "text-gray-400" : "text-gray-500")}>
        {label}
      </p>
      {Icon && <Icon className={cn("w-5 h-5", variant === 'dark' ? "text-gray-500" : "text-gray-300")} />}
    </div>
    <div>
      <h3 className="text-3xl font-bold mb-1">{value}</h3>
      {subValue && (
        <p className={cn("text-xs font-medium", variant === 'dark' ? "text-green-400" : "text-gray-400")}>
          {subValue}
        </p>
      )}
    </div>
  </div>
);

const formatEuro = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

const ProjectKPIs = ({ totals }: { totals: any }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <KPICard 
        variant="dark"
        label="Marge Estimée" 
        value={formatEuro(totals.margin)} 
        subValue={`+${totals.profitability.toFixed(1)}% sur coût total`}
        icon={TrendingUp}
      />
      <KPICard 
        label="Coût Total" 
        value={formatEuro(totals.costTotal)} 
        subValue="Budget global de l'opération"
        icon={Wallet}
      />
      <KPICard 
        label="CA Estimé" 
        value={formatEuro(totals.caTotal)} 
        subValue="Total revente prévisionnel"
        icon={BarChart3}
      />
    </div>
  );
};

export default ProjectKPIs;