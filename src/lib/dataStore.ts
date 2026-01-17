/**
 * Module for managing JSON data storage in memory
 * The data is read from the DOM at initialization, then stored in a JavaScript object
 */

import type { JSONContent } from '@tiptap/core';
import type { SecretCheckboxState, IntroCheckboxState, HowData } from './types/editorTypes';
import type { Recipient } from './types/recipient';

interface SecurityData {
  confirmedAt?: string; // ISO datetime with timezone
}

interface WhatData {
  content?: string;
  checkboxState?: SecretCheckboxState;
}

interface WhoData {
  recipients?: Recipient[];
}

interface IntroData {
  message?: JSONContent | null;
  checkboxState?: IntroCheckboxState;
}

export interface StoredData {
  encrypt?: number;
  security?: SecurityData;
  what?: WhatData;
  who?: WhoData;
  how?: HowData;
  intro?: IntroData;
  language?: string;
}

const SCRIPT_ID = 'fwimg-data';

/**
 * Read initial data from the JSON script element in the document head
 * @throws Error if the script element is not found or if parsing fails
 */
function readInitialDataFromDOM(): StoredData {
  const scriptElement = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  
  if (!scriptElement) {
    throw new Error(`Data script element #${SCRIPT_ID} not found in document`);
  }
  
  if (!scriptElement.textContent) {
    throw new Error(`Data script element #${SCRIPT_ID} has no content`);
  }
  
  try {
    return JSON.parse(scriptElement.textContent) as StoredData;
  } catch (error) {
    throw new Error(`Failed to parse JSON from script element #${SCRIPT_ID}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * In-memory data store, initialized from DOM at module load
 */
let storedData: StoredData = readInitialDataFromDOM();

/**
 * Read the current stored data from memory
 */
export function getStoredData(): StoredData {
  return storedData;
}

/**
 * Mutex for serializing updateStoredData calls
 * Resolves to the last written data
 */
let updateMutex = Promise.resolve(storedData);

/**
 * Update the stored data in memory
 * Uses mutex to ensure only one update runs at a time
 * @param updater Function that receives current data and returns the complete new data
 */
export function updateStoredData(updater: (currentData: StoredData) => StoredData): Promise<StoredData> {
  const result = updateMutex.then((currentData): StoredData => {
    const newData = updater(currentData);
    storedData = newData;
    return newData;
  });
  
  updateMutex = result;
  return result;
}
