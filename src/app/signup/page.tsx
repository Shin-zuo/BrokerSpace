'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { signupAction } from '@/src/app/actions/auth';
import { Building2, User, Phone, Briefcase, FileBadge, Link as LinkIcon, Mail, Lock } from 'lucide-react';
import BackButton from '@/src/components/ui/BackButton';

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [whatsapp, setWhatsapp] = useState('');
  const [contact, setContact] = useState('');
  const [sameAsWhatsapp, setSameAsWhatsapp] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await signupAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl" />
      </div>

      <div className="w-full max-w-2xl px-6 py-12 relative z-10">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="glass-panel p-8 sm:p-12 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-6">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Create Broker Account</h1>
            <p className="text-slate-500">Join BrokerSpace to manage and showcase your properties.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">Full Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">WhatsApp Number *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-500 font-medium z-10">+63</span>
                  <div className="absolute inset-y-0 left-0 pl-11 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400 opacity-50" />
                  </div>
                  <input
                    type="text"
                    name="whatsappNumber"
                    required
                    value={whatsapp.replace(/^\+63\s*/, '')}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      const formatted = val ? `+63${val}` : '';
                      setWhatsapp(formatted);
                      if (sameAsWhatsapp) setContact(formatted);
                    }}
                    className="w-full pl-16 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="9000000000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 block">Contact Number</label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={sameAsWhatsapp}
                      onChange={(e) => {
                        setSameAsWhatsapp(e.target.checked);
                        if (e.target.checked) setContact(whatsapp);
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Same as WhatsApp
                  </label>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-500 font-medium z-10">+63</span>
                  <div className="absolute inset-y-0 left-0 pl-11 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400 opacity-50" />
                  </div>
                  <input
                    type="text"
                    name="contactNumber"
                    disabled={sameAsWhatsapp}
                    value={contact.replace(/^\+63\s*/, '')}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setContact(val ? `+63${val}` : '');
                    }}
                    className="w-full pl-16 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:bg-slate-100"
                    placeholder="9000000000"
                  />
                </div>
              </div>

              {/* Professional Info */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">Company Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="companyName"
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Real Estate Corp"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">License Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <FileBadge className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="licenseNumber"
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="PRC License"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">Facebook URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="facebookUrl"
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">LinkedIn URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="linkedinUrl"
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="https://linkedin.com/..."
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-200/50">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Account Details</h3>
              </div>

              {/* Account Info */}
              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 block">Username *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="johndoe123"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-1">
                <label className="text-sm font-medium text-slate-700 block">Email Address *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-1">
                <label className="text-sm font-medium text-slate-700 block">Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white font-medium bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-8"
            >
              {isPending ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
