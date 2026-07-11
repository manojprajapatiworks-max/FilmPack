import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db, User, Job, Application, Notification, Interview } from "./server/db";
import { GoogleGenAI, Type } from "@google/genai";
import crypto from "crypto";

const app = express();
const PORT = 3000;

// Enable JSON bodies up to 10MB to support simulated file uploads (base64)
app.use(express.json({ limit: "10mb" }));

// Helper to generate IDs
const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// Initialize Gemini client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini API Client:", err);
  }
} else {
  console.log("No GEMINI_API_KEY found in process.env. Running skill-matching using fallback keyword scoring.");
}

// ==========================================
// SECURITY UTILITIES & MITIGATION ENGINE
// ==========================================

// Cryptographically secure hashing helper for passwords
const hashPassword = (password: string): string => {
  return crypto.createHash("sha256").update(password + "_filmpack_secret_salt_2026").digest("hex");
};

// Global authentication & IDOR session verification middleware
const authenticateUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userId = req.headers["x-user-id"] as string;
  const userRole = req.headers["x-user-role"] as string;

  // Paths that are fully public (no auth header needed)
  const isPublicRoute = 
    req.path === "/api/auth/login" || 
    req.path === "/api/auth/register" || 
    req.path === "/api/site-config" ||
    (req.method === "GET" && req.path === "/api/jobs") ||
    (req.method === "GET" && req.path.startsWith("/api/jobs/"));

  if (isPublicRoute) {
    return next();
  }

  if (!userId || !userRole) {
    return res.status(401).json({ error: "Authentication required. Please log in to continue." });
  }

  const users = db.getUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(401).json({ error: "Invalid session user. Please log in again." });
  }

  if (user.status !== "approved" && user.role !== "admin") {
    return res.status(403).json({ error: `Access Denied. Your account status is: ${user.status}.` });
  }

  // Inject authenticated user session context into req
  (req as any).currentUser = user;
  next();
};

// Apply security session middleware to all /api/ requests
app.use("/api", authenticateUser);

// Role Enforcement Middlewares
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = (req as any).currentUser as User;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Access Denied. Administrator role required for this action." });
  }
  next();
};

const requireRecruiterOrAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = (req as any).currentUser as User;
  if (!user || (user.role !== "recruiter" && user.role !== "admin")) {
    return res.status(403).json({ error: "Access Denied. Recruiter or Administrator privilege is required." });
  }
  next();
};

// ==========================================
// API ROUTES
// ==========================================

// Auth Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const users = db.getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Support both cryptographic hashes and legacy plaintext fallback with auto-migration
  const isPlainMatch = user.passwordHash === password;
  const isHashMatch = user.passwordHash === hashPassword(password);

  if (!isPlainMatch && !isHashMatch) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Securely upgrade legacy plaintext password to secure cryptographic hash on successful login
  if (isPlainMatch && !isHashMatch) {
    user.passwordHash = hashPassword(password);
    db.saveUsers(users);
  }

  if (user.status === "pending_approval") {
    return res.status(403).json({ error: "Your account is pending Admin approval. Once approved, you will be able to log in." });
  }

  if (user.status === "disabled") {
    return res.status(403).json({ error: "Your account has been disabled by the Administrator." });
  }

  if (user.status === "suspended") {
    return res.status(403).json({ error: "Profile Suspended, please contact FilmPack Team" });
  }

  if (user.status === "rejected") {
    return res.status(403).json({ error: "Your recruiter registration request was rejected by the Administrator." });
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  db.saveUsers(users);

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    status: user.status,
    companyDetails: user.companyDetails
  });
});

// Auth Register
app.post("/api/auth/register", (req, res) => {
  const { name, email, mobile, password, role, companyName, contactPerson } = req.body;

  if (!name || !email || !mobile || !password || !role) {
    return res.status(400).json({ error: "Missing required registration fields" });
  }

  const users = db.getUsers();
  const exists = users.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "An account with this email already exists" });
  }

  const newUserId = generateId("usr");
  const isRecruiter = role === "recruiter";

  const newUser: User = {
    id: newUserId,
    name,
    email: email.trim(),
    mobile,
    passwordHash: hashPassword(password), // Store hashed password securely
    role: role as 'applicant' | 'recruiter',
    status: isRecruiter ? "pending_approval" : "approved", // Recruiters need approval
    createdDate: new Date().toISOString()
  };

  if (isRecruiter) {
    newUser.companyDetails = {
      companyName: companyName || name,
      contactPerson: contactPerson || name,
      mobile: mobile,
      email: email
    };
  }

  users.push(newUser);
  db.saveUsers(users);

  res.status(201).json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    status: newUser.status,
    message: isRecruiter 
      ? "Registration submitted. Your account is pending Admin approval." 
      : "Registration successful! You can now log in."
  });
});

