"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, ShieldAlert, Sparkles, Check } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialTab = "login" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setEmail("");
      setPassword("");
      setError("");
      setSuccess(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        if (activeTab === "login") {
          const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (authError) throw authError;
        } else {
          const { error: authError } = await supabase.auth.signUp({
            email,
            password,
          });
          if (authError) throw authError;
          setSuccess(true);
          setLoading(false);
          return;
        }
      } else {
        // Mock Auth Fallback Mode
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        const mockUser = {
          id: `usr-${Math.random().toString(36).substr(2, 9)}`,
          email,
          isGuest: false,
          createdAt: new Date().toISOString(),
        };
        
        localStorage.setItem("resumeiq_user", JSON.stringify(mockUser));
        localStorage.setItem("resumeiq_credits", "999"); // Mock users get unlimited credits
        
        // Dispatch custom storage event to alert other components immediately
        window.dispatchEvent(new Event("storage"));
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Force refresh user states
        window.location.reload();
      }, 1000);

    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err?.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-8 shadow-2xl z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Banner warning if in local fallback mode */}
          {!isSupabaseConfigured && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3 flex gap-2.5 items-start text-xs text-amber-800">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Local Mock Mode Active</span>
                Supabase credentials not configured in <code className="bg-amber-100 px-1 py-0.5 rounded text-[10px]">.env.local</code>. Authentication and credit balances will run via Local Storage.
              </div>
            </div>
          )}

          {/* Success screen */}
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {activeTab === "login" ? "Welcome Back!" : "Success!"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {activeTab === "login"
                  ? "Signing you in..."
                  : isSupabaseConfigured
                  ? "Check your email for the confirmation link!"
                  : "Signed up and logged in successfully!"}
              </p>
            </div>
          ) : (
            <>
              {/* Logo / Header */}
              <div className="mb-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl mb-3 shadow-md">
                  R
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {activeTab === "login" ? "Log in to ResumeIQ" : "Create your account"}
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  {activeTab === "login"
                    ? "Access your dashboard, resume reports, and coach conversations."
                    : "Start scoring your resumes and optimizing for recruiter filters."}
                </p>
              </div>

              {/* Tabs */}
              <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setError("");
                  }}
                  className={`w-1/2 rounded-md py-1.5 text-sm font-medium transition ${
                    activeTab === "login"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("signup");
                    setError("");
                  }}
                  className={`w-1/2 rounded-md py-1.5 text-sm font-medium transition ${
                    activeTab === "signup"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-semibold text-white shadow-lg hover:shadow-xl hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {activeTab === "login" ? "Sign In" : "Register Account"}
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
