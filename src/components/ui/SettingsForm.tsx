'use client';

import React, { useState, useRef } from 'react';
import { Camera, Save, Loader2, Link as LinkIcon, Mail, MapPin, Building2, Briefcase, Globe } from 'lucide-react';
import { Broker } from '@prisma/client';

export default function SettingsForm({ initialData }: { initialData: Broker }) {
  const [formData, setFormData] = useState<Partial<Broker>>({
    name: initialData.name || '',
    whatsappNumber: initialData.whatsappNumber || '',
    companyName: initialData.companyName || '',
    licenseNumber: initialData.licenseNumber || '',
    bio: initialData.bio || '',
    profilePictureUrl: initialData.profilePictureUrl || '',
    facebookUrl: initialData.facebookUrl || '',
    linkedinUrl: initialData.linkedinUrl || '',
    officeAddress: initialData.officeAddress || '',
    instagramUrl: initialData.instagramUrl || '',
    websiteUrl: initialData.websiteUrl || '',
    specialization: initialData.specialization || '',
    publicEmail: initialData.publicEmail || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage({ type: '', text: '' });

    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) throw new Error('Failed to upload image');
      
      const { url } = await res.json();
      setFormData({ ...formData, profilePictureUrl: url });
      setMessage({ type: 'success', text: 'Profile picture uploaded successfully!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to upload profile picture.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/broker/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update settings');
      
      setMessage({ type: 'success', text: 'Profile settings saved successfully!' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-10">
      
      {/* Profile Header */}
      <div className="glass-card p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 relative">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center">
            {formData.profilePictureUrl ? (
              <img src={formData.profilePictureUrl} alt={`${formData.name}'s Profile Picture`} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl text-slate-300 font-bold">{formData.name?.charAt(0) || 'B'}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Upload Profile Picture"
            aria-label="Upload Profile Picture"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
            aria-label="File Upload Input"
          />
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-4 w-full">
          <div>
            <label htmlFor="fullName" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Full Name</label>
            <input
              id="fullName"
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full max-w-md px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-xl"
            />
          </div>
          <div>
            <label htmlFor="bio" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Bio / Summary</label>
            <textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-sm"
              placeholder="Tell clients about yourself and your experience..."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Professional Details */}
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-900">Professional Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="companyName" className="text-sm font-semibold text-slate-700">Company / Agency</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="companyName"
                  type="text"
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="E.g. Re/Max, Keller Williams"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="licenseNumber" className="text-sm font-semibold text-slate-700">PRC License Number</label>
              <input
                id="licenseNumber"
                type="text"
                value={formData.licenseNumber || ''}
                onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="1234567"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="specialization" className="text-sm font-semibold text-slate-700">Specialization</label>
            <input
              id="specialization"
              type="text"
              value={formData.specialization || ''}
              onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="E.g. Luxury Condos, Commercial Lots, Pre-selling"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="officeAddress" className="text-sm font-semibold text-slate-700">Office Address</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <textarea
                id="officeAddress"
                value={formData.officeAddress || ''}
                onChange={(e) => setFormData({...formData, officeAddress: e.target.value})}
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                placeholder="Full office address"
              />
            </div>
          </div>
        </div>

        {/* Contact & Socials */}
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <LinkIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-900">Contact & Socials</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="whatsappNumber" className="text-sm font-semibold text-slate-700">WhatsApp Number</label>
              <input
                id="whatsappNumber"
                type="text"
                required
                value={formData.whatsappNumber || ''}
                onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="+63 912 345 6789"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="publicEmail" className="text-sm font-semibold text-slate-700">Public Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="publicEmail"
                  type="email"
                  value={formData.publicEmail || ''}
                  onChange={(e) => setFormData({...formData, publicEmail: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="hello@broker.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="websiteUrl" className="text-sm font-semibold text-slate-700">Website URL</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="websiteUrl"
                  type="url"
                  value={formData.websiteUrl || ''}
                  onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="https://mywebsite.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="facebookUrl" className="text-sm font-semibold text-slate-700">Facebook URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="facebookUrl"
                  type="url"
                  value={formData.facebookUrl || ''}
                  onChange={(e) => setFormData({...formData, facebookUrl: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="https://facebook.com/broker"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="instagramUrl" className="text-sm font-semibold text-slate-700">Instagram URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="instagramUrl"
                  type="url"
                  value={formData.instagramUrl || ''}
                  onChange={(e) => setFormData({...formData, instagramUrl: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="https://instagram.com/broker"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="linkedinUrl" className="text-sm font-semibold text-slate-700">LinkedIn URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl || ''}
                  onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="https://linkedin.com/in/broker"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between glass-card p-4 rounded-2xl shadow-xl border border-white/50 backdrop-blur-xl bg-white/70 mt-4">
        <div className="px-2">
          {message.text && (
            <p className={`text-sm font-semibold ${message.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSaving || isUploading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

    </form>
  );
}
