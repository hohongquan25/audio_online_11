/**
 * Utility functions for generating user codes
 */

/**
 * Generate a random 9-character alphanumeric code
 * Format: 9 random characters (uppercase letters and numbers)
 * Example: "A3K9M2P7Q"
 */
export function generateUserCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 9; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  
  return code;
}

/**
 * Validate user code format
 */
export function isValidUserCode(code: string): boolean {
  // Should be exactly 9 alphanumeric characters
  return /^[A-Z0-9]{9}$/.test(code);
}
