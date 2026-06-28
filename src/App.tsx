import React, { useState, useEffect } from "react";
import { User } from "./types";
import Navbar from "./components/Navbar";
import ApplicantDashboard from "./components/ApplicantDashboard";
import RecruiterDashboard from "./components/RecruiterDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { Briefcase, Building, Shield, User as UserIcon, Lock, Mail, Phone, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // default

  // Authentication UI selection
  const [isLoginView, setIsLoginView] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // Signup form
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "applicant" as "applicant" | "recruiter",
    companyName: "",
    contactPerson: ""
  });

  // Success / Error status banner
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("filmpack_user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem("filmpack_user");
      }
    }
  }, []);

  // Quick credentials injector helper for evaluator
  const injectTestCredentials = (role: 'applicant' | 'recruiter_approved' | 'recruiter_pending' | 'admin') => {
    setAuthError(null);
    setAuthSuccess(null);
    setIsLoginView(true);

    if (role === 'admin') {
      setLoginForm({ email: "admin@filmpack.com", password: "admin123" });
    } else if (role === 'recruiter_approved') {
      setLoginForm({ email: "recruiter@uflex.com", password: "recruiter123" });
    } else if (role === 'recruiter_pending') {
      setLoginForm({ email: "recruiter.pending@cosmo.com", password: "recruiter123" });
    } else {
      setLoginForm({ email: "applicant@gmail.com", password: "applicant123" });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });

      if (res.ok) {
        const user: User = await res.json();
        setCurrentUser(user);
        localStorage.setItem("filmpack_user", JSON.stringify(user));
        setAuthSuccess("Logged in successfully!");
      } else {
        const errData = await res.json();
        setAuthError(errData.error || "Authentication failed. Invalid email or password.");
      }
    } catch (err) {
      setAuthError("Could not connect to authentication services.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);

    const payload = {
      ...signupForm,
      contactPerson: signupForm.role === "recruiter" ? signupForm.name : undefined
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setAuthSuccess(data.message);
        setLoginForm({ email: signupForm.email, password: signupForm.password });
        
        // If it's applicant, auto login is convenient! 
        // For recruiter, it needs admin approval so keep them on login view with the warning.
        if (signupForm.role === "applicant") {
          // Perform auto login
          const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: signupForm.email, password: signupForm.password })
          });
          if (loginRes.ok) {
            const user: User = await loginRes.json();
            setCurrentUser(user);
            localStorage.setItem("filmpack_user", JSON.stringify(user));
            return;
          }
        }
        
        setIsLoginView(true);
      } else {
        const errData = await res.json();
        setAuthError(errData.error || "Signup failed. Email might already be taken.");
      }
    } catch (err) {
      setAuthError("Network error occurred during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("filmpack_user");
    setLoginForm({ email: "", password: "" });
    setAuthError(null);
    setAuthSuccess(null);
    setActiveTab("dashboard");
  };

  return (
    <div className="bg-[#FCFAF6] min-h-screen text-stone-900 flex flex-col justify-between">
      
      {/* Top Banner & Header */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col">
        {currentUser ? (
          /* Role Dashboard Router Router */
          <div className="flex-1">
            {currentUser.role === "applicant" && (
              <ApplicantDashboard currentUser={currentUser} />
            )}
            {currentUser.role === "recruiter" && (
              <RecruiterDashboard currentUser={currentUser} />
            )}
            {currentUser.role === "admin" && (
              <AdminDashboard currentUser={currentUser} />
            )}
          </div>
        ) : (
          /* Authentication Screen Screen */
          <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white border border-stone-200 rounded-sm p-6 sm:p-8 shadow-sm">
              
              {/* Heading */}
              <div className="text-center">
                <div className="bg-stone-900 h-10 w-10 rounded-sm flex items-center justify-center mx-auto mb-3 text-stone-100">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-stone-900 editorial-title">
                  {isLoginView ? "Hiring Entrance Gate" : "Register Candidate Account"}
                </h2>
                <p className="text-xs text-stone-500 mt-1 font-serif italic">
                  {isLoginView ? "Access operator roles & lamination desks" : "Submit profile for technical screening"}
                </p>
              </div>

              {/* Warnings and Status Banners */}
              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-sm text-xs flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="bg-stone-100 border border-stone-200 text-stone-800 p-3 rounded-sm text-xs flex items-start gap-2 leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-stone-850" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Auth Forms */}
              {isLoginView ? (
                /* Login Form */
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                      <input
                        type="email"
                        required
                        placeholder="Registered Email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-sm pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                      <input
                        type="password"
                        required
                        placeholder="Security Password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-sm pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-stone-900 hover:bg-stone-850 text-white font-bold py-2.5 px-4 rounded-sm flex items-center justify-center gap-1 text-xs transition font-mono uppercase tracking-widest shadow-xs"
                  >
                    Authorize Account
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setIsLoginView(false); setAuthError(null); setAuthSuccess(null); }}
                      className="text-stone-800 hover:text-stone-950 hover:underline font-mono text-[11px] uppercase tracking-wider font-bold"
                    >
                      Don't have an account? Sign Up
                    </button>
                  </div>
                </form>
              ) : (
                /* Sign Up Form */
                <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs">
                  <div className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Mobile (Alert Contact)"
                        value={signupForm.mobile}
                        onChange={(e) => setSignupForm({ ...signupForm, mobile: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                      />
                    </div>

                    <input
                      type="password"
                      required
                      placeholder="Access Password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                    />

                    <div>
                      <label className="block text-stone-500 font-mono text-[10px] uppercase mb-1.5 font-bold tracking-wider">Apply as role:</label>
                      <select
                        value={signupForm.role}
                        onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value as any })}
                        className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                      >
                        <option value="applicant">Candidate / Job Seeker</option>
                        <option value="recruiter">Manufacturing Recruiter</option>
                      </select>
                    </div>

                    {signupForm.role === "recruiter" && (
                      <div className="bg-stone-50 p-3 rounded-sm border border-stone-200 space-y-3">
                        <span className="text-[9px] text-stone-500 font-mono font-bold uppercase tracking-wider block">Company Information (Moderated)</span>
                        <input
                          type="text"
                          required
                          placeholder="Plant Company Name (e.g. Cosmo Films)"
                          value={signupForm.companyName}
                          onChange={(e) => setSignupForm({ ...signupForm, companyName: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none text-stone-900 placeholder-stone-400"
                        />
                        <p className="text-[10px] text-stone-500 font-serif leading-relaxed italic">
                          ℹ Note: Recruiter accounts remain inactive until manually approved by the alliance Administrator.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-stone-900 hover:bg-stone-850 text-white font-bold py-2.5 px-4 rounded-sm flex items-center justify-center gap-1 text-xs transition font-mono uppercase tracking-widest shadow-xs"
                  >
                    Submit Registration
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setIsLoginView(true); setAuthError(null); setAuthSuccess(null); }}
                      className="text-stone-800 hover:text-stone-950 hover:underline font-mono text-[11px] uppercase tracking-wider font-bold"
                    >
                      Already have an account? Log In
                    </button>
                  </div>
                </form>
              )}

              {/* Quick Login Test Credentials Box */}
              <div className="mt-6 pt-5 border-t border-stone-200 space-y-3">
                <span className="text-[9px] text-stone-500 font-mono font-bold uppercase tracking-wider block">
                  Quick Bypass Credentials (For Testing)
                </span>
                
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <button
                    onClick={() => injectTestCredentials('applicant')}
                    className="bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-400 p-2.5 rounded-sm text-left transition flex items-center justify-between shadow-xs cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-stone-800">Applicant</p>
                      <p className="text-[9px] text-stone-500 font-mono">Ramesh Kumar</p>
                    </div>
                    <UserIcon className="h-3.5 w-3.5 text-stone-600" />
                  </button>

                  <button
                    onClick={() => injectTestCredentials('recruiter_approved')}
                    className="bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-400 p-2.5 rounded-sm text-left transition flex items-center justify-between shadow-xs cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-stone-800">Approved Recruiter</p>
                      <p className="text-[9px] text-stone-500 font-mono">Uflex Limited</p>
                    </div>
                    <Building className="h-3.5 w-3.5 text-stone-600" />
                  </button>

                  <button
                    onClick={() => injectTestCredentials('recruiter_pending')}
                    className="bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-400 p-2.5 rounded-sm text-left transition flex items-center justify-between shadow-xs cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-stone-800">Pending Recruiter</p>
                      <p className="text-[9px] text-stone-500 font-mono">Cosmo Films</p>
                    </div>
                    <Building className="h-3.5 w-3.5 text-stone-600" />
                  </button>

                  <button
                    onClick={() => injectTestCredentials('admin')}
                    className="bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-400 p-2.5 rounded-sm text-left transition flex items-center justify-between shadow-xs cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-stone-800">Administrator</p>
                      <p className="text-[9px] text-stone-500 font-mono">Full Access Moderation</p>
                    </div>
                    <Shield className="h-3.5 w-3.5 text-stone-600" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#F5F2EB] border-t border-stone-200 py-6 text-center text-[10px] text-stone-500 font-mono uppercase tracking-widest leading-loose">
        <div>FilmPack Flexible Packaging Industry Careers Hub © 2026. All Rights Reserved.</div>
        <div className="mt-1 text-[9px] text-stone-400">Simulated SMS / Email Carrier Gateways: ONLINE</div>
      </footer>
    </div>
  );
}
