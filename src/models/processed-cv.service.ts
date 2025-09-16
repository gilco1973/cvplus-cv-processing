// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Processed CV Model Service
 * Handles processed CV operations for the CV Processing submodule
 */

import * as admin from 'firebase-admin';

export interface ProcessedCV {
  id: string;
  userId: string;
  originalJobId: string;
  structuredData: {
    personalInfo: {
      fullName: string;
      email: string;
      phone: string;
      location: string;
      linkedin?: string;
      website?: string;
      summary?: string;
    };
    experience: Array<{
      title: string;
      company: string;
      startDate: string;
      endDate?: string;
      description: string;
      location?: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
      grade?: string;
      description?: string;
    }>;
    skills: {
      technical: string[];
      soft: string[];
      languages: Array<{
        language: string;
        proficiency: string;
      }>;
    };
    certifications: Array<{
      name: string;
      issuer: string;
      date: string;
      url?: string;
    }>;
  };
  atsAnalysis: {
    score: number;
    keywordDensity: Record<string, number>;
    suggestedImprovements: string[];
    missingKeywords: string[];
    formatScore: number;
  };
  aiAnalysis: {
    personalityProfile?: {
      mbtiType: string;
      summary: string;
      traits: Record<string, number>;
    };
    strengths: string[];
    improvementAreas: string[];
    careerSuggestions: string[];
    industryFit: Array<{
      industry: string;
      fitScore: number;
      reasoning: string;
    }>;
  };
  metadata: {
    processingVersion: string;
    processingTime: number;
    qualityScore: number;
    processingLogs?: string[];
  };
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

/**
 * Get processed CV by ID
 */
export async function getProcessedCV(processedCVId: string): Promise<ProcessedCV | null> {
  try {
    const db = admin.firestore();
    const cvDoc = await db.collection('processedCVs').doc(processedCVId).get();

    if (!cvDoc.exists) {
      return null;
    }

    const data = cvDoc.data();
    if (!data) {
      return null;
    }

    return {
      id: cvDoc.id,
      ...data
    } as ProcessedCV;
  } catch (error) {
    console.error('Error getting processed CV:', error);
    throw error;
  }
}

/**
 * Create new processed CV
 */
export async function createProcessedCV(cvData: Omit<ProcessedCV, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    const docRef = await db.collection('processedCVs').add({
      ...cvData,
      createdAt: now,
      updatedAt: now
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating processed CV:', error);
    throw error;
  }
}

/**
 * Update processed CV
 */
export async function updateProcessedCV(processedCVId: string, updates: Partial<ProcessedCV>): Promise<void> {
  try {
    const db = admin.firestore();
    await db.collection('processedCVs').doc(processedCVId).update({
      ...updates,
      updatedAt: admin.firestore.Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating processed CV:', error);
    throw error;
  }
}

/**
 * Get processed CVs by user ID
 */
export async function getProcessedCVsByUserId(userId: string, limit = 50): Promise<ProcessedCV[]> {
  try {
    const db = admin.firestore();
    const query = await db.collection('processedCVs')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return query.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ProcessedCV));
  } catch (error) {
    console.error('Error getting processed CVs by user:', error);
    throw error;
  }
}

/**
 * Delete processed CV
 */
export async function deleteProcessedCV(processedCVId: string): Promise<void> {
  try {
    const db = admin.firestore();
    await db.collection('processedCVs').doc(processedCVId).delete();
  } catch (error) {
    console.error('Error deleting processed CV:', error);
    throw error;
  }
}