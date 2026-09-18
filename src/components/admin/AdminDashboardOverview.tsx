'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  CreditCard,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Settings,
  ArrowRight,
  Shield,
  Radio,
  Lock,
  MessageSquare,
  UserPlus,
  Power,
} from 'lucide-react';
import type { SystemSettingsMap } from '@/src/lib/systemSettings';

interface AdminDashboardOverviewProps {
  stats: {
    totalUsers: number;
    totalBrokers: number;
    activeSubscriptions: number;
    pendingSubscriptions: number;
    totalProperties: number;
    suspendedUsers: number;
    verifiedBrokers: number;
  };
  settings: SystemSettingsMap;
  recentUsers: Array<{
    id: string;
    username: string;
    email: string;
    role: string;
    createdAt: Date | string;
    broker?: {
      name: string;
      subscriptionStatus: string;
      isVerified: boolean;
    } | null;
  }>;
}

export default function AdminDashboardOverview({
  stats,
  settings,
  recentUsers,
}: AdminDashboardOverviewProps) {
  const isAllHealthy =
    settings.global_login_enabled &&
    settings.global_property_posting_enabled &&
    settings.global_messaging_enabled &&
    settings.global_registration_enabled &&
    !settings.maintenance_mode;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" /> Operations & Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            SuperAdmin Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time platform metrics, global infrastructure status, and system operations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
              isAllHealthy
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isAllHealthy ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`} />
            {isAllHealthy ? 'All Systems Operational' : 'System Mode Active'}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{stats.totalUsers}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">{stats.totalBrokers}</span> brokers registered
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Paid Subscribers</div>
            <div className="text-3xl font-black text-emerald-600 mt-1">{stats.activeSubscriptions}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span className="font-semibold text-amber-600">{stats.pendingSubscriptions}</span> pending payment
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Total Properties */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Listings</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{stats.totalProperties}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Across all subscribed brokers
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Attention Items */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Attention / Verified</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{stats.suspendedUsers}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span className="font-semibold text-teal-600">{stats.verifiedBrokers}</span> PRC verified brokers
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Live System Health & Killswitches Monitor */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Power className="w-5 h-5 text-indigo-600" />
              Live Platform Health & Feature Status
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Current real-time state of the 5 global feature killswitches.
            </p>
          </div>

          <Link
            href="/admin/system"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Manage Killswitches</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-5">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Broker Login</span>
            </div>
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                  settings.global_login_enabled
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {settings.global_login_enabled ? '● Online' : '■ Paused'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Property Posting</span>
            </div>
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                  settings.global_property_posting_enabled
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {settings.global_property_posting_enabled ? '● Active' : '■ Paused'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Chat Messaging</span>
            </div>
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                  settings.global_messaging_enabled
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {settings.global_messaging_enabled ? '● Active' : '■ Paused'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <UserPlus className="w-3.5 h-3.5 text-slate-500" />
              <span>Registrations</span>
            </div>
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                  settings.global_registration_enabled
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {settings.global_registration_enabled ? '● Open' : '■ Closed'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              <span>Payments (Xendit)</span>
            </div>
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                  settings.global_payments_enabled
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {settings.global_payments_enabled ? '● Online' : '■ Paused'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fast Navigation Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/users"
          className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
              User Management
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Search all registered brokers, customize listing limits, toggle posting/messaging permissions, or override subscription status.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 mt-4">
            <span>Manage Brokers</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/system"
          className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-105 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
              System Management
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Disable global login, pause property posting or chat, broadcast top announcement banners, or trigger emergency maintenance.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4">
            <span>Configure Killswitches</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/settings"
          className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-105 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
              Admin Settings
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Update your SuperAdmin master password, configure default listing quotas for new accounts, and review platform defaults.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-purple-600 mt-4">
            <span>Admin Settings</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent User Registrations */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-base text-slate-900">
              Recent Broker Registrations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest accounts created on BrokerSpace.
            </p>
          </div>

          <Link
            href="/admin/users"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentUsers.map((u) => (
            <div key={u.id} className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    {u.broker?.name || u.username}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    u.broker?.subscriptionStatus === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {u.broker?.subscriptionStatus || 'No Plan'}
                </span>

                <Link
                  href={`/admin/users?search=${encodeURIComponent(u.username)}`}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
