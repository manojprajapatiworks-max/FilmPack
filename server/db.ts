import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  email: string;
  passwordHash: string; // Stored as-is or simulated hash
  role: 'applicant' | 'recruiter' | 'admin';
  status: 'pending_approval' | 'approved' | 'rejected' | 'disabled' | 'suspended';
  createdDate: string;
  lastLogin?: string;
  companyDetails?: {
    companyName: string;
    contactPerson: string;
    mobile: string;
    email: string;
  };
}

export interface Job {
  id: string;
  recruiterId: string;
  title: string;
  companyName: string;
  location: string;
  department: string; // Film categories (Extrusion, Printing, QC, etc.)
  experience: string; // e.g. "2-5 Years"
  education: string;  // e.g. "ITI / Diploma" or "B.Tech"
  salary: string;     // e.g. "₹25,000 - ₹35,000 / Month"
  description: string;
  vacancies: number;
  deadline: string;   // YYYY-MM-DD
  status: 'open' | 'closed';
  skillsRequired: string[];
  createdDate: string;
}

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  appliedDate: string;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Rejected' | 'Hired';
  feedback?: string;
  resumeUrl?: string; // Local storage simulation or base64
  photoUrl?: string;  // Local storage simulation or base64
  remarks?: string;
  formData: {
    fullName: string;
    mobile: string;
    email: string;
    currentLocation: string;
    preferredLocation: string;
    qualification: string;
    experience: string; // e.g. "3 Years"
    currentCompany: string;
    currentDesignation: string;
    currentSalary: string;
    expectedSalary: string;
    noticePeriod: string;
    skills: string[];
  };
  matchScore?: number; // Gemini skill matching score
  matchFeedback?: string; // Gemini breakdown
}

