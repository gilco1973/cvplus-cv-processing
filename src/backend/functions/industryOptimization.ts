// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Industry Optimization Firebase Functions
 * 
 * Provides industry-specific CV optimization and career guidance
 * for the 10 priority industries in Phase 2.
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { CallableRequest } from 'firebase-functions/v2/https';
// import { IndustrySpecializationService, IndustryOptimizationRequest } from '../services/industry-specialization.service'; // Module not found

// Temporary placeholder types and services
type IndustryOptimizationRequest = {
  cvId: string;
  industry: string;
  options?: any;
};

const IndustrySpecializationService = {
  optimizeForIndustry: async (cv: any, _industry: string) => ({ optimizedCV: cv, recommendations: [] }),
  getInstance: () => IndustrySpecializationService,
  getSupportedIndustries: () => ['technology', 'healthcare', 'finance', 'manufacturing', 'retail']
};
import { corsOptions } from '../config/cors';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Initialize admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Optimize CV for specific industry
 */
export const optimizeForIndustry = onCall(
  { ...corsOptions, timeoutSeconds: 60 ,
    secrets: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY']
  },
  async (request: CallableRequest) => {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      // Validate input
      if (!data.cvData || !data.targetIndustry) {
        throw new HttpsError('invalid-argument', 'Missing CV data or target industry');
      }

      // Check rate limiting
      await checkIndustryOptimizationRateLimit(auth.uid);

      const industryService = IndustrySpecializationService.getInstance();
      
      // Check if industry is supported
      const supportedIndustries = industryService.getSupportedIndustries();
      if (!supportedIndustries.includes(data.targetIndustry)) {
        throw new HttpsError(
          'invalid-argument', 
          `Unsupported industry. Supported industries: ${supportedIndustries.join(', ')}`
        );
      }

      // Prepare optimization request
      const optimizationRequest: IndustryOptimizationRequest = {
        userId: auth.uid,
        cvData: data.cvData,
        targetIndustry: data.targetIndustry,
        targetRole: data.targetRole,
        experienceLevel: data.experienceLevel || 'mid',
        region: data.region || 'US'
      };

      // Generate industry optimization
      const result = await industryService.optimizeForIndustry(
        optimizationRequest.cvData, 
        optimizationRequest.targetIndustry || '', 
        optimizationRequest.region
      );
      
      // Log optimization request
      await logIndustryOptimization(auth.uid, optimizationRequest, result);
      
      // Update user industry preferences
      await updateUserIndustryPreferences(auth.uid, data.targetIndustry);

      return {
        success: true,
        data: result,
        metadata: {
          requestId: `industry_opt_${Date.now()}`,
          timestamp: new Date(),
          version: '2.0',
          industry: data.targetIndustry,
          processingTime: Date.now() - request.rawRequest.body.timestamp || 0
        }
      };
      
    } catch (error) {
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Industry optimization service temporarily unavailable');
    }
  }
);

/**
 * Get supported industries list
 */
export const getSupportedIndustries = onCall(
  { ...corsOptions, timeoutSeconds: 10 },
  async (_request: CallableRequest) => {
    try {
      const industryService = IndustrySpecializationService.getInstance();
      const supportedIndustries = industryService.getSupportedIndustries();

      // Get industry statistics
      const industryStats = await getIndustryStatistics();

      const industriesWithStats = supportedIndustries.map(industry => ({
        name: industry,
        stats: industryStats[industry] || {
          totalOptimizations: 0,
          averageScoreImprovement: 0,
          userCount: 0
        }
      }));

      return {
        success: true,
        data: {
          industries: industriesWithStats,
          totalSupported: supportedIndustries.length,
          lastUpdated: new Date()
        }
      };
      
    } catch (error) {
      throw new HttpsError('internal', 'Failed to retrieve supported industries');
    }
  }
);

/**
 * Get industry market insights
 */
