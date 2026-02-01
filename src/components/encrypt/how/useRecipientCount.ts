import { useEncryptDataStore } from "@/lib/dataStore";

export function useRecipientCount() {
  return useEncryptDataStore((state) => state.who?.recipients?.length ?? 0);
}