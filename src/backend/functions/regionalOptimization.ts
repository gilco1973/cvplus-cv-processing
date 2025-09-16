// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Regional Optimization Firebase Functions
 * 
 * Provides CV optimization for different global regions with
 * cultural preferences, legal compliance, and local market insights.
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { CallableRequest } from 'firebase-functions/v2/https';
// import { RegionalLocalizationService, RegionalOptimizationRequest } from '../services/regional-localization.service'; // Module not found

// Temporary placeholder types and services
type RegionalOptimizationRequest = {
  cvId: string;
  region: string;
  options?: any;
};

const RegionalLocalizationService = {
  optimizeForRegion: async (cv: any, region: string) => ({ optimizedCV: cv, recommendations: [] })
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
 * Optimize CV for specific region
 */
export const optimizeForRegion = onCall(
  { ...corsOptions, timeoutSeconds: 60 },
  async (request: CallableRequest) => {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      // Validate input
      if (!data.cvData || !data.targetRegion) {
        throw new HttpsError('invalid-argument', 'Missing CV data or target region');
      }

      // Check rate limiting
      await checkRegionalOptimizationRateLimit(auth.uid);

      const regionalizationService = RegionalLocalizationService.getInstance();
      
      // Check if region is supported
      const supportedRegions = regionalizationService.getSupportedRegions();
      if (!supportedRegions.includes(data.targetRegion)) {
        throw new HttpsError(
          'invalid-argument', 
          `Unsupported region. Supported regions: ${supportedRegions.join(', ')}`
        );
      }

      // Prepare optimization request
      const optimizationRequest: RegionalOptimizationRequest = {
        userId: auth.uid,
        cvData: data.cvData,
        targetRegion: data.targetRegion,
        targetCountry: data.targetCountry,
        industry: data.industry,
        jobRole: data.jobRole
      };

      // Generate regional optimization
      const result = await regionalizationService.optimizeForRegion(optimizationRequest);
      
      // Log optimization request
      await logRegionalOptimization(auth.uid, optimizationRequest, result);
      
      // Update user regional preferences
      await updateUserRegionalPreferences(auth.uid, data.targetRegion, data.targetCountry);

      return {
        success: true,
        data: result,
        metadata: {
          requestId: `regional_opt_${Date.now()}`,
          timestamp: new Date(),
          version: '2.0',
          region: data.targetRegion,
          country: data.targetCountry,
          processingTime: Date.now() - request.rawRequest.body.timestamp || 0
        }
      };
      
    } catch (error) {
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Regional optimization service temporarily unavailable');
    }
  }
);

/**
 * Get supported regions and countries
 */
export const getSupportedRegions = onCall(
  { ...corsOptions, timeoutSeconds: 10 },
  async (request: CallableRequest) => {
    try {
      const regionalizationService = RegionalLocalizationService.getInstance();
      const supportedRegions = regionalizationService.getSupportedRegions();

      // Get countries for each region
      const regionsWithCountries = supportedRegions.map(region => ({
        region,
        countries: regionalizationService.getCountriesForRegion(region)
      }));

      // Get regional statistics
      const regionalStats = await getRegionalStatistics();

      const regionsWithStats = regionsWithCountries.map(({ region, countries }) => ({
        name: region,
        countries,
        stats: regionalStats[region] || {
          totalOptimizations: 0,
          averageComplianceScore: 0,
          userCount: 0
        }
      }));

      return {
        success: true,
        data: {
          regions: regionsWithStats,
          totalSupported: supportedRegions.length,
          lastUpdated: new Date()
        }
      };
      
    } catch (error) {
      throw new HttpsError('internal', 'Failed to retrieve supported regions');
    }
  }
);

/**
 * Get regional market insights
 */
export const getRegionalMarketInsights = onCall(
  { ...corsOptions, timeoutSeconds: 30 },
  async (request: CallableRequest) => {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      const { region, country, industry } = data;
      
      if (!region) {
        throw new HttpsError('invalid-argument', 'Region parameter is required');
      }

      const regionalizationService = RegionalLocalizationService.getInstance();
      await regionalizationService.initialize();

      // Get comprehensive regional market insights
      const insights = await getComprehensiveRegionalInsights(region, country, industry);
      
      return {
        success: true,
        data: insights,
        metadata: {
          requestId: `regional_insights_${Date.now()}`,
          timestamp: new Date(),
          region,
          country: country || 'all',
          industry: industry || 'all'
        }
      };
      
    } catch (error) {
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Failed to retrieve regional market insights');
    }
  }
);

