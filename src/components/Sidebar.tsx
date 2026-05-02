"use client";

import React from 'react';
import { Settings, LogOut, Building2, Search as SearchIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Building2, label: 'Mes Projets', path: '/projects' },
    { icon: SearchIcon, label: 'Prospection', path: '/prospection' },
  ];

  return (
    <div className={cn("w-64 h-full bg-white flex flex-col p-6", className)}>
      <div
        className="flex items-center mb-10 px-2 cursor-pointer"
        onClick={() => navigate('/projects')}
      >
        <img
          src="/logo.png"
          alt="Groupe Roussey"
          style={{ height: '120px', width: 'auto' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.removeAttribute('style');
          }}
        />
        <span
          style={{ display: 'none' }}
          className="text-xl font-bold text-gray-900 tracking-tight"
        >
          Groupe Roussey
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/projects' && location.pathname === '/');
          return (
            <button
              key={item.label}
              onClick={() => item.path !== '#' && navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-gray-50 text-black font-semibold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-black"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-black" : "text-gray-400 group-hover:text-black"
                )}
              />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-100 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all duration-200">
          <Settings className="w-5 h-5 text-gray-400" />
          <span className="text-sm">Param&#232;tres</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">D&#233;connexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
