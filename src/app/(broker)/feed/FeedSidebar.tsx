"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { User as UserIcon, Building2, Network, X } from 'lucide-react';
import { useSidebar } from '@/src/components/layout/SidebarContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeedSidebar({ currentUser }: { currentUser: any }) {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSidebarOpen]);

  const SidebarContent = () => (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="h-16 bg-gradient-to-r from-teal-500 to-cyan-600"></div>
        <div className="px-6 pb-6 relative">
          <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-teal-600 -mt-8 mb-3 overflow-hidden">
             {currentUser?.broker?.profilePictureUrl ? (
               <img src={currentUser.broker.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <UserIcon className="w-8 h-8" />
             )}
          </div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">{currentUser?.broker?.name || 'Broker'}</h2>
          <p className="text-sm text-slate-500 mb-4">@{currentUser?.username || 'broker'}</p>
          
          <div className="flex items-center justify-between text-sm text-slate-600 border-t border-slate-100 pt-4">
            <span>My Listings</span>
            <span className="font-bold text-slate-900">Active</span>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Link href={`/${currentUser?.username || 'profile'}`} onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer">
          <UserIcon className="w-5 h-5 text-slate-400" />
          My Profile
        </Link>
        <Link href="/properties" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer">
          <Building2 className="w-5 h-5 text-slate-400" />
          Manage Listings
        </Link>
        <Link href="/saved" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark text-slate-400">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
          Saved Listings
        </Link>
        <Link href="/network" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer">
          <Network className="w-5 h-5 text-slate-400" />
          My Network
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-24">
        <SidebarContent />
      </div>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[100] flex lg:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Sidebar Drawer */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-[280px] max-w-[85vw] bg-slate-50 h-full shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 z-10 flex justify-end p-2 pb-0">
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-slate-500 hover:bg-slate-200 bg-white/50 backdrop-blur rounded-full transition-colors border-none outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 pt-2">
                <SidebarContent />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
