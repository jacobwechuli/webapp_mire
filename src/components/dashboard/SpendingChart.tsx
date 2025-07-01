"use client"

import * as React from "react"
import { Pie, PieChart, Cell, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Transaction } from "@/lib/types"
import { Coins } from "lucide-react"

interface SpendingChartProps {
  transactions: Transaction[]
}

const COLOR_PALETTE = [
  '#4F8EF7', // Blue
  '#F76C5E', // Red/Coral
  '#43AA8B', // Green
  '#FFD166', // Yellow
  '#9D4EDD', // Purple
  '#F9C74F', // Gold
  '#577590', // Slate Blue
  '#F3722C', // Orange
  '#277DA1', // Deep Blue
  '#90BE6D', // Light Green
  '#F94144', // Bright Red
  '#577590', // Blue Gray
  '#43AA8B', // Teal
  '#F9844A', // Orange
  '#B5179E', // Magenta
];

const SpendingChart: React.FC<SpendingChartProps> = ({ transactions }) => {
  const expenseData = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      const existingCategory = acc.find((item) => item.category === t.category)
      if (existingCategory) {
        existingCategory.amount += t.amount
      } else {
        acc.push({ category: t.category, amount: t.amount })
      }
      return acc
    }, [] as { category: string; amount: number }[])
    .sort((a, b) => b.amount - a.amount); // Sort for consistent color assignment

  const chartConfig = expenseData.reduce((config, item, index) => {
    config[item.category] = {
      label: item.category,
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    }
    return config
  }, {} as ChartConfig)
  
  const chartData = expenseData.map(item => ({
    name: item.category,
    value: item.amount,
    fill: chartConfig[item.category]?.color || COLOR_PALETTE[0], // Fallback color
  }));

  if (expenseData.length === 0) {
    return (
      <Card className="bg-card text-card-foreground shadow-lg flex flex-col h-full border border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-card-foreground flex items-center">
            <Coins className="mr-2 h-6 w-6 text-primary" /> Spending Breakdown
          </CardTitle>
          <CardDescription className="text-muted-foreground">No expense data available to display chart.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Add some expenses to see your spending habits.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-background text-foreground border border-border shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-card-foreground flex items-center">
          <Coins className="mr-2 h-6 w-6 text-primary" /> Spending Breakdown
        </CardTitle>
        <CardDescription className="text-muted-foreground">Visualizing your expenses by category</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="name" />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                if ((percent * 100) < 5) return null; // Don't show label for small slices
                return (
                  <text x={x} y={y} fill="hsl(var(--card-foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
            </Pie>
             <ChartLegend content={<ChartLegendContent nameKey="name" className="flex-wrap justify-center" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default SpendingChart;