export interface Notification {
  id: string;
  userId: string;
  type: 'whatsapp' | 'email';
  recipient: string;
  message: string;
  sentAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  applicantId: string;
  recruiterId: string;
  jobId: string;
  title: string;
  dateTime: string;
  mode: string; // "Online" | "In-Person"
  linkOrLocation: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface ShowcaseImage {
  id: string;
  url: string;
  title: string;
  subtitle: string;
  category: string;
  badgeColor: string;
  specs: string | string[];
}

export interface TickerItem {
  id: string;
  text: string;
  highlight: string;
  color: string;
}

export interface SiteConfig {
  header: {
    platformName: string;
    allianceBadge: string;
    plantsLiveCount?: string;
    livePlantsCount?: string;
    tagline: string;
  };
  footer: {
    copyrightText?: string;
    copyrightName?: string;
    contactPhone: string;
    contactEmail: string;
    addressText?: string;
    contactAddress?: string;
    socialLinks?: {
      instagram: string;
      facebook: string;
      whatsapp: string;
      linkedin: string;
    };
  };
  socialLinks?: {
    instagram: string;
    facebook: string;
    whatsapp: string;
    linkedin: string;
  };
  showcaseImages: ShowcaseImage[];
  tickerItems: TickerItem[];
}

export const INITIAL_SITE_CONFIG: SiteConfig = {
  header: {
    platformName: "FILMPACK™",
    allianceBadge: "ALLIANCE",
    plantsLiveCount: "● 14 PLANTS LIVE",
    livePlantsCount: "● 14 PLANTS LIVE",
    tagline: "BOPP • BOPET • CPP • BARRIER FILM JOBS"
  },
  footer: {
    copyrightText: "© 2026 FilmPack Alliance India. All Rights Reserved.",
    copyrightName: "FilmPack Packaging Film Business Alliance",
    contactPhone: "+91 98765 43210",
    contactEmail: "support@filmpack.com",
    addressText: "FilmPack Tower, Film City, Noida, UP 201301",
    contactAddress: "Industrial Packaging Area, Phase-4, Mumbai, India",
    socialLinks: {
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
      whatsapp: "https://wa.me/919876543210",
      linkedin: "https://linkedin.com"
    }
  },
  socialLinks: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    whatsapp: "https://wa.me/919876543210",
    linkedin: "https://linkedin.com"
  },
  showcaseImages: [
    {
      id: "img_1",
      url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
      title: "High-Speed BOPP Extrusion Line #1",
      subtitle: "Automated 8.7m Bruckner line producing ultra-clear sealing films at 480 m/min.",
      category: "BOPP FILMS",
      badgeColor: "bg-emerald-500 text-stone-950",
      specs: "Thickness: 15µ - 40µ • Tensile Strength: 140 MPa"
    },
    {
      id: "img_2",
      url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
      title: "Metallized BOPET & Vacuum Deposition Desk",
      subtitle: "Mirror-finish aluminum metallization for premium snack barrier and UV protection.",
      category: "METALLIZED FOIL",
      badgeColor: "bg-amber-500 text-stone-950",
      specs: "OD: 2.2 - 2.8 • OTR < 0.5 cc/m²/day"
    },
    {
      id: "img_3",
      url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
      title: "Precision Slitting & Roll Rewinding Desk",
      subtitle: "Laser-guided slitting machines preparing customized master rolls for packaging converters.",
      category: "SLITTING DESK",
      badgeColor: "bg-sky-500 text-stone-950",
      specs: "Slit Width: 50mm - 2000mm • Zero-taper winding"
    },
    {
      id: "img_4",
      url: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
      title: "Co-Extruded CPP & Barrier Sealing Plant",
      subtitle: "3-layer and 5-layer cast polypropylene lines engineered for retort pouches and medical packaging.",
      category: "CPP BARRIER",
      badgeColor: "bg-purple-500 text-white",
      specs: "Seal Initiation Temp: 105°C • Puncture Resistant"
    },
    {
      id: "img_5",
      url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80",
      title: "Eco-Green Recyclable Monomaterial Films",
      subtitle: "Pioneering sustainable 100% recyclable polyolefin laminate solutions for global food brands.",
      category: "SUSTAINABILITY",
      badgeColor: "bg-teal-500 text-white",
      specs: "ISCC Plus Certified • 30% Post-Consumer Recyclate"
    }
  ],
  tickerItems: [
    { id: "tck_1", text: "LINE #1 (BOPP 15µ Transparent):", highlight: "480 m/min • Slitting Desk #4 Recruiting", color: "text-emerald-400" },
    { id: "tck_2", text: "LINE #2 (Metallized BOPET 12µ Foil):", highlight: "99.4% OEE • Shift Supervisor Required", color: "text-amber-400" },
    { id: "tck_3", text: "LINE #3 (Multi-layer CPP Barrier Film):", highlight: "ACTIVE EXTRUSION • QC Chemist Walk-ins Open", color: "text-sky-400" },
    { id: "tck_4", text: "ALLIANCE AUDIT:", highlight: "ISO 9001:2015 & BRCGS Certified • Top Packaging Employer India", color: "text-purple-400" },
    { id: "tck_5", text: "ROLLS DISPATCHED TODAY:", highlight: "1,420 MT across Gujarat, Maharashtra & Daman Plants", color: "text-emerald-400" }
  ]
};

export interface DatabaseSchema {
  users: User[];
  jobs: Job[];
  applications: Application[];
  notifications: Notification[];
  interviews: Interview[];
  siteConfig?: SiteConfig;
}

