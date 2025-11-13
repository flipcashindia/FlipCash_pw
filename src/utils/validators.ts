export const validateMobile = (mobile: string): boolean => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePAN = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

export const validateGSTIN = (gstin: string): boolean => {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
};

export const validateIFSC = (ifsc: string): boolean => {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc);
};

export const validateUPI = (upi: string): boolean => {
  const upiRegex = /^[\w.-]+@[\w.-]+$/;
  return upiRegex.test(upi);
};

export const validatePincode = (pincode: string): boolean => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

export const validateIMEI = (imei: string): boolean => {
  return /^\d{15}$/.test(imei);
};

/**
 * Validates a 10-digit Indian mobile number.
 * Must start with a digit from 6 to 9.
 */
// export const validateMobile = (phone: string): boolean => {
//   const phoneRegex = /^[6-9]\d{9}$/;
//   return phoneRegex.test(phone);
// };

// /**
//  * Validates an Indian PAN (Permanent Account Number).
//  * Format: 5 letters, 4 numbers, 1 letter. (e.g., ABCDE1234F)
//  */
// export const validatePAN = (pan: string): boolean => {
//   const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
//   return panRegex.test(pan.toUpperCase());
// };

// /**
//  * Validates a 6-digit Indian Pincode.
//  * Must be exactly 6 digits and cannot start with 0.
//  */
// export const validatePincode = (pincode: string): boolean => {
//   const pincodeRegex = /^[1-9]\d{5}$/;
//   return pincodeRegex.test(pincode);
// };