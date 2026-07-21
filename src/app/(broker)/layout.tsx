import React from "react";
import Sidebar from "@/src/components/layout/Sidebar";

export default function BrokerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex text-slate-900">
      {/* Sidebar Component */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative z-10">
        <header className="h-20 glass-panel border-b border-white/50 flex items-center px-10 sticky top-0 z-10 backdrop-blur-xl bg-white/40">
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Broker Dashboard</h1>
        </header>
        
        <main className="flex-1 p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