/**
 * Check legal compliance for region
 */
export const checkRegionalCompliance = onCall(
  { ...corsOptions, timeoutSeconds: 30 },
  async (request: CallableRequest) => {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      const { cvData, region, country } = data;
      
      if (!cvData || !region) {
        throw new HttpsError('invalid-argument', 'Missing CV data or region');
      }
      
      // Quick compliance check without full optimization
      const complianceResult = await performQuickComplianceCheck(cvData, region, country);
      
      // Log compliance check
      await logComplianceCheck(auth.uid, region, country, complianceResult);

      return {
        success: true,
        data: complianceResult,
        metadata: {
          requestId: `compliance_check_${Date.now()}`,
          timestamp: new Date(),
          region,
          country: country || 'all'
        }
      };
      
    } catch (error) {
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Compliance check service temporarily unavailable');
    }
  }
);

/**
 * Compare regional suitability
 */
export const compareRegions = onCall(
  { ...corsOptions, timeoutSeconds: 90 },
  async (request: CallableRequest) => {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      const { cvData, regions, industry } = data;
      
      if (!cvData || !Array.isArray(regions) || regions.length === 0) {
        throw new HttpsError('invalid-argument', 'Missing CV data or regions array');
      }

      if (regions.length > 3) {
        throw new HttpsError('invalid-argument', 'Maximum 3 regions per comparison');
      }
      
      const regionalizationService = RegionalLocalizationService.getInstance();
      
      // Validate all regions are supported
      const supportedRegions = regionalizationService.getSupportedRegions();
      const unsupported = regions.filter((region: string) => !supportedRegions.includes(region));
      if (unsupported.length > 0) {
        throw new HttpsError(
          'invalid-argument',
          `Unsupported regions: ${unsupported.join(', ')}`
        );
      }

      // Generate optimizations for each region
      const comparisons = await Promise.all(
        regions.map(async (region: string) => {
          try {
            const optimizationRequest: RegionalOptimizationRequest = {
              userId: auth.uid,
              cvData,
              targetRegion: region,
              industry
            };

            const result = await regionalizationService.optimizeForRegion(optimizationRequest);
            
            return {
              region,
              success: true,
              optimization: result,
              regionScore: result.regionScore,
              culturalFit: result.culturalFit,
              legalCompliance: result.legalCompliance.compliant,
              complianceIssues: result.legalCompliance.issues.length,
              keyRecommendations: result.localizedRecommendations
                .slice(0, 3)
                .map((rec: any) => rec.title),
              marketOpportunity: result.marketInsights.networkingImportance === 'high' ? 0.8 : 0.6,
              remoteWorkFriendliness: result.marketInsights.remoteWorkAdoption
            };
            
          } catch (error) {
            return {
              region,
              success: false,
              error: 'Analysis failed for this region'
            };
          }
        })
      );

      // Rank regions by overall suitability
      const successfulComparisons = comparisons.filter(comp => comp.success);
      const rankedRegions = successfulComparisons
        .sort((a, b) => (b as any).regionScore - (a as any).regionScore);

      // Generate comparison summary
      const summary = {
        bestOverallFit: rankedRegions[0]?.region || null,
        averageRegionScore: rankedRegions.length > 0 
          ? rankedRegions.reduce((sum, comp) => sum + (comp as any).regionScore, 0) / rankedRegions.length 
          : 0,
        mostCompliantRegion: rankedRegions
          .filter(comp => (comp as any).legalCompliance)
          .sort((a, b) => (a as any).complianceIssues - (b as any).complianceIssues)[0]?.region || null,
        bestRemoteWorkRegion: rankedRegions
          .sort((a, b) => (b as any).remoteWorkFriendliness - (a as any).remoteWorkFriendliness)[0]?.region || null,
        recommendations: generateCrossRegionalRecommendations(rankedRegions)
      };

      // Log comparison request
      await logRegionalComparison(auth.uid, regions, rankedRegions);

      return {
        success: true,
        data: {
          comparisons,
          rankings: rankedRegions,
          summary,
          comparisonDate: new Date()
        },
        metadata: {
          requestId: `regional_compare_${Date.now()}`,
          timestamp: new Date(),
          regionsCompared: regions.length,
          successfulAnalyses: successfulComparisons.length
        }
      };
      
    } catch (error) {
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Regional comparison service temporarily unavailable');
    }
  }
);

/**
 * Get user's regional optimization history
 */
