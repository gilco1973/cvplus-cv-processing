/**
 * Job-related types for admin validation services
 *
 * @author Gil Klainert
 * @version 1.0.0
  */

export interface Job {
  /** Unique job identifier */
  id: string;
  /** User ID who owns this job */
  userId: string;
  /** CV/Resume data for this job application */
  cvData?: ParsedCV;
  /** Job posting this CV is targeting */
  jobPosting?: JobPosting;
  /** Current processing status */
  status: 'draft' | 'processing' | 'completed' | 'failed';
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Analysis results */
  analysisResults?: CVAnalysisResult[];
  /** Match results against job postings */
  matchResults?: JobMatchResult[];
}

export interface ParsedCV {
  id?: string;
  userId?: string;
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  };
  summary?: string;
  experience?: Array<{
    jobTitle?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    achievements?: string[];
  }>;
  education?: Array<{
    degree?: string;
    institution?: string;
    location?: string;
    graduationDate?: string;
    gpa?: string;
    achievements?: string[];
  }>;
  skills?: {
    technical?: string[];
    soft?: string[];
    languages?: Array<{
      language: string;
      proficiency: string;
    }>;
  };
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate?: string;
    expiryDate?: string;
    credentialId?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
  }>;
  awards?: Array<{
    title: string;
    issuer: string;
    date?: string;
    description?: string;
  }>;
  publications?: Array<{
    title: string;
    publication: string;
    date?: string;
    url?: string;
  }>;
  volunteerWork?: Array<{
    organization: string;
    role: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    version?: string;
    source?: string;
  };
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  preferredQualifications?: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  industry: string;
  skills: string[];
  benefits?: string[];
  postedDate: string;
  applicationDeadline?: string;
  remote: boolean;
  visaSponsorship?: boolean;
}

export interface CVAnalysisResult {
  id: string;
  cvId: string;
  jobId?: string;
  score: number;
  recommendations: Array<{
    type: 'improvement' | 'strength' | 'warning';
    category: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  atsCompatibility: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  skillsMatch?: {
    matched: string[];
    missing: string[];
    score: number;
  };
  analysis: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  metadata: {
    analyzedAt: string;
    version: string;
    processingTime: number;
  };
}

export interface JobMatchResult {
  jobId: string;
  cvId: string;
  matchScore: number;
  skillsMatch: {
    matched: string[];
    missing: string[];
    percentage: number;
  };
  experienceMatch: {
    score: number;
    details: string;
  };
  locationMatch: {
    score: number;
    distance?: number;
  };
  recommendations: string[];
  ranking: number;
  confidence: number;
}