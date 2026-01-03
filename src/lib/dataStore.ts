/**
 * Module for managing JSON data storage in HTML head
 * The data is stored in a <script type="application/json" id="fwimg-data"> element
 */

import type { SecretCheckboxState } from '../components/SecretEditor.svelte';
import type { IntroCheckboxState } from '../components/IntroMessageEditor.svelte';
import type { Recipient } from '../components/WhoEditor.svelte';
import type { HowData } from '../components/HowEditor.svelte';

export interface SecurityData {
  confirmedAt?: string; // ISO datetime with timezone
}

export interface WhatData {
  content?: string;
  checkboxState?: SecretCheckboxState;
}

export interface StoredData {
  encrypt?: number;
  security?: SecurityData;
  what?: WhatData;
  recipients?: Recipient[];
  howData?: HowData;
  introMessage?: string;
  introCheckboxState?: IntroCheckboxState;
  threshold?: number;
  language?: string;
}

const SCRIPT_ID = 'fwimg-data';
const DEBOUNCE_DELAY = 300; // ms

/**
 * Creates a debounced version of a function
 */
function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Get the JSON script element from the document head
 * @throws Error if the element is not found
 */
function getScriptElement(): HTMLScriptElement {
  const scriptElement = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  
  if (!scriptElement) {
    throw new Error(`Data script element #${SCRIPT_ID} not found in document`);
  }
  
  return scriptElement;
}

/**
 * Read the current stored data from the JSON block
 */
export function getStoredData(): StoredData {
  const scriptElement = getScriptElement();
  const data = JSON.parse(scriptElement.textContent!);
  console.log('read', data);
  return data;
}

/**
 * Mutex for serializing updateStoredData calls
 * Resolves to the last written data, avoiding DOM reads between updates
 */
let updateMutex = Promise.resolve(getStoredData());

/**
 * Update the stored data in the JSON block
 * Uses mutex to ensure only one update runs at a time
 * Reuses last written value from mutex to avoid DOM reads
 */
export function updateStoredData(updates: Partial<StoredData>): Promise<StoredData> {
  const result = updateMutex.then((currentData): StoredData => {
    const scriptElement = getScriptElement();
    const newData = { ...currentData, ...updates };
    console.log('write', updates);
    scriptElement.textContent = JSON.stringify(newData, null, 2);
    
    return newData;
  });
  
  updateMutex = result;
  return result;
}

/**
 * Get the current datetime in ISO format with timezone
 */
export function getCurrentISODateTime(): string {
  return new Date().toISOString();
}

/**
 * Record the security confirmation timestamp
 */
export async function recordSecurityConfirmation(): Promise<string> {
  const timestamp = getCurrentISODateTime();
  const currentData = await updateMutex;
  await updateStoredData({ 
    security: { 
      ...currentData.security,
      confirmedAt: timestamp 
    } 
  });
  return timestamp;
}

/**
 * Debounced version of updateStoredData for real-time saving
 */
export const updateStoredDataDebounced = debounce(
  (updates: Partial<StoredData>) => updateStoredData(updates),
  DEBOUNCE_DELAY
);
