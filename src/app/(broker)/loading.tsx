import React from 'react';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr_300px] gap-6 lg:gap-8 items-start">
        {/* Left Sidebar Skeleton */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-slate-200/60 h-[280px] rounded-2xl w-full"></div>
          <div className="bg-slate-200/60 h-[220px] rounded-2xl w-full"></div>
        </div>

        {/* Main Content Skeleton */}
        <div className="w-full max-w-2xl mx-auto min-w-0 space-y-6">
          <div className="bg-slate-200/60 h-[72px] rounded-2xl w-full"></div>
          <div className="bg-slate-200/60 h-[480px] rounded-2xl w-full"></div>
          <div className="bg-slate-200/60 h-[480px] rounded-2xl w-full"></div>
        </div>

        {/* Right Sidebar Skeleton */}
        <div className="hidden xl:block space-y-6">
          <div className="bg-slate-200/60 h-[180px] rounded-2xl w-full"></div>
        </div>
      </div>
    </div>
  );
}
