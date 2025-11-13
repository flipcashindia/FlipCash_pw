// src/utils/validators.ts

/**
 * Validates a 10-digit Indian mobile number.
 * Must start with a digit from 6 to 9.
 */
export const validateMobile = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates an Indian PAN (Permanent Account Number).
 * Format: 5 letters, 4 numbers, 1 letter. (e.g., ABCDE1234F)
 */
export const validatePAN = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
};

/**
 * Validates a 6-digit Indian Pincode.
 * Must be exactly 6 digits and cannot start with 0.
 */
export const validatePincode = (pincode: string): boolean => {
  const pincodeRegex = /^[1-9]\d{5}$/;
  return pincodeRegex.test(pincode);
};