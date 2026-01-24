import { useState, useMemo, useEffect, useCallback } from 'react';
import { getTranslations, type Language } from '../../lib/i18n';
import { computeButtonState, getButtonText } from '../../lib/buttonState';
import { updateStoredData, type EncryptStoredData } from '../../lib/dataStore';
import { getInitialSidePanelState, saveSidePanelState } from '../../lib/sidePanelState';
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
import type { Recipient } from '../../lib/types/recipient';
import './GenerateEditor.css';

interface GenerateEditorProps {
  lang: Language;
  secret: string;
  recipients: Recipient[];
  threshold: number;
  aesKey?: Uint8Array;
  shares?: string[];
  onContinue: () => void;
  onBack: () => void;
}

export function GenerateEditor({ 
  lang, 
  secret, 
  recipients: recipientsProp, 
  threshold, 
  aesKey, 
  shares, 
  onContinue, 
  onBack 
}: GenerateEditorProps) {
  const t = useMemo(() => getTranslations(lang), [lang]);
  
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [sidePanelOpen, setSidePanelOpen] = useState(() => getInitialSidePanelState('generate', true));
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
  const buttonText = useMemo(() => getButtonText(buttonState, t.generateEditor.buttons), [buttonState, t]);

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

  // Save side panel state
  useEffect(() => {
    saveSidePanelState('generate', sidePanelOpen);
  }, [sidePanelOpen]);

  const sidePanelContent = (
    <>
      <h2>{t.generateEditor.sidePanel.title}</h2>
      <p className="panel-intro">{t.generateEditor.sidePanel.intro}</p>
    </>
  );

  return (
    <EditorLayout
      title={t.generateEditor.title}
      sidePanelOpen={sidePanelOpen}
      collapseLabel={t.generateEditor.sidePanel.collapse}
      expandLabel={t.generateEditor.sidePanel.expand}
      onToggleSidePanel={() => setSidePanelOpen(!sidePanelOpen)}
      editorId="generate"
      sidePanelContent={sidePanelContent}
    >
      <div className="generate-content">
        {errorMessage ? (
          <p className="error-text">{errorMessage}</p>
        ) : isProcessing ? (
          <p className="processing-text">{t.generateEditor.processing}</p>
        ) : isReady ? (
          <div className="ready-section">
            <p className="ready-text">{t.generateEditor.ready}</p>
            {currentShares.length > 0 && currentShares.length === recipients.length && (
              <div className="shares-section">
                <h3 className="shares-title">{t.generateEditor.shares.title}</h3>
                <p className="shares-intro">{t.generateEditor.shares.intro}</p>
                <div className="shares-list">
                  {recipients.map((recipient) => {
                    const share = getShareForRecipient(recipient);
                    if (share === undefined) return null;
                    return (
                      <div key={recipient.id} className="share-item">
                        <div className="share-header">
                          <span className="share-recipient-name">
                            {recipient.name || t.generateEditor.shares.unnamedRecipient}
                            {recipient.number !== undefined && (
                              <span className="share-recipient-number"> (#{recipient.number})</span>
                            )}
                          </span>
                          <button
                            className="copy-button"
                            onClick={() => copyShareToClipboard(share)}
                            title={t.generateEditor.shares.copyButton}
                          >
                            {t.generateEditor.shares.copyButton}
                          </button>
                        </div>
                        <div className="share-value" title={share}>
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
          <p className="placeholder-text">{t.generateEditor.placeholder}</p>
        )}
      </div>

      <ActionButtons
        backLabel={t.common.back}
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
