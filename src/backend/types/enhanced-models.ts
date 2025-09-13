// Re-export ParsedCV from job types for compatibility
export { ParsedCV } from "../../types/job";


/**
 * Enhanced Models for CV Processing
 */
import { CVData } from '../../types/autonomous-cv.types';

export interface EnhancedJob {
  id: string;
  userId: string;
  title: string;
  company: string;
  industry?: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  achievements?: string[];
  skills?: string[];
  responsibilities?: string[];
  technologies?: string[];
  location?: string;
  remote?: boolean;
  contractType?: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  parsedData?: CVData;
  enhancedFeatures?: EnhancedFeatures;
}

export interface EnhancedCVData extends CVData {
  enhancedFeatures?: EnhancedFeatures;
  processingMetadata?: ProcessingMetadata;
  qualityScore?: QualityScore;
  optimizations?: CVOptimizations;
}

export interface EnhancedFeatures {
  achievementHighlighting?: AchievementHighlighting[];
  skillsVisualization?: SkillVisualization;
  industryOptimization?: IndustryOptimization;
  atsOptimization?: ATSOptimization;
  personalityInsights?: PersonalityInsights;
  languageProficiency?: LanguageProficiency[];
  regionalOptimization?: RegionalOptimization;
  timeline?: TimelineVisualization;
}

export interface AchievementHighlighting {
  id: string;
  title: string;
  description: string;
  impact: string;
  metrics?: AchievementMetrics;
  category: 'career' | 'education' | 'project' | 'certification' | 'volunteer';
  confidence: number;
  significance: number;
  suggestions?: string[];
}

export interface AchievementMetrics {
  quantifiable: boolean;
  impactScore: number;
  relevanceScore: number;
  originalText: string;
  enhancedText: string;
  length: number;
}

export interface SkillVisualization {
  technicalSkills: SkillCategory[];
  softSkills: SkillCategory[];
  industrySkills: SkillCategory[];
  emergingSkills: SkillCategory[];
}

export interface SkillCategory {
  category: string;
  skills: Skill[];
  proficiencyLevel: number;
  marketDemand: number;
}

export interface Skill {
  name: string;
  proficiency: number;
  yearsExperience?: number;
  certifications?: string[];
  marketValue: number;
  trend: 'growing' | 'stable' | 'declining';
}

export interface IndustryOptimization {
  targetIndustry: string;
  relevanceScore: number;
  keywordOptimization: KeywordOptimization[];
  industryTrends: IndustryTrend[];
  recommendations: OptimizationRecommendation[];
}

export interface KeywordOptimization {
  keyword: string;
  frequency: number;
  importance: number;
  context: string[];
  suggestions: string[];
}

