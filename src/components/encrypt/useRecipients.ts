import { useCallback } from 'react';
import { type Recipient } from '../../lib/types/recipient';
import { createEmptyContact, createEmptyRecipient } from './whoEditorUtils';
import { EncryptStoreActions, useEncryptDataStore } from '../../lib/dataStore';

export function useRecipientActions() {
  const setData: EncryptStoreActions['setData'] = useEncryptDataStore((state) => state.setData) ;
  const addNewRecipient = useCallback(() => {
    const newRecipient = createEmptyRecipient();
    setData((prev) => ({ who: { ...prev.who, recipients: [...prev.who?.recipients ?? [], newRecipient] } }));
    return newRecipient;
  }, [setData]);
  const removeRecipient = useCallback((id: string) => {
    setData((prev) => ({ who: { ...prev.who, recipients: prev.who?.recipients?.filter(r => r.id !== id) ?? [] } }));
  }, [setData]);
  const updateRecipientName = useCallback((id: string, name: string) => {
    setData((prev) => ({ who: { ...prev.who, recipients: prev.who?.recipients?.map(r => r.id === id ? { ...r, name } : r) ?? [] } }));
  }, [setData]);
  const updateRecipientVisibility = useCallback((id: string, isPrivate: boolean) => {
    setData((prev) => ({ who: { ...prev.who, recipients: prev.who?.recipients?.map(r => r.id === id ? { ...r, isPrivate } : r) ?? [] } }));
  }, [setData]);
  const updateRecipientNumber = useCallback((id: string, number: number) => {
    setData((prev) => ({ who: { ...prev.who, recipients: prev.who?.recipients?.map(r => r.id === id ? { ...r, number } : r) ?? [] } }));
  }, [setData]);
  const addRecipientContact = useCallback((recipientId: string) => {
    setData((prev) => ({ who: { ...prev.who, recipients: prev.who?.recipients?.map(r => r.id === recipientId ? { ...r, contacts: [...r.contacts, createEmptyContact()] } : r) ?? [] } }));
  }, [setData]);
  const removeRecipientContact = useCallback((recipientId: string, contactId: string) => {
    setData((prev) => ({ who: { ...prev.who, recipients: prev.who?.recipients?.map(r => r.id === recipientId ? { ...r, contacts: r.contacts.filter(c => c.id !== contactId) } : r) ?? [] } }));
  }, [setData]);
  const updateRecipientContact = useCallback((recipientId: string, contactId: string, field: 'type' | 'value', value: string) => {
    setData((prev) => ({ who: { ...prev.who, recipients: prev.who?.recipients?.map(r => r.id === recipientId ? { ...r, contacts: r.contacts.map(c => c.id === contactId ? { ...c, [field]: value } : c) } : r) ?? [] } }));
  }, [setData]);
  const setRecipients = useCallback((recipients: Recipient[]) => {
    setData((prev) => ({ who: { ...prev.who, recipients } }));
  }, [setData]);
  return { setRecipients, addNewRecipient, removeRecipient, updateRecipientName, updateRecipientVisibility, updateRecipientNumber, addRecipientContact, removeRecipientContact, updateRecipientContact }
};
