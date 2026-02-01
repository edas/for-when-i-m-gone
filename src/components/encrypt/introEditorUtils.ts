import { TFunction } from 'i18next';
import type { JSONContent } from '@tiptap/core';
import { type IntroCheckboxState } from '../../lib/types/editorTypes';
import { hasNodeTypeInJSON, type ContactTypeLabels } from '../../lib/tiptap/extensions';
import { computeInitialCheckboxState } from '../../lib/checkboxSync';

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
 * Compute initial checkbox states based on content detection or saved state
 */
export function computeInitialCheckboxStates(
  content: JSONContent | null,
  saved?: IntroCheckboxState
): IntroCheckboxState {
  return {
    authorIdentity: saved?.authorIdentity ?? false,
    secretHolders: computeInitialCheckboxState(
      hasNodeTypeInJSON(content, INTRO_NODE_TYPES.recipientsBlock),
      saved?.secretHolders
    ),
    openingConditions: computeInitialCheckboxState(
      hasNodeTypeInJSON(content, INTRO_NODE_TYPES.conditionsBlock),
      saved?.openingConditions
    ),
    dated: computeInitialCheckboxState(
      hasNodeTypeInJSON(content, INTRO_NODE_TYPES.dateTimeInline),
      saved?.dated
    ),
    quorum: computeInitialCheckboxState(
      hasNodeTypeInJSON(content, INTRO_NODE_TYPES.quorumInline),
      saved?.quorum
    ),
    directives: saved?.directives ?? false,
  };
}

/**
 * Derived state for intro editor validation
 */
export interface IntroDerivedState {
  hasRecipientsBlock: boolean;
  hasConditionsBlock: boolean;
  hasDateTimeInline: boolean;
  hasQuorumInline: boolean;
  hasContent: boolean;
  allEssentialsChecked: boolean;
  anyChecked: boolean;
}

/**
 * Compute derived state for IntroEditor validation
 */
export function computeIntroDerivedState(
  checkboxState: IntroCheckboxState,
  hasContent: boolean,
  hasRecipientsBlock: boolean,
  hasConditionsBlock: boolean,
  hasDateTimeInline: boolean,
  hasQuorumInline: boolean
): IntroDerivedState {
  const { authorIdentity, secretHolders, openingConditions, dated, quorum, directives } = checkboxState;
  
  const allEssentialsChecked = authorIdentity && secretHolders && openingConditions && dated && quorum;
  const anyChecked = authorIdentity || secretHolders || openingConditions || dated || quorum || directives;

  return {
    hasRecipientsBlock,
    hasConditionsBlock,
    hasDateTimeInline,
    hasQuorumInline,
    hasContent,
    allEssentialsChecked,
    anyChecked,
  };
}

/**
 * Get variant and title for the help section based on validation state
 */
export function getIntroVariantAndTitle(
  hasContent: boolean,
  allEssentialsChecked: boolean,
  anyChecked: boolean,
  t: TFunction
): { variant: 'error' | 'warning' | 'info' | 'success'; title: string } {
  if (!hasContent) {
    return {
      variant: 'warning',
      title: t('introEditor.sidePanel.title'),
    };
  }
  
  if (allEssentialsChecked) {
    return {
      variant: 'success',
      title: t('introEditor.sidePanel.successTitle'),
    };
  }
  
  if (anyChecked) {
    return {
      variant: 'info',
      title: t('introEditor.sidePanel.infoTitle'),
    };
  }
  
  return {
    variant: 'warning',
    title: t('introEditor.sidePanel.title'),
  };
}

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