export interface IndustryTrend {
  trend: string;
  relevance: number;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ATSOptimization {
  score: number;
  overall: number;
  keywordMatches: KeywordMatch[];
  formatOptimization: FormatOptimization;
  recommendations: ATSRecommendation[];
}

export interface KeywordMatch {
  keyword: string;
  found: boolean;
  frequency: number;
  context: string;
  importance: number;
}

export interface FormatOptimization {
  structure: number;
  readability: number;
  keywords: number;
  formatting: number;
  recommendations: string[];
}

export interface ATSRecommendation {
  type: 'keyword' | 'format' | 'structure' | 'content';
  priority: 'high' | 'medium' | 'low';
  description: string;
  implementation: string;
}

export interface PersonalityInsights {
  traits: PersonalityTrait[];
  workStyle: WorkStyle;
  communicationStyle: CommunicationStyle;
  leadershipStyle?: LeadershipStyle;
  recommendations: PersonalityRecommendation[];
}

export interface PersonalityTrait {
  trait: string;
  score: number;
  description: string;
  examples: string[];
}

export interface WorkStyle {
  preference: 'independent' | 'collaborative' | 'mixed';
  environment: 'remote' | 'office' | 'hybrid';
  pace: 'fast' | 'steady' | 'methodical';
  decisionMaking: 'analytical' | 'intuitive' | 'collaborative';
}

export interface CommunicationStyle {
  style: 'direct' | 'diplomatic' | 'enthusiastic' | 'analytical';
  channels: string[];
  strengths: string[];
  areas: string[];
}

export interface LeadershipStyle {
  style: string;
  strengths: string[];
  development: string[];
  suitableRoles: string[];
}

export interface PersonalityRecommendation {
  category: string;
  suggestion: string;
  rationale: string;
  priority: number;
}

export interface LanguageProficiency {
  language: string;
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'beginner';
  certifications?: LanguageCertification[];
  businessProficiency: boolean;
  marketValue: number;
}

export interface LanguageCertification {
  name: string;
  level: string;
  issuer: string;
  date?: string;
  expiryDate?: string;
}

export interface RegionalOptimization {
  targetRegion: string;
  culturalAdaptations: CulturalAdaptation[];
  marketRequirements: MarketRequirement[];
  localizations: Localization[];
}

export interface CulturalAdaptation {
  aspect: string;
  current: string;
  recommended: string;
  rationale: string;
}

export interface MarketRequirement {
  requirement: string;
  importance: number;
  compliance: boolean;
  recommendations: string[];
}

export interface Localization {
  element: string;
  original: string;
  localized: string;
  context: string;
}

export interface TimelineVisualization {
  events: TimelineEvent[];
  milestones: Milestone[];
  gaps: CareerGap[];
  progression: CareerProgression;
}

export interface TimelineEvent {
  id: string;
  date: Date;
  type: 'job' | 'education' | 'project' | 'certification' | 'achievement';
  title: string;
  description: string;
  duration?: number;
  impact?: number;
}

export interface Milestone {
  id: string;
  date: Date;
  achievement: string;
  significance: number;
  context: string;
}

export interface CareerGap {
  startDate: Date;
  endDate: Date;
  duration: number;
  reason?: string;
  impact: 'positive' | 'neutral' | 'negative';
  explanation?: string;
}

export interface CareerProgression {
  trajectory: 'ascending' | 'stable' | 'lateral' | 'declining';
  growthRate: number;
  consistencyScore: number;
  projectedNext: string[];
}

export interface ProcessingMetadata {
  processedAt: Date;
  processingTime: number;
  version: string;
  features: string[];
  qualityChecks: QualityCheck[];
}

export interface QualityCheck {
  check: string;
  passed: boolean;
  score?: number;
  recommendations?: string[];
}

export interface QualityScore {
  overall: number;
  completeness: number;
  relevance: number;
  impact: number;
  presentation: number;
  atsCompatibility: number;
}

export interface CVOptimizations {
  applied: AppliedOptimization[];
  suggested: SuggestedOptimization[];
  performanceMetrics: PerformanceMetrics;
}

export interface AppliedOptimization {
  type: string;
  description: string;
  impact: number;
  confidence: number;
}

export interface SuggestedOptimization {
  type: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
  implementation: string;
}

export interface PerformanceMetrics {
  readabilityScore: number;
  keywordDensity: number;
  lengthOptimization: number;
  structureScore: number;
  visualAppeal: number;
}

export interface OptimizationRecommendation {
  id: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  implementation: string;
  expectedImpact: number;
  category: string;
}

// Additional missing interfaces for ATS optimization
export interface ATSOptimizationResult {
  score: number;
  recommendations: OptimizationRecommendation[];
  keywordMatches: KeywordMatch[];
  formatOptimization: FormatOptimization;
  industryOptimization: IndustryOptimization;
}

export interface AdvancedATSScore {
  overall: number;
  keywords: number;
  format: number;
  experience: number;
  skills: number;
  education: number;
  details: {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
  };
}

export interface SemanticKeywordAnalysis {
  totalKeywords: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  keywordDensity: number;
  semanticMatches: Array<{
    keyword: string;
    synonyms: string[];
    relevance: number;
  }>;
}

export interface CompetitorAnalysis {
  averageScore: number;
  topPerformers: Array<{
    score: number;
    keyFeatures: string[];
  }>;
  benchmarkGaps: string[];
  recommendations: string[];
}

export interface PrioritizedRecommendation extends OptimizationRecommendation {
  weight: number;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
}

export interface ATSSystemSimulation {
  systemType: string;
  passRate: number;
  failureReasons: string[];
  simulatedScore: number;
  recommendations: PrioritizedRecommendation[];
}