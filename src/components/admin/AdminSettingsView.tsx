'use client';

import React, { useState } from 'react';
import {
  Settings,
  KeyRound,
  Shield,
  Building,
  Mail,
  ListOrdered,
  CheckCircle2,
  Loader2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { changeAdminPasswordAction, updateSystemSettingsAction } from '@/src/app/actions/admin';
import type { SystemSettingsMap } from '@/src/lib/systemSettings';

interface AdminSettingsViewProps {
  initialSettings: SystemSettingsMap;
  adminEmail: string;
}

export default function AdminSettingsView({ initialSettings, adminEmail }: AdminSettingsViewProps) {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Platform defaults state
  const [defaultListings, setDefaultListings] = useState<number | string>(initialSettings.default_max_listings ?? 50);
  const [applyToExisting, setApplyToExisting] = useState(false);
  const [savingDefaults, setSavingDefaults] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    setChangingPass(true);
    try {
      const res = await changeAdminPasswordAction(currentPassword, newPassword);
      if (res.success) {
        toast.success('Admin password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.');
    } finally {
      setChangingPass(false);
    }
  };

  const handleSaveDefaults = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDefaults(true);
    try {
      const quota = defaultListings === '' ? 50 : Number(defaultListings);
      const res = await updateSystemSettingsAction({
        default_max_listings: quota,
      }, applyToExisting);
      if (res.success) {
        toast.success(
          applyToExisting
            ? 'Platform defaults updated and synced to all existing brokers!'
            : 'Platform defaults updated successfully!'
        );
      } else {
        toast.error('Failed to update defaults.');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.');
    } finally {
      setSavingDefaults(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
          <Settings className="w-4 h-4" /> Global Preferences
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
          Admin Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage SuperAdmin security, platform listing defaults, and system preferences.
        </p>
      </div>

      {/* Grid of Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: SuperAdmin Account & Password */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">
                SuperAdmin Credentials
              </h2>
              <p className="text-xs text-slate-500">
                Update the master password for the administrative account.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Account Email:</span>
              <span className="font-bold text-slate-800 font-mono">{adminEmail}</span>
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Access Role:</span>
              <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px] border border-indigo-200">
                <Shield className="w-3 h-3 text-indigo-600" /> SuperAdmin
              </span>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={changingPass}
              className="w-full py-2.5 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {changingPass ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Section 2: Platform Defaults */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">
                Platform Listing Quotas & Limits
              </h2>
              <p className="text-xs text-slate-500">
                Default configuration applied to newly registered broker accounts.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveDefaults} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Max Listings per Broker
              </label>
              <input
                type="number"
                min={-1}
                max={9999}
                value={defaultListings}
                onChange={(e) => {
                  const val = e.target.value;
                  setDefaultListings(val === '' ? '' : Number(val));
                }}
                onBlur={() => {
                  if (defaultListings === '' || isNaN(Number(defaultListings))) {
                    setDefaultListings(50);
                  }
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Enter <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">-1</code> for unlimited listings, or specify a quota (e.g. 50 properties).
              </p>

              <label className="flex items-center gap-2.5 mt-3 pt-2 border-t border-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToExisting}
                  onChange={(e) => setApplyToExisting(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Also update all existing registered brokers to this limit ({defaultListings === -1 ? 'Unlimited' : `${defaultListings} listings`})
                </span>
              </label>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-start gap-2.5">
                <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-800">Platform Environment:</span>
                  <div className="text-slate-500 font-mono text-[11px]">Next.js 16 (Turbopack) + Prisma 7 (Postgres)</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-800">Xendit Webhook Endpoint:</span>
                  <div className="text-slate-500 font-mono text-[11px]">/api/webhooks/xendit</div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingDefaults}
              className="w-full py-2.5 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingDefaults ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Defaults...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Platform Defaults</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
