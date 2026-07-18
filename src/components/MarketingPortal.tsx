import React, { useState } from "react";
import { Film, Building, Shield, User as UserIcon, Lock, Mail, Phone, ArrowRight, CheckCircle2, AlertCircle, Instagram, Facebook, MessageCircle, Linkedin, MessageSquare, Globe, MapPin, Eye, EyeOff, Layers, Sparkles, ChevronRight, Cpu, HelpCircle, Activity, Award } from "lucide-react";

interface MarketingPortalProps {
  isLoginView: boolean;
  setIsLoginView: (val: boolean) => void;
  loginForm: any;
  setLoginForm: (val: any) => void;
  signupForm: any;
  setSignupForm: (val: any) => void;
  authBgIndex: number;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  showSignupPassword: boolean;
  setShowSignupPassword: (val: boolean) => void;
  authError: string | null;
  setAuthError: (val: string | null) => void;
  authSuccess: string | null;
  setAuthSuccess: (val: string | null) => void;
  isSubmitting: boolean;
  handleLoginSubmit: (e: React.FormEvent) => Promise<void>;
  handleSignupSubmit: (e: React.FormEvent) => Promise<void>;
  injectTestCredentials: (role: 'applicant' | 'recruiter_approved' | 'recruiter_pending' | 'admin') => void;
  siteConfig: any;
  HD_ENTRANCE_IMAGES: Array<{ url: string; label: string }>;
}

