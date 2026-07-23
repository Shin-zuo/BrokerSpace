'use client';

import React from 'react';
import { X, Building2, User } from 'lucide-react';
import InquiryForm from './InquiryForm';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number | string;
  brokerName: string;
  brokerWhatsApp: string;
}

export default function InquiryModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  propertyPrice,
  brokerName,
  brokerWhatsApp,
}: InquiryModalProps) {
  if (!isOpen) return null;

  const formatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1 mb-1">
              <Building2 className="w-3.5 h-3.5" /> Direct Inquiry
            </span>
            <h3 className="text-lg font-bold line-clamp-1">{propertyTitle}</h3>
            <p className="text-sm font-medium text-indigo-200 mt-0.5">
              {typeof propertyPrice === 'number' ? formatter.format(propertyPrice) : propertyPrice}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subheader / Broker Info */}
        <div className="px-5 py-2.5 bg-indigo-50/60 border-b border-indigo-100/50 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-medium">
            <User className="w-3.5 h-3.5 text-indigo-600" />
            Broker: <strong className="text-slate-900">{brokerName}</strong>
          </span>
          <span className="text-emerald-700 bg-emerald-100/70 font-semibold px-2 py-0.5 rounded-full text-[10px]">
            WhatsApp Ready
          </span>
        </div>

        {/* Modal Body / Form */}
        <div className="p-5">
          <InquiryForm
            propertyId={propertyId}
            propertyTitle={propertyTitle}
            brokerWhatsApp={brokerWhatsApp}
          />
        </div>
      </div>
    </div>
  );
}
