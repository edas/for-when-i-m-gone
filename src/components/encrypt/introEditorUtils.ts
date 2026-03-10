import { TFunction } from 'i18next';

/**
 * Contact type labels for rendering recipients
 */
interface ContactTypeLabels {
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
 * Node types for intro editor dynamic blocks
 */
export const INTRO_NODE_TYPES = {
  recipientsBlock: 'recipientsBlock',
  conditionsBlock: 'conditionsBlock',
  dateTimeInline: 'dateTimeInline',
  quorumInline: 'quorumInline',
} as const;

/**
 * Get contact type labels from translations
 */
export function getContactTypeLabels(t: TFunction): ContactTypeLabels {
  return {
    phone: t('whoEditor.contactTypes.phone'),
    email: t('whoEditor.contactTypes.email'),
    address: t('whoEditor.contactTypes.address'),
    x: t('whoEditor.contactTypes.x'),
    bluesky: t('whoEditor.contactTypes.bluesky'),
    mastodon: t('whoEditor.contactTypes.mastodon'),
    facebook: t('whoEditor.contactTypes.facebook'),
    telegram: t('whoEditor.contactTypes.telegram'),
    whatsapp: t('whoEditor.contactTypes.whatsapp'),
    signal: t('whoEditor.contactTypes.signal'),
    instagram: t('whoEditor.contactTypes.instagram'),
    snapchat: t('whoEditor.contactTypes.snapchat'),
    linkedin: t('whoEditor.contactTypes.linkedin'),
    web: t('whoEditor.contactTypes.web'),
    other: t('whoEditor.contactTypes.other'),
  };
}
