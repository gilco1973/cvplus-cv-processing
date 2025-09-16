// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * CV Data Validation Module
 *
 * Validates CV-specific data structures and content.
 * Extracted from validation.service.ts for better modularity.
 *
 * @author Gil Klainert
 * @version 1.0.0
 */

import { ValidationResult, ValidationError, ValidationErrorCode, ValidationOptions } from '../../../services/validation/types';
import { TextValidator } from '../../../services/validation/text-validator';

export class CVValidator {
  private textValidator: TextValidator;

  private readonly defaultMaxLengths = {
    name: 100,
    title: 200,
    summary: 2000,
    company: 150,
    description: 1000,
    achievement: 500,
    skill: 50,
    institution: 150,
    degree: 100,
    project: 100,
    certification: 150
  };

  constructor() {
    this.textValidator = new TextValidator();
  }

  /**
   * Validates personal information section
   */
  validatePersonalInfo(personalInfo: any): ValidationResult {
    const errors: ValidationError[] = [];
    const sanitizedData: any = {};

    if (!personalInfo || typeof personalInfo !== 'object') {
      errors.push({
        field: 'personalInfo',
        code: ValidationErrorCode.REQUIRED_FIELD,
        message: 'Personal information is required',
        severity: 'error'
      });
      return { isValid: false, errors };
    }

    // Validate name
    if (personalInfo.name) {
      const nameResult = this.textValidator.validateText(
        personalInfo.name,
        'name',
        this.defaultMaxLengths.name
      );
      errors.push(...nameResult.errors);
      sanitizedData.name = nameResult.sanitizedData;
    } else {
      errors.push({
        field: 'name',
        code: ValidationErrorCode.REQUIRED_FIELD,
        message: 'Name is required',
        severity: 'error'
      });
    }

    // Validate email
    if (personalInfo.email) {
      const emailResult = this.textValidator.validateEmail(personalInfo.email);
      errors.push(...emailResult.errors);
      sanitizedData.email = emailResult.sanitizedData;
    }

    // Validate phone (optional)
    if (personalInfo.phone) {
      const phoneResult = this.textValidator.validatePhone(personalInfo.phone);
      errors.push(...phoneResult.errors);
      sanitizedData.phone = phoneResult.sanitizedData;
    }

    // Validate URLs
    const urlFields = ['linkedin', 'github', 'website', 'portfolio'];
    for (const field of urlFields) {
      if (personalInfo[field]) {
        const urlResult = this.textValidator.validateUrl(personalInfo[field], field);
        errors.push(...urlResult.errors);
        sanitizedData[field] = urlResult.sanitizedData;
      }
    }

    // Validate location (optional)
    if (personalInfo.location) {
      const locationResult = this.textValidator.validateText(
        personalInfo.location,
        'location',
        200
      );
      errors.push(...locationResult.errors);
      sanitizedData.location = locationResult.sanitizedData;
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      sanitizedData
    };
  }

  /**
   * Validates work experience array
   */
  validateExperience(experience: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const sanitizedData: any[] = [];

    if (!Array.isArray(experience)) {
      return { isValid: true, errors: [], sanitizedData: [] };
    }

    experience.forEach((exp, index) => {
      const sanitizedExp: any = {};

      // Validate title
      if (exp.title) {
        const titleResult = this.textValidator.validateText(
          exp.title,
          `experience[${index}].title`,
          this.defaultMaxLengths.title
        );
        errors.push(...titleResult.errors);
        sanitizedExp.title = titleResult.sanitizedData;
      }

      // Validate company
      if (exp.company) {
        const companyResult = this.textValidator.validateText(
          exp.company,
          `experience[${index}].company`,
          this.defaultMaxLengths.company
        );
        errors.push(...companyResult.errors);
        sanitizedExp.company = companyResult.sanitizedData;
      }

      // Validate dates
      if (exp.startDate) {
        const startDateResult = this.textValidator.validateDate(
          exp.startDate,
          `experience[${index}].startDate`
        );
        errors.push(...startDateResult.errors);
        sanitizedExp.startDate = startDateResult.sanitizedData;
      }

      if (exp.endDate) {
        const endDateResult = this.textValidator.validateDate(
          exp.endDate,
          `experience[${index}].endDate`
        );
        errors.push(...endDateResult.errors);
        sanitizedExp.endDate = endDateResult.sanitizedData;
      }

      // Validate description
      if (exp.description) {
        const descResult = this.textValidator.validateText(
          exp.description,
          `experience[${index}].description`,
          this.defaultMaxLengths.description
        );
        errors.push(...descResult.errors);
        sanitizedExp.description = descResult.sanitizedData;
      }

      // Validate achievements array
      if (Array.isArray(exp.achievements)) {
        sanitizedExp.achievements = [];
        exp.achievements.forEach((achievement: string, achIndex: number) => {
          const achResult = this.textValidator.validateText(
            achievement,
            `experience[${index}].achievements[${achIndex}]`,
            this.defaultMaxLengths.achievement
          );
          errors.push(...achResult.errors);
          if (achResult.sanitizedData) {
            sanitizedExp.achievements.push(achResult.sanitizedData);
          }
        });
      }

      sanitizedData.push(sanitizedExp);
    });

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      sanitizedData
    };
  }

  /**
   * Validates skills array
   */
  validateSkills(skills: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const sanitizedData: any[] = [];

    if (!Array.isArray(skills)) {
      return { isValid: true, errors: [], sanitizedData: [] };
    }

    // Check for reasonable skill count
    if (skills.length > 50) {
      errors.push({
        field: 'skills',
        code: ValidationErrorCode.TOO_LONG,
        message: 'Too many skills listed (maximum 50)',
        severity: 'warning'
      });
    }

    skills.forEach((skill, index) => {
      if (typeof skill === 'string') {
        const skillResult = this.textValidator.validateText(
          skill,
          `skills[${index}]`,
          this.defaultMaxLengths.skill
        );
        errors.push(...skillResult.errors);
        if (skillResult.sanitizedData) {
          sanitizedData.push(skillResult.sanitizedData);
        }
      } else if (typeof skill === 'object' && skill.name) {
        // Handle skill objects with name and level
        const skillResult = this.textValidator.validateText(
          skill.name,
          `skills[${index}].name`,
          this.defaultMaxLengths.skill
        );
        errors.push(...skillResult.errors);

        const sanitizedSkill: any = {
          name: skillResult.sanitizedData
        };

        if (skill.level) {
          sanitizedSkill.level = skill.level;
        }

        sanitizedData.push(sanitizedSkill);
      }
    });

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      sanitizedData
    };
  }

  /**
   * Validates education array
   */
  validateEducation(education: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const sanitizedData: any[] = [];

    if (!Array.isArray(education)) {
      return { isValid: true, errors: [], sanitizedData: [] };
    }

    education.forEach((edu, index) => {
      const sanitizedEdu: any = {};

      // Validate institution
      if (edu.institution) {
        const instResult = this.textValidator.validateText(
          edu.institution,
          `education[${index}].institution`,
          this.defaultMaxLengths.institution
        );
        errors.push(...instResult.errors);
        sanitizedEdu.institution = instResult.sanitizedData;
      }

      // Validate degree
      if (edu.degree) {
        const degreeResult = this.textValidator.validateText(
          edu.degree,
          `education[${index}].degree`,
          this.defaultMaxLengths.degree
        );
        errors.push(...degreeResult.errors);
        sanitizedEdu.degree = degreeResult.sanitizedData;
      }

      // Validate graduation year
      if (edu.year) {
        const yearResult = this.validateYear(edu.year, `education[${index}].year`);
        errors.push(...yearResult.errors);
        sanitizedEdu.year = yearResult.sanitizedData;
      }

      // Validate GPA (optional)
      if (edu.gpa) {
        const gpaResult = this.validateGPA(edu.gpa, `education[${index}].gpa`);
        errors.push(...gpaResult.errors);
        sanitizedEdu.gpa = gpaResult.sanitizedData;
      }

      sanitizedData.push(sanitizedEdu);
    });

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      sanitizedData
    };
  }

  private validateYear(year: string | number, fieldName: string): ValidationResult {
    const errors: ValidationError[] = [];

    const yearNum = typeof year === 'string' ? parseInt(year) : year;
    const currentYear = new Date().getFullYear();

    if (isNaN(yearNum)) {
      errors.push({
        field: fieldName,
        code: ValidationErrorCode.INVALID_FORMAT,
        message: 'Year must be a valid number',
        severity: 'error'
      });
    } else if (yearNum < 1950 || yearNum > currentYear + 5) {
      errors.push({
        field: fieldName,
        code: ValidationErrorCode.OUT_OF_RANGE,
        message: `Year should be between 1950 and ${currentYear + 5}`,
        severity: 'warning'
      });
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      sanitizedData: yearNum
    };
  }

  private validateGPA(gpa: string | number, fieldName: string): ValidationResult {
    const errors: ValidationError[] = [];

    const gpaNum = typeof gpa === 'string' ? parseFloat(gpa) : gpa;

    if (isNaN(gpaNum)) {
      errors.push({
        field: fieldName,
        code: ValidationErrorCode.INVALID_FORMAT,
        message: 'GPA must be a valid number',
        severity: 'error'
      });
    } else if (gpaNum < 0 || gpaNum > 4.0) {
      errors.push({
        field: fieldName,
        code: ValidationErrorCode.OUT_OF_RANGE,
        message: 'GPA should be between 0.0 and 4.0',
        severity: 'warning'
      });
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      sanitizedData: gpaNum
    };
  }
}