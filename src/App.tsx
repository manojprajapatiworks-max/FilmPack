import React, { useState, useEffect } from "react";
import { User } from "./types";
import Navbar from "./components/Navbar";
import ApplicantDashboard from "./components/ApplicantDashboard";
import RecruiterDashboard from "./components/RecruiterDashboard";
import AdminDashboard from "./components/AdminDashboard";
import PackagingFilmShowcase from "./components/PackagingFilmShowcase";
import { Film, Building, Shield, User as UserIcon, Lock, Mail, Phone, ArrowRight, CheckCircle2, AlertCircle, Instagram, Facebook, MessageCircle, Linkedin, MessageSquare, Globe, MapPin } from "lucide-react";

const HD_ENTRANCE_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
    label: "BOPP High-Speed Extrusion Line #1 (480 m/min)"
  },
  {
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    label: "Metallized BOPET & Foil Deposition Chamber"
  },
  {
    url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    label: "Laser-Guided Slitting Desk & Roll Rewinding"
  },
  {
    url: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
    label: "3-Layer Co-Extruded CPP Retort Barrier Plant"
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // default

  // Authentication UI selection
  const [isLoginView, setIsLoginView] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [authBgIndex, setAuthBgIndex] = useState(0);

  const [siteConfig, setSiteConfig] = useState<any>({
    footer: {
      copyrightName: "FilmPack Packaging Film Business Alliance",
      copyrightText: "© 2026 FilmPack Alliance India. All Rights Reserved.",
      contactPhone: "+91 98765 43210",
      contactEmail: "careers@filmpack.global",
      contactAddress: "Industrial Packaging Area, Phase-4, Mumbai, India",
      addressText: "FilmPack Tower, Film City, Noida, UP 201301",
      socialLinks: {
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        whatsapp: "https://whatsapp.com",
        linkedin: "https://linkedin.com",
        line: "https://line.me"
      }
    },
    socialLinks: {
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
      whatsapp: "https://whatsapp.com",
      linkedin: "https://linkedin.com",
      line: "https://line.me"
    }
  });

  useEffect(() => {
    fetch("/api/site-config")
      .then(r => r.json())
      .then(data => {
        if (data) {
          const socialLinks = {
            instagram: "https://instagram.com",
            facebook: "https://facebook.com",
            whatsapp: "https://whatsapp.com",
            linkedin: "https://linkedin.com",
            line: "https://line.me",
            ...(data.socialLinks || data.footer?.socialLinks || {})
          };
          setSiteConfig({ ...data, socialLinks, footer: { ...data.footer, socialLinks } });
        }
      })
      .catch(e => console.error("Error loading site config in App", e));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setAuthBgIndex((prev) => (prev + 1) % HD_ENTRANCE_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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
          <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
            <PackagingFilmShowcase />
            {currentUser.role === "applicant" && (
              <ApplicantDashboard currentUser={currentUser} siteConfig={siteConfig} />
            )}
            {currentUser.role === "recruiter" && (
              <RecruiterDashboard currentUser={currentUser} siteConfig={siteConfig} />
            )}
            {currentUser.role === "admin" && (
              <AdminDashboard currentUser={currentUser} siteConfig={siteConfig} />
            )}
          </div>
        ) : (
          /* Authentication Screen Screen */
          <div className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem-4.5rem)]">
            
            {/* Left Decorative/Info Side - Joyful Packaging Film Web Aesthetic with HD Photo Reel */}
            <div className="hidden lg:flex lg:col-span-5 bg-stone-900 text-stone-100 p-10 flex-col justify-between relative overflow-hidden border-r border-stone-800 shadow-2xl">
              {/* Animated HD Photo Background */}
              <img
                key={authBgIndex}
                src={HD_ENTRANCE_IMAGES[authBgIndex].url}
                alt="Packaging Film Manufacturing"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-30 scale-105 transition-all duration-1000 ease-out pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/80 to-stone-950/70 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
              
              <div className="space-y-8 relative z-10">
                <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-sm text-[10px] font-mono uppercase tracking-widest backdrop-blur-md shadow-sm font-bold">
                  <Film className="h-4 w-4 text-amber-400" />
                  INDIA'S #1 FILM MANUFACTURING NETWORK
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-4xl font-serif font-bold text-white tracking-tight leading-tight drop-shadow-md">
                    The Pulse of <br />
                    <span className="italic text-amber-300 font-normal">Flexible Packaging</span> <br />
                    Careers.
                  </h2>
                  <p className="text-stone-300 text-sm leading-relaxed font-serif drop-shadow">
                    Connecting certified extrusion operators, slitting technicians, and plant managers with leading BOPP, BOPET & CPP film facilities.
                  </p>
                </div>

                {/* Live HD Image Caption & Grade Badge */}
                <div className="pt-2 space-y-3">
                  <div className="relative p-5 bg-stone-900/85 border border-stone-700/80 rounded-md backdrop-blur-md shadow-xl">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-bold">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" />
                        LIVE PLANT FEED
                      </p>
                      <span className="text-[9px] font-mono text-stone-400 bg-stone-800 px-2 py-0.5 rounded">LINE #{authBgIndex + 1}</span>
                    </div>
                    <p className="text-xs font-serif text-white font-bold mb-3">{HD_ENTRANCE_IMAGES[authBgIndex].label}</p>
                    
                    <p className="text-[9px] font-mono uppercase tracking-wider text-stone-400 mb-1 border-t border-stone-800 pt-2">Co-Extrusion Layer Structure</p>
                    <div className="mt-2 flex gap-1 h-2">
                      <div className="flex-1 bg-amber-500/80 rounded-full shadow-2xs" title="Top Sealing Layer (2µ)" />
                      <div className="flex-[3_3_0%] bg-emerald-500/80 rounded-full shadow-2xs" title="Core Barrier Layer (12µ)" />
                      <div className="flex-1 bg-amber-500/80 rounded-full shadow-2xs" title="Printable Layer (2µ)" />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[8px] font-mono text-stone-400 font-semibold">
                      <span>Seal (2µ)</span>
                      <span>Core BOPP/CPP (12µ)</span>
                      <span>Corona Print (2µ)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 relative z-10 pt-6 border-t border-stone-800/80">
                <div className="grid grid-cols-3 gap-2.5 text-left">
                  <div className="bg-stone-900/80 p-2.5 rounded border border-stone-800 backdrop-blur-xs">
                    <p className="text-xl font-black text-white font-mono">14+</p>
                    <p className="text-[9px] text-stone-400 uppercase tracking-widest font-mono">Plants Live</p>
                  </div>
                  <div className="bg-stone-900/80 p-2.5 rounded border border-stone-800 backdrop-blur-xs">
                    <p className="text-xl font-black text-amber-400 font-mono">480m</p>
                    <p className="text-[9px] text-stone-400 uppercase tracking-widest font-mono">Line Speed</p>
                  </div>
                  <div className="bg-stone-900/80 p-2.5 rounded border border-stone-800 backdrop-blur-xs">
                    <p className="text-xl font-black text-emerald-400 font-mono">100%</p>
                    <p className="text-[9px] text-stone-400 uppercase tracking-widest font-mono">Audit Certified</p>
                  </div>
                </div>
                <p className="text-[10px] text-stone-400 font-mono tracking-wider uppercase flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
                  SECURE ENTERPRISE HIRING GATEWAY
                </p>
              </div>
            </div>

            {/* Right Form Side */}
            <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#FCFAF6]/60 relative">
              {/* Matrix grid background */}
              <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
              
              <div className="max-w-md w-full space-y-6 sm:space-y-8 bg-white border border-stone-200 rounded-sm p-5 sm:p-8 shadow-md relative z-10">
                
                {/* Heading */}
                <div className="text-center">
                  <div className="bg-stone-900 h-10 w-10 rounded-sm flex items-center justify-center mx-auto mb-3 text-stone-100">
                    <Film className="h-5 w-5" />
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
                      className="w-full bg-stone-900 hover:bg-stone-850 text-white font-bold py-2.5 px-4 rounded-sm flex items-center justify-center gap-1 text-xs transition font-mono uppercase tracking-widest shadow-xs cursor-pointer"
                    >
                      Authorize Account
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => { setIsLoginView(false); setAuthError(null); setAuthSuccess(null); }}
                        className="text-stone-800 hover:text-stone-950 hover:underline font-mono text-[11px] uppercase tracking-wider font-bold cursor-pointer"
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
                      className="w-full bg-stone-900 hover:bg-stone-850 text-white font-bold py-2.5 px-4 rounded-sm flex items-center justify-center gap-1 text-xs transition font-mono uppercase tracking-widest shadow-xs cursor-pointer"
                    >
                      Submit Registration
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => { setIsLoginView(true); setAuthError(null); setAuthSuccess(null); }}
                        className="text-stone-800 hover:text-stone-950 hover:underline font-mono text-[11px] uppercase tracking-wider font-bold cursor-pointer"
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

          </div>
        )}
      </div>

      {/* Dynamic & Editable Footer with Social Media Jump Icons - Requirement 5 */}
      <footer id="website-footer" className="bg-[#18181b] text-stone-300 font-sans border-t border-stone-800 py-8 sm:py-10 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 pb-8 border-b border-stone-800 text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              {siteConfig?.header?.logoUrl && (
                <img src={siteConfig.header.logoUrl} alt="Company Logo" className="h-7 sm:h-8 w-auto max-w-[130px] sm:max-w-[140px] object-contain" referrerPolicy="no-referrer" />
              )}
              <h4 className="font-serif font-bold text-sm sm:text-base text-white tracking-tight">{siteConfig?.footer?.copyrightName || siteConfig?.footer?.copyrightText || "FilmPack Alliance"}</h4>
            </div>
            <p className="text-xs text-stone-400 font-serif leading-relaxed">{siteConfig?.header?.tagline || "BOPP • BOPET • CPP • BARRIER FILM JOBS"}</p>
            <p className="text-[11px] text-stone-500 font-mono pt-1">Simulated SMS / Email Carrier Gateways: <span className="text-emerald-400 font-bold">● ONLINE</span></p>
          </div>

          <div className="space-y-2 font-mono text-xs text-stone-400">
            <p className="font-bold text-stone-200 uppercase text-[10px] tracking-widest mb-1">Corporate Alliance Desk</p>
            <p className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-amber-500" /> {siteConfig?.footer?.contactPhone || "+91 98765 43210"}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-amber-500" /> {siteConfig?.footer?.contactEmail || "careers@filmpack.global"}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-amber-500" /> {siteConfig?.footer?.contactAddress || siteConfig?.footer?.addressText || "Industrial Packaging Area, Phase-4, Mumbai"}
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-bold text-stone-200 uppercase font-mono text-[10px] tracking-widest">Connect & Jump Directly</p>
            <p className="text-xs text-stone-400 font-serif">Follow live packaging plant updates and operator openings across social channels:</p>
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <a
                href={(siteConfig?.socialLinks || siteConfig?.footer?.socialLinks)?.instagram || "https://instagram.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-stone-800 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 text-stone-300 hover:text-white p-2.5 rounded-sm transition shadow-md cursor-pointer flex items-center gap-1.5 text-xs font-bold font-mono uppercase"
                title="Jump directly to official Instagram page"
              >
                <Instagram className="h-4 w-4 text-pink-400" />
                <span>Instagram</span>
              </a>
              <a
                href={(siteConfig?.socialLinks || siteConfig?.footer?.socialLinks)?.facebook || "https://facebook.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-stone-800 hover:bg-blue-600 text-stone-300 hover:text-white p-2.5 rounded-sm transition shadow-md cursor-pointer flex items-center gap-1.5 text-xs font-bold font-mono uppercase"
                title="Jump directly to official Facebook page"
              >
                <Facebook className="h-4 w-4 text-blue-400" />
                <span>Facebook</span>
              </a>
              <a
                href={(siteConfig?.socialLinks || siteConfig?.footer?.socialLinks)?.whatsapp || "https://whatsapp.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-stone-800 hover:bg-emerald-600 text-stone-300 hover:text-white p-2.5 rounded-sm transition shadow-md cursor-pointer flex items-center gap-1.5 text-xs font-bold font-mono uppercase"
                title="Jump directly to WhatsApp Helpdesk"
              >
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
              <a
                href={(siteConfig?.socialLinks || siteConfig?.footer?.socialLinks)?.linkedin || "https://linkedin.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-stone-800 hover:bg-cyan-600 text-stone-300 hover:text-white p-2.5 rounded-sm transition shadow-md cursor-pointer flex items-center gap-1.5 text-xs font-bold font-mono uppercase"
                title="Jump directly to official LinkedIn page"
              >
                <Linkedin className="h-4 w-4 text-cyan-400" />
                <span>LinkedIn</span>
              </a>
              <a
                href={(siteConfig?.socialLinks || siteConfig?.footer?.socialLinks)?.line || "https://line.me"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-stone-800 hover:bg-green-600 text-stone-300 hover:text-white p-2.5 rounded-sm transition shadow-md cursor-pointer flex items-center gap-1.5 text-xs font-bold font-mono uppercase"
                title="Jump directly to official LINE channel"
              >
                <MessageSquare className="h-4 w-4 text-green-400" />
                <span>LINE</span>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 text-center text-[10px] text-stone-500 font-mono uppercase tracking-widest">
          {siteConfig?.footer?.copyrightName || siteConfig?.footer?.copyrightText || "FilmPack Packaging Film Business Alliance"} © 2026. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
