"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import AuthModal from "./AuthModal";
import { User, LogOut, ShieldAlert } from "lucide-react";

interface NavUser {
  email: string;
  isGuest: boolean;
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
          setUser({ email: session.user.email || "", isGuest: false });
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
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setUser({ email: session.user.email || "", isGuest: false });
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
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-95 transition">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
              R
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">
                ResumeIQ AI
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-1">
                AI Resume Analyzer
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm text-slate-600 hover:text-blue-600 transition font-medium"
            >
              Home
            </Link>

            <Link
              href="/analyze"
              className="text-sm text-slate-600 hover:text-blue-600 transition font-medium"
            >
              Analyze
            </Link>

            <Link
              href="/dashboard"
              className="text-sm text-slate-600 hover:text-blue-600 transition font-medium"
            >
              Dashboard
            </Link>
          </div>

          {/* Buttons / User Panel */}
          <div className="flex items-center gap-3">
            {isGuest ? (
              <>
                <button
                  onClick={openLogin}
                  className="px-4 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-100 transition font-medium"
                >
                  Login
                </button>

                <button
                  onClick={openSignUp}
                  className="px-5 py-2 text-sm rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition duration-200"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {/* User email badge */}
                <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-medium text-slate-700 border border-slate-200">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span className="max-w-[150px] truncate">{user.email}</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogOut}
                  title="Sign Out"
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition active:scale-95"
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