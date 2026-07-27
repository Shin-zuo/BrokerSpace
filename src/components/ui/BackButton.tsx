'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors font-medium cursor-pointer"
    >
      <ChevronLeft className="w-5 h-5" />
      Back
    </button>
  );
}
