
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateQueueDialog from '@/components/queue/CreateQueueDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { createLogger } from '@/utils/logger';
import QueuePageHeader from '@/components/queue/QueuePageHeader';
import QueueBoardAlgorithmInfo from '@/components/queue/board/QueueBoardAlgorithmInfo';
import HospitalFooter from '@/components/queue/HospitalFooter';

const logger = createLogger('CreateQueue');

const CreateQueue: React.FC = () => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  
  // Update the current time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Handle dialog close by navigating back to create queue page instead of management
  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      logger.debug('Dialog closed, staying on create queue page');
      // Change navigation to stay on the create queue page
      navigate('/queue/create');
    }
  };
  
  // Handle successful queue creation
  const handleCreateQueue = (queue: any) => {
    logger.info('Queue created successfully', queue);
    // Keep the user on the create queue page after creation
    // The QR code dialog will show automatically
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-pharmacy-50">
      {/* Header - same as QueueBoard but without back button */}
      <QueuePageHeader 
        currentTime={currentTime}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        title="ระบบแสดงคิวห้องยา"
      />
      
      {/* Algorithm Info Bar - using similar component */}
      <QueueBoardAlgorithmInfo algorithmName="สร้างคิวใหม่" />
      
      {/* Main Content Area */}
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">สร้างคิวใหม่</h1>
            <p className="text-gray-500 mb-8">กรุณาคลิกปุ่มด้านล่างเพื่อสร้างคิวใหม่</p>
            
            <Button 
              onClick={() => setDialogOpen(true)}
              className="bg-pharmacy-600 hover:bg-pharmacy-700 py-6 px-10"
              size="lg"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              สร้างคิวใหม่
            </Button>
          </div>
        </div>
      </main>
      
      {/* Footer - same as QueueBoard */}
      <HospitalFooter />
      
      {/* Dialog will only open when button is clicked */}
      <CreateQueueDialog 
        open={dialogOpen} 
        onOpenChange={handleOpenChange} 
        onCreateQueue={handleCreateQueue}
      />
    </div>
  );
};

export default CreateQueue;