const INITIAL_DB: DatabaseSchema = {
  siteConfig: INITIAL_SITE_CONFIG,
  users: [
    {
      id: "usr_admin",
      name: "Manoj Prajapati (Admin)",
      mobile: "+919876543210",
      email: "admin@filmpack.com",
      passwordHash: "admin123",
      role: "admin",
      status: "approved",
      createdDate: "2026-01-01T00:00:00.000Z",
      lastLogin: "2026-06-28T09:22:00.000Z"
    },
    {
      id: "usr_rec_1",
      name: "Uflex HR Team",
      mobile: "+919988776655",
      email: "recruiter@uflex.com",
      passwordHash: "recruiter123",
      role: "recruiter",
      status: "approved",
      createdDate: "2026-03-10T10:00:00.000Z",
      lastLogin: "2026-06-27T14:30:00.000Z",
      companyDetails: {
        companyName: "Uflex Limited",
        contactPerson: "Rajesh Sharma",
        mobile: "+919988776655",
        email: "recruiter@uflex.com"
      }
    },
    {
      id: "usr_rec_2",
      name: "Cosmo Films HR",
      mobile: "+918877665544",
      email: "recruiter.pending@cosmo.com",
      passwordHash: "recruiter123",
      role: "recruiter",
      status: "pending_approval",
      createdDate: "2026-06-25T11:00:00.000Z",
      companyDetails: {
        companyName: "Cosmo First Limited",
        contactPerson: "Anjali Gupta",
        mobile: "+918877665544",
        email: "recruiter.pending@cosmo.com"
      }
    },
    {
      id: "usr_app_1",
      name: "Ramesh Kumar",
      mobile: "+919111222333",
      email: "applicant@gmail.com",
      passwordHash: "applicant123",
      role: "applicant",
      status: "approved",
      createdDate: "2026-04-15T09:00:00.000Z",
      lastLogin: "2026-06-28T02:00:00.000Z"
    },
    {
      id: "usr_app_2",
      name: "Amit Patel",
      mobile: "+919222333444",
      email: "amit.patel@gmail.com",
      passwordHash: "applicant123",
      role: "applicant",
      status: "approved",
      createdDate: "2026-05-01T12:00:00.000Z"
    }
  ],
  jobs: [
    {
      id: "job_1",
      recruiterId: "usr_rec_1",
      title: "Extrusion Operator (BOPP/CPP)",
      companyName: "Uflex Limited",
      location: "Noida, UP",
      department: "Extrusion Operator",
      experience: "3-5 Years",
      education: "ITI Mechanical / Diploma in Plastic Technology",
      salary: "₹30,000 - ₹40,000 / Month",
      description: "We are looking for an experienced Extrusion Operator to run our high-speed BOPP and CPP production line. Candidates must have hands-on experience in temperature profiles, die adjustments, and corona treatment parameters.",
      vacancies: 3,
      deadline: "2026-08-15", // In the future
      status: "open",
      skillsRequired: ["BOPP Extrusion", "CPP Line Operations", "Corona Treatment", "Thickness Profiling", "Tension Control"],
      createdDate: "2026-06-01T08:00:00.000Z"
    },
    {
      id: "job_2",
      recruiterId: "usr_rec_1",
      title: "Flexographic Printing Machine Operator",
      companyName: "Uflex Limited",
      location: "Jammu, J&K",
      department: "Printing Operator",
      experience: "2-6 Years",
      education: "10th/ITI Printing Technology",
      salary: "₹28,000 - ₹35,000 / Month",
      description: "Seeking a printing operator proficient in 8-color CI Flexo machines. Responsible for color matching, ink viscosity control, registration adjustments, and ensuring print quality with minimum waste.",
      vacancies: 2,
      deadline: "2026-07-30", // In the future
      status: "open",
      skillsRequired: ["CI Flexo", "8-Color Printing", "Color Registration", "Ink Viscosity Control", "Flexo Plates"],
      createdDate: "2026-06-10T10:30:00.000Z"
    },
    {
      id: "job_3",
      recruiterId: "usr_rec_1",
      title: "Solventless Lamination Operator",
      companyName: "Uflex Limited",
      location: "Noida, UP",
      department: "Lamination Operator",
      experience: "4-7 Years",
      education: "ITI / Diploma",
      salary: "₹32,000 - ₹42,000 / Month",
      description: "Experienced operator needed for Nordmeccanica Solventless Lamination machine. Must understand adhesive mixing ratios, coating weights, web tension controls, and bonding checks.",
      vacancies: 1,
      deadline: "2026-05-15", // Expired - should be closed on query
      status: "open", // Will be closed dynamically
      skillsRequired: ["Solventless Lamination", "Adhesive Ratio Control", "Coating Weight Adjustment", "Tension Management", "Web Guiding Systems"],
      createdDate: "2026-04-10T11:00:00.000Z"
    },
    {
      id: "job_4",
      recruiterId: "usr_rec_1",
      title: "QC Engineer (Flexible Packaging)",
      companyName: "Uflex Limited",
      location: "Sanand, Gujarat",
      department: "QC Engineer",
      experience: "2-4 Years",
      education: "B.Sc Chemistry / CIPET Diploma",
      salary: "₹25,000 - ₹32,000 / Month",
      description: "Responsible for laboratory testing of films and laminates. Conduct Tensile strength, COF (Coefficient of Friction), OTR, WVTR, and bond strength testing. Document test reports and handle non-conformance logs.",
      vacancies: 2,
      deadline: "2026-07-15", // In the future
      status: "open",
      skillsRequired: ["COF Testing", "Tensile Strength", "OTR/WVTR Measuring", "ISO 9001 Documentation", "CIPET Lab Standards"],
      createdDate: "2026-06-15T09:00:00.000Z"
    }
  ],
  applications: [
    {
      id: "app_1",
      jobId: "job_1",
      applicantId: "usr_app_1",
      appliedDate: "2026-06-16T14:00:00.000Z",
      status: "Shortlisted",
      feedback: "Great hands-on knowledge of BOPP Extrusion, strong alignment with plastics technology diploma.",
      remarks: "I have 4 years of experience running BOPP lines in Gujarat. Relocating to Noida soon.",
      formData: {
        fullName: "Ramesh Kumar",
        mobile: "+919111222333",
        email: "applicant@gmail.com",
        currentLocation: "Baroda, Gujarat",
        preferredLocation: "Noida, UP",
        qualification: "Diploma in Plastic Technology (CIPET)",
        experience: "4 Years",
        currentCompany: "Jindal Poly Films",
        currentDesignation: "Junior Extrusion Operator",
        currentSalary: "₹24,000",
        expectedSalary: "₹32,000",
        noticePeriod: "15 Days",
        skills: ["BOPP Extrusion", "Corona Treatment", "Die Adjustments", "Tension Control"]
      },
      matchScore: 92,
      matchFeedback: "Strong matching on BOPP Extrusion and Corona Treatment. Education is a direct fit (CIPET Diploma). Experience levels match perfectly with the 3-5 years range."
    },
    {
      id: "app_2",
      jobId: "job_3",
      applicantId: "usr_app_2",
      appliedDate: "2026-05-10T15:30:00.000Z",
      status: "Applied",
      remarks: "Interested in the solventless operator role.",
      formData: {
        fullName: "Amit Patel",
        mobile: "+919222333444",
        email: "amit.patel@gmail.com",
        currentLocation: "Vapi, Gujarat",
        preferredLocation: "Noida, UP",
        qualification: "ITI Mechanical",
        experience: "5 Years",
        currentCompany: "Supreme Industries",
        currentDesignation: "Lamination Assistant",
        currentSalary: "₹26,000",
        expectedSalary: "₹35,000",
        noticePeriod: "Immediate",
        skills: ["Solventless Lamination", "Adhesive Ratio Control", "Coating Weight Adjustment", "Tension Management"]
      },
      matchScore: 88,
      matchFeedback: "Matches key lamination skills. Experience (5 Years) meets the 4-7 year requirement. Immediate availability is advantageous."
    }
  ],
  notifications: [
    {
      id: "not_1",
      userId: "usr_app_1",
      type: "whatsapp",
      recipient: "+919111222333",
      message: "Hello Ramesh Kumar, your application for 'Extrusion Operator (BOPP/CPP)' has been shortlisted! Recruiter feedback: Great hands-on knowledge. Expect an interview schedule soon.",
      sentAt: "2026-06-20T11:00:00.000Z"
    },
    {
      id: "not_2",
      userId: "usr_app_1",
      type: "email",
      recipient: "applicant@gmail.com",
      message: "Dear Ramesh, Uflex HR has changed your status to Shortlisted for Extrusion Operator (BOPP/CPP). Stay tuned for interview details.",
      sentAt: "2026-06-20T11:01:00.000Z"
    }
  ],
  interviews: [
    {
      id: "int_1",
      applicationId: "app_1",
      applicantId: "usr_app_1",
      recruiterId: "usr_rec_1",
      jobId: "job_1",
      title: "Technical Round - Extrusion Supervisor",
      dateTime: "2026-07-02T11:00:00",
      mode: "Online",
      linkOrLocation: "https://meet.google.com/abc-defg-hij",
      notes: "Be prepared to answer questions on temperature gradients for BOPP, melt filter cleaning cycle, and air knife parameters.",
      status: "scheduled"
    }
  ]
};

