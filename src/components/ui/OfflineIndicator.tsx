
import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  className?: string;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className }) => {
  const isOffline = useOfflineStatus();
  
  console.log("[DEBUG] OfflineIndicator - isOffline:", isOffline);
  
  if (!isOffline) return null;
  
  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-md shadow-md flex items-center gap-2 z-50 animate-pulse",
        className
      )}
    >
      <WifiOff size={18} />
      <span className="font-medium">คุณกำลังออฟไลน์</span>
    </div>
  );
};

export default OfflineIndicator;