export default function MarketingPortal({
  isLoginView,
  setIsLoginView,
  loginForm,
  setLoginForm,
  signupForm,
  setSignupForm,
  authBgIndex,
  showPassword,
  setShowPassword,
  showSignupPassword,
  setShowSignupPassword,
  authError,
  setAuthError,
  authSuccess,
  setAuthSuccess,
  isSubmitting,
  handleLoginSubmit,
  handleSignupSubmit,
  injectTestCredentials,
  siteConfig,
  HD_ENTRANCE_IMAGES
}: MarketingPortalProps) {
  
  const [selectedStructure, setSelectedStructure] = useState<'3layer' | '5layer'>('3layer');
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  return (
    <div className="flex-1 flex flex-col">
      
      {/* HERO & SECURE LOGIN GATEWAY SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pb-24 border-b border-slate-200/50 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/40">
        {/* Glowing Decorative Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-100/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(14,165,233,0.025)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Core Value Propositions & Slide monitors */}
            <div className="col-span-1 lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100 text-cyan-700 px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest shadow-2xs font-extrabold animate-float">
                <Sparkles className="h-3.5 w-3.5 text-cyan-500 animate-pulse" />
                India's #1 Technical Packaging Job Network
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] font-display">
                The Pulse of <br />
                <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Flexible Packaging
                </span> <br />
                Careers.
              </h1>
              
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                The unified digital portal connecting certified extruder operators, lamination engineers, slitting supervisors, and QC analysts with premier BOPP, BOPET, CPP, and barrier-film plant networks.
              </p>

              {/* High Impact Statistics Dashboard Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                <div className="bg-white/85 p-3 rounded-xl border border-slate-200/50 backdrop-blur-md shadow-2xs">
                  <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono">14+</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-mono font-bold">Plants Live</p>
                </div>
                <div className="bg-white/85 p-3 rounded-xl border border-slate-200/50 backdrop-blur-md shadow-2xs">
                  <p className="text-xl sm:text-2xl font-black text-cyan-600 font-mono">480m</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-mono font-bold">Line Speed</p>
                </div>
                <div className="bg-white/85 p-3 rounded-xl border border-slate-200/50 backdrop-blur-md shadow-2xs">
                  <p className="text-xl sm:text-2xl font-black text-purple-600 font-mono">100%</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-mono font-bold">Certified</p>
                </div>
                <div className="bg-white/85 p-3 rounded-xl border border-slate-200/50 backdrop-blur-md shadow-2xs">
                  <p className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">₹45k</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-mono font-bold">Max Salary</p>
                </div>
              </div>

              {/* Manufacturing Live Feed Showcase */}
              <div className="bg-slate-900/5 p-2 rounded-2xl border border-slate-200/60 overflow-hidden relative">
                <div className="relative h-44 sm:h-52 rounded-xl overflow-hidden shadow-inner">
                  <img
                    src={HD_ENTRANCE_IMAGES[authBgIndex]?.url || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"}
                    alt="Packaging Film Manufacturing"
                    className="w-full h-full object-cover transition-all duration-1000 ease-out scale-102"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  {/* Status Indicator */}
                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <p className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping inline-block" />
                      Alliance Plant Monitor Feed
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-white tracking-wide font-sans mt-1">
                      {HD_ENTRANCE_IMAGES[authBgIndex]?.label || "Co-Extrusion Plant Line"}
                    </p>
                  </div>
                  
                  {/* Mini slide dots */}
                  <div className="absolute top-4 right-4 flex gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                    {HD_ENTRANCE_IMAGES.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                          idx === authBgIndex ? "bg-cyan-400" : "bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Lab Anchor Link Helper */}
              <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-cyan-500 animate-pulse" />
                Scroll down to access the interactive Co-Extrusion Tech Lab
              </p>
            </div>

            {/* Right Column: Secure Portal Gateway Credentials Form */}
            <div className="col-span-1 lg:col-span-5 relative" id="hiring-gateway">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur-lg opacity-15 pointer-events-none" />
              
              <div className="relative bg-white/90 border border-white p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-xl text-left">
                
                {/* Heading */}
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-tr from-cyan-600 to-blue-600 h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-3 text-white shadow-md shadow-cyan-500/20">
                    <Film className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
                    {isLoginView ? "Hiring Entrance Gate" : "Register Candidate Account"}
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1 italic">
                    {isLoginView ? "Access operator roles & lamination desks" : "Submit profile for technical screening"}
                  </p>
                </div>

                {/* System Messages Banner */}
                {authError && (
                  <div className="bg-red-50 border border-red-150 text-red-700 p-3 rounded-lg text-xs flex items-start gap-2 mb-4 leading-relaxed">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{authError}</span>
                  </div>
                )}

                {authSuccess && (
                  <div className="bg-cyan-50 border border-cyan-150 text-cyan-700 p-3 rounded-lg text-xs flex items-start gap-2 mb-4 leading-relaxed">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-cyan-500" />
                    <span>{authSuccess}</span>
                  </div>
                )}

                {/* Forms Router */}
                {isLoginView ? (
                  /* Elegant Login Screen */
                  <form key="login-form" id="login-form" onSubmit={handleLoginSubmit} className="space-y-4 text-xs" autoComplete="off">
                    <div className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-cyan-600" />
                        <input
                          id="login-email"
                          name="login-email"
                          type="email"
                          required
                          placeholder="Registered Email"
                          autoComplete="off"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className="w-full glass-input pl-9 pr-3 py-2.5 text-xs text-slate-850 placeholder-slate-400"
                        />
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-cyan-600" />
                        <input
                          id="login-password"
                          name="login-password"
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="Security Password"
                          autoComplete="current-password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="w-full glass-input pl-9 pr-10 py-2.5 text-xs text-slate-850 placeholder-slate-400"
                        />
                        <button
                          id="toggle-login-password-btn"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer flex items-center h-full"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      id="login-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs transition font-mono uppercase tracking-widest shadow-lg shadow-cyan-500/10 cursor-pointer active:scale-98"
                    >
                      Authorize Account
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    <div className="text-center pt-2">
                      <button
                        id="toggle-to-signup-btn"
                        type="button"
                        onClick={() => {
                          setIsLoginView(false);
                          setAuthError(null);
                          setAuthSuccess(null);
                          setLoginForm({ email: "", password: "" });
                          setSignupForm({
                            name: "",
                            email: "",
                            mobile: "",
                            password: "",
                            role: "applicant",
                            companyName: "",
                            contactPerson: ""
                          });
                        }}
                        className="text-slate-500 hover:text-slate-800 hover:underline font-mono text-[10.5px] uppercase tracking-wider font-bold cursor-pointer transition-colors"
                      >
                        Don't have an account? Sign Up
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Elegant Signup Screen */
                  <form key="signup-form" id="signup-form" onSubmit={handleSignupSubmit} className="space-y-4 text-xs" autoComplete="off">
                    <div className="space-y-3">
                      <input
                        id="signup-name"
                        name="signup-name"
                        type="text"
                        required
                        placeholder="Your Full Name"
                        autoComplete="off"
                        value={signupForm.name}
                        onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                        className="w-full glass-input px-3 py-2.5 text-xs text-slate-850 placeholder-slate-400"
                      />

                      <div className="grid grid-cols-2 gap-2.5">
                        <input
                          id="signup-email"
                          name="signup-email"
                          type="email"
                          required
                          placeholder="Email Address"
                          autoComplete="off"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                          className="w-full glass-input px-3 py-2.5 text-xs text-slate-850 placeholder-slate-400"
                        />
                        <input
                          id="signup-mobile"
                          name="signup-mobile"
                          type="tel"
                          required
                          placeholder="Mobile Number"
                          autoComplete="off"
                          value={signupForm.mobile}
                          onChange={(e) => setSignupForm({ ...signupForm, mobile: e.target.value })}
                          className="w-full glass-input px-3 py-2.5 text-xs text-slate-850 placeholder-slate-400"
                        />
                      </div>

                      <div className="relative">
                        <input
                          id="signup-password"
                          name="signup-password"
                          type={showSignupPassword ? "text" : "password"}
                          required
                          placeholder="Access Password"
                          autoComplete="new-password"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                          className="w-full glass-input pl-3 pr-10 py-2.5 text-xs text-slate-850 placeholder-slate-400"
                        />
                        <button
                          id="toggle-signup-password-btn"
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer flex items-center h-full"
                          title={showSignupPassword ? "Hide password" : "Show password"}
                        >
                          {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-mono text-[9px] uppercase mb-1 font-bold tracking-wider">Apply as role:</label>
                        <select
                          id="signup-role"
                          name="signup-role"
                          value={signupForm.role}
                          onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value as any })}
                          className="w-full glass-input p-2.5 text-xs text-slate-850"
                        >
                          <option value="applicant" className="bg-white text-slate-800">Candidate / Job Seeker</option>
                          <option value="recruiter" className="bg-white text-slate-800">Manufacturing Recruiter</option>
                        </select>
                      </div>

                      {signupForm.role === "recruiter" && (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-[8.5px] text-cyan-600 font-mono font-bold uppercase tracking-wider block">Company Details</span>
                          <input
                            id="signup-company"
                            name="signup-company"
                            type="text"
                            required
                            placeholder="Plant Company Name (e.g. Cosmo Films)"
                            autoComplete="off"
                            value={signupForm.companyName}
                            onChange={(e) => setSignupForm({ ...signupForm, companyName: e.target.value })}
                            className="w-full glass-input px-3 py-2 text-xs text-slate-850"
                          />
                          <p className="text-[9px] text-slate-500 leading-relaxed italic">
                            ℹ Recruiter accounts must be approved by the alliance Administrator before activation.
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      id="signup-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs transition font-mono uppercase tracking-widest shadow-lg shadow-cyan-500/10 cursor-pointer active:scale-98"
                    >
                      Submit Registration
                    </button>

                    <div className="text-center pt-2">
                      <button
                        id="toggle-to-login-btn"
                        type="button"
                        onClick={() => {
                          setIsLoginView(true);
                          setAuthError(null);
                          setAuthSuccess(null);
                          setLoginForm({ email: "", password: "" });
                          setSignupForm({
                            name: "",
                            email: "",
                            mobile: "",
                            password: "",
                            role: "applicant",
                            companyName: "",
                            contactPerson: ""
                          });
                        }}
                        className="text-slate-500 hover:text-slate-800 hover:underline font-mono text-[10.5px] uppercase tracking-wider font-bold cursor-pointer transition-colors"
                      >
                        Already have an account? Log In
                      </button>
                    </div>
                  </form>
                )}

                {/* Instant Test Credentials Bypass Panels */}
                <div className="mt-6 pt-5 border-t border-slate-200">
                  <div className="flex items-center justify-between text-[9px] font-mono font-bold text-cyan-700 uppercase tracking-wider mb-2.5">
                    <span>Testing Sandbox Bypass</span>
                    <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wide flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping inline-block" />
                      Active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <button
                      onClick={() => injectTestCredentials('applicant')}
                      className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-cyan-300 p-2 rounded-lg text-left transition flex items-center justify-between shadow-2xs cursor-pointer text-slate-800 font-medium"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-[10px]">Applicant</p>
                        <p className="text-[8.5px] text-slate-500 font-mono">Ramesh Kumar</p>
                      </div>
                      <UserIcon className="h-3 w-3 text-cyan-600 shrink-0" />
                    </button>

                    <button
                      onClick={() => injectTestCredentials('recruiter_approved')}
                      className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-cyan-300 p-2 rounded-lg text-left transition flex items-center justify-between shadow-2xs cursor-pointer text-slate-800 font-medium"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-[10px]">Recruiter</p>
                        <p className="text-[8.5px] text-slate-500 font-mono">Uflex Limited</p>
                      </div>
                      <Building className="h-3 w-3 text-cyan-600 shrink-0" />
                    </button>

                    <button
                      onClick={() => injectTestCredentials('recruiter_pending')}
                      className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-cyan-300 p-2 rounded-lg text-left transition flex items-center justify-between shadow-2xs cursor-pointer text-slate-800 font-medium"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-[10px]">Pending</p>
                        <p className="text-[8.5px] text-slate-500 font-mono">Cosmo Films</p>
                      </div>
                      <Building className="h-3 w-3 text-amber-500 shrink-0" />
                    </button>

                    <button
                      onClick={() => injectTestCredentials('admin')}
                      className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-cyan-300 p-2 rounded-lg text-left transition flex items-center justify-between shadow-2xs cursor-pointer text-slate-800 font-medium"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-[10px]">Admin</p>
                        <p className="text-[8.5px] text-slate-500 font-mono">Full Controls</p>
                      </div>
                      <Shield className="h-3 w-3 text-purple-600 shrink-0" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE CO-EXTRUSION TECH LAB */}
      <section className="bg-slate-50/70 border-b border-slate-200/50 py-16 sm:py-24 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 border border-cyan-100 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold mb-3">
              <Cpu className="h-3.5 w-3.5 text-cyan-600 animate-spin" />
              Packaging Technology Laboratory
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">
              Interactive Co-Extrusion Engineering Lab
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              Explore high-precision multi-layered polymer combinations. Click any material layer in the diagrams below to analyze its chemistry, thickness, and performance features.
            </p>
          </div>

          {/* Structure Selector Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-200/60 p-1 rounded-xl flex border border-slate-200">
              <button
                onClick={() => {
                  setSelectedStructure('3layer');
                  setSelectedLayerId(null);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all uppercase tracking-wider ${
                  selectedStructure === '3layer'
                    ? "bg-white text-cyan-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                3-Layer BOPP Structure
              </button>
              <button
                onClick={() => {
                  setSelectedStructure('5layer');
                  setSelectedLayerId(null);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all uppercase tracking-wider ${
                  selectedStructure === '5layer'
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                5-Layer High-Barrier EVOH Structure
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Columns: Visual Layer Stack Diagrams */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="font-serif font-bold text-slate-900 text-lg">
                    {selectedStructure === '3layer' ? "3-Layer Co-Extruded Standard Film" : "5-Layer Symmetric High-Barrier Foil"}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
                    {selectedStructure === '3layer' ? "Polymers: BOPP / Terpolymer Heat Sealant" : "Polymers: PE / Tie Resins / EVOH / PET Skin"}
                  </p>
                </div>
                <span className={`text-xs font-mono font-extrabold px-3 py-1 rounded-full border ${
                  selectedStructure === '3layer'
                    ? "bg-cyan-50 border-cyan-200 text-cyan-700"
                    : "bg-purple-50 border-purple-200 text-purple-700"
                }`}>
                  {selectedStructure === '3layer' ? "16 Micron (16µ)" : "25 Micron (25µ)"}
                </span>
              </div>

              {/* Interactive Diagram Canvas */}
              <div className="space-y-4">
                {selectedStructure === '3layer' ? (
                  /* 3-Layer Interactivity Diagram */
                  <div className="space-y-2">
                    <div
                      onClick={() => setSelectedLayerId('3-seal')}
                      className={`group cursor-pointer p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                        selectedLayerId === '3-seal'
                          ? "bg-cyan-50/50 border-cyan-400 shadow-md translate-x-2"
                          : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-cyan-200 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-cyan-400 to-cyan-500" />
                      <div className="pl-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">A: Heat Sealable Skin Layer (Top Side)</h4>
                          <p className="text-[10px] text-slate-500 font-mono">Thickness: 2.0 Microns (2µ) • SIT: 105°C</p>
                        </div>
                        <span className="text-[10px] bg-cyan-100/50 text-cyan-700 font-mono px-2 py-0.5 rounded-sm font-bold uppercase shrink-0">Click to Inspect</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setSelectedLayerId('3-core')}
                      className={`group cursor-pointer p-6 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                        selectedLayerId === '3-core'
                          ? "bg-blue-50/50 border-blue-400 shadow-md translate-x-2"
                          : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-blue-200 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-blue-500 to-indigo-500" />
                      <div className="pl-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">B: Biaxially-Oriented Polypropylene Core Layer</h4>
                          <p className="text-[10px] text-slate-500 font-mono">Thickness: 12.0 Microns (12µ) • Tensile: High Stiffness</p>
                        </div>
                        <span className="text-[10px] bg-blue-100/50 text-blue-700 font-mono px-2 py-0.5 rounded-sm font-bold uppercase shrink-0">Click to Inspect</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setSelectedLayerId('3-corona')}
                      className={`group cursor-pointer p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                        selectedLayerId === '3-corona'
                          ? "bg-purple-50/50 border-purple-400 shadow-md translate-x-2"
                          : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-purple-200 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-purple-400 to-purple-500" />
                      <div className="pl-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">C: Corona Treated Printable Layer (Bottom Side)</h4>
                          <p className="text-[10px] text-slate-500 font-mono">Thickness: 2.0 Microns (2µ) • Surface Tension: &gt;38 dynes/cm</p>
                        </div>
                        <span className="text-[10px] bg-purple-100/50 text-purple-700 font-mono px-2 py-0.5 rounded-sm font-bold uppercase shrink-0">Click to Inspect</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 5-Layer Interactivity Diagram */
                  <div className="space-y-1.5">
                    <div
                      onClick={() => setSelectedLayerId('5-seal')}
                      className={`group cursor-pointer p-3 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                        selectedLayerId === '5-seal'
                          ? "bg-cyan-50/50 border-cyan-400 shadow-md translate-x-2"
                          : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-cyan-200 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-cyan-400 to-cyan-500" />
                      <div className="pl-2 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-[11px]">Layer 1: PE Sealing Sealant Skin</h4>
                          <p className="text-[9px] text-slate-500 font-mono">Thickness: 3.0 Microns (3µ) • SIT: 110°C • Direct Food Contact Safe</p>
                        </div>
                        <span className="text-[9px] bg-cyan-100/50 text-cyan-700 font-mono px-2 py-0.5 rounded-sm font-bold uppercase">Click</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setSelectedLayerId('5-tie1')}
                      className={`group cursor-pointer p-3 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                        selectedLayerId === '5-tie1'
                          ? "bg-amber-50/50 border-amber-400 shadow-md translate-x-2"
                          : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-amber-200 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-amber-400 to-amber-500" />
                      <div className="pl-2 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-[11px]">Layer 2: Maleic Anhydride Adhesive Tie Layer</h4>
                          <p className="text-[9px] text-slate-500 font-mono">Thickness: 3.0 Microns (3µ) • Purpose: Prevents Interlayer Delamination</p>
                        </div>
                        <span className="text-[9px] bg-amber-100/50 text-amber-700 font-mono px-2 py-0.5 rounded-sm font-bold uppercase">Click</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setSelectedLayerId('5-evoh')}
                      className={`group cursor-pointer p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                        selectedLayerId === '5-evoh'
                          ? "bg-indigo-50/50 border-indigo-400 shadow-md translate-x-2"
                          : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-indigo-200 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-indigo-500 to-purple-600" />
                      <div className="pl-2 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">Layer 3: Ethylene Vinyl Alcohol (EVOH) Oxygen Gas Barrier</h4>
                          <p className="text-[10px] text-indigo-700 font-mono font-bold">Thickness: 13.0 Microns (13µ) • Gas Transmission: Ultra-Low</p>
                        </div>
                        <span className="text-[10px] bg-indigo-100/50 text-indigo-700 font-mono px-2 py-0.5 rounded-sm font-bold uppercase">Click</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setSelectedLayerId('5-tie2')}
                      className={`group cursor-pointer p-3 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                        selectedLayerId === '5-tie2'
                          ? "bg-amber-50/50 border-amber-400 shadow-md translate-x-2"
                          : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-amber-200 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-amber-400 to-amber-500" />
                      <div className="pl-2 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-[11px]">Layer 4: Specialty Polyolefin Tie Layer</h4>
                          <p className="text-[9px] text-slate-500 font-mono">Thickness: 3.0 Microns (3µ) • Purpose: Perfect Bonding with PET Skins</p>
                        </div>
                        <span className="text-[9px] bg-amber-100/50 text-amber-700 font-mono px-2 py-0.5 rounded-sm font-bold uppercase">Click</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setSelectedLayerId('5-pet')}
                      className={`group cursor-pointer p-3 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                        selectedLayerId === '5-pet'
                          ? "bg-emerald-50/50 border-emerald-400 shadow-md translate-x-2"
                          : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-emerald-200 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-emerald-400 to-emerald-500" />
                      <div className="pl-2 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-[11px]">Layer 5: Biaxially-Oriented Polyester (PET) Outer Carrier</h4>
                          <p className="text-[9px] text-slate-500 font-mono">Thickness: 3.0 Microns (3µ) • Advantage: High Heat Resistance & Ink Key</p>
                        </div>
                        <span className="text-[9px] bg-emerald-100/50 text-emerald-700 font-mono px-2 py-0.5 rounded-sm font-bold uppercase">Click</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Columns: Inspection Readout Panel */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-full text-left flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                  <Layers className="h-5 w-5 text-cyan-600" />
                  <h3 className="font-sans font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Spectroscopy Readout
                  </h3>
                </div>

                {/* Display content dynamically based on selected layer */}
                {selectedLayerId === '3-seal' && (
                  <div className="space-y-4 animate-fade-in">
                    <span className="inline-block bg-cyan-50 border border-cyan-200 text-cyan-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">TOP SEALANT SKIN</span>
                    <h4 className="font-bold text-slate-900 text-sm">Copolymer / Terpolymer Blend</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Formulated with low-seal-initiation copolymers. Prevents package heat degradation, maintains sliding lubricity over packaging line metal plates, and ensures leakproof seals for bags and pouches containing powdery materials.
                    </p>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[10px] font-mono space-y-1">
                      <p className="flex justify-between"><span>Base Polymer:</span> <span className="font-bold text-slate-800">PP-PE-PB Terpolymer</span></p>
                      <p className="flex justify-between"><span>Density:</span> <span className="font-bold text-slate-800">0.90 g/cm³</span></p>
                      <p className="flex justify-between"><span>COF (Kinetic):</span> <span className="font-bold text-slate-800">0.22 - 0.25 (Slippery)</span></p>
                      <p className="flex justify-between"><span>Applications:</span> <span className="font-bold text-slate-800">FFS Potato Chips, Pouches</span></p>
                    </div>
                  </div>
                )}

                {selectedLayerId === '3-core' && (
                  <div className="space-y-4 animate-fade-in">
                    <span className="inline-block bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">BOPP STRETCH CORE</span>
                    <h4 className="font-bold text-slate-900 text-sm">Biaxially-Oriented Polypropylene Homopolymer</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      The mechanical heart of BOPP film. Stretched longitudinally and transversely to orient polymer chains, multiplying mechanical stiffness, moisture barrier (MVTR), tear resistance, and visual glass-like gloss.
                    </p>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[10px] font-mono space-y-1">
                      <p className="flex justify-between"><span>Base Polymer:</span> <span className="font-bold text-slate-800">PP Homopolymer</span></p>
                      <p className="flex justify-between"><span>Stretch Ratio:</span> <span className="font-bold text-slate-800">5:1 MD, 8:1 TD</span></p>
                      <p className="flex justify-between"><span>Haze Value:</span> <span className="font-bold text-slate-800">1.2% (Crystal Clear)</span></p>
                      <p className="flex justify-between"><span>Water Barrier:</span> <span className="font-bold text-slate-800">Outstanding (&lt;5 g/m²/day)</span></p>
                    </div>
                  </div>
                )}

                {selectedLayerId === '3-corona' && (
                  <div className="space-y-4 animate-fade-in">
                    <span className="inline-block bg-purple-50 border border-purple-200 text-purple-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">PRINTING INTERFACE</span>
                    <h4 className="font-bold text-slate-900 text-sm">High-Dyne Corona Treated Skin</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Undergoes high-voltage electronic bombardment at the casting end. Oxidizes surface polymer chains to form polar carbonyl and hydroxyl groups, enabling chemical adhesion of lamination solvents and photogravure printing inks.
                    </p>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[10px] font-mono space-y-1">
                      <p className="flex justify-between"><span>Surface Energy:</span> <span className="font-bold text-slate-800">38 - 42 Dynes/cm</span></p>
                      <p className="flex justify-between"><span>Shelf Life (Dynes):</span> <span className="font-bold text-slate-800">90 Days (Decays over time)</span></p>
                      <p className="flex justify-between"><span>Ink Adhesion:</span> <span className="font-bold text-slate-800">Rotogravure / Flexo Perfect</span></p>
                      <p className="flex justify-between"><span>Additives:</span> <span className="font-bold text-slate-800">Zero Slipping agents (Anti-migration)</span></p>
                    </div>
                  </div>
                )}

                {selectedLayerId === '5-seal' && (
                  <div className="space-y-4 animate-fade-in">
                    <span className="inline-block bg-cyan-50 border border-cyan-200 text-cyan-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">PE FOOD-CONTACT SEAL</span>
                    <h4 className="font-bold text-slate-900 text-sm">Linear Low Density Polyethylene (LLDPE)</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      An extremely strong polymer sealing face. Best suited for high heat-seal strength, superior hot tack on vertical pouch machines, and 100% compliant with FDA standards for direct packaging contact with edible oils, chips, and dry foods.
                    </p>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[10px] font-mono space-y-1">
                      <p className="flex justify-between"><span>Material:</span> <span className="font-bold text-slate-800">Metallocene-LLDPE</span></p>
                      <p className="flex justify-between"><span>Melting Point:</span> <span className="font-bold text-slate-800">122°C</span></p>
                      <p className="flex justify-between"><span>Seal Strength:</span> <span className="font-bold text-slate-800">&gt;15 N/15mm</span></p>
                    </div>
                  </div>
                )}

                {selectedLayerId === '5-tie1' && (
                  <div className="space-y-4 animate-fade-in">
                    <span className="inline-block bg-amber-50 border border-amber-200 text-amber-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">CHEMICAL ADHESIVE</span>
                    <h4 className="font-bold text-slate-900 text-sm">Grafted Maleic Anhydride Polyolefin Tie</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Standard polyethylene and high-barrier EVOH repel each other like oil and water. This functional tie resin binds non-polar polyolefins on one side and polar EVOH on the other side through continuous inline co-extrusion.
                    </p>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[10px] font-mono space-y-1">
                      <p className="flex justify-between"><span>Polymer Base:</span> <span className="font-bold text-slate-800">MAH-g-LLDPE</span></p>
                      <p className="flex justify-between"><span>Peel Resistance:</span> <span className="font-bold text-slate-800">&gt;4.0 N/cm (Zero Delamination)</span></p>
                      <p className="flex justify-between"><span>Melt Index:</span> <span className="font-bold text-slate-800">2.1 g/10 min</span></p>
                    </div>
                  </div>
                )}

                {selectedLayerId === '5-evoh' && (
                  <div className="space-y-4 animate-fade-in">
                    <span className="inline-block bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">OXYGEN GAS BARRIER</span>
                    <h4 className="font-bold text-slate-900 text-sm">Ethylene Vinyl Alcohol Copolymer (32 mol% Ethylene)</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      The highest gas barrier polymer in flexible packaging. Absolutely blocks oxygen, nitrogen, carbon dioxide, and ambient aroma transmission. Keeps coffee fresh, blocks rancidity in deep-fried snacks, and preserves retort military rations.
                    </p>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[10px] font-mono space-y-1">
                      <p className="flex justify-between"><span>Ethylene Content:</span> <span className="font-bold text-slate-800">32 mol% (Max Barrier)</span></p>
                      <p className="flex justify-between"><span>OTR (23°C, 0% RH):</span> <span className="font-bold text-slate-800">&lt;0.2 cc/m²/day/atm</span></p>
                      <p className="flex justify-between"><span>Aroma Barrier:</span> <span className="font-bold text-slate-800">Hermetic Seal Grade</span></p>
                    </div>
                  </div>
                )}

                {selectedLayerId === '5-tie2' && (
                  <div className="space-y-4 animate-fade-in">
                    <span className="inline-block bg-amber-50 border border-amber-200 text-amber-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">OUTER ADHESIVE RESIN</span>
                    <h4 className="font-bold text-slate-900 text-sm">High-Temperature Tie Link</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Secures the outer PET print skin with the EVOH layer. Designed with elevated thermal properties to prevent bubbling during extreme downstream hot-nip lamination and thermoforming processes.
                    </p>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[10px] font-mono space-y-1">
                      <p className="flex justify-between"><span>Peel Strength:</span> <span className="font-bold text-slate-800">High Thermal Peel &gt;5 N</span></p>
                      <p className="flex justify-between"><span>Clarity:</span> <span className="font-bold text-slate-800">Optically Haze-Free</span></p>
                    </div>
                  </div>
                )}

                {selectedLayerId === '5-pet' && (
                  <div className="space-y-4 animate-fade-in">
                    <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">PET PRINT OUTER SKIN</span>
                    <h4 className="font-bold text-slate-900 text-sm">Biaxially-Oriented Polyester Skin</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      The outer shield of the packaging film. Possesses exceptional thermal melting points (260°C), allowing high-speed heat sealing elements to press the inner PE layers together without sticking or burning the outside face.
                    </p>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[10px] font-mono space-y-1">
                      <p className="flex justify-between"><span>Base Polymer:</span> <span className="font-bold text-slate-800">Polyethylene Terephthalate</span></p>
                      <p className="flex justify-between"><span>Melting Point:</span> <span className="font-bold text-slate-800">260°C (High Heat)</span></p>
                      <p className="flex justify-between"><span>Gloss Value:</span> <span className="font-bold text-slate-800 font-bold text-slate-800">&gt;125 Gu (Ultra Glossy)</span></p>
                    </div>
                  </div>
                )}

                {!selectedLayerId && (
                  <div className="py-12 text-center space-y-3">
                    <div className="bg-slate-100 p-3.5 rounded-full inline-flex text-slate-400">
                      <HelpCircle className="h-6 w-6 animate-pulse" />
                    </div>
                    <h4 className="font-bold text-slate-950 text-xs font-mono uppercase tracking-wider">Ready for Spectroscopy</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed max-w-xs mx-auto">
                      Click or tap on any polymer layer structure in the visual stack to load its technical specification sheet, polymer chemistry details, and real-world industrial application benchmarks.
                    </p>
                  </div>
                )}
              </div>

              {/* Pre-select CTA helper */}
              {!selectedLayerId && (
                <button
                  onClick={() => setSelectedLayerId(selectedStructure === '3layer' ? '3-core' : '5-evoh')}
                  className="w-full mt-6 bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 text-slate-700 hover:text-cyan-800 font-mono text-[10.5px] uppercase font-bold py-2 rounded-xl transition duration-300"
                >
                  Auto-Inspect Core Barrier Layer
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: THE "PILLARS OF PRODUCTION" BENTO GRID OF MANUFACTURING ROLES */}
      <section className="bg-white py-16 sm:py-24 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 text-left">
            <div className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold mb-3">
              <Award className="h-3.5 w-3.5 text-purple-600" />
              Industrial Training Benchmarks
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">
              The Pillars of Flexible Packaging Production
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              Every bag, wrapper, and pouch on store shelves is engineered by a specialized team of technical operators. Access career pathways for the following four plant pillars:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-slate-50/50 hover:bg-white p-6 rounded-2xl border border-slate-200/60 hover:border-cyan-400 transition-all duration-300 shadow-3xs group flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="bg-cyan-50 text-cyan-700 w-10 h-10 rounded-xl flex items-center justify-center border border-cyan-150 shadow-2xs group-hover:scale-110 transition duration-300">
                  <Cpu className="h-5 w-5 text-cyan-600" />
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-base">Extrusion Line Operator</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Manages high-throughput, multi-million dollar cast & bubble lines. Configures motor RPM, die lips, air rings, draft ratios, and chilling rollers for continuous production.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between text-[10px] font-mono text-slate-400">
                <span>Min Exp: 1-2 Yrs</span>
                <span className="font-bold text-cyan-600">Extrusion</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-50/50 hover:bg-white p-6 rounded-2xl border border-slate-200/60 hover:border-indigo-400 transition-all duration-300 shadow-3xs group flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="bg-indigo-50 text-indigo-700 w-10 h-10 rounded-xl flex items-center justify-center border border-indigo-150 shadow-2xs group-hover:scale-110 transition duration-300">
                  <Activity className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-base">Quality Control & Lab Analyst</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Evaluates film specs. Tests oxygen transmission (OTR), dynamic/static coefficient of friction (COF), seal strength limits, haze levels, and inline dyne levels.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between text-[10px] font-mono text-slate-400">
                <span>Min Exp: ITI/B.Sc</span>
                <span className="font-bold text-indigo-600">Lab Analysis</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-50/50 hover:bg-white p-6 rounded-2xl border border-slate-200/60 hover:border-purple-400 transition-all duration-300 shadow-3xs group flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="bg-purple-50 text-purple-700 w-10 h-10 rounded-xl flex items-center justify-center border border-purple-150 shadow-2xs group-hover:scale-110 transition duration-300">
                  <Layers className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-base">Lamination Engineer</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Commands solventless & solvent-based laminators. Controls adhesive mixing ratios, drying tunnel temperatures, curing chamber durations, and prevents visual curling.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between text-[10px] font-mono text-slate-400">
                <span>Min Exp: 3+ Yrs</span>
                <span className="font-bold text-purple-600">Lamination</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="bg-slate-50/50 hover:bg-white p-6 rounded-2xl border border-slate-200/60 hover:border-emerald-400 transition-all duration-300 shadow-3xs group flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="bg-emerald-50 text-emerald-700 w-10 h-10 rounded-xl flex items-center justify-center border border-emerald-150 shadow-2xs group-hover:scale-110 transition duration-300">
                  <Film className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-base">Slitting & Rewinding Master</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Manages high-speed razor and shear slitting machines. Minimizes edge trim waste, eliminates static charges, prevents roll wrinkles, and maximizes core tightness.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between text-[10px] font-mono text-slate-400">
                <span>Min Exp: Diploma</span>
                <span className="font-bold text-emerald-600">Slitting Desk</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 4: INFINITE SCROLLING ALLIANCE MARQUEE */}
      <section className="bg-slate-900 text-white overflow-hidden py-8 relative">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between text-left">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-extrabold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-ping" />
            Hiring Partner Plants & Corporate Members
          </p>
          <span className="text-[8.5px] font-mono text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 rounded">Continuous Updates</span>
        </div>

        {/* Ticker marquee container */}
        <div className="relative flex items-center h-12 overflow-hidden bg-slate-950 border-y border-white/5">
          <div className="animate-marquee whitespace-nowrap flex gap-12 text-sm font-mono font-bold uppercase tracking-widest text-slate-300">
            <span>Cosmo First Limited •</span>
            <span>Uflex Packaging Systems •</span>
            <span>Jindal Poly Films Limited •</span>
            <span>Chiripal Poly Films India •</span>
            <span>Max Speciality Films •</span>
            <span>Polyplex Corporation •</span>
            <span>Constantia Flexibles •</span>
            <span>Huhtamaki India •</span>
            <span>Amcor Packaging •</span>
            <span>Garware Hi-Tech Films •</span>
          </div>
          {/* Loop duplicates */}
          <div className="animate-marquee whitespace-nowrap flex gap-12 text-sm font-mono font-bold uppercase tracking-widest text-slate-300" aria-hidden="true">
            <span>Cosmo First Limited •</span>
            <span>Uflex Packaging Systems •</span>
            <span>Jindal Poly Films Limited •</span>
            <span>Chiripal Poly Films India •</span>
            <span>Max Speciality Films •</span>
            <span>Polyplex Corporation •</span>
            <span>Constantia Flexibles •</span>
            <span>Huhtamaki India •</span>
            <span>Amcor Packaging •</span>
            <span>Garware Hi-Tech Films •</span>
          </div>
        </div>
      </section>

    </div>
  );
}
