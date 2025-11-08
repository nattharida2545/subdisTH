import { useState, useCallback, useEffect } from 'react';
import { createLogger } from '@/utils/logger';

const logger = createLogger('SimulationModeSync');

// Global state for immediate mode synchronization
let globalSimulationMode = false;
let listeners: Array<(mode: boolean) => void> = [];

// Event emitter for immediate state synchronization
export const simulationModeEmitter = {
  // Immediately notify all listeners of mode change
  emit: (isSimulationMode: boolean) => {
    logger.info(`🔄 Mode change broadcast: ${isSimulationMode ? 'SIMULATION' : 'REAL-TIME'}`);
    globalSimulationMode = isSimulationMode;
    listeners.forEach(listener => listener(isSimulationMode));
  },
  
  // Subscribe to mode changes
  subscribe: (listener: (mode: boolean) => void) => {
    listeners.push(listener);
    // Immediately call with current state
    listener(globalSimulationMode);
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  
  // Get current mode instantly
  getCurrentMode: () => globalSimulationMode
};

// Hook for components that need immediate mode updates
export const useSimulationModeSync = () => {
  const [isSimulationMode, setIsSimulationMode] = useState(() => 
    simulationModeEmitter.getCurrentMode()
  );

  useEffect(() => {
    const unsubscribe = simulationModeEmitter.subscribe(setIsSimulationMode);
    return unsubscribe;
  }, []);

  const setSimulationMode = useCallback((mode: boolean) => {
    simulationModeEmitter.emit(mode);
  }, []);

  return {
    isSimulationMode,
    setSimulationMode
  };
};