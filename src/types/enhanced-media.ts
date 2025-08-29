/**
 * Enhanced Media Types
 * Multimedia content management and processing capabilities
 */

export interface MediaAsset {
  id: string;
  type: MediaType;
  url: string;
  filename: string;
  size: number;
  metadata: MediaMetadata;
  createdAt: number;
  updatedAt: number;
}

export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'podcast';

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number;
  format: string;
  quality: string;
  compressed: boolean;
  thumbnail?: string;
}

export interface MediaProcessingOptions {
  resize?: {
    width: number;
    height: number;
    quality?: number;
  };
  compress?: boolean;
  format?: string;
  generateThumbnail?: boolean;
}

export interface MediaUploadRequest {
  file: File | Buffer;
  options?: MediaProcessingOptions;
  folder?: string;
  public?: boolean;
}

export interface MediaUploadResponse {
  asset: MediaAsset;
  uploadUrl?: string;
  publicUrl: string;
}

export interface MediaGallery {
  id: string;
  name: string;
  assets: MediaAsset[];
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PodcastEpisode extends MediaAsset {
  title: string;
  description: string;
  transcript?: string;
  chapters?: PodcastChapter[];
}

export interface PodcastChapter {
  title: string;
  startTime: number;
  endTime: number;
  description?: string;
}

export interface PortfolioImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail: string;
  metadata: MediaMetadata;
  tags: string[];
  order: number;
}

export interface CalendarSettings {
  enabled: boolean;
  provider: 'calendly' | 'google' | 'outlook';
  publicUrl?: string;
  availabilityWindow: {
    start: number; // days
    end: number; // days
  };
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  day: string;
  start: string; // HH:mm format
  end: string; // HH:mm format
  timezone: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  content: string;
  rating?: number;
  date: number;
  verified: boolean;
  avatar?: string;
}

export interface PersonalityProfile {
  id: string;
  traits: PersonalityTrait[];
  summary: string;
  strengths: string[];
  workingStyle: string[];
  communicationStyle: string;
  leadership: LeadershipStyle;
  teamwork: TeamworkStyle;
}

export interface PersonalityTrait {
  name: string;
  score: number; // 0-100
  description: string;
  category: 'cognitive' | 'behavioral' | 'emotional' | 'social';
}

export interface LeadershipStyle {
  primary: string;
  secondary?: string;
  description: string;
  effectiveness: number;
}

export interface TeamworkStyle {
  preference: 'individual' | 'collaborative' | 'balanced';
  communication: 'direct' | 'diplomatic' | 'analytical';
  decisionMaking: 'quick' | 'deliberate' | 'consensus';
}