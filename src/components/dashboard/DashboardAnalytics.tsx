"use client";

import React, { useState, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { Building2, MessageSquare, PieChart, TrendingUp, Filter } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend
} from 'recharts';

export default function DashboardAnalytics({ properties }: { properties: any[] }) {
  // 1. Dynamic Stats Calculation
  const totalProperties = properties.length;
  const soldProperties = properties.filter(p => p.status === 'Sold').length;
  const activeProperties = properties.filter(p => p.status === 'Available').length;
  
  const totalEngagement = properties.reduce((acc, p) => acc + (p.likes?.length || 0) + (p.saves?.length || 0), 0);
  const salesRate = totalProperties > 0 ? Math.round((soldProperties / totalProperties) * 100) : 0;

  // 2. Extract Available Years dynamically based on property 'createdAt' / 'updatedAt'
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    properties.forEach(p => {
      if (p.createdAt) years.add(new Date(p.createdAt).getFullYear());
      if (p.updatedAt && p.status === 'Sold') years.add(new Date(p.updatedAt).getFullYear());
    });
    const currentYear = new Date().getFullYear();
    years.add(currentYear); // Ensure at least current year is present
    return Array.from(years).sort((a, b) => b - a); // Descending order
  }, [properties]);

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // 3. Process data for Sales Trend Chart (Monthly properties sold for selected year)
  const monthlySalesData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = months.map(m => ({ name: m, sold: 0 }));

    properties.forEach(p => {
      if (p.status === 'Sold' && p.updatedAt) {
        const date = new Date(p.updatedAt);
        if (date.getFullYear() === selectedYear) {
          data[date.getMonth()].sold += 1;
        }
      }
    });
    return data;
  }, [properties, selectedYear]);

  // 4. Process data for Occupancy/Status Rate Chart
  const statusData = [
    { name: 'Sold', value: soldProperties },
    { name: 'Available', value: activeProperties },
    { name: 'Draft/Other', value: totalProperties - (soldProperties + activeProperties) }
  ].filter(d => d.value > 0);

  // 5. Process data for Property Type Distribution
  const typeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    properties.forEach(p => {
      const type = p.propertyType || 'Unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [properties]);

  // Colors for charts
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];
  const STATUS_COLORS = ['#3b82f6', '#10b981', '#94a3b8'];

  // Animations
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      
      {/* Header & Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
          <div className="flex flex-col gap-3 relative z-10">
            <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl w-fit">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Listings</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalProperties}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex flex-col gap-3 relative z-10">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl w-fit">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Properties Sold</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{soldProperties}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors" />
          <div className="flex flex-col gap-3 relative z-10">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-xl w-fit">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Sales Rate</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{salesRate}%</h3>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-colors" />
          <div className="flex flex-col gap-3 relative z-10">
            <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl w-fit">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Engagement</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalEngagement}</h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Trend */}
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Monthly Sales Trend</h2>
              <p className="text-sm text-slate-500">Properties sold dynamically filtered by year.</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              <Filter className="w-4 h-4 text-slate-400 ml-2" />
              <select 
                className="bg-transparent text-sm font-medium text-slate-700 outline-none pr-2 cursor-pointer border-none focus:ring-0"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sold" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sales Rate & Occupancy */}
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl flex flex-col">
          <h2 className="text-lg font-bold text-slate-900">Occupancy & Status</h2>
          <p className="text-sm text-slate-500 mb-6">Current breakdown of your portfolio.</p>
          <div className="flex-1 flex flex-col justify-center items-center relative min-h-[250px]">
            {totalProperties > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-sm">No properties available.</div>
            )}
            {totalProperties > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-8">
                <span className="text-2xl font-bold text-slate-900">{salesRate}%</span>
                <span className="text-xs text-slate-500 font-medium">Sold</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Property Type Distribution */}
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl flex flex-col">
          <h2 className="text-lg font-bold text-slate-900">Property Portfolio by Type</h2>
          <p className="text-sm text-slate-500 mb-6">Analyze which property types make up your listings.</p>
          <div className="h-[250px] w-full">
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No property types found.</div>
            )}
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}
