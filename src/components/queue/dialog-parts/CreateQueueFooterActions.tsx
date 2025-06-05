
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { createLogger } from '@/utils/logger';

const logger = createLogger('CreateQueueFooterActions');

interface CreateQueueFooterActionsProps {
  onCancel: () => void;
  onCreateQueue: () => void;
  isDisabled: boolean;
}

const CreateQueueFooterActions: React.FC<CreateQueueFooterActionsProps> = ({
  onCancel,
  onCreateQueue,
  isDisabled
}) => {
  logger.verbose('Rendering CreateQueueFooterActions');
  
  return (
    <>
      <Button variant="outline" onClick={onCancel}>
        ยกเลิก
      </Button>
      <Button 
        className="bg-pharmacy-600 hover:bg-pharmacy-700" 
        onClick={onCreateQueue}
        disabled={isDisabled}
      >
        สร้างคิว
      </Button>
    </>
  );
};

export default CreateQueueFooterActions;
