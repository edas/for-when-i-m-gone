import { TFunction } from 'i18next';
import { type ContactType, type ContactInfo, type Recipient } from '../../lib/types/recipient';

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

export const CONTACT_TYPES: ContactType[] = [
  'phone', 'email', 'address', 'x', 'bluesky', 'mastodon',
  'facebook', 'telegram', 'whatsapp', 'signal',
  'instagram', 'snapchat', 'linkedin', 'web', 'other',
];

export function computeDerivedState(recipients: Recipient[]) {
  // Filter out hidden recipients (isPrivate === true) for contact checks
  const visibleRecipients = recipients.filter(r => !r.isPrivate);
  const unnamedCount = recipients.filter(r => !r.name.trim()).length;
  
  const hasAtLeast2 = recipients.length >= 2;
  const hasAtLeast3 = recipients.length >= 3;
  const hasAtLeast5 = recipients.length >= 5;
  const allNamed = recipients.length > 0 && !unnamedCount;
  // Only check visible recipients for contact info
  const allHaveContact = visibleRecipients.length > 0 && visibleRecipients.every(r => 
    r.contacts.length > 0 && r.contacts.some(c => c.value.trim())
  );
  
  // Only check visible recipients for contact types
  const allHaveAddress = visibleRecipients.length > 0 && visibleRecipients.every(r => 
    r.contacts.some(c => c.type === 'address' && c.value.trim())
  );
  const allHaveEmail = visibleRecipients.length > 0 && visibleRecipients.every(r => 
    r.contacts.some(c => c.type === 'email' && c.value.trim())
  );
  const allHavePhone = visibleRecipients.length > 0 && visibleRecipients.every(r => 
    r.contacts.some(c => c.type === 'phone' && c.value.trim())
  );

  return {
    unnamedCount,
    hasAtLeast2, hasAtLeast3, hasAtLeast5,
    allNamed, allHaveContact,
    allHaveAddress, allHaveEmail, allHavePhone,
  };
}

export function getInitialExpandedId(recipients: Recipient[]): string | null {
  const unnamedRecipient = recipients.find(r => !r.name.trim());
  if (unnamedRecipient) return unnamedRecipient.id;
  if (recipients.length > 1) return null;
  return recipients[0]?.id ?? null;
}

export function getInitialState(initialRecipients?: Recipient[]) {
  if (initialRecipients?.length) {
    return {
      recipients: [...initialRecipients],
      expandedId: getInitialExpandedId(initialRecipients),
    };
  }
  const defaultRecipient = createEmptyRecipient();
  return {
    recipients: [defaultRecipient],
    expandedId: defaultRecipient.id,
  };
}

export function getVariantAndTitle(
  hasAtLeast2: boolean,
  unnamedCount: number,
  essentials: boolean[],
  optional: boolean[],
  t: TFunction
): { variant: 'error' | 'warning' | 'info' | 'success', title: string } {
  if (unnamedCount > 0) {
    return {
      variant: 'error',
      title: t('whoEditor.sidePanel.unnamedTitle')
    };
  }
  
  if (!hasAtLeast2) {
    return {
      variant: 'error',
      title: t('whoEditor.sidePanel.errorTitle')
    };
  }

  const essentialCount = essentials.filter(Boolean).length;
  const essentialTotal = essentials.length;
  const allCheckedCount = essentialCount + optional.filter(Boolean).length;
  const allTotal = essentialTotal + optional.length;
  const allChecked = allCheckedCount === allTotal;
  const allEssentialChecked = essentialCount === essentialTotal;

  if (allChecked) {
    return {
      variant: 'success',
      title: t('whoEditor.sidePanel.successTitle', { count: allCheckedCount, total: allTotal })
    };
  }
  if (allEssentialChecked) {
    return {
      variant: 'info',
      title: t('whoEditor.sidePanel.infoTitle', { count: allCheckedCount, total: allTotal })
    };
  }
  return {
    variant: 'warning',
    title: t('whoEditor.sidePanel.warningTitle', { count: essentialCount, total: essentialTotal })
  };
}
