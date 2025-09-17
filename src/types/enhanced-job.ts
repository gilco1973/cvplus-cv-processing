// @ts-ignore
/**
 * Enhanced Job Models - Main Interface
 * 
 * Core enhanced job interface and related models for CV enhancement features.
 * Properly modularized to maintain <200 line compliance through separation of concerns.
 * 
 * @author Gil Klainert
 * @version 1.0.0
  */

// Import and re-export core enhanced job interface
export type { EnhancedJob } from './enhanced-job-core';

// Media-related types - implemented locally to avoid module resolution issues
export interface PortfolioImage {
  /** Unique identifier for the portfolio image  */
  id: string;
  /** Full-size image URL  */
  url: string;
  /** Optimized thumbnail URL for previews  */
  thumbnailUrl: string;
  /** Image title for display  */
  title: string;
  /** Optional detailed description  */
  description?: string;
  /** Category for grouping (e.g., "Web Design", "Photography")  */
  category: string;
  /** Tags for filtering and search  */
  tags: string[];
  /** Optional URL to related project or case study  */
  projectUrl?: string;
  /** Upload timestamp  */
  uploadedAt: Date;
  /** Display order for sorting  */
  order: number;
}

export interface CalendarSettings {
  /** Whether calendar integration is enabled  */
  enabled: boolean;
  /** Calendar service provider  */
  provider: 'calendly' | 'google' | 'outlook';
  /** Calendar URL for bookings  */
  calendarUrl?: string;
  /** Available time slots configuration  */
  availableSlots?: string[];
  /** User's timezone  */
  timeZone: string;
  /** Available meeting types and configurations  */
  meetingTypes: Array<{
    /** Meeting type identifier  */
    type: string;
    /** Duration in minutes  */
    duration: number;
    /** Description of the meeting type  */
    description: string;
  }>;
}

export interface Testimonial {
  /** Unique identifier  */
  id: string;
  /** Recommender's full name  */
  name: string;
  /** Recommender's job title  */
  title: string;
  /** Company or organization name  */
  company: string;
  /** Testimonial text content  */
  content: string;
  /** Optional star rating (1-5)  */
  rating?: number;
  /** Optional profile image URL  */
  imageUrl?: string;
  /** Optional LinkedIn profile URL  */
  linkedinUrl?: string;
  /** Whether this testimonial has been verified  */
  isVerified: boolean;
  /** Creation timestamp  */
  createdAt: Date;
  /** Display order for testimonials carousel  */
  order: number;
}

// Import personality profile from modular file
export type { PersonalityProfile } from './personality-profile';

// Import and re-export skills and certification types
export type {
  SkillsVisualization,
  SkillCategory,
  LanguageSkill,
  Certification
} from './enhanced-skills';

// Privacy settings type (kept here as it's small and job-specific)
export interface PrivacySettings {
  /** Show contact information publicly  */
  showContactInfo: boolean;
  
  /** Show social media links  */
  showSocialLinks: boolean;
  
  /** Allow CV download by visitors  */
  allowCVDownload: boolean;
  
  /** Show analytics data to profile visitors  */
  showAnalytics: boolean;
  
  /** Allow visitors to send chat messages  */
  allowChatMessages: boolean;
  
  /** Make profile publicly accessible  */
  publicProfile: boolean;
  
  /** Allow profile to be found in search engines  */
  searchable: boolean;
  
  /** Display personality profile section  */
  showPersonalityProfile: boolean;
  
  /** Display testimonials section  */
  showTestimonials: boolean;
  
  /** Display portfolio section  */
  showPortfolio: boolean;
  
  /** Privacy level enabled  */
  enabled?: boolean;
  
  /** Masking rules for sensitive information  */
  maskingRules?: {
    maskEmail?: boolean;
    maskPhone?: boolean;
    maskAddress?: boolean;
  };
  
  /** Whether to show public email  */
  publicEmail?: boolean;
  
  /** Whether to show public phone  */
  publicPhone?: boolean;
  
  /** Require contact form submission before allowing CV download  */
  requireContactFormForCV: boolean;
}

// All enhanced job model interfaces are now properly modularized
// This provides a clean main interface while maintaining type safety
// and clear separation of concerns across logical boundaries