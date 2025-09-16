// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Advanced Predictions Firebase Functions
 * 
 * Provides sophisticated prediction capabilities including salary forecasting,
 * time-to-hire estimation, competitive analysis, and market positioning.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { CallableRequest } from 'firebase-functions/v2/https';
import { 
  AdvancedPredictionsService, 
  AdvancedPredictionRequest
} from '../services/advanced-predictions.service';
import { corsOptions } from '../config/cors';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Initialize admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Generate advanced salary prediction with market analysis
 */
export const predictSalaryAdvanced = onCall(
  { ...corsOptions, timeoutSeconds: 60 },
  async (request: CallableRequest) => {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      // Validate input
      if (!data.cvData || !data.jobData) {
        throw new HttpsError('invalid-argument', 'Missing CV data or job data');
      }

      // Check rate limiting
      await checkAdvancedPredictionRateLimit(auth.uid, 'salary');

      const advancedService = AdvancedPredictionsService.getInstance();
      
      // Prepare prediction request
      const predictionRequest: AdvancedPredictionRequest = {
        userId: auth.uid,
        cvData: data.cvData,
        jobData: {
          title: data.jobData.title || 'Software Engineer',
          company: data.jobData.company || 'Unknown Company',
          location: data.jobData.location || 'Remote',
          industry: data.jobData.industry || 'Technology',
          experienceLevel: data.jobData.experienceLevel || 'mid',
          salaryRange: data.jobData.salaryRange,
          benefits: data.jobData.benefits || [],
          remoteOption: data.jobData.remoteOption || false,
          companySize: data.jobData.companySize || 'medium'
        },
        marketContext: data.marketContext
      };

      // Generate salary prediction
      const salaryPrediction = await advancedService.predictSalaryAdvanced(predictionRequest);
      
      // Log prediction request
      await logAdvancedPrediction(auth.uid, 'salary', predictionRequest, { salaryPrediction });

      return {
        success: true,
        data: salaryPrediction,
        metadata: {
          requestId: `salary_pred_${Date.now()}`,
          timestamp: new Date(),
          version: '2.0',
          predictionType: 'salary',
          processingTime: Date.now() - request.rawRequest.body.timestamp || 0
        }
      };
      
    } catch (error) {
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Advanced salary prediction service temporarily unavailable');
    }
  }
);

/**
 * Generate advanced time-to-hire prediction
 */
export const predictTimeToHireAdvanced = onCall(
  { ...corsOptions, timeoutSeconds: 60 },
  async (request: CallableRequest) => {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      if (!data.cvData || !data.jobData) {
        throw new HttpsError('invalid-argument', 'Missing CV data or job data');
      }

      await checkAdvancedPredictionRateLimit(auth.uid, 'time');

      const advancedService = AdvancedPredictionsService.getInstance();
      
      const predictionRequest: AdvancedPredictionRequest = {
        userId: auth.uid,
        cvData: data.cvData,
        jobData: {
          title: data.jobData.title || 'Software Engineer',
          company: data.jobData.company || 'Unknown Company',
          location: data.jobData.location || 'Remote',
          industry: data.jobData.industry || 'Technology',
          experienceLevel: data.jobData.experienceLevel || 'mid',
          salaryRange: data.jobData.salaryRange,
          benefits: data.jobData.benefits || [],
          remoteOption: data.jobData.remoteOption || false,
          companySize: data.jobData.companySize || 'medium'
        },
        marketContext: data.marketContext
      };

      const timeToHirePrediction = await advancedService.predictTimeToHireAdvanced(predictionRequest);
      
      await logAdvancedPrediction(auth.uid, 'time_to_hire', predictionRequest, { timeToHirePrediction });

      return {
        success: true,
        data: timeToHirePrediction,
        metadata: {
          requestId: `time_pred_${Date.now()}`,
          timestamp: new Date(),
          version: '2.0',
          predictionType: 'time_to_hire'
        }
      };
      
    } catch (error) {
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Advanced time prediction service temporarily unavailable');
    }
  }
);

/**
 * Generate comprehensive competitive analysis
 */
