/**
 * Role profile types placeholder
 */
export interface RoleProfile {
  id: string;
  title: string;
  skills: string[];
  requirements: string[];
}

export interface RoleAnalysis {
  matchScore: number;
  missingSkills: string[];
  recommendations: string[];
}
