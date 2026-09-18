'use client';

import React, { useState, useTransition } from 'react';
import { X, Shield, CheckCircle2, AlertTriangle, Calendar, Plus, Loader2, Save, Ban, Check, Building2, MessageSquare, BadgeCheck } from 'lucide-react';
import { updateUserPermissionsAction, UpdateUserPermissionsInput } from '@/src/app/actions/admin';

interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
  isSuspended: boolean;
  createdAt: Date | string;
  broker?: {
    id: string;
    name: string;
    whatsappNumber: string;
    companyName?: string | null;
    licenseNumber?: string | null;
    subscriptionPlan: string;
    subscriptionStatus: string;
    subscriptionExpiresAt: Date | string | null;
    maxListings: number;
    canPostListings: boolean;
    canMessage: boolean;
    isVerified: boolean;
    _count?: {
      properties: number;
      payments: number;
    };
  } | null;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  onSuccess: () => void;
}

export default function UserPermissionsModal({ isOpen, onClose, user, onSuccess }: ModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [role, setRole] = useState<'Broker' | 'SuperAdmin'>(
    (user?.role as 'Broker' | 'SuperAdmin') || 'Broker'
  );
  const [isSuspended, setIsSuspended] = useState<boolean>(user?.isSuspended || false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>(
    user?.broker?.subscriptionStatus || 'active'
  );
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>(
    user?.broker?.subscriptionPlan || 'monthly'
  );
  const [expiresAt, setExpiresAt] = useState<string>(
    user?.broker?.subscriptionExpiresAt
      ? new Date(user.broker.subscriptionExpiresAt).toISOString().split('T')[0]
      : ''
  );
  const [maxListings, setMaxListings] = useState<number | string>(user?.broker?.maxListings ?? 50);
  const [canPostListings, setCanPostListings] = useState<boolean>(
    user?.broker?.canPostListings ?? true
  );
  const [canMessage, setCanMessage] = useState<boolean>(user?.broker?.canMessage ?? true);
  const [isVerified, setIsVerified] = useState<boolean>(user?.broker?.isVerified ?? false);

  if (!isOpen || !user) return null;

  const handleQuickExtend = (days: number) => {
    const base = expiresAt ? new Date(expiresAt) : new Date();
    // If expired in the past, extend from now
    const startDate = base < new Date() ? new Date() : base;
    startDate.setDate(startDate.getDate() + days);
    setExpiresAt(startDate.toISOString().split('T')[0]);
    if (subscriptionStatus !== 'active') {
      setSubscriptionStatus('active');
    }
  };

  const handleSave = () => {
    setError(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const isSuperAdminRole = role === 'SuperAdmin';
      const input: UpdateUserPermissionsInput = {
        userId: user.id,
        role,
        isSuspended,
        subscriptionStatus: isSuperAdminRole ? 'active' : subscriptionStatus,
        subscriptionPlan: isSuperAdminRole ? 'lifetime' : subscriptionPlan,
        subscriptionExpiresAt: isSuperAdminRole ? null : (expiresAt ? new Date(expiresAt).toISOString() : null),
        maxListings: Number(maxListings),
        canPostListings,
        canMessage,
        isVerified,
      };

      const result = await updateUserPermissionsAction(input);

      if (!result.success) {
        setError(result.error || 'Failed to update permissions.');
      } else {
        setSuccessMsg('Permissions & limits updated successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">User Permissions & Access Limits</h3>
              <p className="text-xs text-slate-500">Configure platform privileges for {user.broker?.name || user.username}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              {successMsg}
            </div>
          )}

          {/* User Profile Summary */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{user.broker?.name || user.username}</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email} • @{user.username}</p>
              {user.broker?.licenseNumber && (
                <p className="text-[11px] text-teal-700 font-medium mt-1">PRC Lic: {user.broker.licenseNumber}</p>
              )}
            </div>
            <div className="text-right">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                isSuspended
                  ? 'bg-red-100 text-red-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isSuspended ? 'SUSPENDED' : 'ACTIVE ACCOUNT'}
              </span>
            </div>
          </div>

          {/* Section 1: Role & Account Suspension */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Account Role & Status</h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Broker">Broker (Standard Member)</option>
                  <option value="SuperAdmin">SuperAdmin (Full Control)</option>
                </select>
              </div>

              {/* Account Suspension Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Account Status</label>
                <button
                  type="button"
                  onClick={() => setIsSuspended(!isSuspended)}
                  className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSuspended
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {isSuspended ? (
                    <>
                      <Ban className="w-4 h-4 text-red-600" /> Account is Suspended
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" /> Account is Active
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Subscription & Expiration Date Override */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Subscription & Access Duration</h5>
            
            {role === 'SuperAdmin' ? (
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-3">
                <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-extrabold text-indigo-950">Permanent SuperAdmin Access (No Expiration)</div>
                  <div className="text-[11px] text-indigo-700 mt-0.5 leading-relaxed">
                    SuperAdmin accounts hold permanent platform-wide access and do not have an expiration date.
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Status</label>
                    <select
                      value={subscriptionStatus}
                      onChange={(e) => setSubscriptionStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="active">Active</option>
                      <option value="pending_payment">Pending Payment</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Plan</label>
                    <select
                      value={subscriptionPlan}
                      onChange={(e) => setSubscriptionPlan(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="monthly">Monthly (₱499)</option>
                      <option value="yearly">Annual (₱4,999)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Expiration Date</label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Quick Extension Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 font-semibold">Quick Extension:</span>
                  {[
                    { label: '+30 Days', days: 30 },
                    { label: '+90 Days', days: 90 },
                    { label: '+1 Year', days: 365 },
                  ].map((q) => (
                    <button
                      type="button"
                      key={q.label}
                      onClick={() => handleQuickExtend(q.days)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors cursor-pointer"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Section 3: Granular Permissions & Access Limits */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">3. Granular Access Limits & Permissions</h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Max Listings Limit */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Max Property Listings Allowed
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={maxListings}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMaxListings(val === '' ? '' : Number(val));
                    }}
                    onBlur={() => {
                      if (maxListings === '' || isNaN(Number(maxListings))) {
                        setMaxListings(50);
                      }
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setMaxListings(-1)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                      maxListings === -1
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    Unlimited
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Current active listings: {user.broker?._count?.properties || 0}</p>
              </div>

              {/* Verified Badge */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Verified PRC Broker Badge
                </label>
                <button
                  type="button"
                  onClick={() => setIsVerified(!isVerified)}
                  className={`w-full py-2 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    isVerified
                      ? 'bg-teal-50 border-teal-300 text-teal-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BadgeCheck className={`w-4 h-4 ${isVerified ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span>{isVerified ? 'Verified Broker' : 'Unverified'}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono">{isVerified ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>

              {/* Can Post Listings */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Can Post Properties
                </label>
                <button
                  type="button"
                  onClick={() => setCanPostListings(!canPostListings)}
                  className={`w-full py-2 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    canPostListings
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-red-50 border-red-300 text-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className={`w-4 h-4 ${canPostListings ? 'text-emerald-600' : 'text-red-500'}`} />
                    <span>{canPostListings ? 'Allowed to Post' : 'Posting Disabled'}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono">{canPostListings ? 'Active' : 'Blocked'}</span>
                </button>
              </div>

              {/* Can Send Messages */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Can Send Messages (Chat)
                </label>
                <button
                  type="button"
                  onClick={() => setCanMessage(!canMessage)}
                  className={`w-full py-2 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    canMessage
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-red-50 border-red-300 text-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className={`w-4 h-4 ${canMessage ? 'text-emerald-600' : 'text-red-500'}`} />
                    <span>{canMessage ? 'Messaging Enabled' : 'Chat Blocked'}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono">{canMessage ? 'Active' : 'Blocked'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/25 transition-all disabled:opacity-70 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Permissions
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
