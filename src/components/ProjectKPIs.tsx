"use client";

import React from 'react';
import { TrendingUp, Clock, Wallet, Target, BarChart3 } from 'lucide-react';
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

const ProjectKPIs = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      <KPICard 
        variant="dark"
        label="Marge Estimée" 
        value="93 400 €" 
        subValue="+15.3% du CA"
        icon={TrendingUp}
      />
      <KPICard 
        label="Coût Total" 
        value="516 600 €" 
        subValue="Budget maîtrisé"
        icon={Wallet}
      />
      <KPICard 
        label="Prix d'Achat" 
        value="320 000 €" 
        subValue="Net vendeur"
        icon={Target}
      />
      <KPICard 
        label="Durée Portage" 
        value="14 mois" 
        subValue="Fin estimée : Nov 2025"
        icon={Clock}
      />
      <KPICard 
        label="CA Estimé" 
        value="610 000 €" 
        subValue="4 lots identifiés"
        icon={BarChart3}
      />
      <KPICard 
        label="Rentabilité" 
        value="18.1 %" 
        subValue="Objectif : > 15%"
        icon={TrendingUp}
      />
    </div>
  );
};

export default ProjectKPIs;