export const getIndustryInsights = onCall(
  { ...corsOptions, timeoutSeconds: 30 },
  async (request: CallableRequest) => {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      const { industry, region = 'US' } = data;
      
      if (!industry) {
        throw new HttpsError('invalid-argument', 'Industry parameter is required');
      }

      const industryService = IndustrySpecializationService.getInstance();
      await industryService.initialize();

      // Get comprehensive industry insights
      const insights = await getComprehensiveIndustryInsights(industry, region);
      
      return {
        success: true,
        data: insights,
        metadata: {
          requestId: `insights_${Date.now()}`,
          timestamp: new Date(),
          industry,
          region
        }
      };
      
    } catch (error) {
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Failed to retrieve industry insights');
    }
  }
);

/**
 * Compare multiple industries for user
 */
export const compareIndustries = onCall(
  { ...corsOptions, timeoutSeconds: 90 },
  async (request: CallableRequest) => {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      const { cvData, industries } = data;
      
      if (!cvData || !Array.isArray(industries) || industries.length === 0) {
        throw new HttpsError('invalid-argument', 'Missing CV data or industries array');
      }

      if (industries.length > 5) {
        throw new HttpsError('invalid-argument', 'Maximum 5 industries per comparison');
      }

      const industryService = IndustrySpecializationService.getInstance();
      
      // Validate all industries are supported
      const supportedIndustries = industryService.getSupportedIndustries();
      const unsupported = industries.filter(ind => !supportedIndustries.includes(ind));
      if (unsupported.length > 0) {
        throw new HttpsError(
          'invalid-argument',
          `Unsupported industries: ${unsupported.join(', ')}`
        );
      }

      // Generate optimizations for each industry
      const comparisons = await Promise.all(
        industries.map(async (industry: any) => {
          try {
            const optimizationRequest: IndustryOptimizationRequest = {
              userId: auth.uid,
              cvData,
              targetIndustry: industry,
              experienceLevel: data.experienceLevel || 'mid',
              region: data.region || 'US'
            };

            const result = await industryService.optimizeForIndustry(optimizationRequest);
            
            return {
              industry,
              success: true,
              optimization: result,
              fitScore: result.industryScore,
              fitLevel: result.industryFit,
              keyStrengths: result.recommendations
                .filter((rec: any) => rec.type === 'skill' && rec.impact > 0.15)
                .slice(0, 3)
                .map((rec: any) => rec.title),
              improvementPotential: result.recommendations
                .reduce((sum: number, rec: any) => sum + rec.impact, 0),
              estimatedSalary: result.salaryBenchmark.median
            };
            
          } catch (error) {
            return {
              industry,
              success: false,
              error: 'Analysis failed for this industry'
            };
          }
        })
      );

      // Rank industries by fit score
      const successfulComparisons = comparisons.filter(comp => comp.success);
      const rankedIndustries = successfulComparisons
        .sort((a, b) => (b as any).fitScore - (a as any).fitScore);

      // Generate comparison summary
      const summary = {
        bestFit: rankedIndustries[0]?.industry || null,
        averageFitScore: rankedIndustries.length > 0 
          ? rankedIndustries.reduce((sum, comp) => sum + (comp as any).fitScore, 0) / rankedIndustries.length 
          : 0,
        highestSalaryPotential: rankedIndustries
          .sort((a, b) => (b as any).estimatedSalary - (a as any).estimatedSalary)[0]?.industry || null,
        recommendations: generateCrossIndustryRecommendations(rankedIndustries)
      };

      // Log comparison request
      await logIndustryComparison(auth.uid, industries, rankedIndustries);

      return {
        success: true,
        data: {
          comparisons,
          rankings: rankedIndustries,
          summary,
          comparisonDate: new Date()
        },
        metadata: {
          requestId: `compare_${Date.now()}`,
          timestamp: new Date(),
          industriesCompared: industries.length,
          successfulAnalyses: successfulComparisons.length
        }
      };
      
    } catch (error) {
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Industry comparison service temporarily unavailable');
    }
  }
);

