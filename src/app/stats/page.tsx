"use client";

import React, { useState, useEffect } from 'react';
import { format, isSameMonth, parseISO, subMonths, addMonths } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Transaction } from '@/lib/types';
import { useSWRData } from '@/hooks/useSWRData';
import { FirebaseExpenditure } from '@/lib/firebaseDataStructure';

type MonthlyStat = { month: string; income: number; expense: number; net: number };

const COLORS = ['#FFD600', '#FFB300', '#FF7043', '#8D6E63', '#29B6F6', '#66BB6A', '#AB47BC', '#EC407A'];

function getMonthRange(transactions: Transaction[]): string[] {
  const months = Array.from(new Set(transactions.map(t => format(parseISO(t.date), 'yyyy-MM'))));
  return months.sort().reverse();
}

function getMonthlyStats(transactions: Transaction[]): MonthlyStat[] {
  const stats: { [month: string]: { month: string; income: number; expense: number } } = {};
  transactions.forEach((t: Transaction) => {
    const month = format(parseISO(t.date), 'yyyy-MM');
    if (!stats[month]) stats[month] = { month, income: 0, expense: 0 };
    if (t.type === 'income') stats[month].income += t.amount;
    if (t.type === 'expense') stats[month].expense += t.amount;
  });
  return Object.values(stats).map((s) => ({ ...s, net: s.income - s.expense })).sort((a, b) => b.month.localeCompare(a.month));
}

// Utility hook to detect mobile (SSR safe)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function StatsPage() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const { transactions, loading } = useSWRData();
  const isMobile = useIsMobile();

  // Combine transactions and expenditure data
  const allTransactions = [
    ...transactions,
    // Convert expenditure to transaction format for stats
    ...([] as FirebaseExpenditure[]).map(exp => ({
      id: exp.id,
      description: exp.description,
      amount: exp.amount,
      type: 'expense' as const,
      category: exp.category,
      date: exp.date,
      createdAt: exp.createdAt,
      updatedAt: exp.updatedAt,
    }))
  ];

  // Filter for selected month
  const filtered = allTransactions.filter(t => isSameMonth(parseISO(t.date), selectedMonth));

  // Pie chart data (category breakdown)
  const expenseByCategory: { [category: string]: number } = {};
  filtered.filter(t => t.type === 'expense').forEach(t => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
  });
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  // Monthly trend data
  const monthlyStats = getMonthlyStats(allTransactions).reverse();

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Monthly Breakdown & Analytics</h1>
      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading your stats...</div>
      ) : (
        <>
          {/* Month Selector */}
          <div className="flex items-center gap-2 mb-6">
            <button
              className="px-2 py-1 rounded bg-accent text-accent-foreground border border-border"
              onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
            >
              &lt;
            </button>
            <span className="font-semibold text-card-foreground text-lg">{format(selectedMonth, 'MMMM yyyy')}</span>
            <button
              className="px-2 py-1 rounded bg-accent text-accent-foreground border border-border"
              onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
              disabled={format(selectedMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM')}
            >
              &gt;
            </button>
          </div>
          {/* Pie Chart: Spending Breakdown */}
          <Card borderless className="mb-8">
            <CardHeader>
              <CardTitle>Spending Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full aspect-[4/3] sm:aspect-[16/9] max-w-full">
                {pieData.length === 0 ? (
                  <div className="text-muted-foreground">No expense data for this month.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={isMobile ? '60%' : '70%'}
                        label={isMobile ? false : ({ name }) => name}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      {!isMobile && <Legend wrapperStyle={{ fontSize: '0.85rem' }} />}
                      <Tooltip wrapperStyle={{ fontSize: '0.85rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Line/Bar Chart: Monthly Trends */}
          <Card borderless className="mb-8">
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full aspect-[4/3] sm:aspect-[16/9] max-w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyStats} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={m => format(parseISO(m + '-01'), 'MMM yy')} tick={{ fontSize: isMobile ? 10 : 12 }} />
                    <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                    <Tooltip wrapperStyle={{ fontSize: '0.85rem' }} />
                    {!isMobile && <Legend wrapperStyle={{ fontSize: '0.85rem' }} />}
                    <Line type="monotone" dataKey="income" stroke="#FFD600" name="Income" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="expense" stroke="#FF7043" name="Expenses" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="net" stroke="#66BB6A" name="Net" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {/* Table: Transactions for Selected Month */}
          <Card borderless>
            <CardHeader>
              <CardTitle>Transactions ({format(selectedMonth, 'MMMM yyyy')})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {filtered.length === 0 ? (
                  <div className="text-muted-foreground">No transactions for this month.</div>
                ) : (
                  <table className="w-full text-sm sm:text-base min-w-[400px]">
                    <thead>
                      <tr>
                        <th className="text-left whitespace-nowrap">Date</th>
                        <th className="text-left whitespace-nowrap">Description</th>
                        <th className="text-left whitespace-nowrap">Category</th>
                        <th className="text-right whitespace-nowrap">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(t => (
                        <tr key={t.id}>
                          <td>{format(parseISO(t.date), 'MMM d')}</td>
                          <td>{t.description}</td>
                          <td>{t.category}</td>
                          <td className="text-right">{t.type === 'income' ? '+' : '-'}KES {t.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 