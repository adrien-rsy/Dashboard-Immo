"use client";

import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TopBar = () => {
  return (
    <div className="h-20 flex items-center justify-between px-8 bg-transparent">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="pl-10 pr-4 py-2 bg-white border border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all w-64"
          />
        </div>
        
        <button className="relative p-2 text-gray-500 hover:bg-white rounded-xl transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-50" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer group">
          <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
            <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-semibold leading-none">Jane Doe</p>
            <p className="text-xs text-gray-500 mt-1">Premium Member</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default TopBar;