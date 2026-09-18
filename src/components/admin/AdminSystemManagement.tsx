'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Power,
  Lock,
  MessageSquare,
  Building2,
  UserPlus,
  CreditCard,
  Megaphone,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { updateSystemSettingsAction } from '@/src/app/actions/admin';
import type { SystemSettingsMap } from '@/src/lib/systemSettings';

interface AdminSystemManagementProps {
  initialSettings: SystemSettingsMap;
}

export default function AdminSystemManagement({ initialSettings }: AdminSystemManagementProps) {
  const [settings, setSettings] = useState<SystemSettingsMap>(initialSettings);
  const [saving, setSaving] = useState(false);

  const handleToggle = (key: keyof SystemSettingsMap) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateSystemSettingsAction(settings);
      if (res.success) {
        toast.success('System settings updated and deployed successfully!');
      } else {
        toast.error('Failed to update system settings.');
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const killswitches = [
    {
      key: 'global_login_enabled' as const,
      title: 'Global Broker Login',
      description: 'Allow or block standard broker logins. When disabled, only SuperAdmins can sign in. Regular brokers receive a maintenance message.',
      icon: Lock,
      danger: true,
      current: settings.global_login_enabled,
    },
    {
      key: 'global_property_posting_enabled' as const,
      title: 'Global Property Posting',
      description: 'Allow or pause creation and editing of property listings. Disables the "List Property" button and API submission globally.',
      icon: Building2,
      danger: false,
      current: settings.global_property_posting_enabled,
    },
    {
      key: 'global_messaging_enabled' as const,
      title: 'Global Direct Messaging & Chat',
      description: 'Allow or pause direct chat messages between brokers. Halts real-time message sending during maintenance.',
      icon: MessageSquare,
      danger: false,
      current: settings.global_messaging_enabled,
    },
    {
      key: 'global_registration_enabled' as const,
      title: 'Global Broker Signups & Registrations',
      description: 'Allow new broker accounts to be created. When disabled, public registration displays a temporarily closed notice.',
      icon: UserPlus,
      danger: false,
      current: settings.global_registration_enabled,
    },
    {
      key: 'global_payments_enabled' as const,
      title: 'Global Subscriptions & Invoicing (Xendit)',
      description: 'Allow processing of subscription upgrades, automated invoices, and payment renewals.',
      icon: CreditCard,
      danger: false,
      current: settings.global_payments_enabled,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Sliders className="w-4 h-4" /> System Control & Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            System Management
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Globally control core platform capabilities, pause individual features during maintenance, or broadcast system-wide banners.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer shrink-0"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Deploying Changes...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Save System Settings</span>
            </>
          )}
        </button>
      </div>

      {/* Emergency Lockdown Notice */}
      {(!settings.global_login_enabled || settings.maintenance_mode) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-amber-900 text-base">
              Restricted Access Active
            </div>
            <div className="text-xs text-amber-800 mt-1 leading-relaxed">
              {settings.maintenance_mode
                ? 'System is currently set to Maintenance Mode.'
                : 'Global Broker Login is currently paused.'}{' '}
              Non-SuperAdmin users will receive maintenance notices and cannot use restricted features. SuperAdmins retain full access to manage and restore settings.
            </div>
          </div>
        </div>
      )}

      {/* Feature Killswitches Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Power className="w-5 h-5 text-indigo-600" />
              Global Feature Killswitches
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly toggle core functionality across the entire application in real-time.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {killswitches.map((item) => {
            const Icon = item.icon;
            const isEnabled = item.current;

            return (
              <div
                key={item.key}
                className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      isEnabled
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isEnabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isEnabled ? 'Enabled / Online' : 'Paused / Off'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(item.key)}
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    isEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={isEnabled}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Broadcast Announcement Banner Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">
                System Announcement Broadcast Banner
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Displays a persistent notice at the very top of all pages for every logged-in broker and visitor.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.announcement_active}
              onChange={() => handleToggle('announcement_active')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Banner Announcement Text
          </label>
          <textarea
            rows={3}
            value={settings.announcement_banner}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, announcement_banner: e.target.value }))
            }
            placeholder="e.g. 📢 Scheduled Maintenance: BrokerSpace will undergo a database upgrade on Sunday from 2:00 AM to 4:00 AM PHT."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
          />
        </div>
      </div>

      {/* Maintenance Mode & Custom Notice Text */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">
                Full Maintenance Mode
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Puts the entire application into maintenance mode.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenance_mode}
              onChange={() => handleToggle('maintenance_mode')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Maintenance Notice Message (Shown to users upon login or attempt)
          </label>
          <input
            type="text"
            value={settings.maintenance_message}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, maintenance_message: e.target.value }))
            }
            placeholder="BrokerSpace is currently undergoing scheduled maintenance. Please check back shortly."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-900"
          />
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Deploying Changes...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Save System Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