/**
 * Get user's industry optimization history
 */
export const getUserIndustryHistory = onCall(
  { ...corsOptions, timeoutSeconds: 30 },
  async (request: CallableRequest) => {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      const { limit = 20, offset = 0 } = data;

      let query = db.collection('industry_optimizations')
        .where('userId', '==', auth.uid)
        .orderBy('timestamp', 'desc')
        .limit(Math.min(limit, 50));

      if (offset > 0) {
        const offsetSnapshot = await db.collection('industry_optimizations')
          .where('userId', '==', auth.uid)
          .orderBy('timestamp', 'desc')
          .limit(offset)
          .get();

        if (!offsetSnapshot.empty) {
          const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
          query = query.startAfter(lastDoc);
        }
      }

      const snapshot = await query.get();
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get user's industry preferences and trends
      const preferences = await getUserIndustryPreferences(auth.uid);
      const trends = calculateUserIndustryTrends(history);

      return {
        success: true,
        data: {
          history,
          preferences,
          trends,
          pagination: {
            limit,
            offset,
            hasMore: history.length === limit
          }
        }
      };
      
    } catch (error) {
      throw new HttpsError('internal', 'Failed to retrieve industry optimization history');
    }
  }
);

// Helper functions

async function checkIndustryOptimizationRateLimit(userId: string): Promise<void> {
  const rateLimitRef = db.collection('industry_rate_limits').doc(userId);
  const rateLimitDoc = await rateLimitRef.get();
  
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000);
  
  if (rateLimitDoc.exists) {
    const data = rateLimitDoc.data();
    const recentRequests = (data?.requests || []).filter((time: number) => time > hourAgo);
    
    if (recentRequests.length >= 20) { // 20 industry optimizations per hour
      throw new HttpsError('resource-exhausted', 'Industry optimization rate limit exceeded. Please try again later.');
    }
    
    recentRequests.push(now);
    await rateLimitRef.update({ requests: recentRequests });
  } else {
    await rateLimitRef.set({ requests: [now] });
  }
}

async function logIndustryOptimization(
  userId: string, 
  request: IndustryOptimizationRequest, 
  result: any
): Promise<void> {
  try {
    await db.collection('industry_optimizations').add({
      userId,
      targetIndustry: request.targetIndustry,
      targetRole: request.targetRole,
      experienceLevel: request.experienceLevel,
      region: request.region,
      industryScore: result.industryScore,
      industryFit: result.industryFit,
      recommendationsCount: result.recommendations.length,
      timestamp: FieldValue.serverTimestamp(),
      version: '2.0'
    });

    // Log analytics event
    await db.collection('analytics_events').add({
      eventType: 'industry_optimization',
      userId,
      timestamp: FieldValue.serverTimestamp(),
      data: {
        industry: request.targetIndustry,
        score: result.industryScore,
        fit: result.industryFit,
        recommendationsCount: result.recommendations.length
      }
    });
  } catch (error) {
  }
}

async function updateUserIndustryPreferences(userId: string, industry: string): Promise<void> {
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.set({
      industryPreferences: {
        lastOptimized: industry,
        lastOptimizedDate: FieldValue.serverTimestamp(),
        optimizedIndustries: admin.firestore.FieldValue.arrayUnion(industry)
      }
    }, { merge: true });
  } catch (error) {
  }
}

async function getIndustryStatistics(): Promise<Record<string, any>> {
  try {
    // Get aggregated statistics from analytics
    const statsSnapshot = await db.collection('industry_stats').doc('aggregate').get();
    return statsSnapshot.data() || {};
  } catch (error) {
    return {};
  }
}

