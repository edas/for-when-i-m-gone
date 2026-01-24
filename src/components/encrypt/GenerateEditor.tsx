import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { computeButtonState, getButtonText } from '../../lib/buttonState';
import { useData } from '../../lib/DataContext';
import { type EncryptStoredData } from '../../lib/dataStore';
import { 
  generateAES256Key, 
  exportKeyToUint8Array,
  importKeyFromUint8Array,
  encryptBuffer, 
  textToBuffer,
} from '../../lib/crypto/aes';
import { splitBuffer } from 'ssss-js';
import { EditorLayout } from '../ui/EditorLayout';
import { ActionButtons } from '../ui/ActionButtons';
import { HelpSection } from '../ui/HelpSection';
import type { Recipient } from '../../lib/types/recipient';
import styles from './GenerateEditor.module.css';

interface GenerateEditorProps {
  secret: string;
  recipients: Recipient[];
  threshold: number;
  aesKey?: Uint8Array;
  shares?: string[];
  onContinue: () => void;
  onBack: () => void;
}

export function GenerateEditor({ 
  secret, 
  recipients: recipientsProp, 
  threshold, 
  aesKey, 
  shares, 
  onContinue, 
  onBack 
}: GenerateEditorProps) {
  const { updateStoredData } = useData();
  const { t } = useTranslation();
  
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentShares, setCurrentShares] = useState<string[]>([]);

  // Sync recipients from props
  useEffect(() => {
    setRecipients([...recipientsProp]);
  }, [recipientsProp]);

  // Initialize currentShares from props
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
    const existingNumbers = recipients
      .map(r => r.number)
      .filter((n): n is number => typeof n === 'number' && n > 0);
    
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    let nextNumber = maxNumber + 1;
    
    const updatedRecipients: Recipient[] = recipients.map(recipient => {
      if (typeof recipient.number === 'number' && recipient.number > 0) {
        return recipient;
      }
      return { ...recipient, number: nextNumber++ };
    });
    
    await updateStoredData((data) => {
      const encryptData = data as EncryptStoredData;
      return {
        ...encryptData,
        who: { ...encryptData.who, recipients: updatedRecipients },
      };
    });
    
    setRecipients(updatedRecipients);
  }, [recipients]);

  const validateInputs = useCallback((): void => {
    if (!secret?.trim()) {
      throw new Error('Secret content is missing or empty');
    }
    if (!recipients?.length) {
      throw new Error('No recipients found');
    }
    if (!threshold || threshold <= 0) {
      throw new Error('Threshold is missing or invalid');
    }
  }, [secret, recipients, threshold]);

  const getOrCreateAesKey = useCallback(async (): Promise<{ key: CryptoKey; keyBytes: Uint8Array }> => {
    if (aesKey instanceof Uint8Array) {
      // Create a new Uint8Array with a fresh ArrayBuffer to satisfy TypeScript
      const keyBytesArray = new Uint8Array(aesKey.length);
      keyBytesArray.set(aesKey);
      const key = await importKeyFromUint8Array(keyBytesArray as Uint8Array<ArrayBuffer>);
      return { key, keyBytes: keyBytesArray };
    }
    
    const key = await generateAES256Key();
    const keyBytes = await exportKeyToUint8Array(key);
    
    await updateStoredData((data) => {
      const encryptData = data as EncryptStoredData;
      return {
        ...encryptData,
        generate: { ...encryptData.generate, aesKey: keyBytes },
      };
    });
    
    return { key, keyBytes };
  }, [aesKey]);

  const encryptAndStoreSecret = useCallback(async (key: CryptoKey): Promise<void> => {
    const secretBuffer = textToBuffer(secret);
    const { ciphertext, iv } = await encryptBuffer(key, secretBuffer);
    
    await updateStoredData((data) => {
      const encryptData = data as EncryptStoredData;
      return {
        ...encryptData,
        generate: {
          ...encryptData.generate,
          encryptedSecret: new Uint8Array(ciphertext),
          iv: iv,
        },
      };
    });
  }, [secret]);

  const splitKey = useCallback(async (keyBytes: Uint8Array): Promise<string[]> => {
    const newShares = splitBuffer(keyBytes, {
      threshold,
      numberOfKeys: recipients.length,
    }) as string[];
    
    await updateStoredData((data) => {
      const encryptData = data as EncryptStoredData;
      return {
        ...encryptData,
        generate: { ...encryptData.generate, shares: newShares },
      };
    });
    
    setCurrentShares(newShares);
    return newShares;
  }, [threshold, recipients.length]);

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
    if (shareIndex >= 0 && shareIndex < currentShares.length) {
      return currentShares[shareIndex];
    }
    return undefined;
  }, [currentShares]);

  const copyShareToClipboard = useCallback(async (share: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(share);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, []);

  // Generate on mount
  useEffect(() => {
    generate();
  }, []);

  const handleContinue = useCallback(() => {
    if (canContinue) onContinue();
  }, [canContinue, onContinue]);

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
            {currentShares.length > 0 && currentShares.length === recipients.length && (
              <div className={styles.sharesSection}>
                <h3 className={styles.sharesTitle}>{t('generateEditor.shares.title')}</h3>
                <p className={styles.sharesIntro}>{t('generateEditor.shares.intro')}</p>
                <div className={styles.sharesList}>
                  {recipients.map((recipient) => {
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
            )}
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
        onContinue={handleContinue}
        showContinue={false}
      />
    </EditorLayout>
  );
}

export default GenerateEditor;
