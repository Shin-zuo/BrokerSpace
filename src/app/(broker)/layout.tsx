import React from "react";
import Sidebar from "@/src/components/layout/Sidebar";
import BrokerHeader from "@/src/components/layout/BrokerHeader";

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
        <BrokerHeader />
        
        <main className="flex-1 p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
