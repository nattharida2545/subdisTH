
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash, Copy } from 'lucide-react';
import { QueueType, ensureValidFormat } from '@/hooks/useQueueTypes';
import { Badge } from '@/components/ui/badge';
import { algorithmOptions } from './schemas';

interface QueueTypeDisplayProps {
  queueType: QueueType;
  onEditQueueType: () => void;
  onRemoveQueueType: () => Promise<void>;
  onDuplicateQueueType: () => Promise<void>;
  isProcessing: boolean;
}

const QueueTypeDisplay: React.FC<QueueTypeDisplayProps> = ({
  queueType,
  onEditQueueType,
  onRemoveQueueType,
  onDuplicateQueueType,
  isProcessing,
}) => {
  const getFormatLabel = (format: '0' | '00' | '000') => {
    const formatDescriptions = {
      '0': 'หลักเดียว (0-9)',
      '00': 'สองหลัก (00-99)',
      '000': 'สามหลัก (000-999)'
    };
    return formatDescriptions[format] || format;
  };

  const getAlgorithmLabel = (algorithm?: string) => {
    if (!algorithm) return 'First In, First Out (FIFO)';
    const option = algorithmOptions.find(opt => opt.value === algorithm);
    return option ? option.label : 'First In, First Out (FIFO)';
  };
  
  const getPriorityLabel = (priority?: number) => {
    const value = priority || 5;
    if (value >= 8) return 'สูง';
    if (value >= 4) return 'ปานกลาง';
    return 'ต่ำ';
  };

  const getPriorityColorClass = (priority?: number) => {
    const value = priority || 5;
    if (value >= 8) return 'bg-red-100 text-red-800';
    if (value >= 4) return 'bg-amber-100 text-amber-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-lg">
              {queueType.name}
            </span>
            <Badge variant="outline" className="ml-2">{queueType.code}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onDuplicateQueueType}
              disabled={isProcessing}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Duplicate</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEditQueueType}
              disabled={isProcessing}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700"
              onClick={onRemoveQueueType}
              disabled={isProcessing}
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
        <div>
          <span className="font-medium text-gray-700">Prefix:</span> {queueType.prefix}
        </div>
        <div>
          <span className="font-medium text-gray-700">รูปแบบ:</span> {getFormatLabel(ensureValidFormat(queueType.format))}
        </div>
        <div>
          <span className="font-medium text-gray-700">จุดประสงค์:</span> {queueType.purpose}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm pt-1 border-t border-gray-100">
        <div>
          <span className="font-medium text-gray-700">อัลกอริทึม:</span> {getAlgorithmLabel(queueType.algorithm)}
        </div>
        <div>
          <span className="font-medium text-gray-700">ความสำคัญ:</span> 
          <Badge className={`ml-2 ${getPriorityColorClass(queueType.priority)}`}>
            {getPriorityLabel(queueType.priority)}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default QueueTypeDisplay;
