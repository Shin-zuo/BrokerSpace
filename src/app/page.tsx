import React from 'react';
import Link from 'next/link';
import { Building2, Users, ShieldCheck, ArrowRight, TrendingUp, MessageCircle } from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-panel border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/brokerSpace.png" alt="BrokerSpace Logo" className="h-16 w-auto object-contain" />
            <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">BrokerSpace</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2 transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2.5 rounded-full shadow-md shadow-teal-500/20 transition-all">
              Sign up as Broker
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-32 overflow-hidden flex-1 flex flex-col justify-center items-center text-center">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-100/60 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/60 blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-teal-600 animate-pulse"></span>
            The Exclusive Network for Verified Real Estate Brokers
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
            Close deals faster in a <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">private broker network</span>
          </h1>
          <p className="text-lg lg:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Join thousands of licensed professionals to co-broke, share off-market listings, and communicate securely in real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-teal-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2 text-lg">
              Join the Network <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-bold px-8 py-4 rounded-full shadow-sm border border-slate-200 transition-all flex items-center justify-center gap-2 text-lg">
              Sign in to your account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Verified Professionals Only</h3>
              <p className="text-slate-600 leading-relaxed">
                Every member is verified. Say goodbye to spam and deal directly with licensed, serious real estate brokers.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Real-Time Direct Chat</h3>
              <p className="text-slate-600 leading-relaxed">
                Negotiate and clarify details instantly. Our built-in chat keeps your deals moving without needing external apps.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Personal Analytics</h3>
              <p className="text-slate-600 leading-relaxed">
                Track exactly how many brokers are viewing your shared listings and optimize your sales strategy with real data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/brokerSpace.png" alt="BrokerSpace Logo" className="h-12 w-auto object-contain" />
            <span className="text-xl font-bold text-white">BrokerSpace</span>
          </div>
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} BrokerSpace. Built for the modern real estate broker.</p>
        </div>
      </footer>
    </div>
  );
}

