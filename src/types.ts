export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
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
  profileDefaults?: any;
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
    logoUrl?: string;
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
      line?: string;
    };
  };
  socialLinks?: {
    instagram: string;
    facebook: string;
    whatsapp: string;
    linkedin: string;
    line?: string;
  };
  stats?: {
    plantsLiveValue?: string;
    plantsLiveLabel?: string;
    lineSpeedValue?: string;
    lineSpeedLabel?: string;
    certifiedValue?: string;
    certifiedLabel?: string;
    maxSalaryValue?: string;
    maxSalaryLabel?: string;
  };
  pillarsTitle?: string;
  pillarsSubtitle?: string;
  pillars?: Array<{
    id: string;
    title: string;
    description: string;
    minExp: string;
    tag: string;
    icon: string;
  }>;
  confidentialAttachments?: Array<{
    id: string;
    title: string;
    type: 'link' | 'text' | 'image';
    content: string;
    dateAdded: string;
  }>;
  jobCategories?: string[];
  showcaseImages: ShowcaseImage[];
  tickerItems: TickerItem[];
}

export interface NewsletterItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  imageUrl?: string;
  sourceUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  publishedDate?: string;
  createdDate: string;
  isAiGenerated: boolean;
  topic?: string;
}