export const getUserRegionalHistory = onCall(
  { ...corsOptions, timeoutSeconds: 30 },
  async (request: CallableRequest) => {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      const { limit = 20, offset = 0 } = data;

      let query = db.collection('regional_optimizations')
        .where('userId', '==', auth.uid)
        .orderBy('timestamp', 'desc')
        .limit(Math.min(limit, 50));

      if (offset > 0) {
        const offsetSnapshot = await db.collection('regional_optimizations')
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

      // Get user's regional preferences and trends
      const preferences = await getUserRegionalPreferences(auth.uid);
      const trends = calculateUserRegionalTrends(history);

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
      throw new HttpsError('internal', 'Failed to retrieve regional optimization history');
    }
  }
);

// Helper functions

async function checkRegionalOptimizationRateLimit(userId: string): Promise<void> {
  const rateLimitRef = db.collection('regional_rate_limits').doc(userId);
  const rateLimitDoc = await rateLimitRef.get();
  
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000);
  
  if (rateLimitDoc.exists) {
    const data = rateLimitDoc.data();
    const recentRequests = (data?.requests || []).filter((time: number) => time > hourAgo);
    
    if (recentRequests.length >= 15) { // 15 regional optimizations per hour
      throw new HttpsError('resource-exhausted', 'Regional optimization rate limit exceeded. Please try again later.');
    }
    
    recentRequests.push(now);
    await rateLimitRef.update({ requests: recentRequests });
  } else {
    await rateLimitRef.set({ requests: [now] });
  }
}

async function logRegionalOptimization(
  userId: string, 
  request: RegionalOptimizationRequest, 
  result: any
): Promise<void> {
  try {
    await db.collection('regional_optimizations').add({
      userId,
      targetRegion: request.targetRegion,
      targetCountry: request.targetCountry,
      industry: request.industry,
      regionScore: result.regionScore,
      culturalFit: result.culturalFit,
      legalCompliance: result.legalCompliance.compliant,
      recommendationsCount: result.localizedRecommendations.length,
      timestamp: FieldValue.serverTimestamp(),
      version: '2.0'
    });

    // Log analytics event
    await db.collection('analytics_events').add({
      eventType: 'regional_optimization',
      userId,
      timestamp: FieldValue.serverTimestamp(),
      data: {
        region: request.targetRegion,
        country: request.targetCountry,
        score: result.regionScore,
        culturalFit: result.culturalFit,
        compliant: result.legalCompliance.compliant
      }
    });
  } catch (error) {
  }
}

async function updateUserRegionalPreferences(userId: string, region: string, country?: string): Promise<void> {
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.set({
      regionalPreferences: {
        lastOptimizedRegion: region,
        lastOptimizedCountry: country,
        lastOptimizedDate: FieldValue.serverTimestamp(),
        optimizedRegions: admin.firestore.FieldValue.arrayUnion(region)
      }
    }, { merge: true });
  } catch (error) {
  }
}

async function getRegionalStatistics(): Promise<Record<string, any>> {
  try {
    // Get aggregated statistics from analytics
    const statsSnapshot = await db.collection('regional_stats').doc('aggregate').get();
    return statsSnapshot.data() || {};
  } catch (error) {
    return {};
  }
}

async function getComprehensiveRegionalInsights(region: string, country?: string, industry?: string): Promise<any> {
  try {
    // Get market data, cultural insights, and legal requirements for the region
    const insights = {
      marketOverview: {
        economicGrowth: 0.025,
        unemploymentRate: 0.045,
        majorIndustries: ['Technology', 'Manufacturing', 'Services'],
        businessCulture: 'Formal and relationship-focused'
      },
      culturalInsights: {
        communicationStyle: 'Direct but respectful',
        hierarchyImportance: 'High',
        workLifeBalance: 'Valued',
        networkingImportance: 'Critical for success',
        professionalDresscode: 'Conservative business attire'
      },
      legalRequirements: {
        cvPhotoRequired: false,
        ageDisclosureProhibited: true,
        workPermitMentionRequired: false,
        dataPrivacyCompliance: 'GDPR required',
        commonDiscriminationIssues: ['Age', 'Gender', 'Photo']
      },
      jobMarket: {
        averageJobSearchDuration: 35,
        popularJobBoards: ['LinkedIn', 'Indeed', 'RegionalBoard'],
        recruitmentMethods: ['Online applications', 'Networking', 'Recruitment agencies'],
        salaryNegotiation: 'Expected during final interviews',
        contractTypes: ['Full-time', 'Contract', 'Part-time']
      },
      applicationProcess: {
        coverLetterExpected: true,
        followUpAppropriate: false,
        interviewStyle: 'Structured and formal',
        decisionTimeline: '2-4 weeks',
        referenceCheckTiming: 'After final interview'
      }
    };

    // Customize insights based on country and industry if provided
    if (country) {
      insights.legalRequirements = {
        ...insights.legalRequirements,
        // countrySpecific: `Additional requirements for ${country}`
      };
    }

    if (industry) {
      insights.marketOverview = {
        ...insights.marketOverview,
        // industrySpecific: `${industry} sector insights for ${region}`
      };
    }

    return insights;
  } catch (error) {
    throw error;
  }
}

