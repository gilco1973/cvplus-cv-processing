// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Legal Compliance Checker for Regional CV Processing
 * Moved from i18n module to correct cv-processing domain
 */

import { ParsedCV, RegionalConfiguration, ComplianceIssue } from '../types/regional';

export class ComplianceChecker {
  /**
   * Check legal compliance for CV in target region
   */
  async checkLegalCompliance(cvData: ParsedCV, regionConfig: RegionalConfiguration) {
    const issues: ComplianceIssue[] = [];
    const recommendations: string[] = [];
    const criticalViolations: ComplianceIssue[] = [];

    // Check prohibited information
    const prohibitedInfo = regionConfig.legalRestrictions?.prohibitedInfo || [];
    for (const info of prohibitedInfo) {
      const issue = this.checkProhibitedInfo(cvData, info, regionConfig.regionName || regionConfig.regionId);
      if (issue) {
        issues.push(issue);
        if (issue.severity === 'critical') {
          criticalViolations.push(issue);
        }
      }
    }

    // Check required disclosures
    this.checkRequiredDisclosures(cvData, regionConfig, issues);

    // Check data privacy compliance
    this.checkDataPrivacyCompliance(cvData, regionConfig, issues);

    // Generate recommendations based on issues
    for (const issue of issues) {
      recommendations.push(issue.solution);
    }

    // Add general recommendations
    this.addGeneralRecommendations(cvData, regionConfig, recommendations);

    return {
      compliant: criticalViolations.length === 0,
      issues,
      recommendations,
      criticalViolations
    };
  }

  private checkProhibitedInfo(cvData: ParsedCV, prohibitedType: string, region: string): ComplianceIssue | null {
    const personalInfo = cvData.personalInfo || {};

    switch (prohibitedType) {
      case 'age':
        if (personalInfo.age || (personalInfo as any).dateOfBirth) {
          return {
            type: 'age',
            severity: 'critical',
            description: 'Age or date of birth information found',
            solution: 'Remove age and date of birth information to comply with anti-discrimination laws',
            countries: [region],
            legalBasis: 'Age Discrimination in Employment Act',
            consequences: 'Legal liability for employer, application may be rejected',
            autoFixAvailable: true
          };
        }
        break;

      case 'marital_status':
        if (personalInfo.maritalStatus) {
          return {
            type: 'marital_status',
            severity: 'warning',
            description: 'Marital status information found',
            solution: 'Remove marital status information as it is not relevant for job applications',
            countries: [region],
            legalBasis: 'Equal Employment Opportunity laws',
            autoFixAvailable: true
          };
        }
        break;

      case 'photo':
        if (this.hasPhoto(cvData)) {
          const severity = this.getPhotoProhibitionSeverity(region);
          return {
            type: 'photo',
            severity,
            description: 'Photo found on CV',
            solution: 'Consider removing photo to prevent unconscious bias in hiring process',
            countries: [region],
            legalBasis: 'Anti-discrimination employment laws',
            consequences: severity === 'critical' ? 'May result in application rejection' : 'May influence hiring decision unconsciously',
            autoFixAvailable: true
          };
        }
        break;

      case 'gender':
        if (personalInfo.gender) {
          return {
            type: 'gender',
            severity: 'critical',
            description: 'Gender information found',
            solution: 'Remove gender information to comply with equal opportunity laws',
            countries: [region],
            legalBasis: 'Gender discrimination laws',
            consequences: 'Legal liability for employer, application may be rejected',
            autoFixAvailable: true
          };
        }
        break;

      case 'nationality':
        if (personalInfo.nationality && !this.isNationalityRequired(region)) {
          return {
            type: 'nationality',
            severity: 'warning',
            description: 'Nationality information found where not required',
            solution: 'Remove nationality information unless specifically required for work authorization',
            countries: [region],
            legalBasis: 'National origin discrimination laws',
            autoFixAvailable: true
          };
        }
        break;

      case 'personal_info':
        const sensitiveFields = ['religion', 'politicalAffiliation', 'sexualOrientation', 'disability', 'race', 'ethnicity'];
        for (const field of sensitiveFields) {
          if ((personalInfo as any)[field]) {
            return {
              type: 'personal_info',
              severity: 'critical',
              description: `Sensitive personal information found: ${field}`,
              solution: `Remove ${field} information as it is protected under employment law`,
              countries: [region],
              legalBasis: 'Protected class discrimination laws',
              consequences: 'Severe legal liability for employer, guaranteed application rejection',
              autoFixAvailable: true
            };
          }
        }
        break;
    }

    return null;
  }

  private checkRequiredDisclosures(cvData: ParsedCV, regionConfig: RegionalConfiguration, issues: ComplianceIssue[]) {
    const legalReqs = regionConfig.legalRestrictions;
    if (!legalReqs) return;

    // Check work permit requirements
    if (legalReqs.workPermitRequired && !this.hasWorkPermitInfo(cvData)) {
      issues.push({
        type: 'work_permit',
        severity: 'error',
        description: 'Work authorization status not disclosed where required',
        solution: 'Add work authorization status or eligibility statement',
        countries: [regionConfig.regionId],
        legalBasis: 'Immigration and employment authorization laws',
        autoFixAvailable: false
      });
    }

    // Check required age disclosure
    if (legalReqs.ageDisclosureRequired && !cvData.personalInfo?.age) {
      issues.push({
        type: 'age',
        severity: 'warning',
        description: 'Age disclosure required but not provided',
        solution: 'Consider adding age if required by local employment laws',
        countries: [regionConfig.regionId],
        autoFixAvailable: false
      });
    }
  }

  private checkDataPrivacyCompliance(cvData: ParsedCV, regionConfig: RegionalConfiguration, issues: ComplianceIssue[]) {
    const dataRegs = regionConfig.legalRestrictions?.dataPrivacyRegulations || [];

    if (dataRegs.includes('GDPR')) {
      // GDPR compliance checks
      if (this.hasExcessivePersonalData(cvData)) {
        issues.push({
          type: 'personal_info',
          severity: 'warning',
          description: 'Potential GDPR violation: excessive personal data collection',
          solution: 'Minimize personal data to what is necessary for employment consideration',
          countries: ['EU'],
          legalBasis: 'GDPR Article 5 - Data minimization principle',
          autoFixAvailable: false
        });
      }
    }
  }

  private addGeneralRecommendations(cvData: ParsedCV, regionConfig: RegionalConfiguration, recommendations: string[]) {
    // Photo recommendations
    if (regionConfig.legalRestrictions?.photoRequired === false && this.hasPhoto(cvData)) {
      recommendations.push('Consider removing photo as it may lead to unconscious bias');
    } else if (regionConfig.legalRestrictions?.photoRequired === true && !this.hasPhoto(cvData)) {
      recommendations.push('Consider adding a professional photo as it is expected in this region');
    }

    // Format recommendations
    const formatPrefs = regionConfig.formatPreferences;
    if (formatPrefs?.dateFormat && !this.usesCorrectDateFormat(cvData, formatPrefs.dateFormat)) {
      recommendations.push(`Use ${formatPrefs.dateFormat} date format for this region`);
    }

    // Content recommendations
    const contentGuidelines = regionConfig.contentGuidelines;
    if (contentGuidelines?.personalStatementRequired && !this.hasPersonalStatement(cvData)) {
      recommendations.push('Add a personal statement/objective as it is expected in this region');
    }
  }

  // Helper methods
  private hasPhoto(cvData: ParsedCV): boolean {
    return !!(cvData.personalInfo?.photo);
  }

  private hasWorkPermitInfo(cvData: ParsedCV): boolean {
    const personalInfo = cvData.personalInfo || {};
    return !!(personalInfo as any).workAuthorization || !!(personalInfo as any).visaStatus;
  }

  private hasExcessivePersonalData(cvData: ParsedCV): boolean {
    const personalInfo = cvData.personalInfo || {};
    const sensitiveFields = ['age', 'maritalStatus', 'nationality', 'photo', 'gender'];
    return sensitiveFields.filter(field => personalInfo[field as keyof typeof personalInfo]).length > 2;
  }

  private getPhotoProhibitionSeverity(region: string): 'critical' | 'error' | 'warning' | 'info' {
    // Regions where photos are strictly prohibited
    const strictlyProhibited = ['us', 'canada', 'uk', 'australia'];
    if (strictlyProhibited.includes(region.toLowerCase())) {
      return 'critical';
    }

    // Regions where photos are discouraged
    const discouraged = ['ireland', 'newzealand'];
    if (discouraged.includes(region.toLowerCase())) {
      return 'warning';
    }

    return 'info';
  }

  private isNationalityRequired(region: string): boolean {
    // Regions where nationality disclosure may be required
    const nationalityRequired = ['uae', 'singapore', 'hongkong'];
    return nationalityRequired.includes(region.toLowerCase());
  }

  private usesCorrectDateFormat(cvData: ParsedCV, expectedFormat: string): boolean {
    // Simplified check - in real implementation, would analyze date formats in CV
    return true; // Placeholder
  }

  private hasPersonalStatement(cvData: ParsedCV): boolean {
    return !!(cvData as any).summary || !!(cvData as any).objective || !!(cvData as any).personalStatement;
  }

  /**
   * Auto-fix compliance issues where possible
   */
  async autoFixCompliance(cvData: ParsedCV, issues: ComplianceIssue[]): Promise<{ fixedCV: ParsedCV; appliedFixes: string[] }> {
    const fixedCV = JSON.parse(JSON.stringify(cvData));
    const appliedFixes: string[] = [];

    for (const issue of issues) {
      if (!issue.autoFixAvailable) continue;

      switch (issue.type) {
        case 'photo':
          if (fixedCV.personalInfo?.photo) {
            delete fixedCV.personalInfo.photo;
            appliedFixes.push('Removed photo');
          }
          break;

        case 'age':
          if (fixedCV.personalInfo?.age) {
            delete fixedCV.personalInfo.age;
            appliedFixes.push('Removed age information');
          }
          if ((fixedCV.personalInfo as any)?.dateOfBirth) {
            delete (fixedCV.personalInfo as any).dateOfBirth;
            appliedFixes.push('Removed date of birth');
          }
          break;

        case 'gender':
          if (fixedCV.personalInfo?.gender) {
            delete fixedCV.personalInfo.gender;
            appliedFixes.push('Removed gender information');
          }
          break;

        case 'marital_status':
          if (fixedCV.personalInfo?.maritalStatus) {
            delete fixedCV.personalInfo.maritalStatus;
            appliedFixes.push('Removed marital status');
          }
          break;

        case 'personal_info':
          const sensitiveFields = ['religion', 'politicalAffiliation', 'sexualOrientation', 'disability', 'race', 'ethnicity'];
          for (const field of sensitiveFields) {
            if ((fixedCV.personalInfo as any)?.[field]) {
              delete (fixedCV.personalInfo as any)[field];
              appliedFixes.push(`Removed ${field} information`);
            }
          }
          break;
      }
    }

    return { fixedCV, appliedFixes };
  }
}