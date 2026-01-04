/**
 * Types for editor checkbox states and data
 */

import type { JSONContent } from '@tiptap/core';

export interface SecretCheckboxState {
  emails: boolean;
  phoneCodes: boolean;
  cloudAccounts: boolean;
  computerLogins: boolean;
  otherPasswords: boolean;
  domainManager: boolean;
  passwordManager: boolean;
  backups: boolean;
  crypto: boolean;
}

export const defaultSecretCheckboxState: SecretCheckboxState = {
  emails: false,
  phoneCodes: false,
  cloudAccounts: false,
  computerLogins: false,
  otherPasswords: false,
  domainManager: false,
  passwordManager: false,
  backups: false,
  crypto: false,
};

export interface IntroCheckboxState {
  authorIdentity: boolean;
  secretHolders: boolean;
  openingConditions: boolean;
  dated: boolean;
  quorum: boolean;
  directives: boolean;
}

export const defaultIntroCheckboxState: IntroCheckboxState = {
  authorIdentity: false,
  secretHolders: false,
  openingConditions: false,
  dated: false,
  quorum: false,
  directives: false,
};

export interface HowData {
  threshold: number;
  conditions: JSONContent | null;
  hasNoOpenConditions: boolean;
  isConditionsUnmodified?: boolean;
}