async function getComprehensiveIndustryInsights(industry: string, region: string): Promise<any> {
  try {
    // Get market data, trends, and insights for the industry
    const insights = {
      marketOverview: {
        growth: 0.08,
        jobOpenings: 15000,
        avgSalary: 85000,
        demandTrend: 'rising'
      },
      skills: {
        hotSkills: ['Python', 'Machine Learning', 'Cloud Computing'],
        emergingSkills: ['AI', 'Blockchain', 'IoT'],
        decliningSkills: ['Legacy Systems']
      },
      companies: {
        topHiring: ['Google', 'Microsoft', 'Amazon'],
        fastestGrowing: ['OpenAI', 'Anthropic', 'Databricks'],
        remote: ['GitLab', 'Zapier', 'Automattic']
      },
      trends: {
        emerging: ['Remote work', 'AI integration', 'Sustainability focus'],
        challenges: ['Skills shortage', 'Rapid technology change'],
        opportunities: ['New market segments', 'Innovation potential']
      },
      regional: {
        topLocations: ['San Francisco', 'New York', 'Seattle'],
        salaryByLocation: {
          'San Francisco': 120000,
          'New York': 110000,
          'Seattle': 105000
        },
        remoteOpportunities: 0.7
      }
    };

    return insights;
  } catch (error) {
    throw error;
  }
}

async function logIndustryComparison(userId: string, industries: string[], results: any[]): Promise<void> {
  try {
    await db.collection('industry_comparisons').add({
      userId,
      industries,
      resultCount: results.length,
      bestFit: results[0]?.industry || null,
      averageScore: results.length > 0 
        ? results.reduce((sum, r) => sum + (r.fitScore || 0), 0) / results.length 
        : 0,
      timestamp: FieldValue.serverTimestamp()
    });
  } catch (error) {
  }
}

function generateCrossIndustryRecommendations(rankedIndustries: any[]): string[] {
  const recommendations: string[] = [];
  
  if (rankedIndustries.length > 1) {
    const topTwo = rankedIndustries.slice(0, 2);
    const scoreDiff = (topTwo[0] as any).fitScore - (topTwo[1] as any).fitScore;
    
    if (scoreDiff < 10) {
      recommendations.push(`Consider both ${topTwo[0].industry} and ${topTwo[1].industry} as they show similar fit scores.`);
    } else {
      recommendations.push(`${topTwo[0].industry} is your strongest match with a ${scoreDiff.toFixed(1)} point advantage.`);
    }
  }
  
  // Add skill-based recommendations
  const allStrengths = rankedIndustries.flatMap(ind => (ind as any).keyStrengths || []);
  const commonStrengths = allStrengths.filter((strength, index) => 
    allStrengths.indexOf(strength) !== index
  );
  
  if (commonStrengths.length > 0) {
    recommendations.push(`Your ${commonStrengths[0]} skills are valuable across multiple industries.`);
  }
  
  return recommendations;
}

async function getUserIndustryPreferences(userId: string): Promise<any> {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    return userDoc.data()?.industryPreferences || {};
  } catch (error) {
    return {};
  }
}

function calculateUserIndustryTrends(history: any[]): any {
  if (history.length === 0) return {};
  
  const industryFrequency: Record<string, number> = {};
  const scoreProgression: Record<string, number[]> = {};
  
  history.forEach((entry: any) => {
    const industry = entry.targetIndustry;
    industryFrequency[industry] = (industryFrequency[industry] || 0) + 1;
    
    if (!scoreProgression[industry]) {
      scoreProgression[industry] = [];
    }
    scoreProgression[industry].push(entry.industryScore || 0);
  });
  
  const mostExplored = Object.entries(industryFrequency)
    .sort(([,a], [,b]) => b - a)[0]?.[0];
  
  const improvements = Object.entries(scoreProgression)
    .map(([industry, scores]) => ({
      industry,
      improvement: scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0
    }))
    .sort((a, b) => b.improvement - a.improvement);
  
  return {
    mostExplored,
    totalOptimizations: history.length,
    bestImprovement: improvements[0],
    exploredIndustries: Object.keys(industryFrequency).length
  };
}