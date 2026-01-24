/**
 * React Context for global access to storedData
 * Provides reactive access to the data store throughout the component tree
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { 
  getStoredData, 
  updateStoredData as updateStoredDataFn, 
  subscribe,
  type StoredData 
} from './dataStore';

interface DataContextValue {
  storedData: StoredData;
  updateStoredData: (updater: (current: StoredData) => StoredData) => Promise<StoredData>;
  getStoredData: () => StoredData;
}

const DataContext = createContext<DataContextValue | null>(null);

interface DataProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the app and provides access to storedData
 * Subscribes to changes in the data store and updates React state accordingly
 */
export function DataProvider({ children }: DataProviderProps) {
  const [storedData, setStoredData] = useState<StoredData>(() => getStoredData());

  useEffect(() => {
    // Subscribe to data store changes
    const unsubscribe = subscribe((newData) => {
      setStoredData(newData);
    });

    return unsubscribe;
  }, []);

  const updateStoredData = useCallback((updater: (current: StoredData) => StoredData) => {
    return updateStoredDataFn(updater);
  }, []);

  const value: DataContextValue = {
    storedData,
    updateStoredData,
    getStoredData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

/**
 * Hook to access the data context
 * @throws Error if used outside of DataProvider
 */
export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

/**
 * Hook to access only the stored data (for components that only read)
 */
export function useStoredData(): StoredData {
  const { storedData } = useData();
  return storedData;
}
