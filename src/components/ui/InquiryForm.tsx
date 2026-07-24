'use client';

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface InquiryFormProps {
  propertyId: string;
  propertyTitle: string;
  brokerWhatsApp: string;
}

export default function InquiryForm({ propertyId, propertyTitle, brokerWhatsApp }: InquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hi, I am inquiring about ${propertyTitle}`,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerWhatsApp) {
      alert('Broker WhatsApp number is not available.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Implement actual API call to save to database
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          clientName: formData.name,
          clientEmail: formData.email,
          clientPhone: formData.phone,
          message: formData.message,
        }),
      });

      if (!response.ok) throw new Error('Failed to save inquiry');
      setIsSuccess(true);
      
      // Redirect to WhatsApp
      const waNumber = brokerWhatsApp.replace(/[^0-9]/g, '');
      const waMessage = encodeURIComponent(formData.message + `\n\n- From: ${formData.name}`);
      const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;
      
      window.open(waUrl, '_blank');
      
      // Reset form success state after a delay
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ ...formData, message: `Hi, I am inquiring about ${propertyTitle}` });
      }, 3000);

    } catch (error) {
      console.error(error);
      alert('There was an error sending your inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Your Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            placeholder="Juan Dela Cruz"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Phone</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            placeholder="0912 345 6789"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700">Email Address</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          placeholder="juan@example.com"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700">Message</label>
        <textarea
          required
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isSuccess || !brokerWhatsApp}
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-white font-medium transition-all shadow-sm mt-1 text-sm ${
          isSuccess 
            ? 'bg-emerald-500 shadow-emerald-500/20'
            : !brokerWhatsApp
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 cursor-pointer'
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : isSuccess ? (
          'Redirecting...'
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send to Broker
          </>
        )}
      </button>
      <p className="text-[10px] text-slate-500 text-center leading-tight">
        You will be redirected to WhatsApp to send your message directly to the broker.
      </p>
    </form>
  );
}
