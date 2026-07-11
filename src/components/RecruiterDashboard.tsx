import React, { useState, useEffect } from "react";
import { User, Job, Application, Interview } from "../types";
import { Plus, Edit, Trash2, Calendar, FileText, Download, Check, X, Search, Filter, AlertCircle, RefreshCw, Send, CheckCircle, Clock, Award, MapPin, Briefcase } from "lucide-react";
import AllianceGazette from "./AllianceGazette";

interface RecruiterDashboardProps {
  currentUser: User;
  siteConfig?: any;
}

export default function RecruiterDashboard({ currentUser, siteConfig }: RecruiterDashboardProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<"manage_jobs" | "view_applications" | "interviews" | "gazette">("manage_jobs");

  // Job Form Modal State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState({
    title: "",
    companyName: currentUser.companyDetails?.companyName || "",
    location: "",
    department: "Extrusion Operator",
    experience: "",
    education: "",
    salary: "",
    description: "",
    vacancies: 1,
    deadline: "",
    skillsRequired: [] as string[]
  });
  const [newSkill, setNewSkill] = useState("");

  // Applications Filter/Search States
  const [searchApplicant, setSearchApplicant] = useState("");
  const [filterJobId, setFilterJobId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Detail View States
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [statusText, setStatusText] = useState("");

  // Interview Scheduler States
  const [isScheduling, setIsScheduling] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    title: "",
    dateTime: "",
    mode: "Online",
    linkOrLocation: "",
    notes: ""
  });

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

  const fetchRecruiterData = async () => {
    setIsLoading(true);
    try {
      const [jobsRes, appsRes, intRes] = await Promise.all([
        fetch(`/api/jobs?recruiterId=${currentUser.id}`),
        fetch(`/api/applications?recruiterId=${currentUser.id}`),
        fetch(`/api/interviews?recruiterId=${currentUser.id}`)
      ]);

      if (jobsRes.ok && appsRes.ok && intRes.ok) {
        setJobs(await jobsRes.json());
        setApplications(await appsRes.json());
        setInterviews(await intRes.json());
      }
    } catch (err) {
      console.warn("Notice: recruiter data fetch momentarily unavailable", err);
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
    fetchRecruiterData();
  }, [currentUser]);

  useEffect(() => {
    if (isJobModalOpen || selectedApp !== null || isScheduling) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isJobModalOpen, selectedApp, isScheduling]);

  // Open Job Create Form
  const openCreateJobModal = () => {
    setEditingJob(null);
    setJobForm({
      title: "",
      companyName: currentUser.companyDetails?.companyName || "",
      location: "",
      department: "Extrusion Operator",
      experience: "2-5 Years",
      education: "ITI / CIPET Diploma",
      salary: "₹25,000 - ₹35,000 / Month",
      description: "",
      vacancies: 1,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 15 days from now
      skillsRequired: []
    });
    setIsJobModalOpen(true);
  };

  // Open Job Edit Form
  const openEditJobModal = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      companyName: job.companyName,
      location: job.location,
      department: job.department,
      experience: job.experience,
      education: job.education,
      salary: job.salary,
      description: job.description,
      vacancies: job.vacancies,
      deadline: job.deadline,
      skillsRequired: job.skillsRequired || []
    });
    setIsJobModalOpen(true);
  };

  // Save Job (Create or Edit)
  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingJob ? `/api/jobs/${editingJob.id}` : "/api/jobs";
    const method = editingJob ? "PUT" : "POST";

    const payload = {
      ...jobForm,
      recruiterId: currentUser.id
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsJobModalOpen(false);
        fetchRecruiterData();
        showNotice(editingJob ? "Job updated successfully!" : "Job vacancy posted successfully!");
      } else {
        const data = await res.json();
        showNotice(data.error || "Failed to save job");
      }
    } catch (err) {
      console.error("Error saving job", err);
    }
  };

  // Delete Job
  const handleDeleteJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (res.ok) {
        fetchRecruiterData();
        showNotice("Vacancy deleted successfully.");
      }
    } catch (err) {
      console.error("Error deleting job", err);
    }
  };

  // Close Job Manually
  const handleCloseJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/close`, { method: "POST" });
      if (res.ok) {
        fetchRecruiterData();
        showNotice("Job status moved to Closed.");
      }
    } catch (err) {
      console.error("Error closing job", err);
    }
  };

  // Add skill to job requirements
  const addSkillRequirement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !jobForm.skillsRequired.includes(newSkill.trim())) {
      setJobForm({
        ...jobForm,
        skillsRequired: [...jobForm.skillsRequired, newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const removeSkillRequirement = (skill: string) => {
    setJobForm({
      ...jobForm,
      skillsRequired: jobForm.skillsRequired.filter(s => s !== skill)
    });
  };

  // Select Application to Review
  const viewApplicationDetails = (app: Application) => {
    setSelectedApp(app);
    setStatusText(app.status);
    setFeedbackText(app.feedback || "");
    setIsScheduling(false);
  };

  // Update Application Status & Feedback
  const handleUpdateAppStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      const res = await fetch(`/api/applications/${selectedApp.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusText,
          feedback: feedbackText
        })
      });

      if (res.ok) {
        const updated: Application = await res.json();
        setSelectedApp(updated);
        fetchRecruiterData();
        showNotice("Applicant status updated! Real-time alerts simulated for Candidate.");
      } else {
        showNotice("Failed to update status.");
      }
    } catch (err) {
      console.error("Error updating application", err);
    }
  };

  // Trigger Interview Scheduling Form
  const handleScheduleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    const payload = {
      applicationId: selectedApp.id,
      applicantId: selectedApp.applicantId,
      recruiterId: currentUser.id,
      jobId: selectedApp.jobId,
      title: interviewForm.title,
      dateTime: interviewForm.dateTime,
      mode: interviewForm.mode,
      linkOrLocation: interviewForm.linkOrLocation,
      notes: interviewForm.notes
    };

    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsScheduling(false);
        setInterviewForm({
          title: "",
          dateTime: "",
          mode: "Online",
          linkOrLocation: "",
          notes: ""
        });
        fetchRecruiterData();
        showNotice("Interview successfully scheduled! Applicant notified via WhatsApp/Email simulation.");
      } else {
        showNotice("Failed to schedule interview.");
      }
    } catch (err) {
      console.error("Error scheduling interview", err);
    }
  };

  // Simulate downloading resume as file
  const triggerResumeDownload = (app: Application) => {
    const resumeText = `
FILMPACK CAREERS - RESUME DOCUMENTATION
=======================================
Applicant: ${app.formData.fullName}
Role Applied For: ${app.id} (Application ID)
Email: ${app.formData.email} | Mobile: ${app.formData.mobile}

PROFESSIONAL EXPERIENCE:
-----------------------
- Duration: ${app.formData.experience}
- Current Company: ${app.formData.currentCompany || 'N/A'}
- Designation: ${app.formData.currentDesignation || 'N/A'}
- Notice Period: ${app.formData.noticePeriod}

TECHNICAL ALIGNMENT SKILLS:
--------------------------
${(app.formData.skills || []).join(", ") || 'No skills declared'}

SALARY EXPECTATIONS:
-------------------
- Current: ${app.formData.currentSalary || 'N/A'}
- Expected: ${app.formData.expectedSalary}

QUALIFICATION:
-------------
- Degree/Diploma: ${app.formData.qualification}
- Preferred Location: ${app.formData.preferredLocation}
- Current Location: ${app.formData.currentLocation}

COVER NOTE REMARKS:
------------------
${app.remarks || 'None provided'}
    `;

    const blob = new Blob([resumeText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resume_${app.formData.fullName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportRecruiterJobsCSV = () => {
    const headers = ["Job ID", "Job Title", "Company Name", "Location", "Department", "Salary Range", "Vacancy Status", "Total Applications", "Hired Candidates", "Posted Date", "Hiring Status & Comments"];
    const rows = jobs.map(job => {
      const jobApps = applications.filter(a => a.jobId === job.id);
      const hiredApps = jobApps.filter(a => a.status === "hired");
      const comments = `${job.status.toUpperCase()} - ${jobApps.length} candidates applied, ${hiredApps.length} hired. Recruiter audit verified.`;
      return [
        job.id,
        `"${job.title.replace(/"/g, '""')}"`,
        `"${job.companyName.replace(/"/g, '""')}"`,
        `"${job.location.replace(/"/g, '""')}"`,
        job.department,
        `"${job.salaryRange.replace(/"/g, '""')}"`,
        job.status,
        jobApps.length,
        hiredApps.length,
        job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A",
        `"${comments}"`
      ].join(",");
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FilmPack_Recruiter_Job_Openings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter applications list
  const filteredApplications = applications.filter(app => {
    const job = jobs.find(j => j.id === app.jobId);
    const jobTitle = job ? job.title : "";

    const matchesSearch = app.formData.fullName.toLowerCase().includes(searchApplicant.toLowerCase()) ||
                          app.formData.qualification.toLowerCase().includes(searchApplicant.toLowerCase()) ||
                          (app.formData.skills || []).some(s => s.toLowerCase().includes(searchApplicant.toLowerCase()));

    const matchesJob = filterJobId ? app.jobId === filterJobId : true;
    const matchesStatus = filterStatus ? app.status === filterStatus : true;

    return matchesSearch && matchesJob && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#FCFAF6] text-stone-900 font-sans pb-12">
      {/* Sub Navbar */}
      <div className="bg-white border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 sm:space-x-8 h-14 items-center overflow-x-auto">
            <button
              onClick={() => { setActiveTab("manage_jobs"); setSelectedApp(null); }}
              className={`text-xs font-mono uppercase tracking-widest h-full border-b-2 px-1 transition cursor-pointer font-bold whitespace-nowrap ${
                activeTab === "manage_jobs" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-900"
              }`}
            >
              Manage Postings ({jobs.length})
            </button>
            <button
              onClick={() => { setActiveTab("view_applications"); }}
              className={`text-xs font-mono uppercase tracking-widest h-full border-b-2 px-1 transition cursor-pointer font-bold whitespace-nowrap ${
                activeTab === "view_applications" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-900"
              }`}
            >
              View Candidates ({applications.length})
            </button>
            <button
              onClick={() => { setActiveTab("interviews"); setSelectedApp(null); }}
              className={`text-xs font-mono uppercase tracking-widest h-full border-b-2 px-1 transition cursor-pointer font-bold whitespace-nowrap ${
                activeTab === "interviews" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-900"
              }`}
            >
              Interviews ({interviews.length})
            </button>
            <button
              onClick={() => { setActiveTab("gazette"); setSelectedApp(null); }}
              className={`text-xs font-mono uppercase tracking-widest h-full border-b-2 px-1 transition cursor-pointer font-bold whitespace-nowrap ${
                activeTab === "gazette" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-900"
              }`}
            >
              Alliance Gazette 📰
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {actionMessage && (
          <div className="mb-6 bg-stone-900 text-amber-400 p-4 rounded-md shadow-md border border-amber-500/30 flex items-center justify-between font-mono text-xs">
            <span className="flex items-center gap-2 font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              {actionMessage}
            </span>
            <button onClick={() => setActionMessage(null)} className="text-stone-400 hover:text-white font-bold">✕</button>
          </div>
        )}

        {/* MANAGE JOBS VIEW */}
        {activeTab === "manage_jobs" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-stone-900 font-serif">Film Industry Postings</h2>
                <p className="text-xs text-stone-500 font-serif italic mt-1">Create, edit, close, or delete technical vacancies in your plant locations.</p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={exportRecruiterJobsCSV}
                  className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-mono uppercase tracking-widest text-xs py-2.5 px-4 rounded-sm shadow-xs transition flex items-center gap-1.5 font-bold cursor-pointer"
                  title="Export complete list of job openings with hiring status and comments"
                >
                  <Download className="h-4 w-4 text-emerald-700" />
                  Export Jobs CSV
                </button>
                <button
                  onClick={openCreateJobModal}
                  className="bg-stone-900 hover:bg-stone-850 text-white font-mono uppercase tracking-widest text-xs py-2.5 px-6 rounded-sm shadow-xs transition flex items-center gap-1.5 font-bold cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Post New Job
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-stone-500">
                <RefreshCw className="h-8 w-8 text-stone-900 animate-spin mb-3" />
                <p className="text-xs font-mono uppercase tracking-widest">Loading your postings...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 border border-stone-200 rounded-sm bg-white shadow-xs">
                <Briefcase className="h-10 w-10 text-stone-400 mx-auto mb-2" />
                <p className="text-sm text-stone-600 font-serif italic">You haven't posted any jobs yet.</p>
                <button
                  onClick={openCreateJobModal}
                  className="mt-3 text-xs bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 px-4 py-2 rounded-sm font-mono uppercase tracking-widest transition cursor-pointer"
                >
                  Create Your First Vacancy
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {jobs.map(job => {
                  const jobApps = applications.filter(a => a.jobId === job.id);
                  return (
                    <div key={job.id} className="bg-white border border-stone-200 rounded-sm p-6 shadow-xs flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition">
                      
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-serif font-bold text-lg text-stone-900">{job.title}</h3>
                          <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-sm border uppercase tracking-wider ${
                            job.status === "open" 
                              ? "bg-stone-900 text-white border-stone-900" 
                              : "bg-stone-100 text-stone-500 border-stone-200"
                          }`}>
                            {job.status}
                          </span>
                          <span className="text-[10px] bg-stone-100 border border-stone-200 px-2.5 py-0.5 rounded-sm text-stone-700 font-mono uppercase tracking-wider">
                            {job.department}
                          </span>
                        </div>
 
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-stone-600 font-serif italic">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-stone-700" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="h-4 w-4 text-stone-700" />
                            <span>Vacancies: {job.vacancies}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Award className="h-4 w-4 text-stone-700" />
                            <span>Exp: {job.experience}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-stone-700" />
                            <span className="font-mono">Deadline: {job.deadline}</span>
                          </div>
                        </div>

                        {/* Skills and Applications Count */}
                        <div className="flex items-center justify-between pt-3 border-t border-stone-100 flex-wrap gap-2 text-xs">
                          <div className="flex flex-wrap gap-1">
                            {(job.skillsRequired || []).map(skill => (
                              <span key={skill} className="text-[9px] bg-stone-50 border border-stone-200 text-stone-600 px-2.5 py-0.5 rounded-sm font-mono uppercase">
                                {skill}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => { setFilterJobId(job.id); setActiveTab("view_applications"); }}
                            className="text-stone-900 hover:underline font-mono text-[11px] uppercase tracking-wider font-bold flex items-center gap-1 cursor-pointer"
                          >
                            Applications Received: <span className="bg-stone-900 text-white font-mono px-2 py-0.5 rounded-sm text-[10px] ml-1">{jobApps.length}</span>
                          </button>
                        </div>
                      </div>

                      {/* Recruiter Action Buttons */}
                      <div className="flex flex-row md:flex-col justify-center items-stretch gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-stone-200 min-w-[120px]">
                        <button
                          onClick={() => openEditJobModal(job)}
                          className="bg-stone-100 hover:bg-stone-200 text-stone-850 text-[10px] font-mono uppercase tracking-widest py-1.5 px-3 rounded-sm border border-stone-300 flex items-center justify-center gap-1 transition cursor-pointer"
                          title="Edit Vacancy Details"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        {job.status === "open" && (
                          <button
                            onClick={() => handleCloseJob(job.id)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono uppercase tracking-widest py-1.5 px-3 rounded-sm flex items-center justify-center gap-1 transition cursor-pointer"
                            title="Move Job to Closed status immediately"
                          >
                            <X className="h-3.5 w-3.5" />
                            Close Line
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-900 border border-red-300 text-[10px] font-mono uppercase tracking-widest py-1.5 px-3 rounded-sm flex items-center justify-center gap-1 transition cursor-pointer"
                          title="Delete Job"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW APPLICATIONS TAB */}
        {activeTab === "view_applications" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-stone-900 font-serif">Candidates Intake</h2>
                <p className="text-xs text-stone-500 font-serif italic mt-1">Review operator resumes, check AI skill alignment scores, and schedule technical panels.</p>
              </div>

              {/* Excel/CSV exporter */}
              <a
                href={`/api/export/excel?recruiterId=${currentUser.id}${filterJobId ? `&jobId=${filterJobId}` : ''}`}
                className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 px-4 py-2.5 rounded-sm flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-widest shadow-xs transition self-start"
                title="Export list of applications to Excel compatible CSV file"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </a>
            </div>

            {/* Search and Filters */}
            <div className="bg-white border border-stone-200 rounded-sm p-4 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search applicant name, qualification, skills..."
                  value={searchApplicant}
                  onChange={(e) => setSearchApplicant(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-sm pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 font-serif italic placeholder-stone-400"
                />
              </div>

              <div>
                <select
                  value={filterJobId}
                  onChange={(e) => setFilterJobId(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-800 font-serif"
                >
                  <option value="">All Job Openings</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-800 font-serif"
                >
                  <option value="">All Application Statuses</option>
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Hired">Hired</option>
                </select>
              </div>
            </div>

            {/* Split layout: Left list, Right active details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Candidate List */}
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-widest">
                  Applications List ({filteredApplications.length})
                </h3>

                {filteredApplications.length === 0 ? (
                  <div className="text-center py-12 border border-stone-200 rounded-sm bg-white">
                    <AlertCircle className="h-8 w-8 text-stone-400 mx-auto mb-2" />
                    <p className="text-xs text-stone-600 font-serif italic">No applications match the filters.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {filteredApplications.map(app => {
                      const job = jobs.find(j => j.id === app.jobId);
                      const isSelected = selectedApp?.id === app.id;

                      const statusBadge: Record<string, string> = {
                        "Applied": "bg-stone-100 text-stone-800 border-stone-200",
                        "Under Review": "bg-amber-50 text-amber-900 border-amber-200",
                        "Shortlisted": "bg-stone-900 text-white border-stone-900",
                        "Rejected": "bg-red-50 text-red-800 border-red-200",
                        "Hired": "bg-stone-200 text-stone-900 border-stone-350"
                      };

                      return (
                        <div
                          key={app.id}
                          onClick={() => viewApplicationDetails(app)}
                          className={`p-4 border rounded-sm cursor-pointer shadow-xs transition-all duration-150 ${
                            isSelected 
                              ? "bg-stone-100 border-stone-950" 
                              : "bg-white border-stone-200 hover:border-stone-400"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div>
                              <h4 className="font-serif font-bold text-sm text-stone-900">{app.formData.fullName}</h4>
                              <p className="text-[11px] text-stone-500 font-serif italic mt-0.5">{job ? job.title : "Position Deleted"}</p>
                            </div>
                            <span className={`text-[8px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm border ${statusBadge[app.status] || 'bg-stone-100'}`}>
                              {app.status}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[11px] text-stone-600 mt-3 pt-2.5 border-t border-stone-100 font-serif">
                            <div>
                              <span className="text-stone-400 font-mono font-bold uppercase text-[9px]">EXP:</span> {app.formData.experience}
                            </div>
                            <div className="flex items-center gap-1 text-stone-900 font-mono font-bold bg-[#FCFAF6] border border-stone-200 px-1.5 py-0.2 rounded-sm text-[10px]">
                              AI Match: {app.matchScore || 50}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Detail Panel */}
              <div className="lg:col-span-7">
                {selectedApp ? (
                  <div className="bg-white border border-stone-200 rounded-sm p-6 shadow-sm space-y-6">
                    
                    {/* Header */}
                    <div className="border-b border-stone-200 pb-4 flex justify-between items-start flex-wrap gap-3">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-stone-900">{selectedApp.formData.fullName}</h3>
                        <p className="text-xs text-stone-500 mt-1 font-serif italic">Applied for <span className="text-stone-900 font-semibold">{jobs.find(j => j.id === selectedApp.jobId)?.title}</span></p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => triggerResumeDownload(selectedApp)}
                          className="bg-stone-900 hover:bg-stone-850 text-white font-mono uppercase tracking-widest text-xs py-2 px-4 rounded-sm transition flex items-center gap-1.5 cursor-pointer"
                          title="Download complete formatted resume text file"
                        >
                          <FileText className="h-4 w-4" />
                          Download Resume
                        </button>
                      </div>
                    </div>

                    {/* Gemini Matching Metrics Spot */}
                    <div className="bg-[#FCFAF6] border border-stone-200 p-4 rounded-sm space-y-2.5">
                      <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase tracking-widest text-stone-500">
                        <span>Gemini Technical Match Analysis</span>
                        <span className="bg-stone-200 border border-stone-300 text-stone-900 px-2 py-0.5 rounded-sm text-xs font-bold font-mono">
                          {selectedApp.matchScore || 50}% Fit Match
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 h-1 rounded-full overflow-hidden">
                        <div className="bg-stone-900 h-full rounded-full" style={{ width: `${selectedApp.matchScore || 50}%` }}></div>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed pt-1 font-serif italic">
                        {selectedApp.matchFeedback || "Matches based on mechanical ITI or CIPET diploma metrics."}
                      </p>
                    </div>

                    {/* Detailed Applicant Data Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="bg-stone-50 p-3.5 rounded-sm border border-stone-200">
                        <span className="text-stone-500 font-mono font-bold uppercase text-[9px] tracking-wider block mb-1">Contact Profile</span>
                        <div className="space-y-1 text-stone-800 font-serif">
                          <p><span className="text-stone-400 font-mono text-[10px]">Email:</span> {selectedApp.formData.email}</p>
                          <p><span className="text-stone-400 font-mono text-[10px]">Mobile:</span> {selectedApp.formData.mobile}</p>
                          <p><span className="text-stone-400 font-mono text-[10px]">Residence:</span> {selectedApp.formData.currentLocation}</p>
                        </div>
                      </div>

                      <div className="bg-stone-50 p-3.5 rounded-sm border border-stone-200">
                        <span className="text-stone-500 font-mono font-bold uppercase text-[9px] tracking-wider block mb-1">Education & Background</span>
                        <div className="space-y-1 text-stone-800 font-serif">
                          <p><span className="text-stone-400 font-mono text-[10px]">Qualify:</span> {selectedApp.formData.qualification}</p>
                          <p><span className="text-stone-400 font-mono text-[10px]">Experience:</span> {selectedApp.formData.experience}</p>
                          <p><span className="text-stone-400 font-mono text-[10px]">Preference:</span> {selectedApp.formData.preferredLocation}</p>
                        </div>
                      </div>

                      <div className="bg-stone-50 p-3.5 rounded-sm border border-stone-200">
                        <span className="text-stone-500 font-mono font-bold uppercase text-[9px] tracking-wider block mb-1">Current Job Status</span>
                        <div className="space-y-1 text-stone-800 font-serif">
                          <p><span className="text-stone-400 font-mono text-[10px]">Company:</span> {selectedApp.formData.currentCompany || "N/A"}</p>
                          <p><span className="text-stone-400 font-mono text-[10px]">Designation:</span> {selectedApp.formData.currentDesignation || "N/A"}</p>
                          <p><span className="text-stone-400 font-mono text-[10px]">Notice:</span> {selectedApp.formData.noticePeriod}</p>
                        </div>
                      </div>

                      <div className="bg-stone-50 p-3.5 rounded-sm border border-stone-200">
                        <span className="text-stone-500 font-mono font-bold uppercase text-[9px] tracking-wider block mb-1">Compensation Specs</span>
                        <div className="space-y-1 text-stone-800 font-serif">
                          <p><span className="text-stone-400 font-mono text-[10px]">Current:</span> {selectedApp.formData.currentSalary || "N/A"}</p>
                          <p><span className="text-stone-400 font-mono text-[10px]">Expected:</span> {selectedApp.formData.expectedSalary}</p>
                        </div>
                      </div>
                    </div>

                    {/* Declared Technical Skills Tags */}
                    <div>
                      <span className="text-[9px] text-stone-500 font-mono font-bold uppercase tracking-wider block mb-1.5">Candidate Skills Tags:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedApp.formData.skills || []).map(skill => (
                          <span key={skill} className="text-[10px] bg-stone-50 border border-stone-200 text-stone-800 px-2.5 py-1 rounded-sm font-mono uppercase tracking-wider">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Cover note remarks */}
                    {selectedApp.remarks && (
                      <div className="bg-[#FCFAF6] p-3 rounded-sm border border-stone-200">
                        <span className="text-[9px] text-stone-500 font-mono font-bold uppercase tracking-wider block mb-1">Cover Note Remarks:</span>
                        <p className="text-xs text-stone-700 leading-relaxed font-serif italic">"{selectedApp.remarks}"</p>
                      </div>
                    )}

                    {/* Interview Scheduling trigger */}
                    <div className="border-t border-stone-200 pt-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-widest">
                          Review Controls & Status Management
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsScheduling(!isScheduling)}
                          className="text-[10px] text-stone-800 hover:text-stone-950 flex items-center gap-1 font-mono font-bold bg-stone-100 hover:bg-stone-200 border border-stone-300 px-2.5 py-1.5 rounded-sm transition cursor-pointer uppercase tracking-wider"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          {isScheduling ? "Cancel Scheduler" : "Schedule Interview"}
                        </button>
                      </div>

                      {isScheduling ? (
                        <form onSubmit={handleScheduleInterviewSubmit} className="bg-[#FCFAF6] border border-stone-350 rounded-sm p-4 space-y-4">
                          <h5 className="text-[10px] font-bold text-stone-900 font-mono uppercase border-b border-stone-200 pb-1.5 tracking-wider">Configure Interview Slot</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Round/Panel Title *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Technical Round 1 - Extrusion"
                                value={interviewForm.title}
                                onChange={(e) => setInterviewForm({ ...interviewForm, title: e.target.value })}
                                className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs text-stone-950 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Date & Time *</label>
                              <input
                                type="datetime-local"
                                required
                                value={interviewForm.dateTime}
                                onChange={(e) => setInterviewForm({ ...interviewForm, dateTime: e.target.value })}
                                className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs text-stone-800 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Interview Mode *</label>
                              <select
                                value={interviewForm.mode}
                                onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                                className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs text-stone-800 focus:outline-none"
                              >
                                <option value="Online">Online Video (Google Meet)</option>
                                <option value="In-Person">In-Person Plant Visit</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Video Link or Plant Address *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. meet.google.com/abc-defg-hij"
                                value={interviewForm.linkOrLocation}
                                onChange={(e) => setInterviewForm({ ...interviewForm, linkOrLocation: e.target.value })}
                                className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs text-stone-950 focus:outline-none"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Preparatory Instructions / Notes</label>
                              <textarea
                                rows={2}
                                placeholder="e.g. Be prepared to discuss co-extrusion screw configurations or CI Flexo ink recipes..."
                                value={interviewForm.notes}
                                onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                                className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs text-stone-950 focus:outline-none"
                              ></textarea>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 text-xs pt-2">
                            <button
                              type="button"
                              onClick={() => setIsScheduling(false)}
                              className="bg-white hover:bg-stone-50 text-stone-800 py-1.5 px-4 rounded-sm border border-stone-300 font-mono uppercase text-[10px] cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-stone-900 hover:bg-stone-850 text-white font-bold py-1.5 px-6 rounded-sm font-mono uppercase text-[10px] cursor-pointer"
                            >
                              Confirm Schedule
                            </button>
                          </div>
                        </form>
                      ) : (
                        <form onSubmit={handleUpdateAppStatus} className="bg-stone-50 border border-stone-200 rounded-sm p-4 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <div className="sm:col-span-1">
                              <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Change Application Status</label>
                              <select
                                value={statusText}
                                onChange={(e) => setStatusText(e.target.value)}
                                className="w-full bg-white border border-stone-300 rounded-sm p-2 text-xs text-stone-800 focus:outline-none font-serif"
                              >
                                <option value="Applied">Applied</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Shortlisted">Shortlisted</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Hired">Hired</option>
                              </select>
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Recruiter Feedback / Notes (Triggers Alerts)</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="e.g. Excelled in BOPP extruder parameters. Highly recommended."
                                  value={feedbackText}
                                  onChange={(e) => setFeedbackText(e.target.value)}
                                  className="flex-1 bg-white border border-stone-300 rounded-sm p-2 text-xs text-stone-950 focus:outline-none placeholder-stone-400"
                                />
                                <button
                                  type="submit"
                                  className="bg-stone-900 hover:bg-stone-850 text-white font-mono uppercase text-[10px] tracking-wider font-bold px-4 py-2 rounded-sm transition cursor-pointer"
                                >
                                  Update Review
                                </button>
                              </div>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="bg-white border border-stone-200 border-dashed rounded-sm p-12 text-center text-stone-500">
                    <FileText className="h-10 w-10 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm font-serif italic">Select a candidate application to view detailed resume profiles, review alignment, and change statuses.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* INTERVIEW CALENDAR TAB */}
        {activeTab === "interviews" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 font-serif">Scheduled Panel Interviews</h2>
              <p className="text-xs text-stone-500 font-serif italic mt-1">Manage physical plant visits and virtual video screens for operators and chemists.</p>
            </div>

            {interviews.length === 0 ? (
              <div className="text-center py-20 border border-stone-200 rounded-sm bg-white">
                <Calendar className="h-10 w-10 text-stone-300 mx-auto mb-2" />
                <p className="text-sm text-stone-600 font-serif italic">No interviews scheduled yet.</p>
                <p className="text-xs text-stone-500 mt-1 font-mono">Go to "View Applications", select a candidate, and click "Schedule Interview" to book slots.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interviews.map(item => (
                  <div key={item.id} className="bg-white border border-stone-200 rounded-sm p-5 shadow-xs space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-serif font-bold text-base text-stone-900">{item.title}</h3>
                        <p className="text-[10px] text-stone-500 font-mono mt-0.5">ID: {item.id}</p>
                      </div>
                      <span className="text-[10px] bg-stone-900 text-white font-mono font-bold px-2.5 py-0.5 rounded-sm border border-stone-900 uppercase tracking-wider">
                        {item.mode}
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 text-stone-600 font-serif">
                      <p>
                        <span className="text-stone-400 font-mono font-bold uppercase text-[9px] tracking-wider block mb-0.5">Date & Time:</span>{" "}
                        <span className="text-stone-900 font-mono font-semibold">{new Date(item.dateTime).toLocaleString()}</span>
                      </p>
                      <p>
                        <span className="text-stone-400 font-mono font-bold uppercase text-[9px] tracking-wider block mb-0.5">Link / Venue:</span>{" "}
                        <a href={item.linkOrLocation} target="_blank" rel="noopener noreferrer" className="text-stone-900 hover:underline underline-offset-2 font-mono font-semibold">
                          {item.linkOrLocation}
                        </a>
                      </p>
                      {item.notes && (
                        <div className="bg-stone-50 p-2.5 rounded-sm text-[11px] leading-relaxed text-stone-700 mt-2 border border-stone-200">
                          <span className="text-stone-400 font-mono text-[9px] font-bold block mb-1 uppercase tracking-wider">Recruiter Prep Notes:</span>
                          {item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* GAZETTE NEWS FEED VIEW */}
        {activeTab === "gazette" && (
          <div className="bg-white border border-stone-200 rounded-sm p-6 shadow-sm">
            <AllianceGazette currentUser={currentUser} />
          </div>
        )}

      </main>

      {/* CREATE/EDIT JOB MODAL OVERLAY */}
      {isJobModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-stone-300 rounded-sm max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-stone-200 pb-3 flex justify-between items-center">
              <h3 className="text-base font-serif font-bold text-stone-900">
                {editingJob ? "Modify Job Vacancy" : "Post Packaging Film Vacancy"}
              </h3>
              <button
                onClick={() => setIsJobModalOpen(false)}
                className="text-stone-500 hover:text-stone-900 font-mono uppercase tracking-widest text-xs p-1 hover:bg-stone-100 rounded-sm cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleJobSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Slitting Machine Assistant Operator"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2 text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.companyName}
                    onChange={(e) => setJobForm({ ...jobForm, companyName: e.target.value })}
                    className="w-full bg-stone-100 border border-stone-200 rounded-sm p-2 text-stone-500 focus:outline-none cursor-not-allowed"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Job Category / Department *</label>
                  <select
                    value={jobForm.department}
                    onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2 text-stone-800 focus:outline-none font-serif"
                  >
                    {filmCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Plant Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gwalior, MP"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2 text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Experience Required *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2-5 Years"
                    value={jobForm.experience}
                    onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2 text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Education Required *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ITI Mechanical / CIPET"
                    value={jobForm.education}
                    onChange={(e) => setJobForm({ ...jobForm, education: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2 text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Salary Budget *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹28,000 - ₹35,000 / Month"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2 text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Number of Vacancies *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={jobForm.vacancies}
                    onChange={(e) => setJobForm({ ...jobForm, vacancies: Number(e.target.value) })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2 text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Application Deadline *</label>
                  <input
                    type="date"
                    required
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-sm p-2 text-stone-800 focus:outline-none font-serif"
                  />
                </div>
              </div>

              {/* Job description */}
              <div>
                <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Job Description & Responsibilities *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide details on plant environment, specific extruder models (extruder cylinder diameter, die details) or laminators (solventless dry laminators), shift rosters, and safety policies..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full bg-white border border-stone-300 rounded-sm p-2 text-stone-900 focus:outline-none placeholder-stone-400"
                ></textarea>
              </div>

              {/* Skills required tags */}
              <div className="space-y-2">
                <label className="block text-[10px] text-stone-500 font-mono uppercase mb-1 font-bold">Skills Tags Required for Match Rating</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type skill tag (e.g. Flexo Ink viscosity) and click Add"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkillRequirement(e as any); } }}
                    className="flex-1 bg-white border border-stone-300 rounded-sm p-2 text-stone-900 focus:outline-none placeholder-stone-400"
                  />
                  <button
                    type="button"
                    onClick={addSkillRequirement}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono uppercase tracking-widest text-[10px] px-4 rounded-sm border border-stone-300 transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {jobForm.skillsRequired.map(skill => (
                    <span key={skill} className="bg-stone-100 border border-stone-200 text-stone-850 px-2.5 py-1 rounded-sm flex items-center gap-1.5 font-mono uppercase tracking-wider text-[10px]">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkillRequirement(skill)}
                        className="text-red-600 font-bold hover:text-red-900 ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-stone-200 pt-5 flex justify-end gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 py-2 px-6 rounded-sm transition font-mono uppercase tracking-widest cursor-pointer text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-stone-900 hover:bg-stone-850 text-white py-2 px-8 rounded-sm transition font-mono uppercase tracking-widest font-bold cursor-pointer text-[11px]"
                >
                  {editingJob ? "Update Post" : "Post Vacancy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
