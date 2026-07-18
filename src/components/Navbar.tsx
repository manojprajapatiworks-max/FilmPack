import React, { useState, useEffect } from "react";
import { User, Notification, SiteConfig } from "../types";
import { Film, Bell, LogOut, User as UserIcon, MessageSquare, Mail, Phone, Calendar, Shield, Building, Trash2, Send, Check } from "lucide-react";

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ currentUser, onLogout, activeTab, setActiveTab }: NavbarProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/notifications?userId=${currentUser.id}&role=${currentUser.role}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        if (!isNotifOpen) {
          setUnreadCount(data.length);
        }
      }
    } catch (err) {
      console.warn("Background polling notice: notifications momentarily unavailable", err);
    }
  };

  const fetchSiteConfig = async () => {
    try {
      const res = await fetch("/api/site-config");
      if (res.ok) {
        const data = await res.json();
        setSiteConfig(data);
      }
    } catch (err) {
      console.warn("Background polling notice: site config momentarily unavailable", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchSiteConfig();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchSiteConfig();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser, isNotifOpen]);

  useEffect(() => {
    if (isNotifOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isNotifOpen]);

  const handleTestAlert = async () => {
    if (!currentUser) return;
    try {
      await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          recipient: currentUser.mobile || currentUser.email,
          message: `Simulated Live Test Alert: Verified at ${new Date().toLocaleTimeString()} for ${currentUser.name}.`,
          type: "whatsapp"
        })
      });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to trigger test alert", err);
    }
  };

  const handleClearAlerts = async () => {
    if (!currentUser) return;
    try {
      setNotifications([]);
      await fetch(`/api/notifications?userId=${currentUser.id}&role=${currentUser.role}`, {
        method: "DELETE"
      });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to clear alerts", err);
    }
  };

  return (
    <>
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 text-slate-800 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Realistic Packaging Film Business Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group min-w-0 max-w-[70%] sm:max-w-none" onClick={() => setActiveTab("dashboard")}>
            {siteConfig?.header?.logoUrl ? (
              <div className="relative flex items-center shrink-0">
                <img src={siteConfig.header.logoUrl} alt="Company Logo" className="h-7 sm:h-9 w-auto max-w-[110px] sm:max-w-[160px] object-contain transition duration-300 group-hover:opacity-95" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="relative shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-lg blur-xs opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-white p-1.5 rounded-lg flex items-center justify-center shadow-md border border-slate-200 min-w-[34px] min-h-[34px] sm:min-w-[36px] sm:min-h-[36px]">
                  <Film className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-500 transform group-hover:rotate-12 transition-transform duration-300" />
                  <div className="absolute -top-1 -right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-cyan-500 rounded-full border-2 border-white animate-ping" title="Production Lines Live" />
                </div>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap sm:flex-nowrap">
                <h1 className="text-sm sm:text-lg font-black tracking-tight text-slate-900 editorial-title flex items-center truncate">
                  {siteConfig?.header?.platformName || "FILMPACK™"}
                </h1>
                <span className="text-[8px] sm:text-[9px] bg-cyan-50 text-cyan-600 px-1.5 sm:px-2 py-0.5 rounded-full font-mono font-extrabold tracking-widest uppercase border border-cyan-200 shadow-2xs shrink-0">
                  {siteConfig?.header?.allianceBadge || "ALLIANCE"}
                </span>
                <span className="hidden md:inline-block text-[9px] bg-cyan-50 text-cyan-600 border border-cyan-200 px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                  {siteConfig?.header?.plantsLiveCount || "● 14 PLANTS LIVE"}
                </span>
              </div>
              <p className="text-[8px] sm:text-[9px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1 font-semibold truncate sm:overflow-visible">
                {siteConfig?.header?.tagline || "BOPP • BOPET • CPP • BARRIER FILM JOBS"}
              </p>
            </div>
          </div>

          {/* User Details & Controls */}
          {currentUser ? (
            <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
              {/* Role Indicator Accent */}
              <div className="hidden md:flex items-center space-x-2">
                {currentUser.role === "admin" && (
                  <span className="flex items-center text-[10px] bg-purple-50 border border-purple-200 text-purple-700 px-2.5 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </span>
                )}
                {currentUser.role === "recruiter" && (
                  <span className="flex items-center text-[10px] bg-cyan-50 border border-cyan-200 text-cyan-700 px-2.5 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider">
                    <Building className="h-3 w-3 mr-1" />
                    Recruiter
                  </span>
                )}
                {currentUser.role === "applicant" && (
                  <span className="flex items-center text-[10px] bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider">
                    <UserIcon className="h-3 w-3 mr-1" />
                    Applicant
                  </span>
                )}
              </div>

              {/* User Name */}
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">{currentUser.email}</p>
              </div>

              {/* Notification Bell */}
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setUnreadCount(0);
                }}
                className="p-1.5 text-slate-500 hover:text-cyan-600 rounded-lg hover:bg-slate-100/80 transition relative border border-transparent hover:border-slate-200/50"
                title="Simulated Alerts Log (WhatsApp & Email)"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] rounded-full h-4 w-4 flex items-center justify-center font-bold font-mono shadow-md animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Log Out */}
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-500 hover:text-red-650 rounded-lg hover:bg-red-50 transition border border-transparent hover:border-red-200"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-slate-500 text-right shrink-0 ml-1">
              <span className="hidden sm:inline">Packaging Film Industry Alliance Portal</span>
              <span className="sm:hidden font-bold text-slate-650">Alliance Portal</span>
            </div>
          )}
        </div>
      </div>

      {/* Live Packaging Film Production & Hiring Ticker */}
      <div className="bg-slate-900 border-t border-slate-800 text-slate-200 text-[9px] sm:text-[10px] font-mono py-1.5 overflow-hidden shadow-inner flex items-center">
        <div className="bg-cyan-500 text-gray-950 font-black px-2 sm:px-2.5 py-0.5 z-10 shrink-0 uppercase tracking-widest flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[9px] shadow-sm ml-2 rounded-full border border-cyan-450 animate-pulse">
          <span className="w-1.5 h-1.5 bg-gray-950 rounded-full shrink-0"></span>
          <span className="hidden sm:inline">PLANT </span>PULSE
        </div>
        <div className="flex overflow-hidden relative w-full">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 px-4 font-semibold text-stone-300">
            {(siteConfig?.tickerItems || [
              { id: "tck_1", text: "LINE #1 (BOPP 15µ Transparent):", highlight: "480 m/min • Slitting Desk #4 Recruiting", color: "text-emerald-400" },
              { id: "tck_2", text: "LINE #2 (Metallized BOPET 12µ Foil):", highlight: "99.4% OEE • Shift Supervisor Required", color: "text-amber-400" },
              { id: "tck_3", text: "LINE #3 (Multi-layer CPP Barrier Film):", highlight: "ACTIVE EXTRUSION • QC Chemist Walk-ins Open", color: "text-sky-400" },
              { id: "tck_4", text: "ALLIANCE AUDIT:", highlight: "ISO 9001:2015 & BRCGS Certified • Top Packaging Employer India", color: "text-purple-400" },
              { id: "tck_5", text: "ROLLS DISPATCHED TODAY:", highlight: "1,420 MT across Gujarat, Maharashtra & Daman Plants", color: "text-emerald-400" }
            ]).map((item, index) => (
              <span key={`${item.id}-${index}`} className="flex items-center gap-1.5">
                <span className={item.color || "text-emerald-400"}>●</span> {item.text} <b className="text-white">{item.highlight}</b>
              </span>
            ))}
            {(siteConfig?.tickerItems || [
              { id: "tck_1", text: "LINE #1 (BOPP 15µ Transparent):", highlight: "480 m/min • Slitting Desk #4 Recruiting", color: "text-emerald-400" },
              { id: "tck_2", text: "LINE #2 (Metallized BOPET 12µ Foil):", highlight: "99.4% OEE • Shift Supervisor Required", color: "text-amber-400" },
              { id: "tck_3", text: "LINE #3 (Multi-layer CPP Barrier Film):", highlight: "ACTIVE EXTRUSION • QC Chemist Walk-ins Open", color: "text-sky-400" },
              { id: "tck_4", text: "ALLIANCE AUDIT:", highlight: "ISO 9001:2015 & BRCGS Certified • Top Packaging Employer India", color: "text-purple-400" },
              { id: "tck_5", text: "ROLLS DISPATCHED TODAY:", highlight: "1,420 MT across Gujarat, Maharashtra & Daman Plants", color: "text-emerald-400" }
            ]).map((item, index) => (
              <span key={`${item.id}-dup-${index}`} className="flex items-center gap-1.5">
                <span className={item.color || "text-emerald-400"}>●</span> {item.text} <b className="text-white">{item.highlight}</b>
              </span>
            ))}
          </div>
        </div>
      </div>
      </header>

      {/* Slide-out simulated notification alerts drawer - Placed at root level outside backdrop-blur sticky header! */}
      {isNotifOpen && currentUser && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 z-[99998] backdrop-blur-sm transition-opacity overscroll-contain"
            onClick={() => setIsNotifOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white/95 border-l border-slate-200/60 shadow-2xl z-[99999] flex flex-col text-slate-800 backdrop-blur-xl overscroll-contain">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 editorial-title">
                  <Bell className="h-4 w-4 text-cyan-600" />
                  Simulated Alerts Log
                  <span className="text-[10px] bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded font-mono font-bold border border-cyan-200">
                    {notifications.length} ALERTS
                  </span>
                </h3>
                <p className="text-[10px] text-slate-500 font-serif italic mt-0.5">
                  Real-time WhatsApp & Email deliveries ({currentUser.role.toUpperCase()} View)
                </p>
              </div>
              <button
                onClick={() => setIsNotifOpen(false)}
                className="text-slate-500 hover:text-slate-800 font-mono text-[10px] uppercase font-bold p-1 px-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition shadow-sm cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="p-2.5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={handleTestAlert}
                className="flex items-center gap-1.5 text-xs bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-semibold px-2.5 py-1 rounded border border-cyan-200 transition cursor-pointer"
                title="Trigger a test WhatsApp alert"
              >
                <Send className="h-3 w-3 text-cyan-600" />
                Simulate Test Alert
              </button>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAlerts}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-650 px-2 py-1 rounded hover:bg-red-50 transition cursor-pointer"
                  title="Clear all displayed alerts"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear Log
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40 overscroll-contain">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-12">
                  <MessageSquare className="h-10 w-10 text-slate-300 mb-3 stroke-1 animate-pulse" />
                  <p className="text-sm font-serif italic font-medium text-slate-700">No alerts triggered yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
                    Status updates, scheduled interviews, and admin approvals will stream live notifications here.
                  </p>
                  <button
                    onClick={handleTestAlert}
                    className="mt-4 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-mono font-bold uppercase rounded shadow hover:from-cyan-500 hover:to-blue-500 transition cursor-pointer"
                  >
                    Generate Sample Alert
                  </button>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-lg border text-xs leading-relaxed transition shadow-sm bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200 ${
                      notif.type === "whatsapp"
                        ? "border-l-4 border-l-cyan-500"
                        : "border-l-4 border-l-purple-500"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5 pb-1.5 border-b border-slate-100">
                      <span className="font-bold flex items-center gap-1.5 font-mono uppercase text-[10px] tracking-wider text-slate-800">
                        {notif.type === "whatsapp" ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
                            <MessageSquare className="h-3.5 w-3.5 text-cyan-600" />
                            WhatsApp Alert
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
                            <Mail className="h-3.5 w-3.5 text-purple-600" />
                            Email Delivery
                          </>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-550 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                        {new Date(notif.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <div className="font-mono text-slate-500 text-[10px] mb-2 pb-1 border-b border-slate-100 flex justify-between items-center">
                      <span><b className="text-slate-400 font-semibold">TO:</b> {notif.recipient}</span>
                      <span className="text-[9px] text-slate-400 italic">ID: {notif.id.slice(-6)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-slate-700 font-sans text-xs leading-relaxed">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200/60 text-[10px] text-cyan-650 text-center font-mono uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block animate-ping"></span>
              Simulated Node.js Gateway Connected
            </div>
          </div>
        </>
      )}
    </>
  );
}
