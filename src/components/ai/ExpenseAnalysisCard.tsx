"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';

// Define a map for category names to display labels and colors
const CATEGORY_META: Record<string, { label: string; color: string }> = {
  food:          { label: 'Ăn uống',   color: '#D4EF3F' }, // Primary
  transport:     { label: 'Di chuyển', color: '#1a1c1c' }, // On-surface
  health:        { label: 'Sức khỏe',  color: '#e74c3c' }, 
  shopping:      { label: 'Mua sắm',   color: '#3498db' },
  rent:          { label: 'Nhà ở',     color: '#9b59b6' },
  education:     { label: 'Học tập',   color: '#f1c40f' },
  utilities:     { label: 'Tiện ích',  color: '#1abc9c' },
  entertainment: { label: 'Giải trí',  color: '#e67e22' },
  salary:        { label: 'Lương',     color: '#2ecc71' },
  investment:    { label: 'Đầu tư',    color: '#f39c12' },
  insurance:     { label: 'Bảo hiểm',  color: '#e74c3c' },
  other:         { label: 'Khác',      color: '#95a5a6' },
};

const COLORS = ['#D4EF3F', '#1a1c1c', '#3498db', '#e74c3c', '#f1c40f', '#9b59b6', '#1abc9c', '#e67e22', '#95a5a6'];

export const ExpenseAnalysisCard = () => {
  const { data: transactionsData, isLoading } = useTransactions();

  const chartData = useMemo(() => {
    if (!transactionsData || !transactionsData.expenses) return [];

    const expenses = transactionsData.expenses;
    if (expenses.length === 0) return [];

    // Group by category and sum amounts
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(t => {
      const cat = t.category || 'other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
    });

    const totalExpense = transactionsData.totalExpenses || 1; // Prevent div by 0

    // Convert to Array mapped with colors and labels
    const mapped = Object.entries(categoryTotals)
      .map(([cat, amount], index) => {
        const meta = CATEGORY_META[cat] || { label: cat, color: COLORS[index % COLORS.length] };
        return {
          name: meta.label,
          amount: amount,
          value: parseFloat(((amount / totalExpense) * 100).toFixed(1)), // percentage
          color: meta.color || COLORS[index % COLORS.length]
        };
      })
      .sort((a, b) => b.amount - a.amount); // sort largest to smallest

    // Optionally take top 4 and group rest into "Khác"
    if (mapped.length > 5) {
      const top4 = mapped.slice(0, 4);
      const others = mapped.slice(4);
      const othersAmount = others.reduce((sum, item) => sum + item.amount, 0);
      const othersValue = parseFloat(((othersAmount / totalExpense) * 100).toFixed(1));
      
      top4.push({
        name: 'Khác',
        amount: othersAmount,
        value: othersValue,
        color: '#d1d5db' // Gray
      });
      return top4;
    }

    return mapped;
  }, [transactionsData]);

  if (isLoading) {
    return (
      <div className="neumorphic p-6 rounded-large h-full flex flex-col min-h-[250px]">
        <h3 className="font-bold text-lg mb-4 text-on-surface">Phân tích Chi tiêu</h3>
        <div className="flex-1 flex items-center justify-center neumorphic-pressed rounded-standard p-4 animate-pulse">
           <div className="w-32 h-32 rounded-full bg-black/10"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="neumorphic p-6 rounded-large h-full flex flex-col min-h-[300px]">
      <h3 className="font-black text-xl mb-6 text-on-surface flex items-center gap-3">
        <PieChart size={24} className="text-[var(--color-primary)] stroke-[2.5]" />
        Phân tích Chi tiêu
      </h3>
      <div className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-6 mt-4">
        {chartData.length === 0 ? (
          <div className="text-center text-sm font-medium text-[var(--color-on-surface-variant)] py-10 w-full">
            Chưa có dữ liệu chi tiêu để phân tích.
          </div>
        ) : (
          <>
            <div className="w-40 h-40 shrink-0 min-w-[160px] min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={160} minHeight={160}>
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any, props: any) => [`${value}% - ${props.payload.amount.toLocaleString()} ₫`, name]}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#F5F5F5', padding: '12px' }}
                    itemStyle={{ color: '#1a1c1c', fontWeight: '900', fontSize: '14px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 flex-1 w-full justify-center">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-inner shrink-0" style={{ backgroundColor: item.color }}></div>
                    <span className="text-base font-bold text-[var(--color-on-surface-variant)] truncate max-w-[140px] tracking-tight">{item.name}</span>
                  </div>
                  <span className="text-base font-black text-[var(--color-on-surface)] ml-4">{item.value}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
