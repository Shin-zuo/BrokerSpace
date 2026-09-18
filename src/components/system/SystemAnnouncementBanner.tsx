'use client';

import React, { useState } from 'react';
import { Megaphone, AlertTriangle, X } from 'lucide-react';

interface SystemAnnouncementBannerProps {
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  announcementActive?: boolean;
  announcementBanner?: string;
}

export default function SystemAnnouncementBanner({
  maintenanceMode,
  maintenanceMessage,
  announcementActive,
  announcementBanner,
}: SystemAnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (maintenanceMode && maintenanceMessage) {
    return (
      <div className="bg-amber-600 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-between gap-3 sticky top-16 z-30">
        <div className="flex items-center gap-2 max-w-5xl mx-auto flex-1 justify-center text-center">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-200" />
          <span>{maintenanceMessage}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-amber-200 hover:text-white rounded transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (announcementActive && announcementBanner) {
    return (
      <div className="bg-indigo-600 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-between gap-3 sticky top-16 z-30">
        <div className="flex items-center gap-2 max-w-5xl mx-auto flex-1 justify-center text-center">
          <Megaphone className="w-4 h-4 shrink-0 text-indigo-200" />
          <span>{announcementBanner}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-indigo-200 hover:text-white rounded transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return null;
}
