"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'Jan', value: 7200 },
  { name: 'Feb', value: 6400 },
  { name: 'Mar', value: 8900 },
  { name: 'Apr', value: 5800 },
  { name: 'May', value: 8200 },
  { name: 'Jun', value: 4500 },
];

const CashFlowChart = () => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold">Monthly Cash Flow</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-black" />
            <span className="text-xs text-gray-500">Income</span>
          </div>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip 
              cursor={{ fill: '#F9FAFB' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 2 ? '#000000' : '#E5E7EB'} className="hover:fill-black transition-colors duration-300" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CashFlowChart;