// Database class
class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = { ...INITIAL_DB };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(fileContent);
        if (!this.data.siteConfig) {
          this.data.siteConfig = INITIAL_SITE_CONFIG;
          this.save();
        }
        this.checkAndCloseExpiredJobs();
      } else {
        this.save();
      }
    } catch (error) {
      console.error('Failed to load database, using defaults', error);
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save database', error);
    }
  }

  // Automatically transition jobs to 'closed' if deadline is passed
  public checkAndCloseExpiredJobs() {
    let updated = false;
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    this.data.jobs = this.data.jobs.map(job => {
      if (job.status === 'open' && job.deadline < todayStr) {
        job.status = 'closed';
        updated = true;
      }
      return job;
    });
    if (updated) {
      this.save();
    }
  }

  // Users CRUD
  public getUsers(): User[] {
    this.load();
    return this.data.users;
  }

  public saveUsers(users: User[]) {
    this.data.users = users;
    this.save();
  }

  // Jobs CRUD
  public getJobs(): Job[] {
    this.load();
    this.checkAndCloseExpiredJobs();
    return this.data.jobs;
  }

  public saveJobs(jobs: Job[]) {
    this.data.jobs = jobs;
    this.save();
  }

  // Applications CRUD
  public getApplications(): Application[] {
    this.load();
    return this.data.applications;
  }

  public saveApplications(apps: Application[]) {
    this.data.applications = apps;
    this.save();
  }

  // Notifications
  public getNotifications(): Notification[] {
    this.load();
    return this.data.notifications;
  }

  public saveNotifications(notifications: Notification[]) {
    this.data.notifications = notifications;
    this.save();
  }

  // Interviews
  public getInterviews(): Interview[] {
    this.load();
    return this.data.interviews;
  }

  public saveInterviews(interviews: Interview[]) {
    this.data.interviews = interviews;
    this.save();
  }

  // Site Config
  public getSiteConfig(): SiteConfig {
    this.load();
    const cfg = this.data.siteConfig || INITIAL_SITE_CONFIG;
    const socialLinks = cfg.socialLinks || cfg.footer?.socialLinks || INITIAL_SITE_CONFIG.footer.socialLinks!;
    const showcaseImages = (cfg.showcaseImages || INITIAL_SITE_CONFIG.showcaseImages).map(img => ({
      ...img,
      specs: Array.isArray(img.specs) ? img.specs.join(" • ") : (img.specs || "")
    }));
    return {
      ...cfg,
      header: {
        ...INITIAL_SITE_CONFIG.header,
        ...cfg.header,
        plantsLiveCount: cfg.header?.plantsLiveCount || cfg.header?.livePlantsCount || "● 14 PLANTS LIVE",
        livePlantsCount: cfg.header?.livePlantsCount || cfg.header?.plantsLiveCount || "● 14 PLANTS LIVE",
      },
      footer: {
        ...INITIAL_SITE_CONFIG.footer,
        ...cfg.footer,
        copyrightText: cfg.footer?.copyrightText || cfg.footer?.copyrightName || "© 2026 FilmPack Alliance India. All Rights Reserved.",
        copyrightName: cfg.footer?.copyrightName || cfg.footer?.copyrightText || "FilmPack Packaging Film Business Alliance",
        addressText: cfg.footer?.addressText || cfg.footer?.contactAddress || "FilmPack Tower, Film City, Noida, UP 201301",
        contactAddress: cfg.footer?.contactAddress || cfg.footer?.addressText || "Industrial Packaging Area, Phase-4, Mumbai, India",
        socialLinks
      },
      socialLinks,
      showcaseImages
    };
  }

  public saveSiteConfig(config: SiteConfig) {
    const socialLinks = config.socialLinks || config.footer?.socialLinks || INITIAL_SITE_CONFIG.footer.socialLinks!;
    const showcaseImages = (config.showcaseImages || INITIAL_SITE_CONFIG.showcaseImages).map(img => ({
      ...img,
      specs: Array.isArray(img.specs) ? img.specs.join(" • ") : (img.specs || "")
    }));
    this.data.siteConfig = {
      ...config,
      header: {
        ...config.header,
        plantsLiveCount: config.header?.plantsLiveCount || config.header?.livePlantsCount || "● 14 PLANTS LIVE",
        livePlantsCount: config.header?.livePlantsCount || config.header?.plantsLiveCount || "● 14 PLANTS LIVE",
      },
      footer: {
        ...config.footer,
        copyrightText: config.footer?.copyrightText || config.footer?.copyrightName || "© 2026 FilmPack Alliance India. All Rights Reserved.",
        copyrightName: config.footer?.copyrightName || config.footer?.copyrightText || "FilmPack Packaging Film Business Alliance",
        addressText: config.footer?.addressText || config.footer?.contactAddress || "FilmPack Tower, Film City, Noida, UP 201301",
        contactAddress: config.footer?.contactAddress || config.footer?.addressText || "Industrial Packaging Area, Phase-4, Mumbai, India",
        socialLinks
      },
      socialLinks,
      showcaseImages
    };
    this.save();
  }
}

export const db = new Database();
