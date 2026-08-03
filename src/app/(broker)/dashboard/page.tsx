"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Building2, MessageSquare, AlertCircle } from "lucide-react";
import BackButton from '@/src/components/ui/BackButton';

export default function DashboardPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="mb-2">
        <BackButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
          <div className="flex flex-col gap-4 relative z-10">
            <div className="p-3.5 bg-blue-500/10 text-blue-600 rounded-xl w-fit">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Properties</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">12</h3>
            </div>
          </div>
        </motion.div>

        {/* Stat Card 2 */}
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex flex-col gap-4 relative z-10">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-600 rounded-xl w-fit">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Recent Inquiries</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">48</h3>
            </div>
          </div>
        </motion.div>
        
        {/* Stat Card 3 */}
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
          <div className="flex flex-col gap-4 relative z-10">
            <div className="p-3.5 bg-amber-500/10 text-amber-600 rounded-xl w-fit">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Actions</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">3</h3>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl min-h-[400px]">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
        <div className="flex flex-col items-center justify-center h-[250px] text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
            <MessageSquare className="w-8 h-8" />
          </div>
          <p className="text-slate-500 font-medium">No recent activity to display.</p>
          <p className="text-sm text-slate-400 mt-1">When clients inquire about your properties, they will appear here.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
