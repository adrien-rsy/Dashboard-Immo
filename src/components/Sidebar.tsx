"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  PieChart, 
  Target, 
  History, 
  Settings, 
  HelpCircle, 
  LogOut,
  TrendingUp
} from 'lucide-react';
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: History, label: 'Transactions', active: false },
  { icon: Wallet, label: 'Accounts', active: false },
  { icon: PieChart, label: 'Budgeting', active: false },
  { icon: Target, label: 'Goals', active: false },
  { icon: TrendingUp, label: 'Reports', active: false },
];

const footerItems = [
  { icon: Settings, label: 'Settings' },
  { icon: HelpCircle, label: 'Help Center' },
  { icon: LogOut, label: 'Log out' },
];

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  return (
    <div className={cn("w-64 h-full bg-white flex flex-col p-6", className)}>
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <Wallet className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight">FinFlow</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
              item.active 
                ? "bg-gray-50 text-black font-medium" 
                : "text-gray-500 hover:bg-gray-50 hover:text-black"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-colors",
              item.active ? "text-black" : "text-gray-400 group-hover:text-black"
            )} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-100 space-y-1">
        <div className="bg-black rounded-2xl p-4 mb-6 text-white relative overflow-hidden group hidden sm:block">
          <div className="relative z-10">
            <h4 className="font-semibold mb-1">Upgrade to Pro</h4>
            <p className="text-xs text-gray-400 mb-3">Get advanced analytics.</p>
            <button className="w-full py-2 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors">
              Upgrade
            </button>
          </div>
        </div>

        {footerItems.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all duration-200"
          >
            <item.icon className="w-5 h-5 text-gray-400" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;