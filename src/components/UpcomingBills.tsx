"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const days = [
  { date: 17, day: 'Tue', active: false },
  { date: 18, day: 'Wed', active: false },
  { date: 19, day: 'Thu', active: true },
  { date: 20, day: 'Fri', active: false },
  { date: 21, day: 'Sat', active: false },
];

const UpcomingBills = () => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-50 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
          <h3 className="text-sm font-bold">September 2024</h3>
          <button className="p-1 hover:bg-gray-50 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-8">
        {days.map((item) => (
          <div key={item.date} className="text-center">
            <p className="text-[10px] text-gray-400 uppercase mb-3">{item.day}</p>
            <div className={`
              w-10 h-14 mx-auto rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300
              ${item.active ? 'bg-black text-white shadow-lg shadow-black/20' : 'text-gray-900 hover:bg-gray-50'}
            `}>
              {item.date}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold">Savings Goal</h4>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-500 font-medium">↑ 0.9%</span> from last month
            </p>
          </div>
          <div className="relative w-12 h-12">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                className="text-gray-100"
                strokeDasharray="100, 100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-black"
                strokeDasharray="65, 100"
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">65%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingBills;