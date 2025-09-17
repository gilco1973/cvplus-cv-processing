// @ts-ignore
/**
 * Validation Types
 *
 * Core validation types for CV processing module.
 * Implemented locally to avoid module resolution issues.
 *
 * @author Gil Klainert
 * @version 1.0.0
 */

export enum ValidationErrorCode {
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  TOO_LONG = 'TOO_LONG',
  TOO_SHORT = 'TOO_SHORT',
  OUT_OF_RANGE = 'OUT_OF_RANGE',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_URL = 'INVALID_URL',
  INVALID_PHONE = 'INVALID_PHONE',
  INVALID_DATE = 'INVALID_DATE',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION'
}

export interface ValidationError {
  /** Field that has the validation error */
  field: string;
  /** Error code for categorization */
  code: ValidationErrorCode;
  /** Human-readable error message */
  message: string;
  /** Error severity level */
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Array of validation errors found */
  errors: ValidationError[];
  /** Sanitized data if validation passed */
  sanitizedData?: any;
}

export interface ValidationOptions {
  /** Whether to perform strict validation */
  strict?: boolean;
  /** Maximum string length allowed */
  maxLength?: number;
  /** Minimum string length required */
  minLength?: number;
  /** Custom validation rules */
  customRules?: Array<(value: any) => ValidationResult>;
}

/**
 * Text validation utility class
 */
export class TextValidator {

  validateText(text: string, fieldName: string, maxLength?: number): ValidationResult {
    const errors: ValidationError[] = [];

    if (!text || text.trim().length === 0) {
      errors.push({
        field: fieldName,
        code: ValidationErrorCode.REQUIRED_FIELD,
        message: `${fieldName} is required`,
        severity: 'error'
      });
      return { isValid: false, errors };
    }

    const trimmedText = text.trim();

    if (maxLength && trimmedText.length > maxLength) {
      errors.push({
        field: fieldName,
        code: ValidationErrorCode.TOO_LONG,
        message: `${fieldName} exceeds maximum length of ${maxLength} characters`,
        severity: 'error'
      });
    }

    // Check for security violations (basic XSS prevention)
    const dangerousPatterns = [/<script/i, /javascript:/i, /on\w+=/i];
    const hasDangerousContent = dangerousPatterns.some(pattern => pattern.test(trimmedText));

    if (hasDangerousContent) {
      errors.push({
        field: fieldName,
        code: ValidationErrorCode.SECURITY_VIOLATION,
        message: `${fieldName} contains potentially dangerous content`,
        severity: 'error'
      });
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      sanitizedData: trimmedText
    };
  }

  validateEmail(email: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!email) {
      errors.push({
        field: 'email',
        code: ValidationErrorCode.REQUIRED_FIELD,
        message: 'Email is required',
        severity: 'error'
      });
      return { isValid: false, errors };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({
        field: 'email',
        code: ValidationErrorCode.INVALID_EMAIL,
        message: 'Invalid email format',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: email.toLowerCase().trim()
    };
  }

  validatePhone(phone: string): ValidationResult {
    const errors: ValidationError[] = [];

    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      errors.push({
        field: 'phone',
        code: ValidationErrorCode.INVALID_PHONE,
        message: 'Phone number must be between 7 and 15 digits',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: phone.trim()
    };
  }

  validateUrl(url: string, fieldName: string): ValidationResult {
    const errors: ValidationError[] = [];

    try {
      new URL(url);
    } catch {
      errors.push({
        field: fieldName,
        code: ValidationErrorCode.INVALID_URL,
        message: `${fieldName} is not a valid URL`,
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: url.trim()
    };
  }

  validateDate(dateString: string, fieldName: string): ValidationResult {
    const errors: ValidationError[] = [];

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      errors.push({
        field: fieldName,
        code: ValidationErrorCode.INVALID_DATE,
        message: `${fieldName} is not a valid date`,
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: date
    };
  }
}