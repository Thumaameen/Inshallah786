/**
 * ID Number Validation for South African IDs
 */
export function validateIdNumber(idNumber: string): boolean {
  // Basic format check
  if (!idNumber || typeof idNumber !== 'string' || idNumber.length !== 13) {
    return false;
  }

  // Only digits allowed
  if (!/^\d{13}$/.test(idNumber)) {
    return false;
  }

  // Extract components
  const year = parseInt(idNumber.substring(0, 2));
  const month = parseInt(idNumber.substring(2, 4));
  const day = parseInt(idNumber.substring(4, 6));
  
  // Validate date components
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Calculate checksum
  let sum = 0;
  let isMultiplyByTwo = false;
  
  for (let i = idNumber.length - 2; i >= 0; i--) {
    let digit = parseInt(idNumber[i]);
    
    if (isMultiplyByTwo) {
      digit *= 2;
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
    }
    
    sum += digit;
    isMultiplyByTwo = !isMultiplyByTwo;
  }

  const checksum = (10 - (sum % 10)) % 10;
  const lastDigit = parseInt(idNumber[12]);

  return checksum === lastDigit;
}