export const generateCompetitiveAnalysis = onCall(
  { ...corsOptions, timeoutSeconds: 90 },
  async (request: CallableRequest) => {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      if (!data.cvData || !data.jobData) {
        throw new HttpsError('invalid-argument', 'Missing CV data or job data');
      }

      await checkAdvancedPredictionRateLimit(auth.uid, 'competitive');

      const advancedService = AdvancedPredictionsService.getInstance();
      
      const predictionRequest: AdvancedPredictionRequest = {
        userId: auth.uid,
        cvData: data.cvData,
        jobData: {
          title: data.jobData.title || 'Software Engineer',
          company: data.jobData.company || 'Unknown Company',
          location: data.jobData.location || 'Remote',
          industry: data.jobData.industry || 'Technology',
          experienceLevel: data.jobData.experienceLevel || 'mid',
          salaryRange: data.jobData.salaryRange,
          benefits: data.jobData.benefits || [],
          remoteOption: data.jobData.remoteOption || false,
          companySize: data.jobData.companySize || 'medium'
        },
        marketContext: data.marketContext
      };

      const competitiveAnalysis = await advancedService.generateCompetitiveAnalysis(predictionRequest);
      
      await logAdvancedPrediction(auth.uid, 'competitive_analysis', predictionRequest, { competitiveAnalysis });

      return {
        success: true,
        data: competitiveAnalysis,
        metadata: {
          requestId: `competitive_${Date.now()}`,
          timestamp: new Date(),
          version: '2.0',
          predictionType: 'competitive_analysis'
        }
      };
      
    } catch (error) {
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Competitive analysis service temporarily unavailable');
    }
  }
);

/**
 * Generate market insights and trends
 */
export const generateMarketInsights = onCall(
  { ...corsOptions, timeoutSeconds: 60 },
  async (request: CallableRequest) => {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      if (!data.jobData) {
        throw new HttpsError('invalid-argument', 'Missing job data');
      }

      await checkAdvancedPredictionRateLimit(auth.uid, 'market');

      const advancedService = AdvancedPredictionsService.getInstance();
      
      const predictionRequest: AdvancedPredictionRequest = {
        userId: auth.uid,
        cvData: data.cvData || {},
        jobData: {
          title: data.jobData.title || 'Software Engineer',
          company: data.jobData.company || 'Unknown Company',
          location: data.jobData.location || 'Remote',
          industry: data.jobData.industry || 'Technology',
          experienceLevel: data.jobData.experienceLevel || 'mid',
          salaryRange: data.jobData.salaryRange,
          benefits: data.jobData.benefits || [],
          remoteOption: data.jobData.remoteOption || false,
          companySize: data.jobData.companySize || 'medium'
        },
        marketContext: data.marketContext
      };

      const marketInsights = await advancedService.generateMarketInsights(predictionRequest);
      
      await logAdvancedPrediction(auth.uid, 'market_insights', predictionRequest, { marketInsights });

      return {
        success: true,
        data: marketInsights,
        metadata: {
          requestId: `market_${Date.now()}`,
          timestamp: new Date(),
          version: '2.0',
          predictionType: 'market_insights'
        }
      };
      
    } catch (error) {
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Market insights service temporarily unavailable');
    }
  }
);

/**
 * Generate negotiation insights and strategy
 */
export const generateNegotiationInsights = onCall(
  { ...corsOptions, timeoutSeconds: 60 },
  async (request: CallableRequest) => {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      if (!data.cvData || !data.jobData) {
        throw new HttpsError('invalid-argument', 'Missing CV data or job data');
      }

      await checkAdvancedPredictionRateLimit(auth.uid, 'negotiation');

      const advancedService = AdvancedPredictionsService.getInstance();
      
      const predictionRequest: AdvancedPredictionRequest = {
        userId: auth.uid,
        cvData: data.cvData,
        jobData: {
          title: data.jobData.title || 'Software Engineer',
          company: data.jobData.company || 'Unknown Company',
          location: data.jobData.location || 'Remote',
          industry: data.jobData.industry || 'Technology',
          experienceLevel: data.jobData.experienceLevel || 'mid',
          salaryRange: data.jobData.salaryRange,
          benefits: data.jobData.benefits || [],
          remoteOption: data.jobData.remoteOption || false,
          companySize: data.jobData.companySize || 'medium'
        },
        marketContext: data.marketContext
      };

      const negotiationInsights = await advancedService.generateNegotiationInsights(predictionRequest);
      
      await logAdvancedPrediction(auth.uid, 'negotiation_insights', predictionRequest, { negotiationInsights });

      return {
        success: true,
        data: negotiationInsights,
        metadata: {
          requestId: `negotiation_${Date.now()}`,
          timestamp: new Date(),
          version: '2.0',
          predictionType: 'negotiation_insights'
        }
      };
      
    } catch (error) {
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Negotiation insights service temporarily unavailable');
    }
  }
);

/**
 * Get comprehensive prediction package (all predictions in one call)
 */
