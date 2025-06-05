
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, Trash2, RefreshCw } from 'lucide-react';

interface TestDashboardHeaderProps {
  onSimulate: () => Promise<void>;
  onRecalculate: () => Promise<void>;
  onClearQueues: () => Promise<void>;
  onForceRefresh: () => void;
}

const TestDashboardHeader: React.FC<TestDashboardHeaderProps> = ({
  onSimulate,
  onRecalculate,
  onClearQueues,
  onForceRefresh
}) => {
  return (
    <div className="bg-white border-b px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ระบบทดสอบการจัดการคิว</h1>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={onSimulate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <PlayCircle className="w-4 h-4" />
            สร้างคิวทดสอบ (15 คิว)
          </Button>
          
          <Button 
            onClick={onRecalculate}
            variant="outline"
            className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
          >
            <RefreshCw className="w-4 h-4" />
            คำนวณการมอบหมายใหม่
          </Button>
          
          <Button 
            variant="outline"
            onClick={onClearQueues}
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            ลบคิวทดสอบ
          </Button>

          <Button 
            variant="outline"
            onClick={onForceRefresh}
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            รีเฟรช
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestDashboardHeader;
