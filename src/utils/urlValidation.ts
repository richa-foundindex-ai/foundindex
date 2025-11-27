// URL validation utilities for pre-flight checks

export interface ValidationResult {
  valid: boolean;
  normalizedUrl?: string;
  displayUrl?: string;
  error?: string;
  suggestion?: string;
  errorType?: 'format' | 'spaces' | 'missing_tld' | 'invalid';
}

/**
 * Client-side URL validation and normalization
 * Runs instantly before any API calls
 */
export function validateAndNormalizeUrl(input: string): ValidationResult {
  if (!input || input.trim().length === 0) {
    return {
      valid: false,
      error: 'Please enter a website URL',
      errorType: 'format'
    };
  }

  // Clean up the input
  let url = input.trim();
  
  // Check for spaces in the URL (common typo)
  if (url.includes(' ')) {
    const suggestion = url.replace(/\s+/g, '');
    return {
      valid: false,
      error: 'Website URLs cannot contain spaces',
      suggestion: suggestion,
      errorType: 'spaces'
    };
  }

  // Remove any leading dots (typo)
  url = url.replace(/^\.+/, '');

  // Add https:// if no protocol is present
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  // Try to parse as URL
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Must have at least one dot (domain.tld)
    if (!hostname.includes('.')) {
      return {
        valid: false,
        error: 'Invalid domain format. Did you forget .com?',
        suggestion: hostname + '.com',
        errorType: 'missing_tld'
      };
    }

    // Check for common typos
    if (hostname.includes('..')) {
      return {
        valid: false,
        error: 'Invalid URL format - double dots detected',
        suggestion: url.replace('..', '.'),
        errorType: 'format'
      };
    }

    // Return normalized URL (root domain only)
    return {
      valid: true,
      normalizedUrl: `${urlObj.protocol}//${urlObj.hostname}/`,
      displayUrl: hostname
    };

  } catch (e) {
    // Couldn't parse - provide helpful suggestions
    const suggestions: string[] = [];
    
    // Common fixes
    if (!input.includes('.')) {
      suggestions.push(input.trim() + '.com');
    }
    
    return {
      valid: false,
      error: 'Please enter a valid website URL (e.g., example.com)',
      suggestion: suggestions[0],
      errorType: 'invalid'
    };
  }
}

/**
 * Get user-friendly error message for different error types
 */
export function getErrorMessage(result: ValidationResult): { title: string; description: string } {
  switch (result.errorType) {
    case 'spaces':
      return {
        title: 'Spaces in URL',
        description: result.suggestion 
          ? `URLs cannot contain spaces. Did you mean "${result.suggestion}"?`
          : 'Website URLs cannot contain spaces. Please remove any spaces and try again.'
      };
    case 'missing_tld':
      return {
        title: 'Missing domain extension',
        description: result.suggestion
          ? `Did you mean "${result.suggestion}"?`
          : 'Please include the domain extension (like .com, .org, etc.)'
      };
    case 'format':
      return {
        title: 'Invalid URL format',
        description: result.error || 'Please check the URL format and try again.'
      };
    default:
      return {
        title: 'Invalid URL',
        description: result.error || 'Please enter a valid website URL (e.g., example.com)'
      };
  }
}
