import React from 'react';
import Link from 'next/link';
import { Building2, Users, ShieldCheck, ArrowRight, TrendingUp, MessageCircle, Check, Zap, Sparkles } from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col scroll-smooth">
      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-panel border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <img src="/brokerSpace.png" alt="BrokerSpace Logo" className="h-12 sm:h-16 w-auto object-contain" />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent hidden sm:block">BrokerSpace</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="#pricing" className="text-slate-600 hover:text-slate-900 font-medium px-2 sm:px-3 py-2 transition-colors text-sm sm:text-base hidden sm:inline-block">
              Pricing
            </Link>
            <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium px-2 sm:px-4 py-2 transition-colors text-sm sm:text-base">
              Log in
            </Link>
            <Link href="#pricing" className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-md shadow-teal-500/20 transition-all text-sm sm:text-base whitespace-nowrap">
              Sign up <span className="hidden sm:inline">as Broker</span>
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
            <Link href="#pricing" className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-teal-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2 text-lg">
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

      {/* Subscription Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-semibold mb-4">
              <Zap className="w-4 h-4 text-teal-600" />
              Simple, Transparent Pricing
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Choose your membership plan
            </h2>
            <p className="text-lg text-slate-600">
              Select your subscription to unlock exclusive broker tools, co-broking channels, and direct deal opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Monthly Plan Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative group">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                    Monthly Access
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Monthly Flexible</h3>
                <p className="text-slate-600 text-sm mb-6">
                  Perfect for independent brokers getting started with the network. Cancel anytime.
                </p>

                <div className="flex items-baseline gap-2 mb-8 pb-6 border-b border-slate-100">
                  <span className="text-5xl font-black text-slate-900">₱499</span>
                  <span className="text-slate-500 font-medium">/ month</span>
                </div>

                <ul className="space-y-3.5 text-sm text-slate-700 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Full access to private broker network</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Direct messaging & deal negotiation chat</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Unlimited off-market & public listings</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Real-time listing view & engagement analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Co-broking partner search & connection tools</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?plan=monthly"
                className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-center transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group-hover:bg-teal-600"
              >
                Get Started Monthly <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Yearly Plan Card (Highlighted) */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-teal-500 shadow-xl shadow-teal-500/10 hover:shadow-2xl hover:shadow-teal-500/20 transition-all flex flex-col justify-between relative">
              {/* Popular Badge */}
              <div className="absolute -top-4 right-8 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs font-extrabold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Best Value • Save ₱989
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                    Annual Access (Discounted)
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Annual Membership</h3>
                <p className="text-slate-600 text-sm mb-6">
                  Get full year access at our best discounted rate. Equivalent to ~2 months free.
                </p>

                <div className="flex items-baseline gap-2 mb-2 pb-2">
                  <span className="text-5xl font-black text-slate-900">₱4,999</span>
                  <span className="text-slate-500 font-medium">/ year</span>
                </div>
                <div className="text-xs font-semibold text-teal-600 mb-8 pb-6 border-b border-slate-100 flex items-center gap-1.5">
                  <span>Only ~₱416 / month • Save ₱989 compared to monthly</span>
                </div>

                <ul className="space-y-3.5 text-sm text-slate-700 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Full access to private broker network</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Direct messaging & deal negotiation chat</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Unlimited off-market & public listings</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Real-time listing view & engagement analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Co-broking partner search & connection tools</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?plan=yearly"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-center transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 flex items-center justify-center gap-2"
              >
                Get Started Yearly <ArrowRight className="w-4 h-4" />
              </Link>
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
