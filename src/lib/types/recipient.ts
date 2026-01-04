/**
 * Recipient and Contact types
 */

export type ContactType =
  | 'phone'
  | 'email'
  | 'address'
  | 'x'
  | 'bluesky'
  | 'mastodon'
  | 'facebook'
  | 'telegram'
  | 'whatsapp'
  | 'signal'
  | 'instagram'
  | 'snapchat'
  | 'linkedin'
  | 'web'
  | 'other';

export interface ContactInfo {
  id: string;
  type: ContactType;
  value: string;
  comment: string;
}

export interface Recipient {
  id: string;
  name: string;
  contacts: ContactInfo[];
  isPrivate?: boolean;
}

export function createEmptyContact(): ContactInfo {
  return { id: crypto.randomUUID(), type: 'phone', value: '', comment: '' };
}

export function createEmptyRecipient(): Recipient {
  return {
    id: crypto.randomUUID(),
    name: '',
    contacts: [
      { ...createEmptyContact(), type: 'phone' },
      { ...createEmptyContact(), type: 'email' },
      { ...createEmptyContact(), type: 'address' },
    ],
    isPrivate: false,
  };
}
