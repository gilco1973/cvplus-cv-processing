// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Core CV data types and interfaces
 * 
 * This module defines the core types used throughout the CV processing system
 * for representing CV data, metadata, and structure.
 */

// Re-export shared CV types for convenience
export type {
  CVData,
  CVMetadata,
  CVStatus,
  ProcessingType
} from '../shared/types';

// Extended CV types specific to processing
export interface ExtendedCVData {
  id: string;
  userId: string;
  content: string;
  metadata: CVMetadata;
  status: CVStatus;
  createdAt: Date;
  updatedAt: Date;
  processedSections?: CVSectionData[];
  analysisResults?: CVAnalysisResults;
  templateData?: CVTemplateData;
  exportUrls?: CVExportUrls;
}

export interface CVSectionData {
  id: string;
  type: CVSectionType;
  title: string;
  content: string;
  order: number;
  isVisible: boolean;
  metadata?: Record<string, any>;
}

export enum CVSectionType {
  PERSONAL_INFO = 'personal_info',
  SUMMARY = 'summary',
  EXPERIENCE = 'experience',
  EDUCATION = 'education',
  SKILLS = 'skills',
  CERTIFICATIONS = 'certifications',
  PROJECTS = 'projects',
  LANGUAGES = 'languages',
  CUSTOM = 'custom'
}

export interface CVAnalysisResults {
  overallScore: number;
  sectionScores: Record<string, number>;
  keywords: string[];
  suggestions: CVSuggestion[];
  atsCompatibility: ATSCompatibilityScore;
  readabilityScore: number;
}

export interface CVSuggestion {
  id: string;
  type: 'improvement' | 'warning' | 'critical';
  section: string;
  title: string;
  description: string;
  actionable: boolean;
  priority: number;
}

export interface ATSCompatibilityScore {
  score: number;
  factors: ATSFactor[];
  recommendations: string[];
}

export interface ATSFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
}

export interface CVTemplateData {
  templateId: string;
  name: string;
  category: string;
  settings: TemplateSettings;
  customizations?: Record<string, any>;
}

export interface TemplateSettings {
  colors: ColorScheme;
  fonts: FontSettings;
  layout: LayoutSettings;
  spacing: SpacingSettings;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

export interface FontSettings {
  heading: string;
  body: string;
  size: FontSizes;
}

export interface FontSizes {
  small: number;
  medium: number;
  large: number;
  xlarge: number;
}

export interface LayoutSettings {
  columns: number;
  headerHeight: number;
  sectionSpacing: number;
}

export interface SpacingSettings {
  margin: number;
  padding: number;
  lineHeight: number;
}

export interface CVExportUrls {
  pdf?: string;
  html?: string;
  docx?: string;
  json?: string;
  preview?: string;
}

// Re-import types for internal use (to avoid unused import warnings)
import type { CVData, CVMetadata, CVStatus } from '../shared/types';

// Utility to prevent unused variable warnings
export const _internalTypeCheck = (
  _cvData: CVData, 
  _cvMetadata: CVMetadata, 
  _cvStatus: CVStatus
): void => {
  // This function ensures TypeScript doesn't complain about unused imports
};