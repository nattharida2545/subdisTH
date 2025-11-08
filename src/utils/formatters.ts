/**
 * Utility functions for formatting data
 */

/**
 * Masks an ID card number, showing only the last 4 digits
 * @param idCard - The ID card number to mask
 * @returns The masked ID card number
 */
export const maskIdCard = (idCard: string | undefined): string => {
  if (!idCard) return "ไม่ระบุเลขบัตร";

  // If ID card is shorter than 4 characters, just return it as is
  if (idCard.length <= 4) return idCard;

  // Get the last 4 digits
  const lastFourDigits = idCard.slice(-4);

  // Create a mask of X characters for the rest of the digits
  const maskLength = idCard.length - 4;
  const mask = "X".repeat(maskLength);

  // Return the masked ID card number
  return `${mask}${lastFourDigits}`;
};

/**
 * Formats a phone number to a standard format (XXX-XXX-XXXX)
 * @param phoneNumber - The phone number to format
 * @returns The formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string | undefined): string => {
  if (!phoneNumber) return "";
  
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, "");
  
  // Format the phone number
  if (digits.length === 10) {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  
  return phoneNumber;
};
