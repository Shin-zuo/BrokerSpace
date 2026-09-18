'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { 
  Users, Shield, Building2, CheckCircle2, Clock, AlertTriangle, 
  Search, Filter, SlidersHorizontal, Ban, BadgeCheck, MessageSquare, 
  ChevronLeft, ChevronRight, RefreshCw, Sparkles 
} from 'lucide-react';
import { getAdminUsersAction, getAdminDashboardStatsAction } from '@/src/app/actions/admin';
import UserPermissionsModal from './UserPermissionsModal';

interface Props {
  initialStats: {
    totalUsers: number;
    totalBrokers: number;
    activeSubscriptions: number;
    pendingSubscriptions: number;
    totalProperties: number;
    suspendedUsers: number;
    verifiedBrokers: number;
  };
  initialUsersData: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    users: any[];
  };
}

export default function AdminUserManagement({ initialStats, initialUsersData }: Props) {
  const [stats, setStats] = useState(initialStats);
  const [usersData, setUsersData] = useState(initialUsersData);

  // Filter States
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState('');
  const [isSuspended, setIsSuspended] = useState('');
  const [page, setPage] = useState(1);

  const [isPending, startTransition] = useTransition();

  // Modal State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = (newPage = page) => {
    startTransition(async () => {
      const [newStats, newUsers] = await Promise.all([
        getAdminDashboardStatsAction(),
        getAdminUsersAction({
          search,
          role: role || undefined,
          subscriptionStatus: subscriptionStatus || undefined,
          isSuspended: isSuspended || undefined,
          page: newPage,
        }),
      ]);
      setStats(newStats);
      setUsersData(newUsers);
      setPage(newPage);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(1);
  };

  const handleOpenPermissions = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SuperAdmin Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor real-time platform metrics, manage user permissions, and override subscription access limits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadData(page)}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Total Users</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats.totalUsers}</div>
            <span className="text-[11px] text-slate-500 font-medium">{stats.totalBrokers} Brokers</span>
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Active Subscriptions</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">{stats.activeSubscriptions}</div>
            <span className="text-[11px] text-slate-500 font-medium">Verified Paid Brokers</span>
          </div>
        </div>

        {/* Total Properties */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Property Listings</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats.totalProperties}</div>
            <span className="text-[11px] text-teal-600 font-medium">{stats.verifiedBrokers} Verified Badges</span>
          </div>
        </div>

        {/* Pending & Suspended */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Attention Needed</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-0.5">{stats.pendingSubscriptions}</div>
            <span className="text-[11px] text-red-500 font-medium">{stats.suspendedUsers} Suspended Users</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, username, or PRC license..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Role Filter */}
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setTimeout(() => loadData(1), 50);
              }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="Broker">Brokers</option>
              <option value="SuperAdmin">SuperAdmins</option>
            </select>

            {/* Subscription Filter */}
            <select
              value={subscriptionStatus}
              onChange={(e) => {
                setSubscriptionStatus(e.target.value);
                setTimeout(() => loadData(1), 50);
              }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Subscriptions</option>
              <option value="active">Active</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="expired">Expired</option>
            </select>

            {/* Suspended Filter */}
            <select
              value={isSuspended}
              onChange={(e) => {
                setIsSuspended(e.target.value);
                setTimeout(() => loadData(1), 50);
              }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Accounts</option>
              <option value="false">Active Only</option>
              <option value="true">Suspended Only</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base">Registered Platform Users</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
              {usersData.totalCount} total
            </span>
          </div>
        </div>

        {usersData.users.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-base text-slate-700">No users match your criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or reset filter options.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 pl-6">Broker / User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Subscription</th>
                  <th className="py-3.5 px-4">Permissions & Limits</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersData.users.map((u) => {
                  const broker = u.broker;
                  const expiresAt = broker?.subscriptionExpiresAt ? new Date(broker.subscriptionExpiresAt) : null;
                  const isExpired = expiresAt ? expiresAt < new Date() : broker?.subscriptionStatus === 'pending_payment';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Broker / User */}
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 overflow-hidden shrink-0">
                            {broker?.profilePictureUrl ? (
                              <img src={broker.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              u.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <span>{broker?.name || u.username}</span>
                              {broker?.isVerified && (
                                <span title="Verified PRC Broker">
                                  <BadgeCheck className="w-4 h-4 text-teal-600 shrink-0" />
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                            <div className="text-[11px] text-slate-400 font-mono">@{u.username} {broker?.whatsappNumber ? `• +63 ${broker.whatsappNumber}` : ''}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        {u.role === 'SuperAdmin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Shield className="w-3 h-3 text-indigo-600" /> SuperAdmin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                            Broker
                          </span>
                        )}
                      </td>

                      {/* Subscription */}
                      <td className="py-4 px-4">
                        {u.role === 'SuperAdmin' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Shield className="w-3 h-3 text-indigo-600" /> Lifetime
                            </span>
                            <div className="text-[11px] font-medium text-slate-400 mt-1">Permanent (No Expiry)</div>
                          </div>
                        ) : broker ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              {broker.subscriptionStatus === 'active' && !isExpired ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                                </span>
                              ) : isExpired ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                                  <AlertTriangle className="w-3 h-3 text-red-500" /> Expired
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-500" /> Pending
                                </span>
                              )}
                              <span className="text-xs font-bold text-slate-700 uppercase">
                                {broker.subscriptionPlan}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1">
                              {expiresAt
                                ? `Expires: ${expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                : 'No expiry set'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Admin (N/A)</span>
                        )}
                      </td>

                      {/* Permissions & Limits */}
                      <td className="py-4 px-4">
                        {broker ? (
                          <div className="space-y-1 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Listings: <strong>{broker._count?.properties || 0}</strong> / {broker.maxListings === -1 ? '∞' : broker.maxListings}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className={broker.canPostListings ? 'text-emerald-600 font-semibold' : 'text-red-500'}>
                                {broker.canPostListings ? '✓ Can Post' : '✗ No Post'}
                              </span>
                              <span>•</span>
                              <span className={broker.canMessage ? 'text-emerald-600 font-semibold' : 'text-red-500'}>
                                {broker.canMessage ? '✓ Chat' : '✗ No Chat'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Full System Access</span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="py-4 px-4">
                        {u.isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                            <Ban className="w-3 h-3" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-4 pr-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenPermissions(u)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors cursor-pointer"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {usersData.totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Showing page {usersData.currentPage} of {usersData.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={usersData.currentPage <= 1 || isPending}
                onClick={() => loadData(usersData.currentPage - 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={usersData.currentPage >= usersData.totalPages || isPending}
                onClick={() => loadData(usersData.currentPage + 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Permissions Edit Modal */}
      <UserPermissionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSuccess={() => loadData(page)}
      />

    </div>
  );
}
