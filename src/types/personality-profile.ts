// @ts-ignore
/**
 * Personality Profile Types
 *
 * AI-generated personality analysis and work style insights.
 * Extracted from enhanced-job.ts for modularity compliance.
 *
 * @author Gil Klainert
 * @version 1.0.0
 */

/**
 * Personality profile insights
 * AI-generated personality analysis and work style insights
 */
export interface PersonalityProfile {
  /** Primary working style description  */
  workingStyle: string;
  /** Key personal and professional strengths  */
  strengths: string[];
  /** Core motivating factors  */
  motivations: string[];
  /** Preferred communication methods and styles  */
  communicationPreferences: string[];
  /** Natural team role (e.g., "Leader", "Collaborator", "Specialist")  */
  teamRole: string;
  /** Leadership approach and style  */
  leadershipStyle?: string;
  /** Approach to problem-solving  */
  problemSolvingApproach: string;
  /** Adaptability to change description  */
  adaptability: string;
  /** Stress management approach  */
  stressManagement: string;
  /** Career goals and aspirations  */
  careerAspirations: string[];
  /** Core professional and personal values  */
  values: string[];
  /** Numerical scores for different personality traits  */
  traits: {
    leadership: number;
    communication: number;
    innovation: number;
    teamwork: number;
    problemSolving: number;
    attention_to_detail: number;
    adaptability: number;
    strategic_thinking: number;
    analytical?: number;
    creative?: number;
    decisive?: number;
    empathetic?: number;
    [key: string]: number | undefined;
  };
  /** Primary working style descriptions  */
  workStyle: string[];
  /** Team compatibility assessment  */
  teamCompatibility: string;
  /** Leadership potential score (0-1)  */
  leadershipPotential: number;
  /** Culture fit assessment for different environments  */
  cultureFit: {
    startup: number;
    corporate: number;
    consulting: number;
    nonprofit: number;
    agency: number;
  };
  /** Comprehensive personality summary  */
  summary: string;
  /** When this profile was generated  */
  generatedAt: Date;
}