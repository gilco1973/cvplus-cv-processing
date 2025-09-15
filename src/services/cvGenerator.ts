/**
 * CV Generator - Stub implementation
 * Note: This should be moved to cv-processing module
 */

export const cvGenerator = {
  generate: async (_data: any) => {
    // Stub implementation
    return { success: false, error: 'Not implemented in core module' };
  }
};

// Export with capitalized name for compatibility
export const CVGenerator = cvGenerator;