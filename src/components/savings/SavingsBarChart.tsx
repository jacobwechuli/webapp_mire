"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function getMonthlySavings(goals: any[]) {
  const monthly: Record<string, number> = {};
  goals.forEach(goal => {
    goal.history.forEach((entry: any) => {
      const month = new Date(entry.date).toLocaleString("en-US", { year: "numeric", month: "short" });
      monthly[month] = (monthly[month] || 0) + entry.amount;
    });
  });
  // Convert to array and sort by date
  return Object.entries(monthly)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
}

const SavingsBarChart = ({ goals }: { goals: any[] }) => {
  const data = getMonthlySavings(goals);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" stroke="#666" />
        <YAxis stroke="#666" />
        <Tooltip formatter={v => `$${v}`} />
        <Bar dataKey="total" fill="#FFD700" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SavingsBarChart; 