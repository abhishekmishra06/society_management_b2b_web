// Centralized validation utility for the entire project

export const VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s.'-]+$/,
    message: 'Name must be 2-100 characters, letters only',
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  mobile: {
    required: true,
    pattern: /^[6-9]\d{9}$/,
    message: 'Please enter a valid 10-digit mobile number',
  },
  flatNumber: {
    required: true,
    pattern: /^[A-Za-z0-9\-/]+$/,
    message: 'Flat number should contain only letters, numbers, - or /',
  },
  amount: {
    required: true,
    min: 0,
    message: 'Amount must be a positive number',
  },
  aadhar: {
    pattern: /^\d{12}$/,
    message: 'Aadhaar must be 12 digits',
  },
  pan: {
    pattern: /^[A-Z]{5}\d{4}[A-Z]$/,
    message: 'PAN format: ABCDE1234F',
  },
  pincode: {
    pattern: /^\d{6}$/,
    message: 'Pincode must be 6 digits',
  },
  vehicleNumber: {
    pattern: /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{4}$/,
    message: 'Enter valid vehicle number (e.g., MH01AB1234)',
  },
};

/**
 * Validate a single field
 * @returns {string|null} Error message or null if valid
 */
export function validateField(value, rules) {
  if (!rules) return null;
  
  const val = String(value || '').trim();
  
  if (rules.required && !val) {
    return rules.message || 'This field is required';
  }
  
  if (!val) return null; // Skip other checks if empty and not required
  
  if (rules.minLength && val.length < rules.minLength) {
    return `Minimum ${rules.minLength} characters required`;
  }
  
  if (rules.maxLength && val.length > rules.maxLength) {
    return `Maximum ${rules.maxLength} characters allowed`;
  }
  
  if (rules.pattern && !rules.pattern.test(val)) {
    return rules.message || 'Invalid format';
  }
  
  if (rules.min !== undefined && Number(val) < rules.min) {
    return `Minimum value is ${rules.min}`;
  }
  
  if (rules.max !== undefined && Number(val) > rules.max) {
    return `Maximum value is ${rules.max}`;
  }
  
  return null;
}

/**
 * Validate entire form data against a schema
 * @param {Object} data - Form data
 * @param {Object} schema - { fieldName: VALIDATION_RULES.xxx or custom rules }
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateForm(data, schema) {
  const errors = {};
  let isValid = true;
  
  Object.entries(schema).forEach(([field, rules]) => {
    const error = validateField(data[field], rules);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  });
  
  return { isValid, errors };
}

/**
 * Format mobile number as user types
 */
export function formatMobile(value) {
  return value.replace(/\D/g, '').slice(0, 10);
}

/**
 * Format amount with commas (Indian format)
 */
export function formatAmount(value) {
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString('en-IN');
}