// Update user profile defaults (with IDOR check)
app.put("/api/users/:id/profile-defaults", (req, res) => {
  const currentUser = (req as any).currentUser as User;
  
  // Security Enforcement: Prevent users from editing other users' profile defaults
  if (!currentUser || (currentUser.role !== "admin" && currentUser.id !== req.params.id)) {
    return res.status(403).json({ error: "Access Denied. You are not authorized to update this profile." });
  }

  const users = db.getUsers();
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx !== -1) {
    users[idx].profileDefaults = req.body;
    db.saveUsers(users);
    const { passwordHash, ...safeUser } = users[idx];
    res.json(safeUser);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// GET Jobs (With optional filter parameters)
app.get("/api/jobs", (req, res) => {
  const jobs = db.getJobs();
  const users = db.getUsers();
  const suspendedRecruiterIds = new Set(users.filter(u => u.status === "suspended").map(u => u.id));

  const { department, location, experience, salary, companyName, recruiterId, includeSuspended } = req.query;

  let filteredJobs = [...jobs];

  if (includeSuspended !== "true") {
    filteredJobs = filteredJobs.filter(j => !suspendedRecruiterIds.has(j.recruiterId));
  }

  if (recruiterId) {
    filteredJobs = filteredJobs.filter(j => j.recruiterId === recruiterId);
  }

  if (department) {
    filteredJobs = filteredJobs.filter(j => j.department.toLowerCase() === (department as string).toLowerCase());
  }

  if (location) {
    filteredJobs = filteredJobs.filter(j => j.location.toLowerCase().includes((location as string).toLowerCase()));
  }

  if (experience) {
    filteredJobs = filteredJobs.filter(j => j.experience.toLowerCase().includes((experience as string).toLowerCase()));
  }

  if (companyName) {
    filteredJobs = filteredJobs.filter(j => j.companyName.toLowerCase().includes((companyName as string).toLowerCase()));
  }

  res.json(filteredJobs);
});

// GET Job Details
app.get("/api/jobs/:id", (req, res) => {
  const jobs = db.getJobs();
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job vacancy not found" });
  }
  res.json(job);
});

// POST Create Job
app.post("/api/jobs", requireRecruiterOrAdmin, (req, res) => {
  const { title, companyName, location, department, experience, education, salary, description, vacancies, deadline, skillsRequired, recruiterId } = req.body;

  if (!title || !companyName || !location || !department || !deadline || !recruiterId) {
    return res.status(400).json({ error: "Title, Company, Location, Category, and Deadline are required fields." });
  }

  const currentUser = (req as any).currentUser as User;
  // Security check: Prevent a recruiter from posting jobs as another recruiter
  if (currentUser.role === "recruiter" && recruiterId !== currentUser.id) {
    return res.status(403).json({ error: "Access Denied. You cannot post jobs for another recruiter account." });
  }

  const jobs = db.getJobs();
  const newJob: Job = {
    id: generateId("job"),
    recruiterId,
    title,
    companyName,
    location,
    department,
    experience: experience || "Any Experience",
    education: education || "Not Specified",
    salary: salary || "Negotiable",
    description: description || "",
    vacancies: Number(vacancies) || 1,
    deadline,
    status: "open",
    skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : [],
    createdDate: new Date().toISOString()
  };

  jobs.push(newJob);
  db.saveJobs(jobs);

  // Trigger auto close checks
  db.checkAndCloseExpiredJobs();

  res.status(201).json(newJob);
});

// PUT Edit Job
app.put("/api/jobs/:id", requireRecruiterOrAdmin, (req, res) => {
  const jobs = db.getJobs();
  const index = jobs.findIndex(j => j.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Job not found" });
  }

  const currentUser = (req as any).currentUser as User;
  // Security check: Recruiters can only edit their own jobs
  if (currentUser.role === "recruiter" && jobs[index].recruiterId !== currentUser.id) {
    return res.status(403).json({ error: "Access Denied. You cannot modify another recruiter's job post." });
  }

  const updatedJob = {
    ...jobs[index],
    ...req.body,
    id: req.params.id, // prevent overwriting ID
    recruiterId: jobs[index].recruiterId // prevent changing recruiterId
  };

  jobs[index] = updatedJob;
  db.saveJobs(jobs);

  db.checkAndCloseExpiredJobs();
  res.json(updatedJob);
});

// DELETE Job
app.delete("/api/jobs/:id", requireRecruiterOrAdmin, (req, res) => {
  const jobs = db.getJobs();
  const index = jobs.findIndex(j => j.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Job not found" });
  }

  const currentUser = (req as any).currentUser as User;
  // Security check: Recruiters can only delete their own jobs
  if (currentUser.role === "recruiter" && jobs[index].recruiterId !== currentUser.id) {
    return res.status(403).json({ error: "Access Denied. You cannot delete another recruiter's job post." });
  }

  const filtered = jobs.filter(j => j.id !== req.params.id);
  db.saveJobs(filtered);
  res.json({ message: "Job deleted successfully" });
});

// POST Manual Move to Closed
app.post("/api/jobs/:id/close", requireRecruiterOrAdmin, (req, res) => {
  const jobs = db.getJobs();
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const currentUser = (req as any).currentUser as User;
  // Security check: Recruiters can only close their own jobs
  if (currentUser.role === "recruiter" && job.recruiterId !== currentUser.id) {
    return res.status(403).json({ error: "Access Denied. You cannot close another recruiter's job post." });
  }

  job.status = "closed";
  db.saveJobs(jobs);
  res.json(job);
});

// GET Applications (Secured with role-based ownership constraints)
app.get("/api/applications", (req, res) => {
  const currentUser = (req as any).currentUser as User;
  const apps = db.getApplications();
  const { applicantId, recruiterId, jobId } = req.query;

  let filteredApps = [...apps];

  // Enforce access boundary constraints
  if (currentUser.role === "applicant") {
    // Applicants can ONLY fetch their own applications
    filteredApps = filteredApps.filter(a => a.applicantId === currentUser.id);
  } else if (currentUser.role === "recruiter") {
    // Recruiters can ONLY fetch applications for their own jobs
    const jobs = db.getJobs();
    const recruiterJobIds = new Set(jobs.filter(j => j.recruiterId === currentUser.id).map(j => j.id));
    filteredApps = filteredApps.filter(a => recruiterJobIds.has(a.jobId));

    if (jobId) {
      filteredApps = filteredApps.filter(a => a.jobId === jobId);
    }
  } else if (currentUser.role === "admin") {
    // Admins can filter freely
    if (applicantId) {
      filteredApps = filteredApps.filter(a => a.applicantId === applicantId);
    }
    if (jobId) {
      filteredApps = filteredApps.filter(a => a.jobId === jobId);
    }
    if (recruiterId) {
      const jobs = db.getJobs();
      const recruiterJobIds = new Set(jobs.filter(j => j.recruiterId === recruiterId).map(j => j.id));
      filteredApps = filteredApps.filter(a => recruiterJobIds.has(a.jobId));
    }
  }

  res.json(filteredApps);
});

// POST Submit Application & trigger simulated notification + optional Gemini analysis (Secured)
app.post("/api/applications", (req, res, next) => {
  const { applicantId } = req.body;
  const currentUser = (req as any).currentUser as User;

  // Security check: Applicants can only apply on behalf of themselves
  if (currentUser.role === "applicant" && applicantId !== currentUser.id) {
    return res.status(403).json({ error: "Access Denied. You cannot submit applications on behalf of another user." });
  }
  next();
}, async (req, res) => {
  const { jobId, applicantId, remarks, formData, resumeUrl, photoUrl } = req.body;

  if (!jobId || !applicantId || !formData) {
    return res.status(400).json({ error: "Job ID, Applicant ID, and Resume Form Data are required." });
  }

  const jobs = db.getJobs();
  const job = jobs.find(j => j.id === jobId);
  if (!job) {
    return res.status(404).json({ error: "Target job not found" });
  }

  const apps = db.getApplications();
  const alreadyApplied = apps.some(a => a.jobId === jobId && a.applicantId === applicantId);
  if (alreadyApplied) {
    return res.status(400).json({ error: "You have already applied for this position." });
  }

  // Fallback keyword matching first
  let score = 50; // default base
  let justification = "Evaluated on skills matching metrics.";

  const jobSkills = (job.skillsRequired || []).map(s => s.toLowerCase());
  const candidateSkills = (formData.skills || []).map(s => s.toLowerCase());

  if (jobSkills.length > 0) {
    const intersection = candidateSkills.filter(s => jobSkills.some(js => js.includes(s) || s.includes(js)));
    const ratio = intersection.length / jobSkills.length;
    score = Math.min(100, Math.round(50 + (ratio * 50)));
    justification = `Heuristic match: candidate matches ${intersection.length} out of ${jobSkills.length} required film packaging technical skills.`;
  }

  // Try real Gemini Skill Matching if available
  if (ai) {
    try {
      const prompt = `
        You are a hiring expert specializing in the Flexible Packaging Film Manufacturing Industry.
        Evaluate the candidate's alignment with this specific vacancy:
        
        JOB DETAILS:
        - Job Title: ${job.title}
        - Category/Department: ${job.department}
        - Required Experience: ${job.experience}
        - Required Education: ${job.education}
        - Required Skills: ${JSON.stringify(job.skillsRequired)}
        - Description: ${job.description}
        
        CANDIDATE DETAILS:
        - Name: ${formData.fullName}
        - Experience Duration: ${formData.experience}
        - Qualification: ${formData.qualification}
        - Current Designation: ${formData.currentDesignation}
        - Skills: ${JSON.stringify(formData.skills)}
        - Remarks: ${remarks || "None"}
        
        Evaluate technical fit based on packaging processes (extrusion, co-extrusion, printing, slitting, corona-treatment, quality metrics, raw material, etc.).
        Provide a JSON response matching the schema. Do not output anything else besides JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "Match score from 0 to 100 based on rigorous skill alignment." },
              feedback: { type: Type.STRING, description: "A concise 2-3 sentence technical alignment review highlighting film experience strengths or gaps." }
            },
            required: ["score", "feedback"]
          }
        }
      });

      if (response.text) {
        const result = JSON.parse(response.text.trim());
        if (typeof result.score === "number" && result.feedback) {
          score = result.score;
          justification = result.feedback;
        }
      }
    } catch (err) {
      console.error("Gemini skill matching failed, using heuristic fallback.", err);
    }
  }

  const newApp: Application = {
    id: generateId("app"),
    jobId,
    applicantId,
    appliedDate: new Date().toISOString(),
    status: "Applied",
    resumeUrl: resumeUrl || "",
    photoUrl: photoUrl || "",
    remarks: remarks || "",
    formData,
    matchScore: score,
    matchFeedback: justification
  };

  apps.push(newApp);
  db.saveApplications(apps);

  // Trigger instant notification simulation
  const nots = db.getNotifications();
  const applicantUser = db.getUsers().find(u => u.id === applicantId);

  if (applicantUser) {
    const mobileNo = formData.mobile || applicantUser.mobile;
    const emailAddr = formData.email || applicantUser.email;

    // Simulated WhatsApp Log
    const whatsappMsg: Notification = {
      id: generateId("not"),
      userId: applicantId,
      type: "whatsapp",
      recipient: mobileNo,
      message: `Dear ${formData.fullName}, your application for "${job.title}" at ${job.companyName} has been received successfully. Status: Applied. Match Index: ${score}%.`,
      sentAt: new Date().toISOString()
    };

    // Simulated Email Log
    const emailMsg: Notification = {
      id: generateId("not"),
      userId: applicantId,
      type: "email",
      recipient: emailAddr,
      message: `Dear ${formData.fullName},\n\nThank you for applying to the "${job.title}" position at ${job.companyName}. Your application has been logged, and the recruiter has been notified. You can check updates on your FilmPack dashboard.\n\nBest regards,\nFilmPack Careers Team`,
      sentAt: new Date().toISOString()
    };

    nots.push(whatsappMsg, emailMsg);
    db.saveNotifications(nots);
  }

  res.status(201).json(newApp);
});

// PUT Update Application Status (Trigger notifications - Secured)
app.put("/api/applications/:id/status", requireRecruiterOrAdmin, (req, res) => {
  const { status, feedback } = req.body;
  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }

  const apps = db.getApplications();
  const appIndex = apps.findIndex(a => a.id === req.params.id);
  if (appIndex === -1) {
    return res.status(404).json({ error: "Application not found." });
  }

  const currentUser = (req as any).currentUser as User;
  const application = apps[appIndex];
  
  // Security Check: Recruiters can only update applications for their own jobs
  const jobs = db.getJobs();
  const targetJob = jobs.find(j => j.id === application.jobId);
  if (currentUser.role === "recruiter" && (!targetJob || targetJob.recruiterId !== currentUser.id)) {
    return res.status(403).json({ error: "Access Denied. You are not authorized to moderate applications for another recruiter's jobs." });
  }

  application.status = status;
  if (feedback !== undefined) {
    application.feedback = feedback;
  }

  db.saveApplications(apps);

  // Send WhatsApp/Email Notifications
  const applicantUser = db.getUsers().find(u => u.id === application.applicantId);

  if (targetJob && applicantUser) {
    const nots = db.getNotifications();
    
    const whatsappMsg: Notification = {
      id: generateId("not"),
      userId: application.applicantId,
      type: "whatsapp",
      recipient: application.formData.mobile || applicantUser.mobile,
      message: `Hi ${application.formData.fullName}, your application for "${targetJob.title}" has been updated to: [${status}]. Feedback: ${feedback || "Under further review."}`,
      sentAt: new Date().toISOString()
    };

    const emailMsg: Notification = {
      id: generateId("not"),
      userId: application.applicantId,
      type: "email",
      recipient: application.formData.email || applicantUser.email,
      message: `Dear ${application.formData.fullName},\n\nWe would like to update you that your job application status for "${targetJob.title}" at ${targetJob.companyName} is now: ${status}.\n\nFeedback from hiring manager:\n"${feedback || 'Under active review'}"\n\nCheck your dashboard to view active interview slots or other details.\n\nBest regards,\nRecruiter Team`,
      sentAt: new Date().toISOString()
    };

    nots.push(whatsappMsg, emailMsg);
    db.saveNotifications(nots);
  }

  res.json(application);
});

// PUT Update Feedback Only (Secured)
app.put("/api/applications/:id/feedback", requireRecruiterOrAdmin, (req, res) => {
  const { feedback } = req.body;
  const apps = db.getApplications();
  const appIndex = apps.findIndex(a => a.id === req.params.id);
  if (appIndex === -1) {
    return res.status(404).json({ error: "Application not found." });
  }

  const currentUser = (req as any).currentUser as User;
  const application = apps[appIndex];
  
  // Security Check: Recruiters can only add feedback for applications of their own jobs
  const jobs = db.getJobs();
  const targetJob = jobs.find(j => j.id === application.jobId);
  if (currentUser.role === "recruiter" && (!targetJob || targetJob.recruiterId !== currentUser.id)) {
    return res.status(403).json({ error: "Access Denied. You are not authorized to moderate applications for another recruiter's jobs." });
  }

  apps[appIndex].feedback = feedback;
  db.saveApplications(apps);
  res.json(apps[appIndex]);
});

// ==========================================
// INTERVIEWS ROUTES
// ==========================================
// GET Interviews (Secured against unauthorized multi-user leakage)
app.get("/api/interviews", (req, res) => {
  const currentUser = (req as any).currentUser as User;
  const interviews = db.getInterviews();

  let filtered = [...interviews];

  if (currentUser.role === "applicant") {
    // Applicants can ONLY view their own scheduled interviews
    filtered = filtered.filter(i => i.applicantId === currentUser.id);
  } else if (currentUser.role === "recruiter") {
    // Recruiters can ONLY view interviews scheduled by/for themselves
    filtered = filtered.filter(i => i.recruiterId === currentUser.id);
  }

  res.json(filtered);
});

// POST Schedule Interview (Secured with Recruiter Ownership)
app.post("/api/interviews", requireRecruiterOrAdmin, (req, res) => {
  const { applicationId, applicantId, recruiterId, jobId, title, dateTime, mode, linkOrLocation, notes } = req.body;

  if (!applicationId || !applicantId || !recruiterId || !jobId || !title || !dateTime || !mode) {
    return res.status(400).json({ error: "Required interview scheduling details are missing." });
  }

  const currentUser = (req as any).currentUser as User;

  // Security Check: Ensure recruiter is only scheduling for themselves
  if (currentUser.role === "recruiter" && recruiterId !== currentUser.id) {
    return res.status(403).json({ error: "Access Denied. You cannot schedule interviews on behalf of another recruiter." });
  }

  // Security Check: Verify job belongs to this recruiter
  const jobs = db.getJobs();
  const job = jobs.find(j => j.id === jobId);
  if (currentUser.role === "recruiter" && (!job || job.recruiterId !== currentUser.id)) {
    return res.status(403).json({ error: "Access Denied. You cannot schedule interviews for another recruiter's jobs." });
  }

  const interviews = db.getInterviews();
  const newInterview: Interview = {
    id: generateId("int"),
    applicationId,
    applicantId,
    recruiterId,
    jobId,
    title,
    dateTime,
    mode,
    linkOrLocation,
    notes,
    status: "scheduled"
  };

  interviews.push(newInterview);
  db.saveInterviews(interviews);

  // Notify candidate
  const applicantUser = db.getUsers().find(u => u.id === applicantId);

  if (applicantUser && job) {
    const nots = db.getNotifications();
    const dateTimeFormatted = new Date(dateTime).toLocaleString();

    const whatsappMsg: Notification = {
      id: generateId("not"),
      userId: applicantId,
      type: "whatsapp",
      recipient: applicantUser.mobile,
      message: `🔔 Interview Scheduled! Hi ${applicantUser.name}, you have a new interview scheduled for "${job.title}" [${mode}]. Time: ${dateTimeFormatted}. Link/Location: ${linkOrLocation}.`,
      sentAt: new Date().toISOString()
    };

    const emailMsg: Notification = {
      id: generateId("not"),
      userId: applicantId,
      type: "email",
      recipient: applicantUser.email,
      message: `Dear ${applicantUser.name},\n\nAn interview has been scheduled for your application regarding "${job.title}".\n\nDetails:\n- Interview Round: ${title}\n- Date & Time: ${dateTimeFormatted}\n- Mode: ${mode}\n- Connection / Location: ${linkOrLocation}\n- Preparatory Notes: ${notes || "None"}\n\nGood luck!\nFilmPack Careers Team`,
      sentAt: new Date().toISOString()
    };

    nots.push(whatsappMsg, emailMsg);
    db.saveNotifications(nots);
  }

  res.status(201).json(newInterview);
});

// Update Interview Status (Secured with Recruiter Ownership)
app.put("/api/interviews/:id", requireRecruiterOrAdmin, (req, res) => {
  const interviews = db.getInterviews();
  const idx = interviews.findIndex(i => i.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Interview not found" });
  }

  const currentUser = (req as any).currentUser as User;
  
  // Security Check: Recruiters can only modify status for interviews they scheduled
  if (currentUser.role === "recruiter" && interviews[idx].recruiterId !== currentUser.id) {
    return res.status(403).json({ error: "Access Denied. You cannot modify an interview scheduled by another recruiter." });
  }

  interviews[idx] = {
    ...interviews[idx],
    ...req.body,
    id: req.params.id // lock id
  };

  db.saveInterviews(interviews);
  res.json(interviews[idx]);
});

// ==========================================
// ADMIN WORKFLOWS & USER MANAGEMENT
// ==========================================

// Global protection middleware for all /api/admin/* endpoints
app.use("/api/admin", requireAdmin);

// GET Admin Users List
app.get("/api/admin/users", (req, res) => {
  const users = db.getUsers();
  // Filter sensitive fields for client, but return needed metadata
  const sanitized = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    mobile: u.mobile,
    role: u.role,
    status: u.status,
    createdDate: u.createdDate,
    lastLogin: u.lastLogin,
    companyDetails: u.companyDetails
  }));
  res.json(sanitized);
});

// PUT Moderate/Approve Recruiter or User
app.put("/api/admin/users/:id/status", (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }

  const users = db.getUsers();
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  users[idx].status = status;
  db.saveUsers(users);

  // Send simulation notification for Recruiter Approval / Suspension
  if (users[idx].role === "recruiter" && (status === "approved" || status === "rejected" || status === "suspended")) {
    const nots = db.getNotifications();
    let messageText = `Dear ${users[idx].name},\n\nYour recruiter account registration at FilmPack Careers has been ${status.toUpperCase()} by the Administrator.\n${
      status === "approved" 
        ? "You can now log in using your registered credentials to post jobs and view candidate match metrics." 
        : "Please contact support if you believe this was an error."
    }\n\nRegards,\nFilmPack Admin Office`;

    if (status === "suspended") {
      messageText = `Dear ${users[idx].name},\n\nYour recruiter account at FilmPack Careers has been TEMPORARILY SUSPENDED by the Administrator.\nAll your posted jobs have been hidden from public view and login access is restricted.\nPlease contact FilmPack Team for clarification.\n\nRegards,\nFilmPack Admin Office`;
    }

    const msg: Notification = {
      id: generateId("not"),
      userId: req.params.id,
      type: "email",
      recipient: users[idx].email,
      message: messageText,
      sentAt: new Date().toISOString()
    };
    nots.push(msg);
    db.saveNotifications(nots);
  }

  res.json(users[idx]);
});

// PUT Edit User
app.put("/api/admin/users/:id/edit", (req, res) => {
  const users = db.getUsers();
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  users[idx] = {
    ...users[idx],
    ...req.body,
    id: req.params.id // lock ID
  };
  db.saveUsers(users);
  res.json(users[idx]);
});

// POST Reset Password
app.post("/api/admin/users/:id/reset-password", (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ error: "New password is required." });
  }

  const users = db.getUsers();
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  users[idx].passwordHash = hashPassword(newPassword); // Cryptographically secure hash reset
  db.saveUsers(users);
  res.json({ message: "Password updated successfully" });
});

// DELETE User
app.delete("/api/admin/users/:id", (req, res) => {
  const users = db.getUsers();
  const filtered = users.filter(u => u.id !== req.params.id);
  db.saveUsers(filtered);

  // Also clean up jobs and applications associated? Keep it simple: remove user.
  res.json({ message: "User deleted successfully" });
});

// POST Approve Multiple Recruiters
app.post("/api/admin/users/approve-multiple", (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: "List of user IDs required." });
  }

  const users = db.getUsers();
  let modified = false;

  const nots = db.getNotifications();

  users.forEach(u => {
    if (ids.includes(u.id) && u.status === "pending_approval") {
      u.status = "approved";
      modified = true;

      // Log notification
      nots.push({
        id: generateId("not"),
        userId: u.id,
        type: "email",
        recipient: u.email,
        message: `Dear ${u.name},\n\nYour recruiter account registration at FilmPack Careers has been approved by the Administrator in a batch approval workflow. You can now log in and post packaging film jobs.`,
        sentAt: new Date().toISOString()
      });
    }
  });

  if (modified) {
    db.saveUsers(users);
    db.saveNotifications(nots);
  }

  res.json({ message: `Successfully approved ${ids.length} recruiters.` });
});

// ==========================================
// EXPORTS AND DOWNLOADS (CSV generator)
// ==========================================

// Export job applications as Excel-friendly CSV
app.get("/api/export/excel", requireRecruiterOrAdmin, (req, res) => {
  const currentUser = (req as any).currentUser as User;
  const { jobId, recruiterId } = req.query;
  const apps = db.getApplications();
  const jobs = db.getJobs();

  let filtered = [...apps];

  // Recruiter role validation constraint
  if (currentUser.role === "recruiter") {
    const recJobs = new Set(jobs.filter(j => j.recruiterId === currentUser.id).map(j => j.id));
    filtered = filtered.filter(a => recJobs.has(a.jobId));
    if (jobId) {
      filtered = filtered.filter(a => a.jobId === jobId);
    }
  } else {
    // Admin role filters
    if (jobId) {
      filtered = filtered.filter(a => a.jobId === jobId);
    } else if (recruiterId) {
      const recJobs = new Set(jobs.filter(j => j.recruiterId === recruiterId).map(j => j.id));
      filtered = filtered.filter(a => recJobs.has(a.jobId));
    }
  }

  // Create CSV String
  let csv = "ApplicationID,JobTitle,Company,ApplicantName,Email,Mobile,Experience,CurrentLocation,PreferredLocation,Qualification,ExpectedSalary,MatchScore,Status,AppliedDate\n";

  filtered.forEach(a => {
    const j = jobs.find(job => job.id === a.jobId);
    const title = j ? j.title.replace(/"/g, '""') : "Unknown Job";
    const comp = j ? j.companyName.replace(/"/g, '""') : "Unknown Company";
    
    csv += `"${a.id}","${title}","${comp}","${a.formData.fullName.replace(/"/g, '""')}","${a.formData.email}","${a.formData.mobile}","${a.formData.experience}","${a.formData.currentLocation}","${a.formData.preferredLocation}","${a.formData.qualification}","${a.formData.expectedSalary}","${a.matchScore || 0}%","${a.status}","${a.appliedDate}"\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=applications_export_${Date.now()}.csv`);
  res.status(200).send(csv);
});

// Download resume database as CSV
app.get("/api/export/candidates", requireAdmin, (req, res) => {
  const users = db.getUsers();
  const apps = db.getApplications();

  // Extract all unique applicant detailed resumes from applications
  let csv = "CandidateName,Email,Mobile,Education,Experience,CurrentCompany,CurrentDesignation,Skills,PreferredLocation\n";

  // Use application forms since they contain rich resume-like fields
  const seenApplicants = new Set<string>();
  
  apps.forEach(a => {
    if (!seenApplicants.has(a.applicantId)) {
      seenApplicants.add(a.applicantId);
      const skillsStr = (a.formData.skills || []).join(" | ").replace(/"/g, '""');
      csv += `"${a.formData.fullName.replace(/"/g, '""')}","${a.formData.email}","${a.formData.mobile}","${a.formData.qualification.replace(/"/g, '""')}","${a.formData.experience}","${a.formData.currentCompany.replace(/"/g, '""')}","${a.formData.currentDesignation.replace(/"/g, '""')}","${skillsStr}","${a.formData.preferredLocation}"\n`;
    }
  });

  // Fallback to basic applicant list if no applications yet
  users.forEach(u => {
    if (u.role === "applicant" && !seenApplicants.has(u.id)) {
      csv += `"${u.name.replace(/"/g, '""')}","${u.email}","${u.mobile}","Not Submitted","None","None","None","None","None"\n`;
    }
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=candidates_database_${Date.now()}.csv`);
  res.status(200).send(csv);
});

// GET Notification Log
app.get("/api/notifications", (req, res) => {
  const currentUser = (req as any).currentUser as User;
  const nots = db.getNotifications();
  const { userId } = req.query;

  let filtered = [...nots];
  if (currentUser.role !== "admin") {
    // Regular users can ONLY fetch notifications directed to them
    const email = currentUser.email || "";
    const mobile = currentUser.mobile || "";
    filtered = filtered.filter(n => n.userId === currentUser.id || n.recipient === currentUser.id || n.recipient === email || n.recipient === mobile);
  } else if (userId) {
    filtered = filtered.filter(n => n.userId === userId || n.recipient === userId || (typeof n.recipient === "string" && n.recipient.includes(userId as string)));
  }

  // Sort descending by date
  filtered.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  res.json(filtered);
});

// POST Trigger Simulated Test Alert
app.post("/api/notifications/test", requireAdmin, (req, res) => {
  const { userId, recipient, message, type } = req.body;
  const nots = db.getNotifications();
  const newNotif: Notification = {
    id: generateId("not"),
    userId: userId || "usr_admin",
    type: type || "whatsapp",
    recipient: recipient || "+91 98765 43210",
    message: message || "Simulated System Alert: Alliance production stream active. 14 plants synchronized.",
    sentAt: new Date().toISOString()
  };
  nots.push(newNotif);
  db.saveNotifications(nots);
  res.json(newNotif);
});

// DELETE Clear All Notifications (or for a user)
app.delete("/api/notifications", (req, res) => {
  const currentUser = (req as any).currentUser as User;
  const { userId } = req.query;

  if (currentUser.role === "admin") {
    if (userId) {
      // Admin clears a specific user's logs
      const u = db.getUsers().find(user => user.id === userId);
      const email = u?.email || "";
      const mobile = u?.mobile || "";
      const nots = db.getNotifications().filter(n => {
        const isMatch = n.userId === userId || n.recipient === userId || (email && n.recipient === email) || (mobile && n.recipient === mobile);
        return !isMatch;
      });
      db.saveNotifications(nots);
    } else {
      // Admin clears everything
      db.saveNotifications([]);
    }
  } else {
    // Regular users can only clear their own logs
    const email = currentUser.email || "";
    const mobile = currentUser.mobile || "";
    const nots = db.getNotifications().filter(n => {
      const isMatch = n.userId === currentUser.id || n.recipient === currentUser.id || (email && n.recipient === email) || (mobile && n.recipient === mobile);
      return !isMatch;
    });
    db.saveNotifications(nots);
  }
  res.json({ success: true });
});

// GET Portal Statistics
app.get("/api/admin/stats", (req, res) => {
  const users = db.getUsers();
  const jobs = db.getJobs();
  const apps = db.getApplications();

  const totalApplicants = users.filter(u => u.role === "applicant").length;
  const totalRecruiters = users.filter(u => u.role === "recruiter").length;
  const openJobs = jobs.filter(j => j.status === "open").length;
  const closedJobs = jobs.filter(j => j.status === "closed").length;
  const applicationsReceived = apps.length;
  const hiredCandidates = apps.filter(a => a.status === "Hired").length;

  res.json({
    totalApplicants,
    totalRecruiters,
    openJobs,
    closedJobs,
    applicationsReceived,
    hiredCandidates
  });
});

// GET Site Config
app.get("/api/site-config", (req, res) => {
  res.json(db.getSiteConfig());
});

// PUT Update Site Config (Admin only)
app.put("/api/admin/site-config", (req, res) => {
  const config = req.body;
  if (!config || !config.header || !config.footer) {
    return res.status(400).json({ error: "Invalid site configuration object." });
  }
  db.saveSiteConfig(config);
  res.json({ success: true, config: db.getSiteConfig() });
});

// ==========================================
// VITE OR STATIC FILES MIDDLEWARE
// ==========================================

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error("Failed to start server:", err);
});

