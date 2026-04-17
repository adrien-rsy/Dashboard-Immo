"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import StatCard from '@/components/StatCard';
import CashFlowChart from '@/components/CashFlowChart';
import UpcomingBills from '@/components/UpcomingBills';
import RecentTransactions from '@/components/RecentTransactions';
import { Calendar as CalendarIcon } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex min-h-screen bg-[#F8F9FB] text-gray-900 font-sans selection:bg-black selection:text-white">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {/* Header Filters */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex bg-white p-1 rounded-2xl shadow-sm">
              {['Day', 'Week', 'Month', 'Year'].map((filter) => (
                <button
                  key={filter}
                  className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filter === 'Month' ? 'bg-gray-400 text-white shadow-md' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl shadow-sm text-sm font-medium text-gray-600 hover:text-black transition-colors">
              <CalendarIcon className="w-4 h-4" />
              <span>1 Sep 2024 - 31 Sep 2024</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              variant="dark"
              title="Total Balance" 
              value="$23,902" 
              change="4.2%" 
              trend="up" 
            />
            <StatCard 
              title="Monthly Income" 
              value="$16,815" 
              change="1.7%" 
              trend="up" 
            />
            <StatCard 
              title="Monthly Expenses" 
              value="$1,457" 
              change="2.9%" 
              trend="down" 
            />
            <StatCard 
              title="Savings Rate" 
              value="2,023" 
              change="0.9%" 
              trend="up" 
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <CashFlowChart />
            </div>
            <div className="lg:col-span-1">
              <UpcomingBills />
            </div>
          </div>

          {/* Bottom Table */}
          <RecentTransactions />
        </div>
      </main>
    </div>
  );
};

export default Index;