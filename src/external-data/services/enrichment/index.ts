/**
 * External Data Enrichment Module Exports
 * 
 * @author Gil Klainert
 * @created 2025-08-23
 * @version 1.0
 */

export { EnrichmentService } from './enrichment.service';
export type { EnrichmentResult, DataAttribution, ConflictResolution } from './enrichment.service';
export { PortfolioEnrichmentService } from './portfolio.enrichment';
export type { PortfolioEnrichmentResult } from './portfolio.enrichment';
export { CertificationEnrichmentService } from './certification.enrichment';
export type { CertificationEnrichmentResult } from './certification.enrichment';
export { HobbiesEnrichmentService } from './hobbies.enrichment';
export type { HobbiesEnrichmentResult } from './hobbies.enrichment';
export { SkillsEnrichmentService } from './skills.enrichment';
export type { SkillEnrichmentResult, SkillWithMetadata, ProficiencyLevel } from './skills.enrichment';