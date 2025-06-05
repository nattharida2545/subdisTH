
import * as React from 'react';
import { toast } from 'sonner';

export const useOfflineStatus = () => {
  const [isOffline, setIsOffline] = React.useState(() => {
    // Safe check for browser environment
    if (typeof navigator !== 'undefined') {
      return !navigator.onLine;
    }
    return false;
  });
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    
    const handleOnline = () => {
      setIsOffline(false);
      toast("Connected", {
        description: "การเชื่อมต่อกลับมาแล้ว คุณออนไลน์อยู่",
      });
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      toast("Disconnected", {
        description: "คุณกำลังออฟไลน์ บางฟีเจอร์อาจไม่ทำงาน",
        style: { backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOffline;
};
