import React, { useState, useEffect } from "react";
import { User, NewsletterItem } from "../types";
import { 
  Newspaper, Sparkles, Calendar, ArrowRight, Check, X, Edit, 
  Trash2, Upload, FileText, Plus, Eye, Image as ImageIcon, 
  Tag, ArrowUpRight, RefreshCw, AlertCircle, CheckCircle, 
  Loader2, Filter, ChevronRight
} from "lucide-react";

interface AllianceGazetteProps {
  currentUser: User;
  isAdminView?: boolean;
}

export default function AllianceGazette({ currentUser, isAdminView = false }: AllianceGazetteProps) {
  const [articles, setArticles] = useState<NewsletterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTopic, setFilterTopic] = useState<string>("All");
  const [selectedArticle, setSelectedArticle] = useState<NewsletterItem | null>(null);
  
  // AI Generation State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiTopic, setAiTopic] = useState<string>("Technology");
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
  const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null);
  const [aiSteps, setAiSteps] = useState<string>("");

  // Admin Editing / Creating State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<NewsletterItem> | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [adminActionMessage, setAdminActionMessage] = useState<string | null>(null);

  // Load articles
  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/newsletters");
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (err) {
      console.error("Failed to load newsletter articles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [isAdminView]);

  // Handle AI generation trigger
  const handleTriggerAiGenerate = async () => {
    setIsGeneratingAi(true);
    setAiSuccessMessage(null);
    setAiErrorMessage(null);
    
    // Animate search simulation steps
    setAiSteps("Initializing Gemini 3.5-Flash neural pipelines...");
    setTimeout(() => {
      setAiSteps("Executing Google Search Grounding for 'flexible packaging film breakthroughs 2026'...");
    }, 1500);
    setTimeout(() => {
      setAiSteps("Gathering technical feedstock data and capacity stats...");
    }, 3200);
    setTimeout(() => {
      setAiSteps("Structuring technical article & generating high-contrast cover assets...");
    }, 4800);

    try {
      const res = await fetch("/api/newsletters/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic })
      });

      const data = await res.json();
      if (res.ok) {
        setAiSuccessMessage(data.message || "AI News bulletin successfully gathered!");
        fetchArticles();
      } else {
        setAiErrorMessage(data.error || "The AI model encountered a parsing error. Please retry.");
      }
    } catch (err) {
      setAiErrorMessage("Connection failed. Ensure the server is online and active.");
    } finally {
      setIsGeneratingAi(false);
      setAiSteps("");
    }
  };

  // Admin: Approve / Deny status updates
  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/newsletters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setAdminActionMessage(`Article successfully ${status === "approved" ? "published live" : "moved to denied archive"}.`);
        setTimeout(() => setAdminActionMessage(null), 3500);
        fetchArticles();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Admin: Delete article
  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this news article?")) return;
    try {
      const res = await fetch(`/api/newsletters/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setAdminActionMessage("Article permanently removed from Alliance database.");
        setTimeout(() => setAdminActionMessage(null), 3500);
        fetchArticles();
      }
    } catch (err) {
      console.error("Failed to delete article:", err);
    }
  };

  // Admin: Direct save of manual edits or manual creation
  const handleSaveAdminArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    const isNew = !editingArticle.id;
    const url = isNew ? "/api/newsletters" : `/api/newsletters/${editingArticle.id}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingArticle)
      });

      if (res.ok) {
        setAdminActionMessage(isNew ? "Manual newsletter article successfully drafted!" : "Article content updated successfully!");
        setTimeout(() => setAdminActionMessage(null), 3500);
        setIsEditModalOpen(false);
        setEditingArticle(null);
        fetchArticles();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save. Please review inputs.");
      }
    } catch (err) {
      console.error("Error saving manual article:", err);
    }
  };

  // Admin: Handle direct local image upload (converts to base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be smaller than 2MB.");
      return;
    }

    setUploadProgress(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditingArticle(prev => ({ ...prev, imageUrl: reader.result as string }));
      }
      setUploadProgress(false);
    };
    reader.onerror = () => {
      alert("Failed to read selected image file.");
      setUploadProgress(false);
    };
    reader.readAsDataURL(file);
  };

  // Helper to parse markdown into neat, readable HTML elements
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // H3 heading
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="text-sm font-mono font-bold text-stone-900 mt-5 mb-2.5 uppercase tracking-wider border-b border-stone-200 pb-1">{line.replace("### ", "")}</h4>;
      }
      // H4 heading
      if (line.startsWith("#### ")) {
        return <h5 key={idx} className="text-xs font-mono font-bold text-stone-800 mt-4 mb-2 uppercase">{line.replace("#### ", "")}</h5>;
      }
      // Bullet list item
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const cleanLine = line.trim().replace(/^[\-\*]\s+/, "");
        // Highlight some inline markdown markers manually if present
        return (
          <li key={idx} className="list-disc ml-5 mb-1.5 text-stone-700 text-xs font-serif leading-relaxed">
            {parseInlineMarkdown(cleanLine)}
          </li>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Regular paragraph
      return (
        <p key={idx} className="text-xs font-serif text-stone-800 leading-relaxed mb-3.5">
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  // Quick inline formatter for **bold text**
  const parseInlineMarkdown = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-bold text-stone-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const topics = ["All", "Technology", "Sustainability", "Market Trends", "Raw Materials", "Plants"];

  const isAdmin = isAdminView || currentUser?.role === "admin";

  const filteredArticles = filterTopic === "All" 
    ? articles.filter(a => isAdmin ? true : a.status === "approved")
    : articles.filter(a => a.topic === filterTopic && (isAdmin ? true : a.status === "approved"));

  return (
    <div id="alliance-gazette-panel" className="space-y-6">
      
      {/* Newspaper Styled Title Card */}
      <div className="bg-[#FCFAF6] border-y-4 border-stone-900 py-6 text-center shadow-xs">
        <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-extrabold flex justify-between items-center px-4 max-w-4xl mx-auto border-b border-stone-200 pb-1.5 mb-2.5">
          <span>VOLUME III • ISSUE I</span>
          <span className="hidden sm:inline">THE OFFICIAL VOICE OF THE PACKAGING FILM ALLIANCE</span>
          <span>ESTD. 2026</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-stone-950 uppercase editorial-title">
          The Alliance Gazette
        </h2>
        <p className="text-xs sm:text-sm font-serif italic text-stone-600 max-w-xl mx-auto mt-1.5 px-4">
          Unifying stenter operators, cast extruders, chemical coordinators, and plant leadership with live global intelligence.
        </p>
        <div className="h-0.5 bg-stone-900 mt-4 max-w-4xl mx-auto" />
      </div>

      {adminActionMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-sm flex items-center gap-2.5 text-xs font-mono">
          <CheckCircle className="h-4 w-4 text-emerald-700" />
          {adminActionMessage}
        </div>
      )}

      {/* Grid Layout: News Main Feed & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* News Feed Side */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Filters Rail */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-3 flex-wrap gap-3">
            <div className="flex items-center space-x-1.5 bg-stone-100 p-0.5 rounded-sm border border-stone-200 overflow-x-auto max-w-full">
              {topics.map(topic => (
                <button
                  key={topic}
                  onClick={() => setFilterTopic(topic)}
                  className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-xs transition-all whitespace-nowrap ${
                    filterTopic === topic 
                      ? "bg-stone-900 text-amber-400 shadow-2xs" 
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>

            {isAdminView && (
              <button
                onClick={() => {
                  setEditingArticle({
                    title: "",
                    summary: "",
                    content: "",
                    topic: "Technology",
                    status: "approved",
                    imageUrl: ""
                  });
                  setIsEditModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-amber-400 text-[10px] font-mono font-bold uppercase py-1.5 px-3 rounded-sm transition shadow-sm border border-stone-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Draft Article
              </button>
            )}
          </div>

          {/* Articles Listing */}
          {isLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="h-8 w-8 text-stone-500 animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">Consulting Alliance Archives...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="py-16 text-center bg-white border border-stone-200 rounded-sm">
              <Newspaper className="h-10 w-10 text-stone-300 mx-auto mb-2.5 stroke-1" />
              <p className="text-sm font-serif italic text-stone-600 font-bold">No articles reported in this section.</p>
              <p className="text-xs text-stone-400 max-w-xs mx-auto mt-1 font-serif">
                {isAdminView 
                  ? "There are no newsletters saved in the database. Use the manual form or AI trigger to draft one!"
                  : "Check back later or trigger an AI Gazette Update to scan current industry feeds."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredArticles.map((article) => (
                <div 
                  key={article.id} 
                  className={`bg-white border border-stone-200 rounded-sm overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md ${
                    article.status === 'pending' ? 'ring-2 ring-amber-500/50' : ''
                  }`}
                >
                  <div>
                    {/* Cover Asset */}
                    <div className="relative h-44 w-full bg-stone-100 overflow-hidden border-b border-stone-200">
                      <img 
                        src={article.imageUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"} 
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                        <span className="bg-stone-950/85 backdrop-blur-md text-amber-400 text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                          {article.topic || "General"}
                        </span>
                        {article.isAiGenerated && (
                          <span className="bg-sky-900/85 backdrop-blur-md text-white text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm flex items-center gap-0.5">
                            <Sparkles className="h-2 w-2 text-sky-300" />
                            AI
                          </span>
                        )}
                        {isAdminView && (
                          <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm ${
                            article.status === 'approved' 
                              ? 'bg-emerald-800 text-white' 
                              : article.status === 'pending' 
                              ? 'bg-amber-500 text-stone-950' 
                              : 'bg-stone-500 text-white'
                          }`}>
                            {article.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center text-[10px] text-stone-400 font-mono gap-1.5">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(article.publishedDate || article.createdDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span>•</span>
                        <span>{article.isAiGenerated ? "Gemini-Grounding Engine" : "Alliance Editorial Staff"}</span>
                      </div>

                      {/* Headline */}
                      <h3 className="font-serif font-bold text-sm text-stone-950 hover:text-stone-800 leading-tight">
                        {article.title}
                      </h3>

                      {/* Summary text */}
                      <p className="text-xs font-serif text-stone-600 line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 pt-0 border-t border-stone-100 mt-2.5 flex items-center justify-between gap-2.5">
                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-stone-900 uppercase hover:text-stone-700 py-1 transition"
                    >
                      Read Cutout 
                      <ArrowRight className="h-3 w-3" />
                    </button>

                    {isAdminView && (
                      <div className="flex items-center gap-1 shrink-0">
                        {article.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(article.id, "approved")}
                              className="p-1 text-emerald-800 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                              title="Allow & Publish Live"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(article.id, "rejected")}
                              className="p-1 text-red-800 hover:bg-red-100 rounded border border-red-200 transition"
                              title="Deny / Reject"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setEditingArticle(article);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1 text-stone-600 hover:bg-stone-100 rounded border border-stone-300 transition"
                          title="Edit Article Content"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded border border-red-100 transition"
                          title="Permanently Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI News Triggering Side Panel */}
        <div className="lg:col-span-4 space-y-6">
          {isAdmin && (
            <div className="bg-white/75 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-md backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Sparkles className="h-5 w-5 text-cyan-600" />
                <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-widest">
                  AI Industrial Intelligence
                </h3>
              </div>
              
              <p className="text-xs font-sans text-slate-600 leading-relaxed">
                Trigger Gemini's live news crawler with <b>Google Search Grounding</b>. The engine gathers the latest late-2025 or 2026 breakthroughs, capacity scale-ups, or plant news, drafting a professional blog cutout automatically.
              </p>

              <div className="h-px bg-slate-100" />

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block tracking-wider">
                    Target News Core Topic:
                  </label>
                  <select
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 bg-white rounded-lg p-2 text-slate-850 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    disabled={isGeneratingAi}
                  >
                    <option value="Technology" className="bg-white text-slate-800">Technology (Stenter speeds, metallizing)</option>
                    <option value="Sustainability" className="bg-white text-slate-800">Sustainability (Monomaterial, bio-resins)</option>
                    <option value="Market Trends" className="bg-white text-slate-800">Market Trends (BOPP pricing, trade corridors)</option>
                    <option value="Raw Materials" className="bg-white text-slate-800">Raw Materials (Paraxylene, resin supplies)</option>
                    <option value="Plants" className="bg-white text-slate-800">Plants (New line start-ups, audits)</option>
                  </select>
                </div>

                {aiSuccessMessage && (
                  <div className="bg-cyan-50 border border-cyan-200 text-cyan-800 p-3 rounded-lg text-[10px] font-mono space-y-1">
                    <p className="font-bold text-cyan-700 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Feed Update Submitted!
                    </p>
                    <p className="text-slate-600 leading-relaxed">{aiSuccessMessage}</p>
                  </div>
                )}

                {aiErrorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-[10px] font-mono space-y-1">
                    <p className="font-bold text-red-700 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      AI Engine Blocked
                    </p>
                    <p className="text-slate-600 leading-relaxed">{aiErrorMessage}</p>
                  </div>
                )}

                {isGeneratingAi ? (
                  <div className="p-3.5 bg-slate-50 text-cyan-700 rounded-lg space-y-3 shadow-inner border border-cyan-200">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase animate-pulse text-cyan-700">Gathering news...</span>
                    </div>
                    <p className="text-[9px] font-mono text-slate-550 leading-relaxed">
                      {aiSteps || "Consulting satellite factory feeds..."}
                    </p>
                    <div className="w-full bg-slate-200 h-1 rounded overflow-hidden">
                      <div className="bg-cyan-500 h-full w-2/3 animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleTriggerAiGenerate}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold uppercase py-2.5 px-4 rounded-lg transition shadow-md shadow-cyan-500/10 cursor-pointer animate-fade-in"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Trigger AI News Feed
                  </button>
                )}
              </div>

              <div className="h-px bg-slate-100 pt-1" />
              <div className="text-[9px] text-slate-400 font-mono flex items-center gap-1.5 uppercase font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block animate-ping"></span>
                Moderator Queue Watcher Active
              </div>
            </div>
          )}

          {/* Paper cutouts editorial quote */}
          <div className="p-5 border-l-2 border-cyan-500 bg-white/60 rounded-r-2xl border-y border-r border-slate-200 shadow-xs font-sans italic text-xs text-slate-700 leading-relaxed relative">
            <span className="absolute -top-3 left-4 text-3xl text-cyan-500/10 font-black">“</span>
            "We do not merely extrude film; we isolate oxygen, seal shelf-lives, and sustain the supply chains that feed 1.4 billion people."
            <p className="text-[9px] font-mono uppercase font-bold tracking-wider text-slate-500 mt-2.5 not-italic">— FilmPack Alliance Executive Board</p>
          </div>
        </div>
      </div>

      {/* ARTICLE CLIP READ MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-stone-900/60 z-[99998] backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="fixed inset-0" 
            onClick={() => setSelectedArticle(null)}
          />
          
          <div className="bg-[#FAF8F5] max-w-2xl w-full border-4 border-stone-900 rounded-xs shadow-2xl relative z-[99999] flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Header branding */}
            <div className="p-4 border-b-2 border-stone-900 bg-stone-900 text-amber-400 flex justify-between items-center">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                <Newspaper className="h-4 w-4" />
                Alliance Gazette News Clipping
              </span>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="text-[10px] font-mono font-bold uppercase text-stone-300 hover:text-white px-2 py-0.5 border border-stone-700 hover:border-stone-500 rounded-sm"
              >
                Close ✕
              </button>
            </div>

            {/* Content box */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              
              {/* Cover Asset inside modal */}
              {selectedArticle.imageUrl && (
                <div className="h-56 w-full rounded border border-stone-200 overflow-hidden shadow-xs relative">
                  <img 
                    src={selectedArticle.imageUrl} 
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 right-2 bg-stone-900/85 text-white text-[9px] font-mono px-2 py-0.5 rounded">
                    {selectedArticle.topic || "General"}
                  </div>
                </div>
              )}

              {/* Title & metadata */}
              <div className="space-y-2 border-b border-stone-200 pb-3">
                <h3 className="text-xl font-serif font-black text-stone-950 uppercase leading-snug">
                  {selectedArticle.title}
                </h3>
                <div className="flex flex-wrap items-center text-[10px] text-stone-500 font-mono gap-3">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(selectedArticle.publishedDate || selectedArticle.createdDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  <span>•</span>
                  <span>Source: {selectedArticle.isAiGenerated ? "AI Grounded Bulletin" : "Alliance Council"}</span>
                </div>
              </div>

              {/* Body markdown rendered */}
              <div className="prose prose-sm max-w-none text-stone-900">
                {renderMarkdown(selectedArticle.content)}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="bg-stone-950 hover:bg-stone-800 text-amber-400 text-xs font-mono font-bold uppercase py-2 px-5 rounded-sm shadow"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN EDIT / CREATE MANUAL MODAL */}
      {isEditModalOpen && editingArticle && (
        <div className="fixed inset-0 bg-stone-900/60 z-[99998] backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="fixed inset-0" 
            onClick={() => {
              setIsEditModalOpen(false);
              setEditingArticle(null);
            }}
          />
          
          <form 
            onSubmit={handleSaveAdminArticle}
            className="bg-white max-w-xl w-full border-2 border-stone-900 rounded-sm shadow-2xl relative z-[99999] flex flex-col max-h-[90vh] overflow-hidden text-stone-900"
          >
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
              <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <Edit className="h-4 w-4 text-stone-700" />
                {editingArticle.id ? "Edit News Article" : "Create Manual News Article"}
              </h3>
              <button 
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingArticle(null);
                }}
                className="text-stone-500 hover:text-stone-900 font-mono text-[10px] uppercase font-bold"
              >
                Cancel ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              
              {/* Title input */}
              <div className="space-y-1">
                <label className="font-mono font-bold text-stone-500 uppercase tracking-wider block">Article Headline:</label>
                <input 
                  type="text"
                  required
                  value={editingArticle.title || ""}
                  onChange={(e) => setEditingArticle(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-stone-300 rounded p-2 focus:ring-1 focus:ring-stone-500 focus:outline-none"
                  placeholder="e.g., Jindal Poly Announces Gujarat Plant Expansion"
                />
              </div>

              {/* Topic Select */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono font-bold text-stone-500 uppercase tracking-wider block">Topic:</label>
                  <select
                    value={editingArticle.topic || "Technology"}
                    onChange={(e) => setEditingArticle(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full border border-stone-300 rounded p-2 focus:ring-1 focus:ring-stone-500 focus:outline-none bg-white"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Sustainability">Sustainability</option>
                    <option value="Market Trends">Market Trends</option>
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Plants">Plants</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-mono font-bold text-stone-500 uppercase tracking-wider block">Publish Status:</label>
                  <select
                    value={editingArticle.status || "approved"}
                    onChange={(e) => setEditingArticle(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full border border-stone-300 rounded p-2 focus:ring-1 focus:ring-stone-500 focus:outline-none bg-white"
                  >
                    <option value="approved">Approved (Live)</option>
                    <option value="pending">Pending Moderation</option>
                    <option value="rejected">Rejected (Denied)</option>
                  </select>
                </div>
              </div>

              {/* Summary text */}
              <div className="space-y-1">
                <label className="font-mono font-bold text-stone-500 uppercase tracking-wider block">Concise Summary (1-2 sentences):</label>
                <textarea 
                  required
                  rows={2}
                  value={editingArticle.summary || ""}
                  onChange={(e) => setEditingArticle(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full border border-stone-300 rounded p-2 focus:ring-1 focus:ring-stone-500 focus:outline-none"
                  placeholder="Provide a quick summary of the article to show up in feeds."
                />
              </div>

              {/* Content text (Markdown) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-mono font-bold text-stone-500 uppercase tracking-wider block">Article Content (Supports Markdown):</label>
                  <span className="text-[9px] font-mono text-stone-400">Use ### for headings, ** for bold, - for lists</span>
                </div>
                <textarea 
                  required
                  rows={6}
                  value={editingArticle.content || ""}
                  onChange={(e) => setEditingArticle(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full border border-stone-300 rounded p-2 font-serif text-sm focus:ring-1 focus:ring-stone-500 focus:outline-none"
                  placeholder="### Extrusion Milestones reached&#10;We successfully installed a new 10.4m line...&#10;- Recyclable polyolefin structures&#10;- Corona treating parameters..."
                />
              </div>

              {/* Cover Image Input Options */}
              <div className="space-y-3.5 bg-stone-50 p-4 rounded border border-stone-200">
                <span className="font-mono font-bold text-stone-700 uppercase tracking-wider block">Cover Image Configuration:</span>
                
                {/* Paste URL */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-stone-500 uppercase block">Paste Image URL:</label>
                  <input 
                    type="text"
                    value={editingArticle.imageUrl || ""}
                    onChange={(e) => setEditingArticle(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full border border-stone-300 bg-white rounded p-1.5 focus:ring-1 focus:ring-stone-500 focus:outline-none"
                    placeholder="https://images.unsplash.com/... or base64 data"
                  />
                </div>

                {/* Direct Upload File */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-stone-500 uppercase block">Or Upload Direct Image File (converts to database inline):</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="manual-cover-uploader"
                    />
                    <label 
                      htmlFor="manual-cover-uploader"
                      className="cursor-pointer inline-flex items-center gap-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 py-1.5 px-3 rounded text-xs transition font-semibold shadow-2xs"
                    >
                      <Upload className="h-3.5 w-3.5 text-stone-500" />
                      Select Local Image
                    </label>
                    {uploadProgress && <Loader2 className="h-4 w-4 animate-spin text-stone-500" />}
                    {editingArticle.imageUrl?.startsWith("data:") && (
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">✓ Direct Image Loaded</span>
                    )}
                  </div>
                </div>

                {editingArticle.imageUrl && (
                  <div className="h-20 w-32 rounded border border-stone-200 overflow-hidden relative shadow-2xs mt-2.5">
                    <img 
                      src={editingArticle.imageUrl} 
                      alt="Thumbnail Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingArticle(prev => ({ ...prev, imageUrl: "" }))}
                      className="absolute top-1 right-1 bg-red-800 text-white p-0.5 rounded"
                      title="Clear image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingArticle(null);
                }}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded text-xs transition font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-stone-950 hover:bg-stone-800 text-amber-400 font-mono font-bold uppercase text-xs py-2 px-5 rounded-sm shadow"
              >
                Save Article
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
