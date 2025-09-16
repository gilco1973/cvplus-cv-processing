// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Template Constants
 * 
 * Constants related to CV templates and customization.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import { TemplateCategory } from '../types';

// ============================================================================
// TEMPLATE CATEGORIES
// ============================================================================

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  TemplateCategory.MODERN,
  TemplateCategory.CLASSIC,
  TemplateCategory.CREATIVE,
  TemplateCategory.MINIMAL,
  TemplateCategory.PROFESSIONAL
];

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  [TemplateCategory.MODERN]: 'Modern',
  [TemplateCategory.CLASSIC]: 'Classic',
  [TemplateCategory.CREATIVE]: 'Creative',
  [TemplateCategory.MINIMAL]: 'Minimal',
  [TemplateCategory.PROFESSIONAL]: 'Professional',
  [TemplateCategory.TECHNICAL]: 'Technical',
  [TemplateCategory.ACADEMIC]: 'Academic',
  [TemplateCategory.BUSINESS]: 'Business',
  [TemplateCategory.CORPORATE_PROFESSIONAL]: 'Corporate Professional',
  [TemplateCategory.CREATIVE_PORTFOLIO]: 'Creative Portfolio',
  [TemplateCategory.TECHNICAL_EXPERT]: 'Technical Expert'
};

// ============================================================================
// DEFAULT TEMPLATE SETTINGS
// ============================================================================

export const DEFAULT_TEMPLATE_COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  accent: '#0ea5e9',
  text: '#1e293b',
  background: '#ffffff'
};

export const DEFAULT_TEMPLATE_FONTS = {
  heading: 'Inter',
  body: 'Inter'
};

// ============================================================================
// TEMPLATE FEATURE CATEGORIES
// ============================================================================

export const TEMPLATE_FEATURES = {
  BASIC: [
    'contact-info',
    'work-experience',
    'education',
    'skills'
  ],
  ENHANCED: [
    'profile-summary',
    'achievements',
    'certifications',
    'projects'
  ],
  PREMIUM: [
    'video-introduction',
    'portfolio-gallery',
    'testimonials',
    'analytics-tracking',
    'qr-code',
    'social-links',
    'custom-sections'
  ]
} as const;

// ============================================================================
// COLOR SCHEMES
// ============================================================================

export const PREDEFINED_COLOR_SCHEMES = {
  blue: {
    primary: '#2563eb',
    secondary: '#64748b', 
    accent: '#0ea5e9',
    text: '#1e293b',
    background: '#ffffff'
  },
  green: {
    primary: '#059669',
    secondary: '#6b7280',
    accent: '#10b981', 
    text: '#111827',
    background: '#ffffff'
  },
  purple: {
    primary: '#7c3aed',
    secondary: '#6b7280',
    accent: '#a855f7',
    text: '#111827', 
    background: '#ffffff'
  },
  red: {
    primary: '#dc2626',
    secondary: '#6b7280',
    accent: '#ef4444',
    text: '#111827',
    background: '#ffffff'
  },
  orange: {
    primary: '#ea580c',
    secondary: '#6b7280',
    accent: '#f97316',
    text: '#111827',
    background: '#ffffff'
  },
  gray: {
    primary: '#374151',
    secondary: '#6b7280',
    accent: '#4b5563',
    text: '#111827',
    background: '#ffffff'
  }
} as const;

// ============================================================================
// FONT COMBINATIONS
// ============================================================================

export const FONT_COMBINATIONS = {
  modern: {
    heading: 'Inter',
    body: 'Inter'
  },
  classic: {
    heading: 'Georgia',
    body: 'Georgia'
  },
  professional: {
    heading: 'Roboto',
    body: 'Roboto'
  },
  elegant: {
    heading: 'Playfair Display',
    body: 'Source Sans Pro'
  },
  minimal: {
    heading: 'Helvetica Neue',
    body: 'Helvetica Neue'
  },
  tech: {
    heading: 'JetBrains Mono',
    body: 'Source Code Pro'
  }
} as const;

// ============================================================================
// LAYOUT OPTIONS
// ============================================================================

export const LAYOUT_OPTIONS = {
  SINGLE_COLUMN: 'single-column',
  TWO_COLUMN: 'two-column',
  THREE_COLUMN: 'three-column',
  SIDEBAR_LEFT: 'sidebar-left',
  SIDEBAR_RIGHT: 'sidebar-right',
  HEADER_FOOTER: 'header-footer',
  TIMELINE: 'timeline',
  CARD_BASED: 'card-based'
} as const;

// ============================================================================
// SECTION ORDERING
// ============================================================================

export const DEFAULT_SECTION_ORDER = [
  'personal-info',
  'profile-summary', 
  'work-experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'achievements',
  'languages',
  'references'
];

export const FLEXIBLE_SECTION_ORDER = [
  'personal-info', // Always first
  'profile-summary', // Usually second
  // These can be reordered
  'work-experience',
  'education', 
  'skills',
  'projects',
  'certifications',
  'achievements',
  'languages',
  'references' // Usually last
];

// ============================================================================
// PREMIUM FEATURES
// ============================================================================

export const PREMIUM_TEMPLATE_FEATURES = [
  'video-introduction',
  'portfolio-gallery',
  'testimonials', 
  'analytics-tracking',
  'qr-code-generation',
  'social-media-links',
  'custom-css',
  'advanced-layouts',
  'interactive-elements',
  'multimedia-content'
] as const;

// ============================================================================
// TEMPLATE GENERATION SETTINGS
// ============================================================================

export const GENERATION_SETTINGS = {
  DEFAULT_WIDTH: 210, // A4 width in mm
  DEFAULT_HEIGHT: 297, // A4 height in mm
  DEFAULT_MARGIN: 20, // mm
  DEFAULT_DPI: 300,
  DEFAULT_FORMAT: 'pdf' as const,
  SUPPORTED_FORMATS: ['html', 'pdf', 'docx', 'png', 'jpg'] as const,
  MAX_PAGES: 5,
  QUALITY_SETTINGS: {
    draft: 150,
    standard: 300, 
    high: 600
  }
} as const;