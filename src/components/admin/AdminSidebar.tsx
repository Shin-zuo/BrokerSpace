'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Sliders,
  Settings,
  Shield,
  Home,
  LogOut,
  Menu,
  X,
  Radio,
} from 'lucide-react';
import { logoutAction } from '@/src/app/actions/auth';

interface AdminSidebarProps {
  userEmail?: string;
  isMaintenanceMode?: boolean;
}

export default function AdminSidebar({ userEmail = 'admin@brokerspace.com', isMaintenanceMode = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
      description: 'KPI metrics & health overview',
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      exact: false,
      description: 'Access limits & broker accounts',
    },
    {
      name: 'System Management',
      href: '/admin/system',
      icon: Sliders,
      exact: false,
      description: 'Global killswitches & maintenance',
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      exact: false,
      description: 'Platform defaults & security',
    },
  ];

  const isLinkActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-18 px-5 flex items-center justify-between border-b border-slate-800/80">
        <Link href="/admin" className="flex items-center gap-3">
          <img src="/brokerSpace.png" alt="BrokerSpace" className="h-9 w-auto brightness-200" />
          <div>
            <div className="font-black text-base text-white tracking-tight leading-none">BrokerSpace</div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mt-1 flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" /> SuperAdmin
            </div>
          </div>
        </Link>

        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Maintenance Status Banner in Sidebar */}
      {isMaintenanceMode && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <Radio className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
          <span className="font-semibold text-[11px]">System in Maintenance</span>
        </div>
      )}

      {/* Navigation Section */}
      <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Admin Suite
        </div>

        {navItems.map((item) => {
          const active = isLinkActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                }`}
              />
              <div className="flex-1 truncate">
                <div className="leading-tight">{item.name}</div>
                <div
                  className={`text-[10px] truncate leading-tight mt-0.5 ${
                    active ? 'text-indigo-100' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                >
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile & Actions */}
      <div className="p-3 border-t border-slate-800/80 space-y-2 bg-slate-950/40">
        <Link
          href="/feed"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Home className="w-4 h-4 text-slate-400" />
          <span>Return to Main App</span>
        </Link>

        <div className="px-3 py-2.5 rounded-xl bg-slate-800/40 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-300 shrink-0">
              SA
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">SuperAdmin</div>
              <div className="text-[11px] text-slate-400 font-mono truncate">{userEmail}</div>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <img src="/brokerSpace.png" alt="BrokerSpace" className="h-7 w-auto brightness-200" />
          <span className="font-bold text-sm tracking-tight">SuperAdmin</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 h-full max-w-[85vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 lg:w-72 shrink-0 h-screen sticky top-0 z-20">
        {sidebarContent}
      </aside>
    </>
  );
}
