'use client';

import React from 'react';
import { X, Printer, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

export interface InvoiceData {
  id: string;
  xenditInvoiceId: string;
  externalId: string;
  amount: number | string;
  currency: string;
  plan: string;
  status: string;
  paymentMethod: string | null;
  payerEmail: string | null;
  paidAt: Date | string | null;
  createdAt: Date | string;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
  broker: {
    name: string;
    whatsappNumber: string;
    companyName?: string | null;
    licenseNumber?: string | null;
    publicEmail?: string | null;
  };
}

export default function InvoiceModal({ isOpen, onClose, invoice, broker }: InvoiceModalProps) {
  if (!isOpen || !invoice) return null;

  const invoiceDate = new Date(invoice.paidAt || invoice.createdAt);
  const isPaid = invoice.status === 'PAID';
  const amountNumber = Number(invoice.amount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Card */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Top bar with actions */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between print:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Invoice Details
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-8 print:p-0 print:space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <img src="/brokerSpace.png" alt="BrokerSpace Logo" className="h-10 w-auto object-contain" />
                <span className="text-2xl font-black text-slate-900 tracking-tight">BrokerSpace</span>
              </div>
              <p className="text-xs text-slate-500">Verified Real Estate Broker Network</p>
              <p className="text-xs text-slate-400">Philippines</p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-2 bg-teal-50 text-teal-700 border border-teal-200">
                Official Receipt / Invoice
              </span>
              <div className="font-mono text-xs text-slate-500">
                Invoice No: <span className="font-bold text-slate-800">{invoice.xenditInvoiceId || invoice.externalId}</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Date: <span className="font-medium text-slate-700">{invoiceDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 ${
            isPaid 
              ? 'bg-emerald-50 border border-emerald-200/80 text-emerald-800' 
              : 'bg-amber-50 border border-amber-200/80 text-amber-800'
          }`}>
            <div className="flex items-center gap-2">
              {isPaid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <span className="font-bold text-sm">
                Payment Status: {isPaid ? 'PAID & SETTLED' : invoice.status}
              </span>
            </div>
            <div className="text-xs font-semibold">
              {invoice.paymentMethod || 'Online Gateway'}
            </div>
          </div>

          {/* Billed To & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Billed To</span>
              <h4 className="font-bold text-slate-900 text-base">{broker.name}</h4>
              <p className="text-slate-600 text-xs">{invoice.payerEmail || broker.publicEmail || 'Registered Broker Email'}</p>
              <p className="text-slate-600 text-xs">WhatsApp: {broker.whatsappNumber}</p>
              {broker.companyName && (
                <p className="text-slate-600 text-xs">Agency: {broker.companyName}</p>
              )}
              {broker.licenseNumber && (
                <p className="text-slate-500 text-[11px]">PRC Lic: {broker.licenseNumber}</p>
              )}
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Channel</span>
              <p className="font-semibold text-slate-800 text-sm">
                {invoice.paymentMethod ? `${invoice.paymentMethod} (via Xendit)` : 'Xendit Payment Gateway'}
              </p>
              <p className="text-slate-500 text-xs">Currency: {invoice.currency || 'PHP'}</p>
              <p className="text-slate-500 text-xs">
                Processed: {invoiceDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-4 text-center">Duration</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">
                      BrokerSpace {invoice.plan === 'yearly' ? 'Annual' : 'Monthly'} Membership
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Full access to verified broker network, exclusive listings, and direct chat
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center text-slate-600 font-medium">
                    {invoice.plan === 'yearly' ? '365 Days' : '30 Days'}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-slate-900">
                    ₱{amountNumber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50/80 border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="py-3 px-4 font-bold text-slate-800 text-right">
                    Total Paid:
                  </td>
                  <td className="py-3 px-4 font-extrabold text-slate-900 text-right text-base text-teal-700">
                    ₱{amountNumber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Official electronic tax receipt verified by BrokerSpace and Xendit.</span>
            </div>
            <div className="font-mono text-[10px]">
              Ref: {invoice.externalId}
            </div>
          </div>
        </div>

        {/* Modal Close Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
