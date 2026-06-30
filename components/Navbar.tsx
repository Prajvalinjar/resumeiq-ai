"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import AuthModal from "./AuthModal";
import { User, LogOut, ShieldAlert } from "lucide-react";

interface NavUser {
  email: string;
  isGuest: boolean;
  isAdmin?: boolean;
}

export default function Navbar() {
  const [user, setUser] = useState<NavUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");

  // Sync auth state
  useEffect(() => {
    // 1. Get initial session
    const initializeAuth = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch is_admin
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", session.user.id)
            .single();
          
          setUser({
            email: session.user.email || "",
            isGuest: false,
            isAdmin: !!profile?.is_admin
          });
          return;
        }
      }
      
      // Fallback/Guest check
      const storedUser = localStorage.getItem("resumeiq_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser({ email: "guest@resumeiq.ai", isGuest: true });
      }
    };

    initializeAuth();

    // 2. Subscribe to auth changes
    let subscription: any = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user && supabase) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", session.user.id)
            .single();

          setUser({
            email: session.user.email || "",
            isGuest: false,
            isAdmin: !!profile?.is_admin
          });
        } else {
          // If logged out from Supabase, revert to guest or local storage
          const storedUser = localStorage.getItem("resumeiq_user");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            setUser({ email: "guest@resumeiq.ai", isGuest: true });
          }
        }
      });
      subscription = data.subscription;
    }

    // 3. Listen to local storage changes (for simulated login/logout)
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("resumeiq_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser({ email: "guest@resumeiq.ai", isGuest: true });
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      if (subscription) subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    
    // Clear local mock session if any
    localStorage.removeItem("resumeiq_user");
    localStorage.setItem("resumeiq_credits", "2"); // Reset to guest credits
    setUser({ email: "guest@resumeiq.ai", isGuest: true });
    
    // Alert other components
    window.dispatchEvent(new Event("storage"));
    
    // Redirect to home page
    window.location.href = "/";
  };

  const openLogin = () => {
    setAuthModalTab("login");
    setIsAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthModalTab("signup");
    setIsAuthModalOpen(true);
  };

  const isGuest = !user || user.isGuest;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#020617]/70 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group hover:opacity-100 transition-all duration-300">
            <div className="relative w-10 h-10 flex-shrink-0">
              {/* Animated glow ring */}
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#22d3ee] opacity-60 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-500 animate-pulse" />
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/20 shadow-[0_0_20px_rgba(99,102,241,0.45)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.55)] transition-all duration-500">
                <Image
                  src="/logo.png"
                  alt="ResumeIQ AI Logo"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
            </div>

            <div>
              <h1 className="text-lg font-bold text-white leading-none tracking-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-cyan-300 group-hover:bg-clip-text transition-all duration-300">
                ResumeIQ <span className="bg-gradient-to-r from-cyan-400 to-[#8b5cf6] bg-clip-text text-transparent">AI</span>
              </h1>
              <p className="text-[9px] text-slate-400 font-semibold tracking-widest uppercase mt-1">
                AI Resume Analyzer
              </p>
            </div>
          </Link>


          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-slate-300 hover:text-white hover:shadow-[0_0_8px_rgba(255,255,255,0.1)] transition font-medium"
            >
              Home
            </Link>

            <Link
              href="/analyze"
              className="text-sm text-slate-300 hover:text-white transition font-medium"
            >
              Analyze
            </Link>

            <Link
              href="/dashboard/overview"
              className="text-sm text-slate-300 hover:text-white transition font-medium"
            >
              Dashboard
            </Link>

            <Link
              href="/history"
              className="text-sm text-slate-300 hover:text-white transition font-medium"
            >
              History
            </Link>

            <Link
              href="/dashboard/analytics"
              className="text-sm text-slate-300 hover:text-white transition font-medium"
            >
              Analytics
            </Link>

            {/* More dropdown */}
            <div className="relative group">
              <button className="text-sm text-slate-300 hover:text-white transition font-medium flex items-center gap-1">
                More
                <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#0b1120]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                <Link href="/compare" className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition">
                  Compare Resumes
                </Link>
                <Link href="/job-match" className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition">
                  Job Match
                </Link>
                <Link href="/assistant" className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition">
                  AI Assistant
                </Link>
                {user?.isAdmin && (
                  <Link href="/admin" className="block px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/[0.05] font-bold transition">
                    Admin Panel
                  </Link>
                )}
                <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition">
                  Legacy Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Buttons / User Panel */}
          <div className="flex items-center gap-3">
            {isGuest ? (
              <>
                <button
                  onClick={openLogin}
                  className="px-4 py-2 text-sm rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition font-medium"
                >
                  Login
                </button>

                <button
                  onClick={openSignUp}
                  className="px-5 py-2 text-sm rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:scale-[1.02] active:scale-[0.98] transition duration-200"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {/* User email badge */}
                <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-slate-300 border border-white/[0.08]">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span className="max-w-[150px] truncate">{user.email}</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogOut}
                  title="Sign Out"
                  className="p-2 rounded-lg border border-white/10 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition active:scale-95"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* Auth Modal Component */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  );
}