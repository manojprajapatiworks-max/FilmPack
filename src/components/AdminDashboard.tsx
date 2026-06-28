import React, { useState, useEffect } from "react";
import { User, Job, Application, AdminStats } from "../types";
import { Shield, Users, Briefcase, CheckCircle, Clock, AlertTriangle, Check, X, Search, Edit, Trash2, Key, RefreshCw, Plus, Download, Eye, FileText, Ban } from "lucide-react";

interface AdminDashboardProps {
  currentUser: User;
}

export default function AdminDashboard({ currentUser }: AdminDashboardProps) {
  // Master lists
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalApplicants: 0,
    totalRecruiters: 0,
    openJobs: 0,
    closedJobs: 0,
    applicationsReceived: 0,
    hiredCandidates: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Active view
  const [activeSection, setActiveSection] = useState<"stats" | "pending_approvals" | "user_management" | "job_management">("stats");

  // Selection state for multi-approve recruiters
  const [selectedRecruiterIds, setSelectedRecruiterIds] = useState<string[]>([]);

  // Modals & Action States
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "applicant" as "applicant" | "recruiter" | "admin",
    status: "approved" as any
  });

  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [isCreateRecruiterOpen, setIsCreateRecruiterOpen] = useState(false);
  const [newRecruiterForm, setNewRecruiterForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    companyName: ""
  });

  // Search/Filters states
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [searchJobQuery, setSearchJobQuery] = useState("");
  const [filterUserType, setFilterUserType] = useState("");

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, jobsRes, appsRes, statsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/jobs"),
        fetch("/api/applications"),
        fetch("/api/admin/stats")
      ]);

      if (usersRes.ok && jobsRes.ok && appsRes.ok && statsRes.ok) {
        setUsers(await usersRes.json());
        setJobs(await jobsRes.json());
        setApplications(await appsRes.json());
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.error("Failed to load admin logs", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [currentUser]);

  // Single User status change (Approve/Reject/Disable)
  const handleUserStatusChange = async (userId: string, status: 'approved' | 'rejected' | 'disabled') => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        fetchAdminData();
        alert(`User status changed successfully to ${status}.`);
      }
    } catch (err) {
      console.error("Error setting user status", err);
    }
  };

  // Multi User Recruiter Approvals
  const toggleSelectRecruiter = (id: string) => {
    if (selectedRecruiterIds.includes(id)) {
      setSelectedRecruiterIds(selectedRecruiterIds.filter(item => item !== id));
    } else {
      setSelectedRecruiterIds([...selectedRecruiterIds, id]);
    }
  };

  const handleApproveSelectedRecruiters = async () => {
    if (selectedRecruiterIds.length === 0) return;
    if (!confirm(`Are you sure you want to approve ${selectedRecruiterIds.length} pending recruiter account(s)?`)) return;

    try {
      const res = await fetch("/api/admin/users/approve-multiple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedRecruiterIds })
      });

      if (res.ok) {
        setSelectedRecruiterIds([]);
        fetchAdminData();
        alert("Batch approved recruiters successfully! Notification emails dispatched.");
      }
    } catch (err) {
      console.error("Batch approval failed", err);
    }
  };

  // Create Recruiter Account Form
  const handleCreateRecruiterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRecruiterForm.name,
          email: newRecruiterForm.email,
          mobile: newRecruiterForm.mobile,
          password: newRecruiterForm.password,
          role: "recruiter",
          companyName: newRecruiterForm.companyName,
          contactPerson: newRecruiterForm.name
        })
      });

      if (res.ok) {
        // By default register creates recruiter as pending, let's approve them instantly on backend if created by admin
        const registered = await res.json();
        await fetch(`/api/admin/users/${registered.id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved" })
        });

        setIsCreateRecruiterOpen(false);
        setNewRecruiterForm({ name: "", email: "", mobile: "", password: "", companyName: "" });
        fetchAdminData();
        alert("Recruiter account created and approved instantly.");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create recruiter account");
      }
    } catch (err) {
      console.error("Failed to manual register recruiter", err);
    }
  };

  // Edit User Details Dialog
  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status
    });
    setIsEditUserModalOpen(true);
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editUserForm)
      });

      if (res.ok) {
        setIsEditUserModalOpen(false);
        fetchAdminData();
        alert("User details updated successfully.");
      } else {
        alert("Failed to update user.");
      }
    } catch (err) {
      console.error("Error editing user", err);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user completely? This will wipe their profile.")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        fetchAdminData();
        alert("User deleted from record logs.");
      }
    } catch (err) {
      console.error("Error deleting user", err);
    }
  };

  // Reset Password Dialog
  const openResetPasswordModal = (userId: string) => {
    setResetUserId(userId);
    setNewPassword("reset" + Math.floor(1000 + Math.random() * 9000)); // generate default suggestion
    setIsResetPasswordOpen(true);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserId || !newPassword) return;

    try {
      const res = await fetch(`/api/admin/users/${resetUserId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword })
      });

      if (res.ok) {
        setIsResetPasswordOpen(false);
        setResetUserId(null);
        alert(`User password updated successfully to: ${newPassword}`);
      } else {
        alert("Password reset failed.");
      }
    } catch (err) {
      console.error("Error updating password", err);
    }
  };

  // Close Job vacancy as Admin
  const handleAdminCloseJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/close`, { method: "POST" });
      if (res.ok) {
        fetchAdminData();
        alert("Job closed successfully.");
      }
    } catch (err) {
      console.error("Error closing job", err);
    }
  };

  // Delete Job as Admin
  const handleAdminDeleteJob = async (jobId: string) => {
    if (!confirm("Delete this vacancy posting completely?")) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (res.ok) {
        fetchAdminData();
        alert("Job deleted.");
      }
    } catch (err) {
      console.error("Error deleting job", err);
    }
  };

  // Filter lists
  const pendingRecruiters = users.filter(u => u.role === "recruiter" && u.status === "pending_approval");

  const filteredUsers = users.filter(u => {
    // Exclude Admin themselves from moderation editing to prevent accidental self lockouts
    if (u.id === currentUser.id) return false;

    const matchesSearch = u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
                          u.mobile.includes(searchUserQuery);

    const matchesType = filterUserType ? u.role === filterUserType : true;

    return matchesSearch && matchesType;
  });

  const filteredJobs = jobs.filter(j => {
    return j.title.toLowerCase().includes(searchJobQuery.toLowerCase()) ||
           j.companyName.toLowerCase().includes(searchJobQuery.toLowerCase()) ||
           j.location.toLowerCase().includes(searchJobQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#FCFAF6] text-stone-900 font-sans pb-12">
      {/* Admin Tab Header */}
      <div className="bg-white border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-14 items-center">
            <button
              onClick={() => setActiveSection("stats")}
              className={`text-xs font-mono uppercase tracking-widest h-full border-b-2 px-1 transition cursor-pointer font-bold ${
                activeSection === "stats" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-900"
              }`}
            >
              Overview Insights
            </button>
            <button
              onClick={() => setActiveSection("pending_approvals")}
              className={`text-xs font-mono uppercase tracking-widest h-full border-b-2 px-1 transition cursor-pointer font-bold relative ${
                activeSection === "pending_approvals" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-900"
              }`}
            >
              Approvals Queue
              {pendingRecruiters.length > 0 && (
                <span className="ml-1.5 bg-stone-900 text-white font-mono rounded-sm h-4 w-4 text-[9px] inline-flex items-center justify-center font-bold">
                  {pendingRecruiters.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSection("user_management")}
              className={`text-xs font-mono uppercase tracking-widest h-full border-b-2 px-1 transition cursor-pointer font-bold ${
                activeSection === "user_management" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-900"
              }`}
            >
              User Directory
            </button>
            <button
              onClick={() => setActiveSection("job_management")}
              className={`text-xs font-mono uppercase tracking-widest h-full border-b-2 px-1 transition cursor-pointer font-bold ${
                activeSection === "job_management" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-900"
              }`}
            >
              Master Job Audits
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* OVERVIEW STATS TAB */}
        {activeSection === "stats" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h2 className="text-3xl font-bold text-stone-900 tracking-tight font-serif">Alliance Administration Dashboard</h2>
                <p className="text-xs text-stone-500 font-serif italic mt-1">Real-time statistics of applicants, plant recruiters, and open production slots.</p>
              </div>

              {/* Candidates database exporter */}
              <a
                href="/api/export/candidates"
                className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 px-4 py-2.5 rounded-sm flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-widest shadow-xs transition self-start"
                title="Download consolidated database of resumes as CSV"
              >
                <Download className="h-4 w-4" />
                Download Database CSV
              </a>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white border border-stone-200 p-4 rounded-sm shadow-xs space-y-1">
                <span className="text-[10px] text-stone-500 font-mono font-bold uppercase block tracking-wider">Total Applicants</span>
                <p className="text-2xl font-black text-stone-900 font-mono">{stats.totalApplicants}</p>
              </div>
              <div className="bg-white border border-stone-200 p-4 rounded-sm shadow-xs space-y-1">
                <span className="text-[10px] text-stone-500 font-mono font-bold uppercase block tracking-wider">Total Recruiters</span>
                <p className="text-2xl font-black text-stone-900 font-mono">{stats.totalRecruiters}</p>
              </div>
              <div className="bg-white border border-stone-200 p-4 rounded-sm shadow-xs space-y-1">
                <span className="text-[10px] text-stone-500 font-mono font-bold uppercase block tracking-wider">Open Vacancies</span>
                <p className="text-2xl font-black text-stone-900 font-mono">{stats.openJobs}</p>
              </div>
              <div className="bg-white border border-stone-200 p-4 rounded-sm shadow-xs space-y-1">
                <span className="text-[10px] text-stone-500 font-mono font-bold uppercase block tracking-wider">Closed Postings</span>
                <p className="text-2xl font-black text-stone-500 font-mono">{stats.closedJobs}</p>
              </div>
              <div className="bg-white border border-stone-200 p-4 rounded-sm shadow-xs space-y-1">
                <span className="text-[10px] text-stone-500 font-mono font-bold uppercase block tracking-wider">Apps Received</span>
                <p className="text-2xl font-black text-stone-900 font-mono">{stats.applicationsReceived}</p>
              </div>
              <div className="bg-white border border-stone-200 p-4 rounded-sm shadow-xs space-y-1">
                <span className="text-[10px] text-stone-500 font-mono font-bold uppercase block tracking-wider">Hired Operators</span>
                <p className="text-2xl font-black text-stone-900 font-mono">{stats.hiredCandidates}</p>
              </div>
            </div>

            {/* Visual Analytics Block & Recent actions summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Quick Actions Portal Admin */}
              <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-mono font-bold text-stone-500 uppercase tracking-widest">
                  Administrative Utilities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <button
                    onClick={() => setIsCreateRecruiterOpen(true)}
                    className="p-4 bg-stone-50 hover:bg-stone-100 rounded-sm border border-stone-200 hover:border-stone-400 text-left transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <h4 className="font-bold text-stone-900 font-serif">Provision Recruiter</h4>
                      <p className="text-[11px] text-stone-500 font-serif italic mt-0.5">Manually create recruiter profiles</p>
                    </div>
                    <Plus className="h-5 w-5 text-stone-700" />
                  </button>

                  <button
                    onClick={() => setActiveSection("pending_approvals")}
                    className="p-4 bg-stone-50 hover:bg-stone-100 rounded-sm border border-stone-200 hover:border-stone-400 text-left transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <h4 className="font-bold text-stone-900 font-serif">Moderation Desk</h4>
                      <p className="text-[11px] text-stone-500 font-serif italic mt-0.5">Moderate recruiter applications</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-stone-700" />
                  </button>
                </div>
              </div>

              {/* Plant Activity summary */}
              <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-mono font-bold text-stone-500 uppercase tracking-widest">
                  Recent Applications Logs
                </h3>
                {applications.length === 0 ? (
                  <p className="text-xs text-stone-500 font-serif italic">No applications filed yet.</p>
                ) : (
                  <div className="space-y-3 font-serif">
                    {applications.slice(-3).map(app => (
                      <div key={app.id} className="text-xs flex justify-between items-center pb-2 border-b border-stone-100 last:border-0 last:pb-0 text-stone-800">
                        <div>
                          <span className="font-bold text-stone-950 font-serif">{app.formData.fullName}</span>{" "}
                          <span className="text-stone-500 italic">applied to</span>{" "}
                          <span className="text-stone-900 font-bold">
                            {jobs.find(j => j.id === app.jobId)?.title || "Vacancy"}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {new Date(app.appliedDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* APPROVALS QUEUE */}
        {activeSection === "pending_approvals" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-stone-900 font-serif">Pending Recruiters</h2>
                <p className="text-xs text-stone-500 font-serif italic mt-1">Review film packaging company recruiters before authorizing platform credentials.</p>
              </div>

              {selectedRecruiterIds.length > 0 && (
                <button
                  onClick={handleApproveSelectedRecruiters}
                  className="bg-stone-900 hover:bg-stone-850 text-white font-mono uppercase tracking-widest text-xs py-2 px-4 rounded-sm transition cursor-pointer font-bold"
                >
                  <Check className="h-4 w-4" />
                  Approve Selected ({selectedRecruiterIds.length})
                </button>
              )}
            </div>

            {pendingRecruiters.length === 0 ? (
              <div className="text-center py-24 border border-stone-200 bg-white rounded-sm shadow-xs">
                <CheckCircle className="h-10 w-10 text-stone-400 mx-auto mb-2" />
                <p className="text-sm text-stone-600 font-serif italic">All pending recruiter requests have been cleared.</p>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-sm overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 text-stone-500 font-mono uppercase text-[9px] tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="p-4 w-12 text-center">Select</th>
                      <th className="p-4">Contact Representative</th>
                      <th className="p-4">Company Details</th>
                      <th className="p-4">Contact Phone</th>
                      <th className="p-4">Email</th>
                      <th className="p-4 text-center">Moderate Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-serif text-stone-800">
                    {pendingRecruiters.map(rec => (
                      <tr key={rec.id} className="hover:bg-stone-50">
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedRecruiterIds.includes(rec.id)}
                            onChange={() => toggleSelectRecruiter(rec.id)}
                            className="h-3.5 w-3.5 rounded-sm border-stone-300 text-stone-900 focus:ring-0"
                          />
                        </td>
                        <td className="p-4 font-bold text-stone-900 font-serif">{rec.name}</td>
                        <td className="p-4">
                          <p className="font-bold text-stone-950">{rec.companyDetails?.companyName || "N/A"}</p>
                          <p className="text-[10px] text-stone-500 font-serif italic mt-0.5">Submitted: {new Date(rec.createdDate).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4 font-mono text-[11px]">{rec.mobile}</td>
                        <td className="p-4 font-mono text-[11px]">{rec.email}</td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => handleUserStatusChange(rec.id, "approved")}
                              className="bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 p-1.5 rounded-sm transition cursor-pointer"
                              title="Approve Recruiter"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleUserStatusChange(rec.id, "rejected")}
                              className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-900 p-1.5 rounded-sm transition cursor-pointer"
                              title="Reject Recruiter"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* USER MANAGEMENT TAB */}
        {activeSection === "user_management" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-stone-900 font-serif">Platform Users</h2>
                <p className="text-xs text-stone-500 font-serif italic mt-1">Audit credentials, update contact records, disable accounts, and reset passwords.</p>
              </div>

              <button
                onClick={() => setIsCreateRecruiterOpen(true)}
                className="bg-stone-900 hover:bg-stone-850 text-white font-mono uppercase tracking-widest text-xs py-2.5 px-6 rounded-sm shadow-xs transition flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Register Recruiter
              </button>
            </div>

            {/* Filter tools */}
            <div className="bg-white border border-stone-200 rounded-sm p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or mobile..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-sm pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 font-serif placeholder-stone-400 italic"
                />
              </div>

              <div>
                <select
                  value={filterUserType}
                  onChange={(e) => setFilterUserType(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-sm px-3 py-2 text-xs focus:outline-none text-stone-800 font-serif"
                >
                  <option value="">All Account Types</option>
                  <option value="applicant">Applicant Accounts</option>
                  <option value="recruiter">Recruiter Accounts</option>
                </select>
              </div>
            </div>

            {/* Database Table */}
            <div className="bg-white border border-stone-200 rounded-sm overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-500 font-mono uppercase text-[9px] tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Account Type</th>
                    <th className="p-4">Contact Phone</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4">Last Activity</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-center">Audits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-serif text-stone-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-stone-500 font-serif italic">No users match the queries.</td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-stone-50">
                        <td className="p-4">
                          <p className="font-bold text-stone-900 font-serif">{u.name}</p>
                          <p className="text-[10px] text-stone-500 font-mono mt-0.5">{u.email}</p>
                          {u.companyDetails && (
                            <p className="text-[10px] text-stone-900 font-bold font-serif mt-1">{u.companyDetails.companyName}</p>
                          )}
                        </td>
                        <td className="p-4 uppercase font-mono font-bold text-[9px] tracking-wider">
                          {u.role === "recruiter" ? (
                            <span className="text-stone-600">Recruiter</span>
                          ) : (
                            <span className="text-stone-900">Applicant</span>
                          )}
                        </td>
                        <td className="p-4 font-mono text-[11px]">{u.mobile}</td>
                        <td className="p-4 text-stone-600">{new Date(u.createdDate).toLocaleDateString()}</td>
                        <td className="p-4 font-mono text-stone-600 text-[11px]">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never"}
                        </td>
                        <td className="p-4">
                          <span className={`text-[8px] font-bold uppercase font-mono px-2 py-0.5 rounded-sm border tracking-wider ${
                            u.status === "approved" 
                              ? "bg-stone-900 text-white border-stone-900" 
                              : u.status === "disabled" 
                              ? "bg-red-50 text-red-900 border-red-200" 
                              : "bg-stone-100 text-stone-500 border-stone-200"
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => openEditUserModal(u)}
                              className="bg-stone-100 hover:bg-stone-200 text-stone-850 p-1.5 border border-stone-300 rounded-sm cursor-pointer transition"
                              title="Edit User Info"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openResetPasswordModal(u.id)}
                              className="bg-stone-100 hover:bg-stone-200 text-stone-850 p-1.5 border border-stone-300 rounded-sm text-amber-900 cursor-pointer transition"
                              title="Reset Password"
                            >
                              <Key className="h-3.5 w-3.5" />
                            </button>
                            {u.status === "approved" ? (
                              <button
                                onClick={() => handleUserStatusChange(u.id, "disabled")}
                                className="bg-red-50 hover:bg-red-100 text-red-900 p-1.5 border border-red-200 rounded-sm cursor-pointer transition"
                                title="Disable User Account"
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserStatusChange(u.id, "approved")}
                                className="bg-stone-100 hover:bg-stone-200 text-stone-850 p-1.5 border border-stone-300 rounded-sm cursor-pointer transition"
                                title="Enable User Account"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-900 p-1.5 border border-red-200 rounded-sm cursor-pointer transition"
                              title="Delete Account completely"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MASTER JOB AUDITS TAB */}
        {activeSection === "job_management" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 font-serif">Master Job Listings</h2>
              <p className="text-xs text-stone-500 font-serif italic mt-1">Audit active vacancies, close postings immediately, or erase outdated postings.</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-sm p-4 shadow-xs">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter master jobs by company, location, title..."
                  value={searchJobQuery}
                  onChange={(e) => setSearchJobQuery(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-sm pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder-stone-400 font-serif italic"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-10 text-stone-500 font-serif italic">No jobs posted.</div>
              ) : (
                filteredJobs.map(job => {
                  const jobApps = applications.filter(a => a.jobId === job.id);
                  const isClosed = job.status === "closed";

                  return (
                    <div key={job.id} className="bg-white border border-stone-200 rounded-sm p-5 shadow-xs flex flex-col sm:flex-row justify-between gap-4 hover:shadow-md transition">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-serif font-bold text-base text-stone-900">{job.title}</h4>
                          <span className="text-stone-900 font-serif font-bold italic">{job.companyName}</span>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-sm border uppercase tracking-wider ${
                            isClosed ? "bg-stone-100 text-stone-500 border-stone-200" : "bg-stone-900 text-white border-stone-900"
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="text-xs text-stone-600 font-serif italic space-x-4">
                          <span>Location: {job.location}</span>
                          <span>•</span>
                          <span>Category: {job.department}</span>
                          <span>•</span>
                          <span>Deadline: {job.deadline}</span>
                        </div>
                        <p className="text-xs text-stone-700 font-mono">
                          Applications Count: <span className="text-stone-950 font-bold">{jobApps.length} filed</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 min-w-[120px]">
                        {!isClosed && (
                          <button
                            onClick={() => handleAdminCloseJob(job.id)}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-850 text-[10px] font-mono uppercase tracking-widest py-1.5 px-3 border border-stone-300 rounded-sm cursor-pointer transition"
                          >
                            Mark Closed
                          </button>
                        )}
                        <button
                          onClick={() => handleAdminDeleteJob(job.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-900 text-[10px] font-mono uppercase tracking-widest py-1.5 px-3 border border-red-300 rounded-sm cursor-pointer transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </main>

      {/* CREATE RECRUITER MANUALLY MODAL */}
      {isCreateRecruiterOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-stone-300 rounded-sm max-w-md w-full p-6 shadow-2xl space-y-4 text-xs font-sans">
            <div className="border-b border-stone-200 pb-2 flex justify-between items-center">
              <h3 className="font-serif font-bold text-sm text-stone-900">Register Recruiter Manually</h3>
              <button onClick={() => setIsCreateRecruiterOpen(false)} className="text-stone-500 hover:text-stone-900 font-mono uppercase tracking-widest text-[10px] cursor-pointer">Close</button>
            </div>

            <form onSubmit={handleCreateRecruiterSubmit} className="space-y-3">
              <div>
                <label className="block text-stone-500 font-mono uppercase mb-1 font-bold">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cosmo First"
                  value={newRecruiterForm.companyName}
                  onChange={(e) => setNewRecruiterForm({ ...newRecruiterForm, companyName: e.target.value })}
                  className="w-full bg-white border border-stone-300 p-2 rounded-sm text-stone-950 focus:outline-none placeholder-stone-400"
                />
              </div>
              <div>
                <label className="block text-stone-500 font-mono uppercase mb-1 font-bold">Representative Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Saxena"
                  value={newRecruiterForm.name}
                  onChange={(e) => setNewRecruiterForm({ ...newRecruiterForm, name: e.target.value })}
                  className="w-full bg-white border border-stone-300 p-2 rounded-sm text-stone-950 focus:outline-none placeholder-stone-400"
                />
              </div>
              <div>
                <label className="block text-stone-500 font-mono uppercase mb-1 font-bold">Mobile Contact *</label>
                <input
                  type="text"
                  required
                  placeholder="+919988776655"
                  value={newRecruiterForm.mobile}
                  onChange={(e) => setNewRecruiterForm({ ...newRecruiterForm, mobile: e.target.value })}
                  className="w-full bg-white border border-stone-300 p-2 rounded-sm text-stone-950 focus:outline-none placeholder-stone-400"
                />
              </div>
              <div>
                <label className="block text-stone-500 font-mono uppercase mb-1 font-bold">Representative Email *</label>
                <input
                  type="email"
                  required
                  placeholder="amit@company.com"
                  value={newRecruiterForm.email}
                  onChange={(e) => setNewRecruiterForm({ ...newRecruiterForm, email: e.target.value })}
                  className="w-full bg-white border border-stone-300 p-2 rounded-sm text-stone-950 focus:outline-none placeholder-stone-400"
                />
              </div>
              <div>
                <label className="block text-stone-500 font-mono uppercase mb-1 font-bold">Hiring Portal Password *</label>
                <input
                  type="password"
                  required
                  value={newRecruiterForm.password}
                  onChange={(e) => setNewRecruiterForm({ ...newRecruiterForm, password: e.target.value })}
                  className="w-full bg-white border border-stone-300 p-2 rounded-sm text-stone-950 focus:outline-none placeholder-stone-400"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2 text-xs">
                <button type="button" onClick={() => setIsCreateRecruiterOpen(false)} className="bg-white border border-stone-300 px-4 py-1.5 rounded-sm text-stone-700 font-mono uppercase tracking-widest text-[10px] cursor-pointer">Cancel</button>
                <button type="submit" className="bg-stone-900 text-white font-bold px-5 py-1.5 rounded-sm font-mono uppercase tracking-widest text-[10px] cursor-pointer">Provision Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER DETAILS MODAL */}
      {isEditUserModalOpen && editingUser && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-stone-300 rounded-sm max-w-md w-full p-6 shadow-2xl space-y-4 text-xs font-sans">
            <div className="border-b border-stone-200 pb-2 flex justify-between items-center">
              <h3 className="font-serif font-bold text-sm text-stone-900">Edit User Record</h3>
              <button onClick={() => setIsEditUserModalOpen(false)} className="text-stone-500 hover:text-stone-900 font-mono uppercase tracking-widest text-[10px] cursor-pointer">Close</button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-3">
              <div>
                <label className="block text-stone-500 font-mono uppercase mb-1 font-bold">User Name *</label>
                <input
                  type="text"
                  required
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  className="w-full bg-white border border-stone-300 p-2 rounded-sm text-stone-950 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-500 font-mono uppercase mb-1 font-bold">Email ID *</label>
                <input
                  type="email"
                  required
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                  className="w-full bg-white border border-stone-300 p-2 rounded-sm text-stone-950 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-500 font-mono uppercase mb-1 font-bold">Mobile contact *</label>
                <input
                  type="text"
                  required
                  value={editUserForm.mobile}
                  onChange={(e) => setEditUserForm({ ...editUserForm, mobile: e.target.value })}
                  className="w-full bg-white border border-stone-300 p-2 rounded-sm text-stone-950 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-500 font-mono uppercase mb-1 font-bold">Status Moderation *</label>
                <select
                  value={editUserForm.status}
                  onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value as any })}
                  className="w-full bg-white border border-stone-300 p-2 rounded-sm text-stone-800 focus:outline-none font-serif"
                >
                  <option value="approved">Approved</option>
                  <option value="disabled">Disabled</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2 text-xs">
                <button type="button" onClick={() => setIsEditUserModalOpen(false)} className="bg-white border border-stone-300 px-4 py-1.5 rounded-sm text-stone-700 font-mono uppercase tracking-widest text-[10px] cursor-pointer">Cancel</button>
                <button type="submit" className="bg-stone-900 text-white font-bold px-5 py-1.5 rounded-sm font-mono uppercase tracking-widest text-[10px] cursor-pointer font-bold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetPasswordOpen && resetUserId && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-stone-300 rounded-sm max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs font-sans">
            <div className="border-b border-stone-200 pb-2 flex justify-between items-center">
              <h3 className="font-serif font-bold text-sm text-stone-900">Reset Account Password</h3>
              <button onClick={() => setIsResetPasswordOpen(false)} className="text-stone-500 hover:text-stone-900 font-mono uppercase tracking-widest text-[10px] cursor-pointer">Close</button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-stone-500 font-mono uppercase mb-1 font-bold">New Password (suggestion generated)</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border border-stone-300 p-2 rounded-sm text-stone-950 focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2 text-xs">
                <button type="button" onClick={() => setIsResetPasswordOpen(false)} className="bg-white border border-stone-300 px-4 py-1.5 rounded-sm text-stone-700 font-mono uppercase tracking-widest text-[10px] cursor-pointer">Cancel</button>
                <button type="submit" className="bg-stone-900 text-white font-bold px-5 py-1.5 rounded-sm font-mono uppercase tracking-widest text-[10px] cursor-pointer">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
