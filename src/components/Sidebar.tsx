"use client";

import React from 'react';
import { Settings, LogOut, Building2, Search as SearchIcon, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';

const Sidebar = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, toggle } = useSidebar();

  const navItems = [
    { icon: Building2, label: 'Mes Projets', path: '/projects' },
    { icon: SearchIcon, label: 'Prospection', path: '/prospection' },
    { icon: TrendingUp, label: 'Finance', path: '/finance' },
  ];

  return (
    <div
      className={cn(
        'h-full bg-white flex flex-col transition-all duration-300 ease-in-out relative',
        collapsed ? 'w-[72px] p-3' : 'w-64 p-6',
        className
      )}
    >
      {/* Toggle button — ancré sur le bord droit de la sidebar */}
      <button
        onClick={toggle}
        aria-label={collapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
        className="absolute -right-3 top-8 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300"
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-gray-500" />
          : <ChevronLeft className="w-3 h-3 text-gray-500" />}
      </button>

      {/* Logo */}
      <div
        className={cn(
          'flex items-center justify-center cursor-pointer w-full transition-all duration-300',
          collapsed ? 'mb-6' : 'mb-10'
        )}
        onClick={() => navigate('/projects')}
      >
        <img
          src="/logo.png"
          alt="Groupe Roussey"
          style={{ height: collapsed ? '36px' : '120px', width: 'auto', transition: 'height 0.3s ease' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const next = e.currentTarget.nextElementSibling as HTMLElement | null;
            if (next) next.removeAttribute('style');
          }}
        />
        <span
          style={{ display: 'none' }}
          className="text-xl font-bold text-gray-900 tracking-tight"
        >
          GR
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/projects' && location.pathname === '/');
          return (
            <button
              key={item.label}
              onClick={() => item.path !== '#' && navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'w-full flex items-center transition-all duration-200 group rounded-xl',
                collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3',
                isActive
                  ? 'bg-gray-50 text-black font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-black'
              )}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 transition-colors shrink-0',
                  isActive ? 'text-black' : 'text-gray-400 group-hover:text-black'
                )}
              />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn('mt-auto pt-6 border-t border-gray-100 space-y-1')}>
        <button
          title={collapsed ? 'Paramètres' : undefined}
          className={cn(
            'w-full flex items-center rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all duration-200',
            collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
          )}
        >
          <Settings className="w-5 h-5 text-gray-400 shrink-0" />
          {!collapsed && <span className="text-sm">Paramètres</span>}
        </button>
        <button
          title={collapsed ? 'Déconnexion' : undefined}
          className={cn(
            'w-full flex items-center rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200',
            collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
