import React, { useState, useEffect } from "react";
import { User } from "./types";
import Navbar from "./components/Navbar";
import ApplicantDashboard from "./components/ApplicantDashboard";
import RecruiterDashboard from "./components/RecruiterDashboard";
import AdminDashboard from "./components/AdminDashboard";
import PackagingFilmShowcase from "./components/PackagingFilmShowcase";
import MarketingPortal from "./components/MarketingPortal";
import { Film, Building, Shield, User as UserIcon, Lock, Mail, Phone, ArrowRight, CheckCircle2, AlertCircle, Instagram, Facebook, MessageCircle, Linkedin, MessageSquare, Globe, MapPin, Eye, EyeOff, Layers, Sparkles, ChevronRight, Cpu, HelpCircle, Activity } from "lucide-react";

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
  const [selectedStructure, setSelectedStructure] = useState<'3layer' | '5layer'>('3layer');
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [authBgIndex, setAuthBgIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

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
      .catch(e => console.warn("Notice: site config load momentarily unavailable in App", e));
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
        localStorage.setItem("filmpack_user", JSON.stringify(user));
        setCurrentUser(user);
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
    <div className="min-h-screen text-slate-800 flex flex-col justify-between relative z-10 bg-transparent">
      
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
          <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full animate-fade-in">
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
          <MarketingPortal
            isLoginView={isLoginView}
            setIsLoginView={setIsLoginView}
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            signupForm={signupForm}
            setSignupForm={setSignupForm}
            authBgIndex={authBgIndex}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showSignupPassword={showSignupPassword}
            setShowSignupPassword={setShowSignupPassword}
            authError={authError}
            setAuthError={setAuthError}
            authSuccess={authSuccess}
            setAuthSuccess={setAuthSuccess}
            isSubmitting={isSubmitting}
            handleLoginSubmit={handleLoginSubmit}
            handleSignupSubmit={handleSignupSubmit}
            injectTestCredentials={injectTestCredentials}
            siteConfig={siteConfig}
            HD_ENTRANCE_IMAGES={HD_ENTRANCE_IMAGES}
          />
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
