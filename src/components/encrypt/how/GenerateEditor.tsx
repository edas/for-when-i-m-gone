import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { computeButtonState, getButtonText } from '@/lib/buttonState';
import { useEncryptDataStore, type EncryptStoreActions } from '@/lib/dataStore';
import { 
  generateAES256Key, 
  exportKeyToUint8Array,
  importKeyFromUint8Array,
  encryptBuffer, 
  textToBuffer,
} from '@/lib/crypto/aes';
import { splitBuffer } from 'ssss-js';
import { EditorLayout } from '@/components/ui/EditorLayout';
import { ActionButtons } from '@/components/ui/ActionButtons';
import { HelpSection } from '@/components/ui/HelpSection';
import type { Recipient } from '@/lib/types/recipient';
import styles from './GenerateEditor.module.css';

interface GenerateEditorProps {
  onBack: () => void;
}

export function GenerateEditor({ 
  onBack 
}: GenerateEditorProps) {
  const { t } = useTranslation();
  
  // Récupérer les données depuis le store
  const { getData, setData }: EncryptStoreActions = useEncryptDataStore((state) => {
    const { getData, setData } = state;
    return { getData, setData };
  });
  
  // Récupérer les données réactives depuis le store
  const secret = useEncryptDataStore((state) => state.what?.content ?? '');
  const recipients = useEncryptDataStore((state) => state.who?.recipients ?? []);
  const threshold = useEncryptDataStore((state) => state.how?.threshold ?? 0);
  const shares = useEncryptDataStore((state) => state.generate?.shares);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentShares, setCurrentShares] = useState<string[]>(shares ?? []);

  // Initialize currentShares from store
  useEffect(() => {
    if (shares && shares.length > 0) {
      setCurrentShares(shares);
    }
  }, [shares]);

  const canContinue = isReady;
  const allEssentialsChecked = true;
  const anyChecked = true;

  const buttonState = useMemo(() => computeButtonState(canContinue, anyChecked, allEssentialsChecked), [canContinue]);
  const buttonTexts = useMemo(() => ({
    continueWithoutConfirm: t('generateEditor.buttons.continueWithoutConfirm'),
    continueWithoutEssentials: t('generateEditor.buttons.continueWithoutEssentials'),
    continue: t('generateEditor.buttons.continue'),
  }), [t]);
  const buttonText = useMemo(() => getButtonText(buttonState, buttonTexts), [buttonState, buttonTexts]);

  const assignRecipientNumbers = useCallback(async (): Promise<void> => {
    const currentData = getData();
    const currentRecipients = currentData.who?.recipients ?? [];
    
    const existingNumbers = currentRecipients
      .map(r => r.number)
      .filter((n): n is number => typeof n === 'number' && n > 0);
    
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    let nextNumber = maxNumber + 1;
    
    const updatedRecipients: Recipient[] = currentRecipients.map(recipient => {
      if (typeof recipient.number === 'number' && recipient.number > 0) {
        return recipient;
      }
      return { ...recipient, number: nextNumber++ };
    });
    
    setData((current) => ({
      who: { ...current.who, recipients: updatedRecipients },
    }));
  }, [getData, setData]);

  const validateInputs = useCallback((): void => {
    const currentData = getData();
    const currentSecret = currentData.what?.content ?? '';
    const currentRecipients = currentData.who?.recipients ?? [];
    const currentThreshold = currentData.how?.threshold ?? 0;
    
    if (!currentSecret?.trim()) {
      throw new Error('Secret content is missing or empty');
    }
    if (!currentRecipients?.length) {
      throw new Error('No recipients found');
    }
    if (!currentThreshold || currentThreshold <= 0) {
      throw new Error('Threshold is missing or invalid');
    }
  }, [getData]);

  const getOrCreateAesKey = useCallback(async (): Promise<{ key: CryptoKey; keyBytes: Uint8Array }> => {
    const currentData = getData();
    const currentAesKey = currentData.generate?.aesKey;
    
    if (currentAesKey instanceof Uint8Array) {
      // Create a new Uint8Array with a fresh ArrayBuffer to satisfy TypeScript
      const keyBytesArray = new Uint8Array(currentAesKey.length);
      keyBytesArray.set(currentAesKey);
      const key = await importKeyFromUint8Array(keyBytesArray as Uint8Array<ArrayBuffer>);
      return { key, keyBytes: keyBytesArray };
    }
    
    const key = await generateAES256Key();
    const keyBytes = await exportKeyToUint8Array(key);
    
    setData((current) => ({
      generate: { ...current.generate, aesKey: keyBytes },
    }));
    
    return { key, keyBytes };
  }, [getData, setData]);

  const encryptAndStoreSecret = useCallback(async (key: CryptoKey): Promise<void> => {
    const currentData = getData();
    const currentSecret = currentData.what?.content ?? '';
    const secretBuffer = textToBuffer(currentSecret);
    const { ciphertext, iv } = await encryptBuffer(key, secretBuffer);
    
    setData((current) => ({
      generate: {
        ...current.generate,
        encryptedSecret: new Uint8Array(ciphertext),
        iv: iv,
      },
    }));
  }, [getData, setData]);

  const splitKey = useCallback(async (keyBytes: Uint8Array): Promise<string[]> => {
    const currentData = getData();
    const currentThreshold = currentData.how?.threshold ?? 0;
    const currentRecipients = currentData.who?.recipients ?? [];
    
    const newShares = splitBuffer(keyBytes, {
      threshold: currentThreshold,
      numberOfKeys: currentRecipients.length,
    }) as string[];
    
    setData((current) => ({
      generate: { ...current.generate, shares: newShares },
    }));
    
    setCurrentShares(newShares);
    return newShares;
  }, [getData, setData]);

  const generate = useCallback(async (): Promise<void> => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      validateInputs();
      await assignRecipientNumbers();
      
      const { key, keyBytes } = await getOrCreateAesKey();
      await encryptAndStoreSecret(key);
      await splitKey(keyBytes);
      
      setIsReady(true);
    } catch (error) {
      setErrorMessage(`Erreur: ${error instanceof Error ? error.message : String(error)}`);
      setIsReady(false);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, validateInputs, assignRecipientNumbers, getOrCreateAesKey, encryptAndStoreSecret, splitKey]);

  const getShareForRecipient = useCallback((recipient: Recipient): string | undefined => {
    if (recipient.number === undefined || recipient.number < 1) {
      return undefined;
    }
    const shareIndex = recipient.number - 1;
    const sharesToUse = currentShares.length > 0 ? currentShares : (getData().generate?.shares ?? []);
    if (shareIndex >= 0 && shareIndex < sharesToUse.length) {
      return sharesToUse[shareIndex];
    }
    return undefined;
  }, [currentShares, getData]);

  const copyShareToClipboard = useCallback(async (share: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(share);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, []);

  // Generate on mount or when data changes
  useEffect(() => {
    if (isProcessing) return;
    
    const hasSecret = secret?.trim();
    const hasRecipients = recipients.length > 0;
    const hasThreshold = threshold > 0;
    
    if (hasSecret && hasRecipients && hasThreshold && !isReady) {
      generate();
    }
  }, [secret, recipients.length, threshold, isProcessing, isReady, generate]);

  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  const helpContent = (
    <p className="panel-intro">{t('generateEditor.sidePanel.intro')}</p>
  );

  return (
    <EditorLayout title={t('generateEditor.title')}>
      <div className={styles.generateContent}>
        {errorMessage ? (
          <p className={styles.errorText}>{errorMessage}</p>
        ) : isProcessing ? (
          <p className={styles.processingText}>{t('generateEditor.processing')}</p>
        ) : isReady ? (
          <div className={styles.readySection}>
            <p className={styles.readyText}>{t('generateEditor.ready')}</p>
            {(() => {
              const currentData = getData();
              const currentRecipients = currentData.who?.recipients ?? [];
              const sharesToDisplay = currentShares.length > 0 ? currentShares : (currentData.generate?.shares ?? []);
              
              return sharesToDisplay.length > 0 && sharesToDisplay.length === currentRecipients.length && (
                <div className={styles.sharesSection}>
                  <h3 className={styles.sharesTitle}>{t('generateEditor.shares.title')}</h3>
                  <p className={styles.sharesIntro}>{t('generateEditor.shares.intro')}</p>
                  <div className={styles.sharesList}>
                    {currentRecipients.map((recipient) => {
                      const share = getShareForRecipient(recipient);
                      if (share === undefined) return null;
                      return (
                        <div key={recipient.id} className={styles.shareItem}>
                          <div className={styles.shareHeader}>
                            <span className={styles.shareRecipientName}>
                              {recipient.name || t('generateEditor.shares.unnamedRecipient')}
                              {recipient.number !== undefined && (
                                <span className={styles.shareRecipientNumber}> (#{recipient.number})</span>
                              )}
                            </span>
                            <button
                              className={styles.copyButton}
                              onClick={() => copyShareToClipboard(share)}
                              title={t('generateEditor.shares.copyButton')}
                            >
                              {t('generateEditor.shares.copyButton')}
                            </button>
                          </div>
                          <div className={styles.shareValue} title={share}>
                            {share}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <p className={styles.placeholderText}>{t('generateEditor.placeholder')}</p>
        )}
      </div>

      <HelpSection title={t('generateEditor.sidePanel.title')}>
        {helpContent}
      </HelpSection>

      <ActionButtons
        backLabel={t('common.back')}
        continueLabel={buttonText}
        buttonState={buttonState}
        disabled={!canContinue}
        onBack={handleBack}
        onContinue={() => {}}
        showContinue={false}
      />
    </EditorLayout>
  );
}