export const getComprehensivePredictions = onCall(
  { ...corsOptions, timeoutSeconds: 120 },
  async (request: CallableRequest) => {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      if (!data.cvData || !data.jobData) {
        throw new HttpsError('invalid-argument', 'Missing CV data or job data');
      }

      // Check if user has permission for comprehensive analysis
      await checkPremiumAccess(auth.uid);
      
      await checkAdvancedPredictionRateLimit(auth.uid, 'comprehensive');

      const advancedService = AdvancedPredictionsService.getInstance();
      
      const predictionRequest: AdvancedPredictionRequest = {
        userId: auth.uid,
        cvData: data.cvData,
        jobData: {
          title: data.jobData.title || 'Software Engineer',
          company: data.jobData.company || 'Unknown Company',
          location: data.jobData.location || 'Remote',
          industry: data.jobData.industry || 'Technology',
          experienceLevel: data.jobData.experienceLevel || 'mid',
          salaryRange: data.jobData.salaryRange,
          benefits: data.jobData.benefits || [],
          remoteOption: data.jobData.remoteOption || false,
          companySize: data.jobData.companySize || 'medium'
        },
        marketContext: data.marketContext
      };

      // Generate all predictions in parallel
      const [
        salaryPrediction,
        timeToHirePrediction,
        competitiveAnalysis,
        marketInsights,
        negotiationInsights
      ] = await Promise.all([
        advancedService.predictSalaryAdvanced(predictionRequest),
        advancedService.predictTimeToHireAdvanced(predictionRequest),
        advancedService.generateCompetitiveAnalysis(predictionRequest),
        advancedService.generateMarketInsights(predictionRequest),
        advancedService.generateNegotiationInsights(predictionRequest)
      ]);

      const comprehensiveResults = {
        salaryPrediction,
        timeToHirePrediction,
        competitiveAnalysis,
        marketInsights,
        negotiationInsights,
        summary: generatePredictionSummary({
          salaryPrediction,
          timeToHirePrediction,
          competitiveAnalysis,
          marketInsights,
          negotiationInsights
        })
      };
      
      await logAdvancedPrediction(auth.uid, 'comprehensive', predictionRequest, comprehensiveResults);

      return {
        success: true,
        data: comprehensiveResults,
        metadata: {
          requestId: `comprehensive_${Date.now()}`,
          timestamp: new Date(),
          version: '2.0',
          predictionType: 'comprehensive',
          includedAnalyses: ['salary', 'time_to_hire', 'competitive', 'market', 'negotiation']
        }
      };
      
    } catch (error) {
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Comprehensive predictions service temporarily unavailable');
    }
  }
);

/**
 * Get user's advanced prediction history
 */
export const getUserAdvancedPredictionHistory = onCall(
  { ...corsOptions, timeoutSeconds: 30 },
  async (request: CallableRequest) => {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      const { 
        limit = 20, 
        offset = 0, 
        predictionType, 
        dateFrom, 
        dateTo 
      } = data;

      let query = db.collection('advanced_predictions')
        .where('userId', '==', auth.uid)
        .orderBy('timestamp', 'desc')
        .limit(Math.min(limit, 50));

      // Filter by prediction type if specified
      if (predictionType) {
        query = query.where('predictionType', '==', predictionType);
      }

      // Filter by date range if specified
      if (dateFrom) {
        query = query.where('timestamp', '>=', new Date(dateFrom));
      }
      
      if (dateTo) {
        query = query.where('timestamp', '<=', new Date(dateTo));
      }

      // Handle pagination
      if (offset > 0) {
        const offsetQuery = db.collection('advanced_predictions')
          .where('userId', '==', auth.uid)
          .orderBy('timestamp', 'desc')
          .limit(offset);

        if (predictionType) {
          offsetQuery.where('predictionType', '==', predictionType);
        }

        const offsetSnapshot = await offsetQuery.get();
        if (!offsetSnapshot.empty) {
          const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
          query = query.startAfter(lastDoc);
        }
      }

      const snapshot = await query.get();
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));

      // Get usage statistics
      const usageStats = await getUserAdvancedPredictionStats(auth.uid);

      return {
        success: true,
        data: {
          history,
          usageStats,
          pagination: {
            limit,
            offset,
            hasMore: history.length === limit,
            total: await getTotalAdvancedPredictionCount(auth.uid, predictionType)
          }
        }
      };
      
    } catch (error) {
      throw new HttpsError('internal', 'Failed to retrieve advanced prediction history');
    }
  }
);

