/**
 * Security-related utilities
 */

import { updateStoredData } from './dataStore';

/**
 * Get the current datetime in ISO format with timezone
 */
function getCurrentISODateTime(): string {
  return new Date().toISOString();
}

/**
 * Record the security confirmation timestamp
 */
export async function recordSecurityConfirmation(): Promise<string> {
  const timestamp = getCurrentISODateTime();
  
  await updateStoredData((currentData) => ({
    ...currentData,
    security: { 
      ...currentData.security,
      confirmedAt: timestamp 
    } 
  }));
  
  return timestamp;
}