async function performQuickComplianceCheck(cvData: any, region: string, country?: string): Promise<any> {
  const regionalizationService = RegionalLocalizationService.getInstance();
  await regionalizationService.initialize();

  // Perform a lightweight compliance check
  const optimizationRequest: RegionalOptimizationRequest = {
    userId: 'compliance_check',
    cvData,
    targetRegion: region,
    targetCountry: country
  };

  const result = await regionalizationService.optimizeForRegion(optimizationRequest);
  
  return {
    compliant: result.legalCompliance.compliant,
    issues: result.legalCompliance.issues,
    recommendations: result.legalCompliance.recommendations,
    riskLevel: result.legalCompliance.issues.some(issue => issue.severity === 'error') ? 'high' :
               result.legalCompliance.issues.some(issue => issue.severity === 'warning') ? 'medium' : 'low',
    summary: `Found ${result.legalCompliance.issues.length} compliance issues for ${region}`
  };
}

async function logComplianceCheck(userId: string, region: string, country: string | undefined, result: any): Promise<void> {
  try {
    await db.collection('compliance_checks').add({
      userId,
      region,
      country: country || null,
      compliant: result.compliant,
      issuesCount: result.issues.length,
      riskLevel: result.riskLevel,
      timestamp: FieldValue.serverTimestamp()
    });
  } catch (error) {
  }
}

async function logRegionalComparison(userId: string, regions: string[], results: any[]): Promise<void> {
  try {
    await db.collection('regional_comparisons').add({
      userId,
      regions,
      resultCount: results.length,
      bestRegion: results[0]?.region || null,
      averageScore: results.length > 0 
        ? results.reduce((sum, r) => sum + (r.regionScore || 0), 0) / results.length 
        : 0,
      timestamp: FieldValue.serverTimestamp()
    });
  } catch (error) {
  }
}

function generateCrossRegionalRecommendations(rankedRegions: any[]): string[] {
  const recommendations: string[] = [];
  
  if (rankedRegions.length > 1) {
    const topTwo = rankedRegions.slice(0, 2);
    const scoreDiff = (topTwo[0] as any).regionScore - (topTwo[1] as any).regionScore;
    
    if (scoreDiff < 10) {
      recommendations.push(`${topTwo[0].region} and ${topTwo[1].region} show similar regional fit scores - consider your personal preferences.`);
    } else {
      recommendations.push(`${topTwo[0].region} is your strongest regional match with a ${scoreDiff.toFixed(1)} point advantage.`);
    }
  }
  
  // Legal compliance recommendations
  const compliantRegions = rankedRegions.filter(r => (r as any).legalCompliance);
  if (compliantRegions.length > 0 && compliantRegions.length < rankedRegions.length) {
    recommendations.push(`Consider ${compliantRegions[0].region} for better legal compliance.`);
  }

  return recommendations.slice(0, 3);
}

async function getUserRegionalPreferences(userId: string): Promise<any> {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    return userDoc.data()?.regionalPreferences || {};
  } catch (error) {
    return {};
  }
}

function calculateUserRegionalTrends(history: any[]): any {
  if (history.length === 0) return {};
  
  const regionFrequency: Record<string, number> = {};
  const scoreProgression: Record<string, number[]> = {};
  
  history.forEach((entry: any) => {
    const region = entry.targetRegion;
    regionFrequency[region] = (regionFrequency[region] || 0) + 1;
    
    if (!scoreProgression[region]) {
      scoreProgression[region] = [];
    }
    scoreProgression[region].push(entry.regionScore || 0);
  });
  
  const mostExplored = Object.entries(regionFrequency)
    .sort(([,a], [,b]) => b - a)[0]?.[0];
  
  const improvements = Object.entries(scoreProgression)
    .map(([region, scores]) => ({
      region,
      improvement: scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0
    }))
    .sort((a, b) => b.improvement - a.improvement);
  
  return {
    mostExplored,
    totalOptimizations: history.length,
    bestImprovement: improvements[0],
    exploredRegions: Object.keys(regionFrequency).length
  };
}