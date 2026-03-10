/**
 * Module for managing JSON data storage in memory with Zustand
 * The data is read from the DOM at initialization, then stored in a Zustand store
 */

import type { JSONContent } from '@tiptap/core';
import type { SecretCheckboxState, IntroCheckboxState, HowData } from './types/editorTypes';
import type { Recipient } from './types/recipient';
import { base64ToUint8Array } from './crypto/aes';
import { create } from 'zustand';
import { initialLanguage } from './i18n';

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

interface ExportableGenerateData {
  aesKey?: string; // base64 encoded
  encryptedSecret?: string; // base64 encoded
  iv?: string; // base64 encoded
  shares?: string[]; // array of shares from ssss-js split
}

/**
 * Application mode determined from initial DOM data
 */
type AppMode = 'encrypt' | 'decrypt' | 'locked';

export type StoredData = EncryptStoredData | DecryptStoredData | LockedStoredData;

type baseStoredData = {
  mode: AppMode;
  language?: string;
}

export type EncryptStoredData = baseStoredData & {
  mode: 'encrypt';
  what?: WhatData;
  who?: WhoData;
  how?: HowData;
  intro?: IntroData;
  generate?: GenerateData; // Can be internal (buffers) or serialized (base64)
}

type ExportableEncryptStoredData = Omit<EncryptStoredData, 'generate'> & {
  generate?: ExportableGenerateData; // Can be internal (buffers) or serialized (base64)
}

export type DecryptStoredData = baseStoredData & {
  mode: 'decrypt';
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
    const parsed = JSON.parse(scriptElement.textContent) as ExportableStoredData;
    return {
      language: initialLanguage,
      ...fromExportable(parsed)
    };
  } catch (error) {
    throw new Error(`Failed to parse JSON from script element #${SCRIPT_ID}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Zustand store for reactive data management
 * Initialized from DOM at module load
 */
type StoreActions = {
  setData(updater: (current: StoredData) => Partial<StoredData>, replace?: boolean): void;
  getData(): StoredData;
}

export type EncryptStoreActions = {
  setData(updater: (current: EncryptStoredData) => Partial<EncryptStoredData>, replace?: boolean): void;
  getData(): EncryptStoredData;
}

export const useDataStore = create<StoredData & StoreActions>(
  (set, get) => ({
    ...readInitialDataFromDOM(),
    setData: set,
    getData: get,
  })
)

export function useEncryptDataStore(selector: (data: EncryptStoredData & StoreActions) => any): any {
  return useDataStore((state) => {
    if (isEncryptData(state)) {
      return selector(state);
    } 
    throw new Error('Invalid data store');
  });
}

function fromExportable(exportable: ExportableStoredData): StoredData {
  switch (exportable.mode) {
    case 'encrypt':
      return {
        ...exportable,
        generate: exportable.generate ? {
          ...exportable.generate,
          aesKey: exportable.generate.aesKey ? base64ToUint8Array(exportable.generate.aesKey) : undefined,
          encryptedSecret: exportable.generate.encryptedSecret ? base64ToUint8Array(exportable.generate.encryptedSecret) : undefined,
          iv: exportable.generate.iv ? base64ToUint8Array(exportable.generate.iv) : undefined,
        } : undefined,
      };
    case 'decrypt':
    case 'locked':
      return exportable;
    default:
      throw new Error('Invalid exportable data');
  }
}

export type LockedStoredData = baseStoredData & {
  mode: 'locked';
  salt: string;
  iv: string;
  ciphertext: string; 
}

type ExportableStoredData = ExportableEncryptStoredData | DecryptStoredData | LockedStoredData;

function isEncryptData(data: StoredData): data is StoredData & EncryptStoredData {
  return data.mode === 'encrypt';
}