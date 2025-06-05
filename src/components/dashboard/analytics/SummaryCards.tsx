
import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, UserCheck } from 'lucide-react';

interface SummaryCardsProps {
  waitingQueueCount: number;
  averageWaitTime: number;
  averageServiceTime: number;
  completedQueueCount: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  waitingQueueCount,
  averageWaitTime,
  averageServiceTime,
  completedQueueCount
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="shadow-sm bg-card">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">คิวที่รอ</p>
              <h3 className="text-2xl font-bold">{waitingQueueCount}</h3>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm bg-card">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">เวลารอเฉลี่ย</p>
              <h3 className="text-2xl font-bold">{Math.round(averageWaitTime)} นาที</h3>
            </div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm bg-card">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">เวลาให้บริการเฉลี่ย</p>
              <h3 className="text-2xl font-bold">{Math.round(averageServiceTime)} นาที</h3>
            </div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm bg-card">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ผู้รับบริการวันนี้</p>
              <h3 className="text-2xl font-bold">{completedQueueCount}</h3>
            </div>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
