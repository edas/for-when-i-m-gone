import { EncryptStoreActions, useEncryptDataStore } from "@/lib/dataStore";
import { useRef } from "react";
import { useRecipientCount } from "./useRecipientCount";

export function useThreshold() {
  return useEncryptDataStore((state) => state.how?.threshold);
}

export function useThresholdStoreWithDefault() {
  const hasChanged = useRef(false);
  const storedThreshold = useThreshold();
  const defaultThreshold = getDefaultThreshold();
  const { setThreshold } = useThresholdActions();
  if (storedThreshold !== undefined) return storedThreshold;
  if (!hasChanged.current) {
    hasChanged.current = true;
    setThreshold(defaultThreshold);
  }
  return defaultThreshold;
}

function getDefaultThreshold() {
  const recipientCount = useEncryptDataStore((state) => state.who?.recipients?.length ?? 0);
  if (recipientCount <= 3) return 2;
  if (recipientCount <= 6) return 3;
  return 4;
}

export function useIsThresholdReadOnly() {
  const aesKey = useEncryptDataStore((state) => state.generate?.aesKey);
  const isThresholdReadOnly = !!aesKey;
  return isThresholdReadOnly;
}

export type ThresholdUpdater = number | ((threshold: number) => number);

function _setThreshold(threshold: number | ThresholdUpdater, setData: EncryptStoreActions['setData']) {
  setData((current) => ({
    how: {
      conditions: null,
      hasNoOpenConditions: false,
      ...current.how,
      threshold: typeof threshold === 'function' ? threshold(current!.how!.threshold!) : threshold,
    },
  }));
}

export function useThresholdActions() {
  const recipientCount = useRecipientCount();
  const setData: EncryptStoreActions['setData'] = useEncryptDataStore((state) => state.setData);
  const setThreshold = (threshold: number | ThresholdUpdater) => _setThreshold(threshold, setData);
  const increment = () => setThreshold((current: number) => (current < recipientCount) ? current + 1 : current);
  const decrement = () => setThreshold((current: number) => (current > 2) ? current - 1 : current);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseThreshold(event.target.value);
    if (value !== null) setThreshold(value);
  };
  return {
    setThreshold,
    increment,
    decrement,
    handleInputChange,
  };
}

function parseThreshold(inputValue: string): number | null {
  const trimmed = inputValue.trim();
  if (trimmed === '') return null;
  const num = parseInt(trimmed, 10);
  if (isNaN(num) || !isFinite(num) || !Number.isInteger(num)) return null;
  if (num < 0) return null;
  return num;
}