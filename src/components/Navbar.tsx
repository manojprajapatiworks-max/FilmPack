import React, { useState, useEffect } from "react";
import { User, Notification } from "../types";
import { Briefcase, Bell, LogOut, User as UserIcon, MessageSquare, Mail, Phone, Calendar, Shield, Building } from "lucide-react";

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

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/notifications?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        // Simulate reading notifications by resetting unreadCount when drawer is opened
        if (!isNotifOpen) {
          setUnreadCount(data.length);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll notifications
    return () => clearInterval(interval);
  }, [currentUser, isNotifOpen]);

  return (
    <header className="bg-[#fc20f6]/0 bg-[#FCFAF6] border-b border-stone-200 text-stone-900 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="bg-stone-900 p-1.5 rounded-sm flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-[#FCFAF6]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-stone-900 flex items-center gap-1.5 editorial-title">
                FilmPack <span className="text-[10px] bg-stone-900 text-stone-100 px-2 py-0.5 rounded-sm font-mono font-bold tracking-widest uppercase">Careers</span>
              </h1>
              <p className="text-[9px] text-stone-500 font-mono uppercase tracking-wider">Packaging Film Job Portal</p>
            </div>
          </div>

          {/* User Details & Controls */}
          {currentUser ? (
            <div className="flex items-center space-x-4">
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
                  <span className="absolute -top-1 -right-1 bg-red-800 text-white text-[8px] rounded-full h-4 w-4 flex items-center justify-center font-bold font-mono shadow-sm animate-bounce">
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
            <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500">
              Packaging Film Industry Alliance Portal
            </div>
          )}
        </div>
      </div>

      {/* Slide-out simulated notification alerts drawer */}
      {isNotifOpen && currentUser && (
        <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-[#FCFAF6] border-l border-stone-200 shadow-2xl z-50 flex flex-col text-stone-900">
          <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-[#F5F2EB]">
            <div>
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2 editorial-title">
                <Bell className="h-4 w-4 text-stone-800" />
                Simulated Alerts
              </h3>
              <p className="text-[10px] text-stone-500 font-serif italic mt-0.5">Real-time WhatsApp & Email deliveries</p>
            </div>
            <button
              onClick={() => setIsNotifOpen(false)}
              className="text-stone-500 hover:text-stone-900 font-mono text-[10px] uppercase font-bold p-1 px-2.5 bg-white hover:bg-stone-50 rounded-sm border border-stone-200 transition"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center py-10">
                <MessageSquare className="h-8 w-8 text-stone-300 mb-2 stroke-1" />
                <p className="text-sm font-serif italic">No alerts triggered yet.</p>
                <p className="text-[11px] text-stone-400 mt-1 max-w-[200px] mx-auto leading-relaxed">Status updates or scheduled interviews will stream live alerts here.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-sm border text-xs leading-relaxed transition shadow-sm bg-white ${
                    notif.type === "whatsapp"
                      ? "border-l-4 border-l-stone-900 border-stone-200"
                      : "border-l-4 border-l-stone-400 border-stone-200"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-stone-100">
                    <span className="font-bold flex items-center gap-1 font-mono uppercase text-[9px] tracking-wider">
                      {notif.type === "whatsapp" ? (
                        <>
                          <MessageSquare className="h-3 w-3 text-stone-850" />
                          WhatsApp Alert
                        </>
                      ) : (
                        <>
                          <Mail className="h-3 w-3 text-stone-600" />
                          Email Delivery
                        </>
                      )}
                    </span>
                    <span className="text-[9px] text-stone-400 font-mono">
                      {new Date(notif.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="font-mono text-stone-500 text-[10px] mb-1.5 pb-1 border-b border-stone-100/50">
                    <span className="text-stone-400">To:</span> {notif.recipient}
                  </div>
                  <p className="whitespace-pre-wrap text-stone-800 font-sans">{notif.message}</p>
                </div>
              ))
            )}
          </div>
          <div className="p-3 bg-[#F5F2EB] border-t border-stone-200 text-[10px] text-stone-500 text-center font-mono uppercase tracking-widest">
            Simulated Node.js Gateway Active
          </div>
        </div>
      )}
    </header>
  );
}
