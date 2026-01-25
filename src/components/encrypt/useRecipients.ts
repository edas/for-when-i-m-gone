import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { type Recipient, createEmptyContact, createEmptyRecipient } from '../../lib/types/recipient';
import { getInitialState } from './whoEditorUtils';

export function useRecipients(initialRecipients?: Recipient[]) {
  const [initialState] = useState(() => getInitialState(initialRecipients));
  const [recipients, setRecipients] = useState<Recipient[]>(initialState.recipients);
  const [expandedRecipientId, setExpandedRecipientId] = useState<string | null>(initialState.expandedId);
  const [autoFocusRecipientId, setAutoFocusRecipientId] = useState<string | null>(null);
  const recipientCardRefs = useRef<Record<string, HTMLDivElement>>({});

  const expandedRecipientHasName = useMemo(() => 
    expandedRecipientId !== null && 
    recipients.find(r => r.id === expandedRecipientId)?.name.trim() !== ''
  , [expandedRecipientId, recipients]);

  const addRecipient = useCallback(() => {
    const newRecipient = createEmptyRecipient();
    setRecipients(prev => [...prev, newRecipient]);
    setExpandedRecipientId(newRecipient.id);
    setAutoFocusRecipientId(newRecipient.id);
    
    setTimeout(() => {
      recipientCardRefs.current[newRecipient.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => setAutoFocusRecipientId(null), 200);
    }, 150);
  }, []);

  const removeRecipient = useCallback((id: string) => {
    setRecipients(prev => {
      const recipient = prev.find(r => r.id === id);
      if (recipient && typeof recipient.number === 'number' && recipient.number > 0) return prev;
      
      const index = prev.findIndex(r => r.id === id);
      const filtered = prev.filter(r => r.id !== id);
      delete recipientCardRefs.current[id];
      
      if (expandedRecipientId === id) {
        setExpandedRecipientId(filtered[Math.min(index, filtered.length - 1)]?.id ?? null);
      }
      return filtered;
    });
  }, [expandedRecipientId]);

  const toggleExpanded = useCallback((id: string) => {
    if (!expandedRecipientHasName && expandedRecipientId !== null) return;
    setExpandedRecipientId(prev => prev === id ? null : id);
  }, [expandedRecipientId, expandedRecipientHasName]);

  const updateRecipient = useCallback((id: string, field: keyof Omit<Recipient, 'contacts'>, value: string | boolean) => {
    setRecipients(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }, []);

  const addContact = useCallback((recipientId: string) => {
    setRecipients(prev => prev.map(r => 
      r.id === recipientId ? { ...r, contacts: [...r.contacts, createEmptyContact()] } : r
    ));
  }, []);

  const removeContact = useCallback((recipientId: string, contactId: string) => {
    setRecipients(prev => prev.map(r => 
      r.id === recipientId ? { ...r, contacts: r.contacts.filter(c => c.id !== contactId) } : r
    ));
  }, []);

  const updateContact = useCallback((recipientId: string, contactId: string, field: 'type' | 'value', value: string) => {
    setRecipients(prev => prev.map(r => 
      r.id === recipientId 
        ? { ...r, contacts: r.contacts.map(c => c.id === contactId ? { ...c, [field]: value } : c) }
        : r
    ));
  }, []);

  // Auto focus on first visit
  useEffect(() => {
    const timer = setTimeout(() => {
      if (expandedRecipientId !== null) {
        const expandedRecipient = recipients.find(r => r.id === expandedRecipientId);
        if (expandedRecipient && !expandedRecipient.name.trim()) {
          setAutoFocusRecipientId(expandedRecipient.id);
          setTimeout(() => setAutoFocusRecipientId(null), 400);
        }
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const canToggle = expandedRecipientId === null || expandedRecipientHasName;

  return {
    recipients,
    setRecipients,
    expandedRecipientId,
    autoFocusRecipientId,
    recipientCardRefs,
    expandedRecipientHasName,
    canToggle,
    addRecipient,
    removeRecipient,
    toggleExpanded,
    updateRecipient,
    addContact,
    removeContact,
    updateContact,
  };
}
