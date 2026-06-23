"use client";

import { motion } from "framer-motion";
import { Check, X, ShieldAlert, Sparkles, LogIn } from "lucide-react";
import Link from "next/link";

export default function GuestVsFree() {
  return (
    <section className="bg-white px-6 py-24 border-b border-slate-200">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
            🎁 TIER COMPARISON
          </span>
          
          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Guest vs. Free Account
          </h2>
          
          <p className="mt-4 text-lg text-slate-600">
            Start completely anonymous to test it out, or register a free account in 2 seconds to unlock unlimited reviews and our career coach.
          </p>
        </div>

        {/* Cards Wrapper */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* Guest Tier */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="border border-slate-200 rounded-3xl p-8 flex flex-col justify-between hover:shadow-lg transition bg-slate-50/50"
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-800">Guest Tier</h3>
                <span className="text-xs px-2.5 py-1 bg-slate-200 text-slate-600 font-semibold rounded-full uppercase">Anonymous</span>
              </div>
              <p className="text-slate-500 mt-2 text-sm">Perfect for a quick test run.</p>
              
              <div className="mt-8 text-4xl font-extrabold text-slate-900">$0 <span className="text-sm font-medium text-slate-500">/ forever</span></div>
              
              {/* Feature List */}
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-slate-600 text-sm">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>2 resume reviews per day</span>
                </li>
                <li className="flex items-center gap-3 text-slate-600 text-sm">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Full ATS Score report (0-100)</span>
                </li>
                <li className="flex items-center gap-3 text-slate-600 text-sm">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Basic suggestion list</span>
                </li>
                <li className="flex items-center gap-3 text-slate-400 text-sm line-through">
                  <X className="w-5 h-5 text-slate-300 shrink-0" />
                  <span>Unlimited analyses</span>
                </li>
                <li className="flex items-center gap-3 text-slate-400 text-sm line-through">
                  <X className="w-5 h-5 text-slate-300 shrink-0" />
                  <span>Interactive AI Career Coach</span>
                </li>
                <li className="flex items-center gap-3 text-slate-400 text-sm line-through">
                  <X className="w-5 h-5 text-slate-300 shrink-0" />
                  <span>Resume and chat history tracking</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link 
                href="/analyze" 
                className="w-full inline-flex justify-center items-center py-3.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold transition text-sm shadow-sm"
              >
                Analyze as Guest
              </Link>
            </div>
          </motion.div>

          {/* Free Account Tier */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative border-2 border-blue-500 rounded-3xl p-8 flex flex-col justify-between hover:shadow-2xl transition bg-white"
          >
            {/* Pop badge */}
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Recommended
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">Free Account</h3>
                <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 font-bold rounded-full uppercase">Registered</span>
              </div>
              <p className="text-slate-500 mt-2 text-sm">For comprehensive job seekers.</p>
              
              <div className="mt-8 text-4xl font-extrabold text-slate-900">$0 <span className="text-sm font-medium text-slate-500">/ forever</span></div>
              
              {/* Feature List */}
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-slate-800 text-sm font-medium">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Unlimited resume reviews</span>
                </li>
                <li className="flex items-center gap-3 text-slate-800 text-sm font-medium">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Full ATS Score report (0-100)</span>
                </li>
                <li className="flex items-center gap-3 text-slate-800 text-sm font-medium">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Deep AI suggestion list & rewrites</span>
                </li>
                <li className="flex items-center gap-3 text-slate-800 text-sm font-medium">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Interactive AI Career Coach</span>
                </li>
                <li className="flex items-center gap-3 text-slate-800 text-sm font-medium">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Interactive Dashboard and history</span>
                </li>
                <li className="flex items-center gap-3 text-slate-800 text-sm font-medium">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Skill gap comparison matrices</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <button 
                onClick={() => {
                  // Simulate or navigate to sign up
                  const loginBtn = document.querySelector("button[class*='bg-gradient-to-r']");
                  if (loginBtn) (loginBtn as HTMLElement).click();
                }}
                className="w-full inline-flex justify-center items-center py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold transition text-sm shadow-md hover:shadow-lg"
              >
                <LogIn className="w-4 h-4 mr-2" /> Sign Up Free Now
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
