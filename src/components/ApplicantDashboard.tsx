import React, { useState, useEffect } from "react";
import { User, Job, Application, Interview } from "../types";
import { Search, MapPin, Award, IndianRupee, Calendar, FileText, Camera, UploadCloud, CheckCircle, Info, RefreshCw, Layers, SlidersHorizontal, BookOpen, AlertCircle } from "lucide-react";
import AllianceGazette from "./AllianceGazette";

interface ApplicantDashboardProps {
  currentUser: User;
  siteConfig?: any;
}

export default function ApplicantDashboard({ currentUser, siteConfig }: ApplicantDashboardProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search and Filter States
  const [searchTitle, setSearchTitle] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterExperience, setFilterExperience] = useState("");

  // UI Selection States
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [activeSection, setActiveSection] = useState<"find_jobs" | "my_applications" | "profile" | "gazette">("find_jobs");

  // Profile default data
  const [profileData, setProfileData] = useState({
    fullName: currentUser.name,
    mobile: currentUser.mobile,
    email: currentUser.email,
    currentLocation: "",
    preferredLocation: "",
    qualification: "",
    experience: "",
    currentCompany: "",
    currentDesignation: "",
    currentSalary: "",
    expectedSalary: "",
    noticePeriod: "",
    skills: [] as string[]
  });

  // Application Form States
  const [appForm, setAppForm] = useState({
    remarks: "",
    resumeFile: null as { name: string; size: number; base64?: string } | null,
    photoFile: null as { name: string; size: number; previewUrl?: string } | null
  });

  const [newSkillTag, setNewSkillTag] = useState("");
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [appSuccessMessage, setAppSuccessMessage] = useState<string | null>(null);
  const [matchReport, setMatchReport] = useState<{ score: number; feedback: string } | null>(null);
  const [isProfileSaved, setIsProfileSaved] = useState(Boolean(currentUser?.profileDefaults?.qualification && currentUser?.profileDefaults?.experience));

  const filmCategories = siteConfig?.jobCategories || [
    "Extrusion Operator",
    "Printing Operator",
    "Lamination Operator",
    "Slitting Operator",
    "QC Engineer",
    "Production Manager",
    "Maintenance Engineer",
    "Sales & Marketing",
    "R&D",
    "Warehouse"
  ];

  const fetchJobsAndApplications = async () => {
    setIsLoading(true);
    try {
      const [jobsRes, appsRes, intRes] = await Promise.all([
        fetch("/api/jobs"),
        fetch(`/api/applications?applicantId=${currentUser.id}`),
        fetch(`/api/interviews?applicantId=${currentUser.id}`)
      ]);

      if (jobsRes.ok && appsRes.ok && intRes.ok) {
        setJobs(await jobsRes.json());
        setApplications(await appsRes.json());
        setInterviews(await intRes.json());
      }
    } catch (err) {
      console.warn("Notice: dashboard data fetch momentarily unavailable", err);
    } finally {
      setIsLoading(false);
    }
  };

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  useEffect(() => {
    fetchJobsAndApplications();
    if (currentUser.profileDefaults) {
      setProfileData(prev => ({ ...prev, ...currentUser.profileDefaults }));
      if (currentUser.profileDefaults.qualification && currentUser.profileDefaults.experience) {
        setIsProfileSaved(true);
      }
    }
  }, [currentUser]);

  // Handle Form Submission
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setIsSubmittingApp(true);
    setAppSuccessMessage(null);
    setMatchReport(null);

    const payload = {
      jobId: selectedJob.id,
      applicantId: currentUser.id,
      remarks: appForm.remarks,
      resumeUrl: appForm.resumeFile ? `${appForm.resumeFile.name} (${Math.round(appForm.resumeFile.size / 1024)} KB)` : "default_resume.pdf",
      photoUrl: appForm.photoFile ? appForm.photoFile.name : "",
      formData: {
        ...profileData
      }
    };

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newApp: Application = await res.json();
        setAppSuccessMessage(`Successfully applied to ${selectedJob.title}! An alert confirmation has been simulated over SMS/WhatsApp.`);
        setMatchReport({
          score: newApp.matchScore || 50,
          feedback: newApp.matchFeedback || "Standard technical match."
        });

        // Clear applying views after delay or on click
        fetchJobsAndApplications();
      } else {
        const errData = await res.json();
        showNotice(errData.error || "Failed to submit application");
      }
    } catch (err) {
      console.error("Error submitting application", err);
      showNotice("Error occurred while submitting your application.");
    } finally {
      setIsSubmittingApp(false);
    }
  };

  // Add / Remove Skills Tag
  const addSkillTag = (e: React.MouseEvent) => {
    e.preventDefault();
    if (newSkillTag.trim() && !profileData.skills.includes(newSkillTag.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkillTag.trim()]
      });
      setNewSkillTag("");
    }
  };

  const removeSkillTag = (skillToRemove: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(s => s !== skillToRemove)
    });
  };

  // Drag and Drop Simulations
  const handleResumeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setAppForm(prev => ({
        ...prev,
        resumeFile: { name: file.name, size: file.size }
      }));
    }
  };

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setAppForm(prev => ({
        ...prev,
        photoFile: { name: file.name, size: file.size, previewUrl: URL.createObjectURL(file) }
      }));
    }
  };

  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAppForm(prev => ({
        ...prev,
        resumeFile: { name: file.name, size: file.size }
      }));
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAppForm(prev => ({
        ...prev,
        photoFile: { name: file.name, size: file.size, previewUrl: URL.createObjectURL(file) }
      }));
    }
  };

  // Profile Save
  const saveProfileDefaults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.qualification.trim() || !profileData.experience.trim()) {
      showNotice("Please fill in at least Highest Qualification and Years of Experience before saving.");
      return;
    }
    try {
      const res = await fetch(`/api/users/${currentUser.id}/profile-defaults`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        setIsProfileSaved(true);
        showNotice("Profile defaults saved successfully! You can now apply for jobs.");
      } else {
        setIsProfileSaved(true);
        showNotice("Profile defaults updated locally.");
      }
    } catch (err) {
      setIsProfileSaved(true);
      showNotice("Profile defaults updated locally.");
    }
  };

  // Pre-fill profile defaults when starting an application
  const openApplyForm = (job: Job) => {
    setSelectedJob(job);
    setIsApplying(true);
    setAppForm({
      remarks: "",
      resumeFile: null,
      photoFile: null
    });
    setAppSuccessMessage(null);
    setMatchReport(null);
  };

  // Filter Logic
  const filteredJobs = jobs.filter(job => {
    if (job.status !== "open") return false; // Show only open jobs to applicant

    const matchesSearch = job.title.toLowerCase().includes(searchTitle.toLowerCase()) || 
                          job.companyName.toLowerCase().includes(searchTitle.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchTitle.toLowerCase());
    const matchesDept = filterDepartment ? job.department === filterDepartment : true;
    const matchesLoc = filterLocation ? job.location.toLowerCase().includes(filterLocation.toLowerCase()) : true;
    const matchesExp = filterExperience ? job.experience.toLowerCase().includes(filterExperience.toLowerCase()) : true;

    return matchesSearch && matchesDept && matchesLoc && matchesExp;
  });

  const openJobsCount = jobs.filter(j => j.status === "open").length;

  return (
    <div className="min-h-screen bg-transparent text-slate-800 font-sans pb-12">
      {/* Tab Selectors */}
      <div className="bg-white/70 border-b border-slate-200/60 backdrop-blur-md rounded-xl shadow-xs">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-4 sm:space-x-6 h-14 items-center overflow-x-auto">
            <button
              onClick={() => { setActiveSection("find_jobs"); setIsApplying(false); setSelectedJob(null); }}
              className={`text-xs font-mono font-bold uppercase tracking-widest h-full border-b-2 px-1 transition py-4 cursor-pointer whitespace-nowrap ${
                activeSection === "find_jobs" ? "border-cyan-600 text-cyan-600" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Search Film Jobs ({openJobsCount})
            </button>
            <button
              onClick={() => { setActiveSection("my_applications"); setIsApplying(false); setSelectedJob(null); }}
              className={`text-xs font-mono font-bold uppercase tracking-widest h-full border-b-2 px-1 transition py-4 cursor-pointer whitespace-nowrap ${
                activeSection === "my_applications" ? "border-cyan-600 text-cyan-600" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              My Applied Jobs ({applications.length})
            </button>
            <button
              onClick={() => { setActiveSection("profile"); setIsApplying(false); setSelectedJob(null); }}
              className={`text-xs font-mono font-bold uppercase tracking-widest h-full border-b-2 px-1 transition py-4 cursor-pointer whitespace-nowrap ${
                activeSection === "profile" ? "border-cyan-600 text-cyan-600" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Resume Profile Defaults
            </button>
            <button
              onClick={() => { setActiveSection("gazette"); setIsApplying(false); setSelectedJob(null); }}
              className={`text-xs font-mono font-bold uppercase tracking-widest h-full border-b-2 px-1 transition py-4 cursor-pointer whitespace-nowrap ${
                activeSection === "gazette" ? "border-cyan-600 text-cyan-600" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Alliance Gazette 📰
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto mt-8">
        {actionMessage && (
          <div className="mb-6 bg-white border border-cyan-200 text-cyan-800 p-4 rounded-xl shadow-md flex items-center justify-between font-mono text-xs backdrop-blur-md">
            <span className="flex items-center gap-2 font-bold uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block animate-pulse"></span>
              {actionMessage}
            </span>
            <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-755 font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* FIND JOBS VIEW */}
        {activeSection === "find_jobs" && !isApplying && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3 flex-wrap font-serif">
                <span>Flexible Packaging Vacancies</span>
                <span className="text-xs bg-cyan-50 border border-cyan-200 text-cyan-700 px-3 py-1 rounded-full font-mono font-bold tracking-wider shadow-xs">
                  {openJobsCount} Total Vacancies Open
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 italic">Search active jobs across co-extrusion, gravure, QC lab testing, and maintenance operators.</p>
            </div>

            {!isProfileSaved && (
              <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between gap-3 shadow-xs backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-800 font-serif text-sm">Action Required: Complete Resume Profile Defaults</h4>
                    <p className="text-xs text-amber-700 font-sans mt-0.5">You must complete and save your Resume Profile Defaults before submitting job applications.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsApplying(false); setSelectedJob(null); setActiveSection("profile"); }}
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-mono font-bold uppercase tracking-widest px-4 py-2 rounded-lg shadow transition cursor-pointer"
                >
                  Complete Profile →
                </button>
              </div>
            )}

            {/* Filter Panel */}
            <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4 mb-6 shadow-xl backdrop-blur-md">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Term */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400/70" />
                  <input
                    type="text"
                    placeholder="Search keywords, title, company..."
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    className="w-full bg-gray-950/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500"
                  />
                </div>

                {/* Category Selector */}
                <div>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full bg-gray-950/50 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white"
                  >
                    <option value="" className="bg-gray-900 text-white">All Film Roles / Categories</option>
                    {filmCategories.map(cat => (
                      <option key={cat} value={cat} className="bg-gray-900 text-white">{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <input
                    type="text"
                    placeholder="Filter by Location (e.g. Noida)"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full bg-gray-950/50 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white placeholder-gray-500"
                  />
                </div>

                {/* Experience Filter */}
                <div>
                  <input
                    type="text"
                    placeholder="Experience (e.g. 3 Years)"
                    value={filterExperience}
                    onChange={(e) => setFilterExperience(e.target.value)}
                    className="w-full bg-gray-950/50 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Job Board Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mb-3" />
                <p className="text-xs font-mono uppercase tracking-wider">Loading active openings...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-20 border border-white/10 rounded-2xl bg-gray-900/40 backdrop-blur-md">
                <AlertCircle className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-300 font-serif italic">No vacancies match your active search filters.</p>
                <button 
                  onClick={() => { setSearchTitle(""); setFilterDepartment(""); setFilterLocation(""); setFilterExperience(""); }}
                  className="mt-4 text-xs bg-gray-900 hover:bg-gray-850 text-white border border-white/10 hover:border-cyan-500/30 px-4 py-2 rounded-lg font-mono uppercase tracking-wider transition cursor-pointer"
                >
                  Reset Search Criteria
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredJobs.map(job => (
                  <div key={job.id} className="bg-gray-900/65 border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-cyan-500/40 hover:shadow-cyan-500/10 hover:shadow-2xl transition-all duration-300 backdrop-blur-md">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div>
                          <h3 className="font-bold text-base text-white font-serif">{job.title}</h3>
                          <p className="text-xs text-gray-400 font-serif italic mt-0.5">{job.companyName}</p>
                        </div>
                        <span className="text-[9px] bg-cyan-950/60 text-cyan-400 font-mono font-semibold px-2.5 py-1 rounded-full border border-cyan-500/20 uppercase tracking-wider">
                          {job.department}
                        </span>
                      </div>

                      {/* Info Pills */}
                      <div className="grid grid-cols-2 gap-3 text-xs text-gray-300 font-medium mb-4 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-cyan-400/80" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-cyan-400/80" />
                          <span>Exp: {job.experience}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4 text-cyan-400/80" />
                          <span>{job.salary}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-1">
                          <Calendar className="h-4 w-4 text-purple-400" />
                          <span className="text-purple-300 font-mono text-[11px]">Apply before: {job.deadline}</span>
                        </div>
                      </div>

                      {/* Description summary */}
                      <p className="text-xs text-gray-300 leading-relaxed line-clamp-3 mb-4 font-serif">
                        {job.description}
                      </p>

                      {/* Required Skills Required Tags */}
                      {job.skillsRequired && job.skillsRequired.length > 0 && (
                        <div className="mb-5">
                          <p className="text-[9px] text-gray-400 font-mono font-bold uppercase tracking-wider mb-1.5">Target Process Skills:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {job.skillsRequired.map(skill => (
                              <span key={skill} className="text-[9px] bg-gray-950/60 text-cyan-400 px-2 py-0.5 rounded-lg border border-cyan-500/20 uppercase tracking-widest font-mono font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openApplyForm(job)}
                        className="flex-1 text-center bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-widest py-2.5 rounded-lg shadow-lg shadow-cyan-500/10 transition active:scale-98 cursor-pointer"
                      >
                        Apply for Job
                      </button>
                      {!isProfileSaved && (
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/20 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1" title="Complete Resume Profile Defaults first">
                          <AlertCircle className="h-3 w-3" /> Profile Req.
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* APPLY FORM WORKFLOW (MULTI-SECTION COMPREHENSIVE RESUME FIELDS) */}
        {activeSection === "find_jobs" && isApplying && selectedJob && (
          <div className="bg-white border border-stone-200 rounded-sm shadow-md p-6 md:p-8 max-w-4xl mx-auto">
            <div className="border-b border-stone-200 pb-4 mb-6">
              <button
                onClick={() => setIsApplying(false)}
                className="text-[10px] text-stone-600 hover:text-stone-900 font-mono uppercase tracking-widest bg-stone-50 hover:bg-stone-100 px-2.5 py-1 rounded-sm border border-stone-200 mb-4 inline-block transition cursor-pointer"
              >
                ← Back to Vacancies
              </button>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight font-serif">Hiring Application</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-sm font-mono text-stone-850 uppercase tracking-widest font-bold">
                  {selectedJob.title}
                </span>
                <span className="text-xs text-stone-500 font-serif italic">at {selectedJob.companyName}</span>
              </div>
            </div>

            {!isProfileSaved && !appSuccessMessage && (
              <div className="mb-6 bg-amber-50 border-2 border-amber-400 p-4 rounded-sm flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-900 font-serif text-sm">Action Required: Complete Resume Profile Defaults</h4>
                    <p className="text-xs text-amber-800 font-sans mt-0.5">You must complete and save your Resume Profile Defaults before submitting job applications.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsApplying(false); setSelectedJob(null); setActiveSection("profile"); }}
                  className="bg-amber-900 hover:bg-amber-800 text-white text-xs font-mono font-bold uppercase tracking-widest px-4 py-2 rounded-sm shadow-2xs whitespace-nowrap cursor-pointer"
                >
                  Complete Profile →
                </button>
              </div>
            )}

            {appSuccessMessage ? (
              <div className="py-8 space-y-6 text-center">
                <div className="bg-stone-100 border border-stone-200 p-4 rounded-sm max-w-lg mx-auto">
                  <CheckCircle className="h-10 w-10 text-stone-800 mx-auto mb-2" />
                  <h3 className="font-bold text-base text-stone-900 font-serif">Application Submitted!</h3>
                  <p className="text-xs text-stone-600 mt-2">{appSuccessMessage}</p>
                </div>

                {matchReport && (
                  <div className="bg-[#FCFAF6] border border-stone-200 p-5 rounded-sm max-w-xl mx-auto text-left space-y-4">
                    <h4 className="font-mono text-[10px] text-stone-500 uppercase font-bold tracking-widest flex items-center justify-between">
                      <span>Gemini Technical Alignment Score</span>
                      <span className="text-stone-850 bg-stone-200 border border-stone-300 px-2.5 py-0.5 rounded-sm text-xs font-bold font-mono">
                        {matchReport.score}% Fit
                      </span>
                    </h4>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-stone-900 h-full rounded-full transition-all duration-1000" style={{ width: `${matchReport.score}%` }}></div>
                    </div>
                    <div>
                      <p className="text-[9px] text-stone-500 font-mono font-semibold uppercase tracking-wider mb-1">AI Evaluator Feedback:</p>
                      <p className="text-xs text-stone-700 leading-relaxed font-serif italic">{matchReport.feedback}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-3 mt-6">
                  <button
                    onClick={() => { setIsApplying(false); setSelectedJob(null); }}
                    className="bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-mono uppercase tracking-widest py-2.5 px-6 rounded-sm transition cursor-pointer"
                  >
                    Explore Other Openings
                  </button>
                  <button
                    onClick={() => { setActiveSection("my_applications"); setIsApplying(false); }}
                    className="bg-stone-900 hover:bg-stone-850 text-white text-xs font-mono uppercase tracking-widest py-2.5 px-6 rounded-sm transition font-bold cursor-pointer"
                  >
                    View Application Status
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-6">
                
                {/* Section 1: Contact Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold font-mono uppercase text-stone-900 tracking-widest flex items-center gap-2 pb-2 border-b border-stone-200">
                    <span className="bg-stone-900 h-5 w-5 rounded-full text-[10px] text-white flex items-center justify-center font-bold font-mono">1</span>
                    Personal & Contact Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={profileData.mobile}
                        onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Locations & Education */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-xs font-bold font-mono uppercase text-stone-900 tracking-widest flex items-center gap-2 pb-2 border-b border-stone-200">
                    <span className="bg-stone-900 h-5 w-5 rounded-full text-[10px] text-white flex items-center justify-center font-bold font-mono">2</span>
                    Geography & Education
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Current Location *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Baroda, Gujarat"
                        value={profileData.currentLocation}
                        onChange={(e) => setProfileData({ ...profileData, currentLocation: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Preferred Job Location *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Noida, UP or Any"
                        value={profileData.preferredLocation}
                        onChange={(e) => setProfileData({ ...profileData, preferredLocation: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Highest Qualification *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ITI Mechanical / CIPET Diploma"
                        value={profileData.qualification}
                        onChange={(e) => setProfileData({ ...profileData, qualification: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Professional Experience */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-xs font-bold font-mono uppercase text-stone-900 tracking-widest flex items-center gap-2 pb-2 border-b border-stone-200">
                    <span className="bg-stone-900 h-5 w-5 rounded-full text-[10px] text-white flex items-center justify-center font-bold font-mono">3</span>
                    Professional Experience Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Experience (Years) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 4 Years"
                        value={profileData.experience}
                        onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Current Company</label>
                      <input
                        type="text"
                        placeholder="e.g. Jindal Poly Films"
                        value={profileData.currentCompany}
                        onChange={(e) => setProfileData({ ...profileData, currentCompany: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Current Designation</label>
                      <input
                        type="text"
                        placeholder="e.g. Assistant Operator"
                        value={profileData.currentDesignation}
                        onChange={(e) => setProfileData({ ...profileData, currentDesignation: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Notice Period *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Immediate / 30 Days"
                        value={profileData.noticePeriod}
                        onChange={(e) => setProfileData({ ...profileData, noticePeriod: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Current Salary (₹ / Month)</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹25,000"
                        value={profileData.currentSalary}
                        onChange={(e) => setProfileData({ ...profileData, currentSalary: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Expected Salary (₹ / Month) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ₹32,000"
                        value={profileData.expectedSalary}
                        onChange={(e) => setProfileData({ ...profileData, expectedSalary: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Process Skills Tags */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-xs font-bold font-mono uppercase text-stone-900 tracking-widest flex items-center gap-2 pb-2 border-b border-stone-200">
                    <span className="bg-stone-900 h-5 w-5 rounded-full text-[10px] text-white flex items-center justify-center font-bold font-mono">4</span>
                    Industrial Technical Skills Tags
                  </h3>
                  <div>
                    <label className="block text-[10px] text-stone-500 font-mono mb-1.5 uppercase tracking-wider font-bold">Add Skills (Extrusion, printing line, slitter adjustment, corona, bond testing, etc.)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type skill and click Add"
                        value={newSkillTag}
                        onChange={(e) => setNewSkillTag(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkillTag(e as any); } }}
                        className="flex-1 bg-white border border-stone-300 rounded-sm p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                      />
                      <button
                        type="button"
                        onClick={addSkillTag}
                        className="bg-stone-100 hover:bg-stone-200 border border-stone-300 text-xs text-stone-850 font-mono px-4 rounded-sm transition cursor-pointer"
                      >
                        + Add Skill
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {profileData.skills.length === 0 ? (
                        <p className="text-xs text-stone-500 italic font-serif">No skill tags added yet. Add a few to boost your AI Match Index score!</p>
                      ) : (
                        profileData.skills.map(skill => (
                          <span key={skill} className="text-xs bg-stone-100 text-stone-800 border border-stone-200 px-2.5 py-1 rounded-sm flex items-center gap-1.5 font-mono uppercase tracking-wider">
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkillTag(skill)}
                              className="text-red-600 hover:text-red-900 font-bold ml-1 cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 5: Document and Photo Upload simulation (Drag-and-Drop) */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-xs font-bold font-mono uppercase text-stone-900 tracking-widest flex items-center gap-2 pb-2 border-b border-stone-200">
                    <span className="bg-stone-900 h-5 w-5 rounded-full text-[10px] text-white flex items-center justify-center font-bold font-mono">5</span>
                    Resume & Photo Attachment
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Resume Upload Drop Zone */}
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleResumeDrop}
                      className="border-2 border-dashed border-stone-300 hover:border-stone-500 bg-[#FCFAF6] rounded-sm p-5 text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[140px]"
                    >
                      <UploadCloud className="h-8 w-8 text-stone-400 mb-2" />
                      <p className="text-xs text-stone-800 font-semibold">Drag & Drop Resume (PDF/DOC)</p>
                      <p className="text-[10px] text-stone-500 mt-1">or browse manually</p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeSelect}
                        className="hidden"
                        id="resume-file-input"
                      />
                      <label htmlFor="resume-file-input" className="mt-2 text-[10px] bg-white hover:bg-stone-50 text-stone-800 px-3 py-1.5 rounded-sm cursor-pointer font-mono uppercase tracking-widest border border-stone-200 transition">
                        Select Resume File
                      </label>

                      {appForm.resumeFile && (
                        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-stone-800 font-mono">
                          <FileText className="h-4 w-4" />
                          <span>{appForm.resumeFile.name} ({Math.round(appForm.resumeFile.size / 1024)} KB) ✔</span>
                        </div>
                      )}
                    </div>

                    {/* Photo Upload Drop Zone */}
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handlePhotoDrop}
                      className="border-2 border-dashed border-stone-300 hover:border-stone-500 bg-[#FCFAF6] rounded-sm p-5 text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[140px]"
                    >
                      <Camera className="h-8 w-8 text-stone-400 mb-2" />
                      <p className="text-xs text-stone-800 font-semibold">Drag & Drop Passport Photo</p>
                      <p className="text-[10px] text-stone-500 mt-1">PNG, JPG formats supported</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                        id="photo-file-input"
                      />
                      <label htmlFor="photo-file-input" className="mt-2 text-[10px] bg-white hover:bg-stone-50 text-stone-800 px-3 py-1.5 rounded-sm cursor-pointer font-mono uppercase tracking-widest border border-stone-200 transition">
                        Select Photo
                      </label>

                      {appForm.photoFile && (
                        <div className="mt-3 flex flex-col items-center">
                          {appForm.photoFile.previewUrl && (
                            <img src={appForm.photoFile.previewUrl} alt="Preview" className="h-10 w-10 rounded-full object-cover border border-stone-200 mb-1" />
                          )}
                          <span className="text-[10px] text-stone-800 font-mono font-bold">{appForm.photoFile.name} ✔</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional remarks */}
                <div className="space-y-2">
                  <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider font-bold">Cover Note / Additional Remarks</label>
                  <textarea
                    rows={3}
                    placeholder="Provide any additional notes regarding extrusion/printing background, shifting availability, machine specializations, etc."
                    value={appForm.remarks}
                    onChange={(e) => setAppForm({ ...appForm, remarks: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                  ></textarea>
                </div>

                <div className="border-t border-stone-200 pt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    disabled={isSubmittingApp}
                    onClick={() => { setIsApplying(false); setSelectedJob(null); }}
                    className="bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-mono uppercase tracking-widest py-2.5 px-6 rounded-sm transition cursor-pointer"
                  >
                    Cancel Application
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingApp || !isProfileSaved}
                    className={`text-xs font-mono uppercase tracking-widest py-2.5 px-8 rounded-sm shadow-xs transition flex items-center justify-center gap-2 font-bold cursor-pointer ${
                      !isProfileSaved ? "bg-stone-300 text-stone-500 cursor-not-allowed" : "bg-stone-900 hover:bg-stone-850 text-white"
                    }`}
                  >
                    {isSubmittingApp ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                        AI Skill Matching & Submitting...
                      </>
                    ) : (
                      "Submit Technical Application"
                    )}
                  </button>
                </div>

              </form>
            )}
          </div>
        )}

        {/* MY APPLIED JOBS */}
        {activeSection === "my_applications" && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-stone-900 tracking-tight editorial-title">Your Applied Positions</h2>
              <p className="text-xs text-stone-500 font-serif italic mt-1">Track application review, recruiter notes, interview schedules, and SMS/WhatsApp notifications logs.</p>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-24 bg-white border border-stone-200 rounded-sm">
                <FileText className="h-10 w-10 text-stone-400 mx-auto mb-2" />
                <p className="text-sm text-stone-600 font-serif italic">You haven't applied for any positions yet.</p>
                <button 
                  onClick={() => { setActiveSection("find_jobs"); setIsApplying(false); }}
                  className="mt-3 text-xs bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 hover:border-stone-400 px-3 py-1.5 rounded-sm font-mono uppercase tracking-wider transition cursor-pointer"
                >
                  Explore Vacancies
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {applications.map(app => {
                  const targetJob = jobs.find(j => j.id === app.jobId);
                  const statusColors: Record<string, string> = {
                    "Applied": "bg-stone-100 text-stone-800 border border-stone-300 font-mono text-[9px] uppercase tracking-wider",
                    "Under Review": "bg-amber-50 text-amber-900 border border-amber-200 font-mono text-[9px] uppercase tracking-wider",
                    "Shortlisted": "bg-stone-900 text-white border border-stone-900 font-mono text-[9px] uppercase tracking-wider",
                    "Rejected": "bg-red-50 text-red-800 border border-red-200 font-mono text-[9px] uppercase tracking-wider",
                    "Hired": "bg-stone-200 text-stone-900 border border-stone-350 font-mono text-[9px] uppercase tracking-wider"
                  };

                  // Find interviews matching this application
                  const matchedInterviews = interviews.filter(i => i.applicationId === app.id);

                  return (
                    <div key={app.id} className="bg-white border border-stone-200 rounded-sm p-5 shadow-xs space-y-4">
                      
                      {/* Application header */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-stone-150 pb-4">
                        <div>
                          <h3 className="font-bold text-base text-stone-900 font-serif">
                            {targetJob ? targetJob.title : "Unknown Position"}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                            <span className="text-stone-800 font-serif italic font-semibold">{targetJob ? targetJob.companyName : "Unknown Company"}</span>
                            <span>•</span>
                            <span className="font-mono">Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-sm ${statusColors[app.status] || "bg-stone-100 text-stone-700"}`}>
                            {app.status}
                          </span>
                        </div>
                      </div>

                      {/* Technical matching metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#FCFAF6] p-3.5 rounded-sm border border-stone-200 space-y-2">
                          <div className="flex justify-between items-center text-[9px] text-stone-500 font-mono font-bold uppercase tracking-wider">
                            <span>Hiring Alignment</span>
                            <span className="text-stone-900">{app.matchScore || 50}% Fit</span>
                          </div>
                          <div className="w-full bg-stone-200 h-1 rounded-full overflow-hidden">
                            <div className="bg-stone-900 h-full rounded-full" style={{ width: `${app.matchScore || 50}%` }}></div>
                          </div>
                          <p className="text-xs text-stone-700 leading-relaxed font-serif italic mt-1">
                            <span className="text-stone-500 font-mono text-[9px] font-bold uppercase tracking-wider mr-1">Feedback:</span> {app.matchFeedback || "Standard profile matchup checked."}
                          </p>
                        </div>

                        <div className="bg-[#FCFAF6] p-3.5 rounded-sm border border-stone-200 space-y-1">
                          <span className="text-[9px] text-stone-500 font-mono font-bold uppercase tracking-wider block">Hiring Feedback</span>
                          <p className="text-xs text-stone-800 leading-relaxed font-serif italic">
                            "{app.feedback || "Your resume application is under active routing to the manufacturing plant team."}"
                          </p>
                        </div>

                        <div className="bg-[#FCFAF6] p-3.5 rounded-sm border border-stone-200 space-y-1">
                          <span className="text-[9px] text-stone-500 font-mono font-bold uppercase tracking-wider block">Your Application Remarks</span>
                          <p className="text-xs text-stone-600 leading-relaxed font-serif">
                            {app.remarks || "No supplementary cover notes provided."}
                          </p>
                        </div>
                      </div>

                      {/* Matched Interviews Schedule */}
                      {matchedInterviews.length > 0 && (
                        <div className="bg-[#FCFAF6] border border-stone-300 rounded-sm p-3.5">
                          <h4 className="text-xs font-bold font-mono uppercase text-stone-900 flex items-center gap-1.5 mb-2.5 pb-1 border-b border-stone-200">
                            <Calendar className="h-3.5 w-3.5 text-stone-800" />
                            Interview Schedule Scheduled
                          </h4>
                          <div className="space-y-3">
                            {matchedInterviews.map(interview => (
                              <div key={interview.id} className="text-xs space-y-2 pb-2 border-b border-stone-200 last:border-0 last:pb-0">
                                <div className="flex justify-between font-bold text-stone-900 font-serif">
                                  <span>{interview.title}</span>
                                  <span className="text-stone-800 uppercase font-mono text-[9px] tracking-wider bg-stone-200 px-1.5 py-0.5 rounded-sm">
                                    {interview.mode}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-600">
                                  <div>
                                    <span className="text-stone-400 font-mono font-bold uppercase text-[9px] tracking-wider">Date/Time:</span>{" "}
                                    {new Date(interview.dateTime).toLocaleString()}
                                  </div>
                                  <div>
                                    <span className="text-stone-400 font-mono font-bold uppercase text-[9px] tracking-wider">Channel/Location:</span>{" "}
                                    <a href={interview.linkOrLocation} target="_blank" rel="noopener noreferrer" className="text-stone-900 hover:underline underline-offset-2 font-mono">
                                      {interview.linkOrLocation}
                                    </a>
                                  </div>
                                </div>
                                {interview.notes && (
                                  <p className="text-[11px] text-stone-700 leading-relaxed font-serif italic bg-white p-2.5 rounded-sm border border-stone-200">
                                    <span className="text-stone-400 font-mono text-[9px] font-bold uppercase tracking-wider block mb-1">Preparation instructions:</span>{" "}
                                    {interview.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RESUME PROFILE DEFAULTS */}
        {activeSection === "profile" && (
          <div className="bg-white border border-stone-200 rounded-sm p-6 md:p-8 max-w-3xl mx-auto space-y-6 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 font-serif pb-2 border-b border-stone-200">
                <BookOpen className="h-5 w-5 text-stone-900" />
                Resume Profile Defaults
              </h2>
              <p className="text-xs text-stone-500 font-serif italic mt-1">Configure your defaults below. These are pre-filled automatically when applying to any job vacancies.</p>
            </div>

            <form onSubmit={saveProfileDefaults} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Highest Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech Plastics / CIPET Diploma"
                    value={profileData.qualification}
                    onChange={(e) => setProfileData({ ...profileData, qualification: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Years of Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 Years"
                    value={profileData.experience}
                    onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Current Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Gwalior, MP"
                    value={profileData.currentLocation}
                    onChange={(e) => setProfileData({ ...profileData, currentLocation: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Preferred Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Gujarat / Noida"
                    value={profileData.preferredLocation}
                    onChange={(e) => setProfileData({ ...profileData, preferredLocation: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Current Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Cosmo Films"
                    value={profileData.currentCompany}
                    onChange={(e) => setProfileData({ ...profileData, currentCompany: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Current Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Production Executive"
                    value={profileData.currentDesignation}
                    onChange={(e) => setProfileData({ ...profileData, currentDesignation: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Current Salary (₹ / Month)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹30,000"
                    value={profileData.currentSalary}
                    onChange={(e) => setProfileData({ ...profileData, currentSalary: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Expected Salary (₹ / Month)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹40,000"
                    value={profileData.expectedSalary}
                    onChange={(e) => setProfileData({ ...profileData, expectedSalary: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1.5 font-bold">Notice Period</label>
                  <input
                    type="text"
                    placeholder="e.g. Immediate / 30 Days"
                    value={profileData.noticePeriod}
                    onChange={(e) => setProfileData({ ...profileData, noticePeriod: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900"
                  />
                </div>
              </div>

              {/* Profile Skills Tags */}
              <div className="space-y-3">
                <label className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1 font-bold">Default Skills Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type skill and press Enter"
                    value={newSkillTag}
                    onChange={(e) => setNewSkillTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkillTag(e as any); } }}
                    className="flex-1 bg-white border border-stone-300 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400"
                  />
                  <button
                    type="button"
                    onClick={addSkillTag}
                    className="bg-stone-100 hover:bg-stone-200 border border-stone-300 text-xs text-stone-850 font-mono px-4 rounded-sm transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {profileData.skills.map(skill => (
                    <span key={skill} className="text-xs bg-stone-100 text-stone-800 border border-stone-200 px-2.5 py-1 rounded-sm flex items-center gap-1 font-mono uppercase tracking-wider text-[10px]">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkillTag(skill)}
                        className="text-red-600 hover:text-red-900 font-bold ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-stone-200 pt-6 flex justify-end">
                <button
                  type="submit"
                  className="bg-stone-900 hover:bg-stone-850 text-white font-mono font-bold text-xs uppercase tracking-widest py-2.5 px-8 rounded-sm shadow-xs transition cursor-pointer"
                >
                  Save Profile Defaults
                </button>
              </div>
            </form>
          </div>
        )}

        {/* GAZETTE NEWS FEED VIEW */}
        {activeSection === "gazette" && (
          <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <AllianceGazette currentUser={currentUser} />
          </div>
        )}
      </main>
    </div>
  );
}
