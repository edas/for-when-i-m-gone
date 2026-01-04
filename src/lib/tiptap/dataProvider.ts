/**
 * TipTap Dynamic Data Provider
 * 
 * Stores dynamic data that TipTap extensions read during rendering.
 * This avoids storing duplicate data in TipTap node attributes.
 */

import type { JSONContent } from '@tiptap/core';
import type { Recipient } from '../types/recipient';
import type { Language } from '../i18n';

/**
 * Contact type labels for rendering recipients
 */
export interface ContactTypeLabels {
  phone: string;
  email: string;
  address: string;
  x: string;
  bluesky: string;
  mastodon: string;
  facebook: string;
  telegram: string;
  whatsapp: string;
  signal: string;
  instagram: string;
  snapchat: string;
  linkedin: string;
  web: string;
  other: string;
}

/**
 * Dynamic data structure for TipTap extensions
 */
export interface DynamicData {
  recipients: Recipient[];
  conditions: JSONContent | null;
  threshold: number;
  lang: Language;
  contactTypeLabels: ContactTypeLabels;
}

/**
 * Default contact type labels (English)
 */
const defaultContactTypeLabels: ContactTypeLabels = {
  phone: 'Phone',
  email: 'Email',
  address: 'Address',
  x: 'X',
  bluesky: 'Bluesky',
  mastodon: 'Mastodon',
  facebook: 'Facebook',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  signal: 'Signal',
  instagram: 'Instagram',
  snapchat: 'Snapchat',
  linkedin: 'LinkedIn',
  web: 'Web',
  other: 'Other',
};

/**
 * The dynamic data store - read by TipTap extensions during rendering
 */
export const dynamicData: DynamicData = {
  recipients: [],
  conditions: null,
  threshold: 0,
  lang: 'en',
  contactTypeLabels: defaultContactTypeLabels,
};

/**
 * Update the dynamic data store
 * Call this before refreshing TipTap view
 */
export function setDynamicData(data: Partial<DynamicData>): void {
  Object.assign(dynamicData, data);
}

/**
 * Reset dynamic data to defaults
 */
export function resetDynamicData(): void {
  dynamicData.recipients = [];
  dynamicData.conditions = null;
  dynamicData.threshold = 0;
  dynamicData.lang = 'en';
  dynamicData.contactTypeLabels = defaultContactTypeLabels;
}
