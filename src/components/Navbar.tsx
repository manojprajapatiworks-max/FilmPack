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
      console.error("Failed to fetch notifications", err);
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
      console.error("Failed to fetch site config", err);
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
      <header className="bg-[#FCFAF6]/95 backdrop-blur-md border-b border-stone-200 text-stone-900 sticky top-0 z-50 shadow-sm">
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
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-600 rounded-lg blur-xs opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-stone-900 p-1.5 rounded-md flex items-center justify-center shadow-md border border-stone-700 min-w-[34px] min-h-[34px] sm:min-w-[36px] sm:min-h-[36px]">
                  <Film className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 transform group-hover:rotate-12 transition-transform duration-300" />
                  <div className="absolute -top-1 -right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-emerald-500 rounded-full border-2 border-stone-900" title="Production Lines Live" />
                </div>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap sm:flex-nowrap">
                <h1 className="text-sm sm:text-lg font-black tracking-tight text-stone-900 editorial-title flex items-center truncate">
                  {siteConfig?.header?.platformName || "FILMPACK™"}
                </h1>
                <span className="text-[8px] sm:text-[9px] bg-stone-900 text-amber-400 px-1.5 sm:px-2 py-0.5 rounded-sm font-mono font-extrabold tracking-widest uppercase border border-stone-700 shadow-2xs shrink-0">
                  {siteConfig?.header?.allianceBadge || "ALLIANCE"}
                </span>
                <span className="hidden md:inline-block text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                  {siteConfig?.header?.plantsLiveCount || "● 14 PLANTS LIVE"}
                </span>
              </div>
              <p className="text-[8px] sm:text-[9px] text-stone-600 font-mono uppercase tracking-wider flex items-center gap-1 font-semibold truncate sm:overflow-visible">
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
                  <span className="flex items-center text-[10px] bg-purple-100 border border-purple-200 text-purple-800 px-2.5 py-0.5 rounded-sm font-mono uppercase font-bold tracking-wider">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </span>
                )}
                {currentUser.role === "recruiter" && (
                  <span className="flex items-center text-[10px] bg-amber-100 border border-amber-200 text-amber-800 px-2.5 py-0.5 rounded-sm font-mono uppercase font-bold tracking-wider">
                    <Building className="h-3 w-3 mr-1" />
                    Recruiter
                  </span>
                )}
                {currentUser.role === "applicant" && (
                  <span className="flex items-center text-[10px] bg-stone-100 border border-stone-200 text-stone-800 px-2.5 py-0.5 rounded-sm font-mono uppercase font-bold tracking-wider">
                    <UserIcon className="h-3 w-3 mr-1" />
                    Applicant
                  </span>
                )}
              </div>

              {/* User Name */}
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-stone-900">{currentUser.name}</p>
                <p className="text-[10px] text-stone-500 font-mono">{currentUser.email}</p>
              </div>

              {/* Notification Bell */}
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setUnreadCount(0);
                }}
                className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100 transition relative border border-transparent hover:border-stone-200"
                title="Simulated Alerts Log (WhatsApp & Email)"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-800 text-white text-[8px] rounded-full h-4 w-4 flex items-center justify-center font-bold font-mono shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Log Out */}
              <button
                onClick={onLogout}
                className="p-1.5 text-stone-500 hover:text-red-700 rounded hover:bg-red-50 transition border border-transparent hover:border-red-100"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-stone-500 text-right shrink-0 ml-1">
              <span className="hidden sm:inline">Packaging Film Industry Alliance Portal</span>
              <span className="sm:hidden font-bold text-stone-700">Alliance Portal</span>
            </div>
          )}
        </div>
      </div>

      {/* Live Packaging Film Production & Hiring Ticker */}
      <div className="bg-stone-900 text-stone-300 border-t border-stone-800 text-[9px] sm:text-[10px] font-mono py-1.5 overflow-hidden shadow-inner flex items-center">
        <div className="bg-amber-500 text-stone-950 font-black px-2 sm:px-2.5 py-0.5 z-10 shrink-0 uppercase tracking-widest flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[9px] shadow-sm ml-2 rounded-xs border border-amber-400">
          <span className="w-1.5 h-1.5 bg-stone-950 rounded-full shrink-0"></span>
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
            className="fixed inset-0 bg-stone-900/40 z-[99998] backdrop-blur-xs transition-opacity overscroll-contain"
            onClick={() => setIsNotifOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-[#FCFAF6] border-l border-stone-200 shadow-2xl z-[99999] flex flex-col text-stone-900 overscroll-contain">
            <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-[#F5F2EB]">
              <div>
                <h3 className="font-bold text-base text-stone-900 flex items-center gap-2 editorial-title">
                  <Bell className="h-4 w-4 text-stone-800" />
                  Simulated Alerts Log
                  <span className="text-[10px] bg-stone-900 text-amber-400 px-2 py-0.5 rounded font-mono font-bold">
                    {notifications.length} ALERTS
                  </span>
                </h3>
                <p className="text-[10px] text-stone-500 font-serif italic mt-0.5">
                  Real-time WhatsApp & Email deliveries ({currentUser.role.toUpperCase()} View)
                </p>
              </div>
              <button
                onClick={() => setIsNotifOpen(false)}
                className="text-stone-500 hover:text-stone-900 font-mono text-[10px] uppercase font-bold p-1 px-2.5 bg-white hover:bg-stone-50 rounded-sm border border-stone-200 transition shadow-2xs"
              >
                Close ✕
              </button>
            </div>

            <div className="p-2.5 bg-white border-b border-stone-200 flex items-center justify-between gap-2">
              <button
                onClick={handleTestAlert}
                className="flex items-center gap-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold px-2.5 py-1 rounded border border-amber-300 transition"
                title="Trigger a test WhatsApp alert"
              >
                <Send className="h-3 w-3 text-amber-700" />
                Simulate Test Alert
              </button>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAlerts}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition"
                  title="Clear all displayed alerts"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear Log
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/60 overscroll-contain">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center py-12">
                  <MessageSquare className="h-10 w-10 text-stone-300 mb-3 stroke-1" />
                  <p className="text-sm font-serif italic font-medium text-stone-600">No alerts triggered yet.</p>
                  <p className="text-[11px] text-stone-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                    Status updates, scheduled interviews, and admin approvals will stream live notifications here.
                  </p>
                  <button
                    onClick={handleTestAlert}
                    className="mt-4 px-3 py-1.5 bg-stone-900 text-amber-400 text-xs font-mono font-bold uppercase rounded shadow hover:bg-stone-800 transition"
                  >
                    Generate Sample Alert
                  </button>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-md border text-xs leading-relaxed transition shadow-sm bg-white hover:shadow-md ${
                      notif.type === "whatsapp"
                        ? "border-l-4 border-l-stone-900 border-stone-200/80"
                        : "border-l-4 border-l-stone-500 border-stone-200/80"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5 pb-1.5 border-b border-stone-100">
                      <span className="font-bold flex items-center gap-1.5 font-mono uppercase text-[10px] tracking-wider text-stone-900">
                        {notif.type === "whatsapp" ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                            <MessageSquare className="h-3.5 w-3.5 text-emerald-700" />
                            WhatsApp Alert
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-sky-500 inline-block"></span>
                            <Mail className="h-3.5 w-3.5 text-stone-600" />
                            Email Delivery
                          </>
                        )}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono bg-stone-100 px-1.5 py-0.5 rounded">
                        {new Date(notif.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <div className="font-mono text-stone-600 text-[10px] mb-2 pb-1 border-b border-stone-100/60 flex justify-between items-center">
                      <span><b className="text-stone-400">TO:</b> {notif.recipient}</span>
                      <span className="text-[9px] text-stone-400 italic">ID: {notif.id.slice(-6)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-stone-800 font-sans text-xs leading-relaxed">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 bg-[#F5F2EB] border-t border-stone-200 text-[10px] text-stone-500 text-center font-mono uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Simulated Node.js Gateway Connected
            </div>
          </div>
        </>
      )}
    </>
  );
}
