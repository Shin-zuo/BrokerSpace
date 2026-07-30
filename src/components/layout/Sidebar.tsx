"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { LayoutDashboard, Home, MessageSquare, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { logoutAction } from "@/src/app/actions/auth";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Properties", href: "/properties", icon: Home },
  { name: "Inquiries", href: "/inquiries", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 glass-panel border-r border-white h-screen fixed top-0 left-0 z-20">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <img src="/brokerSpace.png" alt="BrokerSpace Logo" className="h-15 w-auto object-contain" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">BrokerSpace</h2>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer group ${
                isActive ? "text-teal-700" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-teal-50 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative flex items-center gap-3 w-full">
                <Icon className={`w-5 h-5 ${isActive ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600 transition-colors"}`} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200/50">
        <form action={logoutAction}>
          <button type="submit" className="group flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 cursor-pointer">
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
