/**
 * Module for managing JSON data storage in memory
 * The data is read from the DOM at initialization, then stored in a JavaScript object
 */

import type { JSONContent } from '@tiptap/core';
import type { SecretCheckboxState, IntroCheckboxState, HowData } from './types/editorTypes';
import type { Recipient } from './types/recipient';
import { base64ToUint8Array, bufferToText, decryptBufferWithPassword, encryptBufferWithPassword, exportKeyToBase64, textToBuffer } from './crypto/aes';
import { uint8ArrayToBase64 } from './crypto/aes';

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

/**
 * Internal representation with buffers (used in memory)
 */
interface GenerateData {
  aesKey?: Uint8Array; 
  encryptedSecret?: Uint8Array; 
  iv?: Uint8Array; 
  shares?: string[]; // Array of shares from ssss-js split
}

export interface ExportableGenerateData {
  aesKey?: string; // base64 encoded
  encryptedSecret?: string; // base64 encoded
  iv?: string; // base64 encoded
  shares?: string[]; // array of shares from ssss-js split
}

/**
 * Application mode determined from initial DOM data
 */
export type AppMode = 'encrypt' | 'decrypt' | 'locked';

export interface StoredData {
  mode: AppMode;
  security?: SecurityData;
  what?: WhatData;
  who?: WhoData;
  how?: HowData;
  intro?: IntroData;
  generate?: GenerateData; // Can be internal (buffers) or serialized (base64)
  language?: string;
}

interface ExportableStoredData {
  mode: AppMode;
  security?: SecurityData;
  what?: WhatData;
  who?: WhoData;
  how?: HowData;
  intro?: IntroData;
  generate?: ExportableGenerateData; // Can be internal (buffers) or serialized (base64)
  language?: string;
}

/**
 * Determine the application mode from stored data
 * @returns 'decrypt' if mode is 'decrypt', 'encrypt' otherwise (default)
 */
export function getAppMode(): AppMode {
  return storedData.mode;
}



const SCRIPT_ID = 'fwimg-data';

/**
 * Read initial data from the JSON script element in the document head
 * Converts serialized data (base64) to internal format (buffers)
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
    const parsed = JSON.parse(scriptElement.textContent) as StoredData;
    return parsed;
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

function toExportable(storedData: StoredData) : ExportableStoredData {
  return {
    ...storedData,
    generate: storedData.generate ? {
      ...storedData.generate,
      aesKey: storedData.generate?.aesKey ? uint8ArrayToBase64(storedData.generate.aesKey) : undefined,
      encryptedSecret: storedData.generate?.encryptedSecret ? uint8ArrayToBase64(storedData.generate.encryptedSecret) : undefined,
      iv: storedData.generate?.iv ? uint8ArrayToBase64(storedData.generate.iv) : undefined,
    } : undefined,
  }
}

function fromExportable(exportable: ExportableStoredData) : StoredData {
  return {
    ...exportable,
    generate: exportable.generate ? {
      ...exportable.generate,
      aesKey: exportable.generate?.aesKey ? base64ToUint8Array(exportable.generate.aesKey) : undefined,
      encryptedSecret: exportable.generate?.encryptedSecret ? base64ToUint8Array(exportable.generate.encryptedSecret) : undefined,
      iv: exportable.generate?.iv ? base64ToUint8Array(exportable.generate.iv) : undefined,
    } : undefined,
  };
}

type ExportableEncryptedDataWithPassword ={
  mode: AppMode;
  security?: SecurityData;
  salt: string;
  iv: string;
  ciphertext: string; 
}

type ExportedStoredData = ExportableStoredData | ExportableEncryptedDataWithPassword


async function encryptExportableData(exportableData: ExportableStoredData, password: string): Promise<ExportableEncryptedDataWithPassword> {
  const exportableString = JSON.stringify(exportableData);
  const exportableBuffer = textToBuffer(exportableString);
  const encryptedData = await encryptBufferWithPassword(exportableBuffer, password);
  return {
    mode: 'locked',
    security: exportableData.security,
    salt: uint8ArrayToBase64(encryptedData.salt),
    iv: uint8ArrayToBase64(encryptedData.iv),
    ciphertext: uint8ArrayToBase64(new Uint8Array(encryptedData.ciphertext)),
  };
}

async function decryptExportableData(exportableData: ExportableEncryptedDataWithPassword, password: string): Promise<ExportableStoredData> {
  const encryptedBuffer = {
    salt: base64ToUint8Array(exportableData.salt),
    iv: base64ToUint8Array(exportableData.iv),
    ciphertext: base64ToUint8Array(exportableData.ciphertext).buffer,
  }
  const encryptedData = await decryptBufferWithPassword(encryptedBuffer, password);
  const exportableString = bufferToText(encryptedData);
  return JSON.parse(exportableString) as ExportableStoredData;
}