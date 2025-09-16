// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Enhanced Analytics Types
 * Comprehensive tracking and analysis capabilities
 */

export interface FeatureInteraction {
  id: string;
  userId: string;
  feature: string;
  action: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsMetrics {
  pageViews: number;
  uniqueVisitors: number;
  engagement: EngagementMetrics;
  conversion: ConversionMetrics;
}

export interface EngagementMetrics {
  averageSessionDuration: number;
  bounceRate: number;
  pagesPerSession: number;
  interactions: number;
}

export interface ConversionMetrics {
  conversionRate: number;
  goals: GoalMetrics[];
  funnelStages: FunnelStage[];
}

export interface GoalMetrics {
  name: string;
  completions: number;
  value: number;
}

export interface FunnelStage {
  stage: string;
  users: number;
  conversionRate: number;
}

export interface UserAnalytics {
  userId: string;
  sessions: SessionData[];
  totalEngagement: EngagementMetrics;
  lastActivity: number;
}

export interface SessionData {
  sessionId: string;
  startTime: number;
  endTime: number;
  pages: string[];
  events: AnalyticsEvent[];
}

export interface AnalyticsEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}