export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
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
  department: string;
  experience: string;
  education: string;
  salary: string;
  description: string;
  vacancies: number;
  deadline: string;
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
  resumeUrl?: string;
  photoUrl?: string;
  remarks?: string;
  formData: {
    fullName: string;
    mobile: string;
    email: string;
    currentLocation: string;
    preferredLocation: string;
    qualification: string;
    experience: string;
    currentCompany: string;
    currentDesignation: string;
    currentSalary: string;
    expectedSalary: string;
    noticePeriod: string;
    skills: string[];
  };
  matchScore?: number;
  matchFeedback?: string;
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
  mode: string;
  linkOrLocation: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface AdminStats {
  totalApplicants: number;
  totalRecruiters: number;
  openJobs: number;
  closedJobs: number;
  applicationsReceived: number;
  hiredCandidates: number;
}
