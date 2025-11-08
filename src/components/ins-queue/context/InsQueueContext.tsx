import React, { createContext, useContext, useState, ReactNode } from 'react';
import { QueueIns } from '@/integrations/supabase/schema';

interface InsQueueContextType {
  insQueue: QueueIns[];
  setInsQueue: React.Dispatch<React.SetStateAction<QueueIns[]>>;
  selectedQueueItem: QueueIns | null;
  setSelectedQueueItem: React.Dispatch<React.SetStateAction<QueueIns | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const InsQueueContext = createContext<InsQueueContextType | undefined>(undefined);

export const useInsQueueContext = () => {
  const context = useContext(InsQueueContext);
  if (!context) {
    throw new Error('useInsQueueContext must be used within an InsQueueProvider');
  }
  return context;
};

interface InsQueueProviderProps {
  children: ReactNode;
}

export const InsQueueProvider: React.FC<InsQueueProviderProps> = ({ children }) => {
  const [insQueue, setInsQueue] = useState<QueueIns[]>([]);
  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueIns | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const value = {
    insQueue,
    setInsQueue,
    selectedQueueItem,
    setSelectedQueueItem,
    isLoading,
    setIsLoading
  };

  return (
    <InsQueueContext.Provider value={value}>
      {children}
    </InsQueueContext.Provider>
  );
};
