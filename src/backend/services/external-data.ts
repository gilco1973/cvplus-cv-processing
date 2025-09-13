/**
 * External Data Service for CV Processing
 */
import { ExternalDataRequest, ExternalDataResponse, ExternalData } from '../types/external-data-analytics.types';

export interface ExternalDataService {
  enrichCV(userId: string, cvData: any): Promise<ExternalDataResponse>;
  getJobMarketData(query: any): Promise<any>;
  getSalaryData(query: any): Promise<any>;
  getSkillsDemand(skills: string[]): Promise<any>;
}

export class ExternalDataServiceImpl implements ExternalDataService {
  
  async enrichCV(userId: string, cvData: any): Promise<ExternalDataResponse> {
    const startTime = Date.now();
    
    try {
      // Mock external data enrichment
      const enrichedData: ExternalData = {
        jobMarket: await this.getJobMarketData({ 
          keywords: this.extractKeywords(cvData),
          location: cvData.location 
        }),
        salaryData: await this.getSalaryData({
          position: cvData.position,
          location: cvData.location,
          experience: cvData.experience?.length || 0
        }),
        skillsDemand: await this.getSkillsDemand(cvData.skills || [])
      };

      return {
        id: `external-${Date.now()}`,
        requestId: `req-${userId}-${Date.now()}`,
        source: 'external-data-service',
        data: enrichedData,
        metadata: {
          retrievedAt: new Date(),
          processingTime: Date.now() - startTime,
          dataSize: JSON.stringify(enrichedData).length,
          sources: ['job-api', 'salary-api', 'skills-api'],
          cached: false
        },
        status: 'success'
      };
    } catch (error) {
      console.error('External data enrichment failed:', error);
      return {
        id: `external-error-${Date.now()}`,
        requestId: `req-${userId}-${Date.now()}`,
        source: 'external-data-service',
        data: {},
        metadata: {
          retrievedAt: new Date(),
          processingTime: Date.now() - startTime,
          dataSize: 0,
          sources: [],
          cached: false
        },
        status: 'error',
        errors: [{
          code: 'EXTERNAL_DATA_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          recoverable: true
        }]
      };
    }
  }

  async getJobMarketData(query: any): Promise<any> {
    // Mock job market data
    return {
      totalJobs: Math.floor(Math.random() * 10000) + 1000,
      activeJobs: Math.floor(Math.random() * 5000) + 500,
      jobGrowth: Math.random() * 20 - 5, // -5% to +15%
      competitionLevel: Math.random() * 100,
      demandTrend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)],
      topEmployers: [
        { name: 'TechCorp', jobCount: 150, avgSalary: 85000 },
        { name: 'InnovateInc', jobCount: 120, avgSalary: 92000 },
        { name: 'DataSystems', jobCount: 100, avgSalary: 88000 }
      ]
    };
  }

  async getSalaryData(query: any): Promise<any> {
    // Mock salary data
    const baseSalary = 70000 + (query.experience * 8000);
    return {
      averageSalary: baseSalary,
      medianSalary: baseSalary * 0.95,
      salaryRange: {
        min: baseSalary * 0.8,
        max: baseSalary * 1.4,
        currency: 'USD',
        period: 'yearly'
      },
      percentiles: {
        p10: baseSalary * 0.7,
        p25: baseSalary * 0.85,
        p50: baseSalary * 0.95,
        p75: baseSalary * 1.15,
        p90: baseSalary * 1.35
      }
    };
  }

  async getSkillsDemand(skills: string[]): Promise<any> {
    // Mock skills demand data
    return {
      topSkills: skills.map((skill: any) => ({
        skill,
        demand: Math.random() * 100,
        growth: Math.random() * 30 - 10, // -10% to +20%
        salaryPremium: Math.random() * 20000,
        jobCount: Math.floor(Math.random() * 5000) + 100
      })),
      emergingSkills: [
        { skill: 'AI/ML', demand: 95, growth: 25, salaryPremium: 15000 },
        { skill: 'Cloud Computing', demand: 88, growth: 18, salaryPremium: 12000 },
        { skill: 'DevOps', demand: 82, growth: 15, salaryPremium: 10000 }
      ]
    };
  }

  private extractKeywords(cvData: any): string[] {
    const keywords: string[] = [];
    
    if (cvData.skills && Array.isArray(cvData.skills)) {
      keywords.push(...cvData.skills);
    }
    
    if (cvData.position) {
      keywords.push(cvData.position);
    }
    
    if (cvData.experience && Array.isArray(cvData.experience)) {
      cvData.experience.forEach((job: any) => {
        if (job.position) keywords.push(job.position);
        if (job.company) keywords.push(job.company);
      });
    }
    
    return [...new Set(keywords)]; // Remove duplicates
  }
}

// Export singleton instance
export const externalDataService = new ExternalDataServiceImpl();

export interface OrchestrationRequest {
  userId: string;
  cvData: any;
  cvId?: string;
  dataTypes: string[];
  priority?: 'low' | 'medium' | 'high';
  maxCost?: number;
}

export interface OrchestrationResult {
  success: boolean;
  status: 'success' | 'error' | 'partial';
  data: any;
  cost: number;
  sources: string[];
  errors?: string[];
  warnings?: string[];
  fetchDuration: number;
}

export class ExternalDataOrchestrator {
  async orchestrateDataEnrichment(request: OrchestrationRequest): Promise<OrchestrationResult> {
    const startTime = Date.now();
    try {
      const response = await externalDataService.enrichCV(request.userId, request.cvData);
      const fetchDuration = Date.now() - startTime;
      
      return {
        success: response.status === 'success',
        status: response.status as 'success' | 'error' | 'partial',
        data: response.data,
        cost: response.metadata?.cost || 0,
        sources: response.metadata?.sources || [],
        errors: response.errors?.map(e => e.message) || [],
        fetchDuration
      };
    } catch (error) {
      const fetchDuration = Date.now() - startTime;
      return {
        success: false,
        status: 'error',
        data: null,
        cost: 0,
        sources: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        fetchDuration
      };
    }
  }
}

export const externalDataOrchestrator = new ExternalDataOrchestrator();