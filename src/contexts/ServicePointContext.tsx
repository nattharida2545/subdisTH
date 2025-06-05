import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServicePoint } from '@/integrations/supabase/schema';
import { useServicePoints } from '@/hooks/useServicePoints';

type ServicePointContextType = {
  selectedServicePoint: ServicePoint | null;
  setSelectedServicePoint: (servicePoint: ServicePoint | null) => void;
  servicePoints: ServicePoint[];
  loading: boolean;
  error: string | null;
  fetchServicePoints: () => Promise<void>;
};

const ServicePointContext = createContext<ServicePointContextType | undefined>(undefined);

export const ServicePointProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedServicePoint, setSelectedServicePoint] = useState<ServicePoint | null>(null);
  const { servicePoints, loading, error, fetchServicePoints } = useServicePoints();

  // Set the first service point as default if none is selected
  useEffect(() => {
    if (!selectedServicePoint && servicePoints.length > 0 && !loading) {
      // Try to get from localStorage first
      const savedServicePointId = localStorage.getItem('selectedServicePointId');
      if (savedServicePointId) {
        const savedServicePoint = servicePoints.find(sp => sp.id === savedServicePointId);
        if (savedServicePoint) {
          setSelectedServicePoint(savedServicePoint);
          return;
        }
      }
      
      // Otherwise select the first enabled one
      const enabledServicePoint = servicePoints.find(sp => sp.enabled);
      if (enabledServicePoint) {
        setSelectedServicePoint(enabledServicePoint);
      }
    }
  }, [servicePoints, loading, selectedServicePoint]);

  // Save selected service point to localStorage
  const handleSetSelectedServicePoint = (servicePoint: ServicePoint | null) => {
    setSelectedServicePoint(servicePoint);
    if (servicePoint) {
      localStorage.setItem('selectedServicePointId', servicePoint.id);
    } else {
      localStorage.removeItem('selectedServicePointId');
    }
  };

  return (
    <ServicePointContext.Provider
      value={{
        selectedServicePoint,
        setSelectedServicePoint: handleSetSelectedServicePoint,
        servicePoints,
        loading,
        error,
        fetchServicePoints
      }}
    >
      {children}
    </ServicePointContext.Provider>
  );
};

export const useServicePointContext = (): ServicePointContextType => {
  const context = useContext(ServicePointContext);
  if (context === undefined) {
    throw new Error('useServicePointContext must be used within a ServicePointProvider');
  }
  return context;
};
