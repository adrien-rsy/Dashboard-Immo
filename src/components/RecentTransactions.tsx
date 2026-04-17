"use client";

import React from 'react';
import { ArrowUpRight, RefreshCcw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const transactions = [
  {
    id: 1,
    name: 'Apple Subscription',
    category: 'Entertainment',
    date: 'Sep 12, 2024',
    amount: '-$14.99',
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=40&h=40&fit=crop'
  },
  {
    id: 2,
    name: 'Salary Deposit',
    category: 'Income',
    date: 'Sep 10, 2024',
    amount: '+$4,500.00',
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=40&h=40&fit=crop'
  },
  {
    id: 3,
    name: 'Starbucks Coffee',
    category: 'Food & Drink',
    date: 'Sep 09, 2024',
    amount: '-$6.50',
    status: 'Pending',
    image: 'https://images.unsplash.com/photo-1544787210-2827443cb69e?w=40&h=40&fit=crop'
  }
];

const RecentTransactions = () => {
  return (
    <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
      <div className="p-6 md:p-8 flex items-center justify-between border-b border-gray-50">
        <h3 className="text-lg font-bold">Recent Transactions</h3>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <RefreshCcw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
      
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wider">
              <th className="px-8 py-4 font-medium">Transaction</th>
              <th className="px-8 py-4 font-medium">Category</th>
              <th className="px-8 py-4 font-medium">Date</th>
              <th className="px-8 py-4 font-medium">Amount</th>
              <th className="px-8 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((tx) => (
              <tr key={tx.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 rounded-xl">
                      <AvatarImage src={tx.image} />
                      <AvatarFallback>{tx.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold">{tx.name}</span>
                  </div>
                </td>
                <td className="px-8 py-4 text-sm text-gray-500">{tx.category}</td>
                <td className="px-8 py-4 text-sm text-gray-500">{tx.date}</td>
                <td className={`px-8 py-4 text-sm font-bold ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'}`}>
                  {tx.amount}
                </td>
                <td className="px-8 py-4">
                  <span className={`
                    px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${tx.status === 'Completed' ? 'bg-gray-100 text-gray-600' : 'bg-amber-50 text-amber-600'}
                  `}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile List */}
      <div className="md:hidden divide-y divide-gray-50">
        {transactions.map((tx) => (
          <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 rounded-xl">
                <AvatarImage src={tx.image} />
                <AvatarFallback>{tx.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{tx.name}</p>
                <p className="text-xs text-gray-500">{tx.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'}`}>
                {tx.amount}
              </p>
              <span className={`
                text-[9px] font-bold uppercase tracking-wider
                ${tx.status === 'Completed' ? 'text-gray-400' : 'text-amber-600'}
              `}>
                {tx.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;