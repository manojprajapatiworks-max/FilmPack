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
  status: 'pending_approval' | 'approved' | 'rejected' | 'disabled';
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

export interface DatabaseSchema {
  users: User[];
  jobs: Job[];
  applications: Application[];
  notifications: Notification[];
  interviews: Interview[];
}

const INITIAL_DB: DatabaseSchema = {
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
}

export const db = new Database();
