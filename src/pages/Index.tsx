"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ProjectKPIs from '@/components/ProjectKPIs';
import LotsTable from '@/components/LotsTable';
import SalesScenarios from '@/components/SalesScenarios';
import CostBreakdown from '@/components/CostBreakdown';
import { MapPin, Calendar, Share2, Download } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-gray-900 font-sans selection:bg-black selection:text-white">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex border-r border-gray-100" />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <div className="flex-1 overflow-y-auto px-4 md:px-10 pb-12">
          {/* Project Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 mt-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                  En cours
                </span>
                <span className="text-xs text-gray-400 font-medium">Réf: OP-2024-082</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-3">Immeuble "Le Renaissance"</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>12 Rue de la République, 69002 Lyon</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Début : Septembre 2024</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-600">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-600">
                <Download className="w-5 h-5" />
              </button>
              <button className="px-6 py-3 bg-black text-white rounded-2xl font-bold shadow-lg shadow-black/10 hover:bg-gray-800 transition-all">
                Éditer l'opération
              </button>
            </div>
          </div>

          {/* KPIs Row */}
          <ProjectKPIs />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            <div className="xl:col-span-2 space-y-8">
              <LotsTable />
              <SalesScenarios />
            </div>
            <div className="xl:col-span-1">
              <CostBreakdown />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;