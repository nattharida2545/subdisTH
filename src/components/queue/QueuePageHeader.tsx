
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

interface QueuePageHeaderProps {
  currentTime: Date;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  title: string;
}

const QueuePageHeader: React.FC<QueuePageHeaderProps> = ({
  currentTime,
  soundEnabled,
  setSoundEnabled,
  title
}) => {
  // Format current time as HH:MM:SS
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };
  
  // Format current date as Thai format
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Toggle sound and save to localStorage
  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    localStorage.setItem('queue_voice_enabled', String(newSoundEnabled));
    
    toast.info(newSoundEnabled ? 'เปิดเสียงเรียกคิว' : 'ปิดเสียงเรียกคิว');
  };
  
  // Load sound setting from localStorage on component mount
  useEffect(() => {
    const savedSoundEnabled = localStorage.getItem('queue_voice_enabled');
    if (savedSoundEnabled !== null) {
      setSoundEnabled(savedSoundEnabled === 'true');
    }
  }, [setSoundEnabled]);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-pharmacy-800">{title}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold text-pharmacy-700">{formatTime(currentTime)}</div>
              <div className="text-sm text-gray-500">{formatDate(currentTime)}</div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleSound}
              className="ml-2"
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5 text-pharmacy-600" />
              ) : (
                <VolumeX className="h-5 w-5 text-gray-400" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default QueuePageHeader;
