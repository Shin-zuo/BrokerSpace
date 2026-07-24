'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, MessageSquare, Check, ExternalLink, Trash2 } from 'lucide-react';

function timeAgo(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return Math.floor(seconds) + " seconds ago";
}

type InquiryWithProperty = {
  id: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  message: string;
  isRead: boolean;
  createdAt: Date;
  property: {
    title: string;
    images: { url: string }[];
  };
};

export default function InquiriesList({ initialInquiries }: { initialInquiries: InquiryWithProperty[] }) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const unreadExists = inquiries.some(inquiry => !inquiry.isRead);
    if (unreadExists) {
      // Optimistically mark all as read locally
      setInquiries(prev => prev.map(inq => ({ ...inq, isRead: true })));
      // Fire and forget API call to mark all as read in the DB
      fetch('/api/broker/inquiries/mark-all-read', { method: 'POST' }).catch(console.error);
    }
  }, []);

  const handleExpand = async (id: string, isRead: boolean) => {
    // Toggle expand
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);

    // If it's already read, do nothing else
    if (isRead) return;

    // Mark as read in UI optimistically
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, isRead: true } : inq));

    // Mark as read in DB
    try {
      await fetch(`/api/broker/inquiries/${id}/read`, { method: 'PATCH' });
    } catch (error) {
      console.error('Failed to mark inquiry as read', error);
      // Revert if failed
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, isRead: false } : inq));
    }
  };

  const openWhatsApp = (phone: string, clientName: string, propertyTitle: string) => {
    const waNumber = phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Hi ${clientName}, I am reaching out regarding your inquiry on BrokerSpace for the property: ${propertyTitle}.`);
    window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    // Optimistically remove from list
    setInquiries(prev => prev.filter(inq => inq.id !== id));

    try {
      const res = await fetch(`/api/broker/inquiries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    } catch (error) {
      console.error('Failed to delete inquiry', error);
      alert('Failed to delete inquiry. Please try again.');
      // Ideally we would revert the optimistic update here if we stored a backup
    }
  };

  return (
    <div className="grid gap-4">
      {inquiries.map((inquiry) => {
        const isExpanded = expandedId === inquiry.id;
        const imageUrl = inquiry.property.images[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80';
        
        return (
          <div 
            key={inquiry.id} 
            className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${!inquiry.isRead ? 'border-l-4 border-l-indigo-500 shadow-md bg-white/95' : 'border-l-4 border-l-transparent'}`}
          >
            {/* Header Row (Always visible) */}
            <div 
              className="p-5 flex items-center justify-between cursor-pointer group"
              onClick={() => handleExpand(inquiry.id, inquiry.isRead)}
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  <img src={imageUrl} alt="Property" className="w-full h-full object-cover" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-lg font-bold ${!inquiry.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                      {inquiry.clientName}
                    </h3>
                    {!inquiry.isRead && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-500 truncate max-w-[250px] sm:max-w-md">
                    Re: {inquiry.property.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-400">
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  <Calendar className="w-3.5 h-3.5" />
                  {timeAgo(inquiry.createdAt)}
                </div>
                <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-slate-100 text-slate-900' : 'group-hover:bg-slate-50 group-hover:text-slate-600'}`}>
                  <svg className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  
                  {/* Contact Info */}
                  <div className="md:col-span-1 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Details</h4>
                    
                    {inquiry.clientEmail && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4 text-indigo-500" />
                        </div>
                        <a href={`mailto:${inquiry.clientEmail}`} className="font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                          {inquiry.clientEmail}
                        </a>
                      </div>
                    )}
                    
                    {inquiry.clientPhone && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="font-medium text-slate-700">{inquiry.clientPhone}</span>
                      </div>
                    )}

                    {inquiry.clientPhone && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openWhatsApp(inquiry.clientPhone!, inquiry.clientName, inquiry.property.title);
                        }}
                        className="mt-2 w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-[#25D366]/20 transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Reply via WhatsApp
                      </button>
                    )}
                  </div>

                  {/* Message */}
                  <div className="md:col-span-2 flex flex-col h-full">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Inquiry Message</h4>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm text-sm text-slate-700 leading-relaxed relative mb-4">
                        <div className="absolute -left-2 top-6 w-4 h-4 bg-white border-l border-b border-slate-200/60 rotate-45" />
                        {inquiry.message}
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-auto">
                      <button 
                        onClick={(e) => handleDelete(e, inquiry.id)}
                        className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Inquiry
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