// Helper functions
async function checkAdvancedPredictionRateLimit(userId: string, predictionType: string): Promise<void> {
  const rateLimitRef = db.collection('advanced_prediction_limits').doc(`${userId}_${predictionType}`);
  const rateLimitDoc = await rateLimitRef.get();
  
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000);
  
  // Different limits for different prediction types
  const limits: Record<string, number> = {
    'salary': 10,
    'time': 10,
    'competitive': 5,
    'market': 15,
    'negotiation': 8,
    'comprehensive': 3
  };
  
  const limit = limits[predictionType] || 5;
  
  if (rateLimitDoc.exists) {
    const data = rateLimitDoc.data();
    const recentRequests = (data?.requests || []).filter((time: number) => time > hourAgo);
    
    if (recentRequests.length >= limit) {
      throw new HttpsError('resource-exhausted', `${predictionType} prediction rate limit exceeded. Please try again later.`);
    }
    
    recentRequests.push(now);
    await rateLimitRef.update({ requests: recentRequests });
  } else {
    await rateLimitRef.set({ requests: [now] });
  }
}

async function checkPremiumAccess(userId: string): Promise<void> {
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  
  if (!userData?.subscriptionType || userData.subscriptionType === 'free') {
    throw new HttpsError(
      'permission-denied', 
      'Comprehensive predictions require a premium subscription'
    );
  }
}

async function logAdvancedPrediction(
  userId: string, 
  predictionType: string, 
  request: AdvancedPredictionRequest, 
  result: any
): Promise<void> {
  try {
    await db.collection('advanced_predictions').add({
      userId,
      predictionType,
      jobTitle: request.jobData.title,
      company: request.jobData.company,
      industry: request.jobData.industry,
      location: request.jobData.location,
      result: JSON.stringify(result),
      timestamp: FieldValue.serverTimestamp(),
      version: '2.0'
    });

    // Log analytics event
    await db.collection('analytics_events').add({
      eventType: 'advanced_prediction',
      userId,
      timestamp: FieldValue.serverTimestamp(),
      data: {
        predictionType,
        jobTitle: request.jobData.title,
        industry: request.jobData.industry
      }
    });
  } catch (error) {
  }
}

function generatePredictionSummary(results: any): any {
  const {
    salaryPrediction,
    timeToHirePrediction,
    competitiveAnalysis,
    marketInsights,
    negotiationInsights
  } = results;

  return {
    overallOutlook: competitiveAnalysis.marketPosition === 'top_25' || competitiveAnalysis.marketPosition === 'top_10' 
      ? 'excellent' : competitiveAnalysis.marketPosition === 'average' ? 'good' : 'challenging',
    
    keyInsights: [
      `Expected salary range: ${salaryPrediction.predictedRange.currency}${salaryPrediction.predictedRange.min.toLocaleString()} - ${salaryPrediction.predictedRange.currency}${salaryPrediction.predictedRange.max.toLocaleString()}`,
      `Estimated time to hire: ${timeToHirePrediction.estimatedDays} days`,
      `Market position: ${competitiveAnalysis.marketPosition.replace('_', ' ')}`,
      `Market demand: ${marketInsights.demandLevel.replace('_', ' ')}`,
      `Negotiation potential: ${Math.round(negotiationInsights.negotiationPotential * 100)}%`
    ],
    
    topRecommendations: [
      ...competitiveAnalysis.recommendedActions.slice(0, 2).map((rec: any) => rec.title),
      `Negotiate using ${negotiationInsights.recommendedStrategy} strategy`
    ],
    
    marketConditions: {
      demand: marketInsights.demandLevel,
      competition: marketInsights.competitionLevel,
      salaryTrend: marketInsights.salaryTrends.direction,
      industryOutlook: marketInsights.industryOutlook.futureProspects
    }
  };
}

async function getUserAdvancedPredictionStats(userId: string): Promise<any> {
  try {
    const statsSnapshot = await db.collection('advanced_predictions')
      .where('userId', '==', userId)
      .get();

    const predictions = statsSnapshot.docs.map(doc => doc.data());
    
    const typeCount: Record<string, number> = {};
    predictions.forEach(pred => {
      typeCount[pred.predictionType] = (typeCount[pred.predictionType] || 0) + 1;
    });

    return {
      totalPredictions: predictions.length,
      predictionsByType: typeCount,
      lastPredictionDate: predictions.length > 0 ? predictions[0]?.timestamp || null : null,
      mostUsedPredictionType: Object.entries(typeCount)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || null
    };
  } catch (error) {
    return {
      totalPredictions: 0,
      predictionsByType: {},
      lastPredictionDate: null,
      mostUsedPredictionType: null
    };
  }
}

async function getTotalAdvancedPredictionCount(userId: string, predictionType?: string): Promise<number> {
  try {
    let query = db.collection('advanced_predictions').where('userId', '==', userId);
    
    if (predictionType) {
      query = query.where('predictionType', '==', predictionType);
    }
    
    const countSnapshot = await query.count().get();
    return countSnapshot.data().count;
  } catch (error) {
    return 0;
  }
}