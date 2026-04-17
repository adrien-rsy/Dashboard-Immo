"use client";

import React from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  Layers, 
  Euro, 
  FileText, 
  Settings, 
  LogOut,
  Users
} from 'lucide-react';
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', active: true },
  { icon: Building2, label: 'Opérations', active: false },
  { icon: Layers, label: 'Gestion des lots', active: false },
  { icon: Euro, label: 'Finances & Bilan', active: false },
  { icon: FileText, label: 'Documents', active: false },
  { icon: Users, label: 'Partenaires', active: false },
];

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  return (
    <div className={cn("w-64 h-full bg-white flex flex-col p-6", className)}>
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
          <Building2 className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-none tracking-tight">ImmoFlow</span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">Marchand de Biens</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              item.active 
                ? "bg-gray-50 text-black font-semibold" 
                : "text-gray-500 hover:bg-gray-50 hover:text-black"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-colors",
              item.active ? "text-black" : "text-gray-400 group-hover:text-black"
            )} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-100 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all duration-200">
          <Settings className="w-5 h-5 text-gray-400" />
          <span className="text-sm">Paramètres</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;