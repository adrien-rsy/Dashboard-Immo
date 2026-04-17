"use client";

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  variant?: 'dark' | 'light';
}

const StatCard = ({ title, value, change, trend, variant = 'light' }: StatCardProps) => {
  const isDark = variant === 'dark';
  
  return (
    <div className={cn(
      "p-6 rounded-[2rem] transition-all duration-300 hover:shadow-lg",
      isDark ? "bg-black text-white" : "bg-white text-black"
    )}>
      <p className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-500")}>{title}</p>
      <h3 className="text-3xl font-bold mb-4">{value}</h3>
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
          trend === 'up' 
            ? (isDark ? "bg-green-500/20 text-green-400" : "bg-green-50 text-green-600")
            : (isDark ? "bg-red-500/20 text-red-400" : "bg-red-50 text-red-600")
        )}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </div>
        <span className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-400")}>from last month</span>
      </div>
    </div>
  );
};

export default StatCard;