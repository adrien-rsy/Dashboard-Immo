"use client";

import React from 'react';
import { Search, Menu } from 'lucide-react';
import SyncIndicator from './SyncIndicator';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from './Sidebar';

const TopBar = () => {
  return (
    <div className="h-20 flex items-center justify-between px-4 md:px-8 bg-transparent">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <button className="lg:hidden p-2 hover:bg-white rounded-xl transition-colors">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Bonjour, Adrien</h1>
      </div>
      
      <div className="flex items-center gap-3 md:gap-6">
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 bg-white border border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all w-40 md:w-64"
          />
        </div>

        <SyncIndicator />
      </div>
    </div>
  );
};

export default TopBar;