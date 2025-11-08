import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, UserCheck, Pill, Stethoscope } from "lucide-react";

interface SummaryCardsProps {
  waitingQueueCount: number;
  averageWaitTime: number;
  averageServiceTime: number;
  completedQueueCount: number;
  // INS Queue props
  waitingInsQueueCount?: number;
  averageInsWaitTime?: number;
  averageInsServiceTime?: number;
  completedInsQueueCount?: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  waitingQueueCount,
  averageWaitTime,
  averageServiceTime,
  completedQueueCount,
  // INS Queue data
  waitingInsQueueCount = 0,
  averageInsWaitTime = 0,
  averageInsServiceTime = 0,
  completedInsQueueCount = 0,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card className="shadow-sm bg-card">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <p className="text-sm font-medium text-muted-foreground">
              คิวที่รอ
            </p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Pharmacy Queue */}
            <div className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg min-w-0">
              <div className="bg-blue-100 p-1.5 rounded-full flex-shrink-0">
                <Pill className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-center w-full">
                <p className="text-xs text-gray-600 mb-0.5">คิวรับยา</p>
                <p className="text-xl font-bold text-blue-600 whitespace-nowrap">{waitingQueueCount}</p>
              </div>
            </div>

            {/* INS Queue */}
            <div className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg min-w-0">
              <div className="bg-purple-100 p-1.5 rounded-full flex-shrink-0">
                <Stethoscope className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-center w-full">
                <p className="text-xs text-gray-600 mb-0.5">คิวตรวจ</p>
                <p className="text-xl font-bold text-purple-600 whitespace-nowrap">{waitingInsQueueCount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* <Card className="shadow-sm bg-card">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">เวลารอเฉลี่ย</p>
              <h3 className="text-2xl font-bold">{Math.round(averageWaitTime)} นาที</h3>
            </div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card> */}

      <Card className="shadow-sm bg-card">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <p className="text-sm font-medium text-muted-foreground">
              เวลาให้บริการเฉลี่ย
            </p>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Pharmacy Queue */}
            <div className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg min-w-0">
              <div className="bg-blue-100 p-1.5 rounded-full flex-shrink-0">
                <Pill className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-center w-full">
                <p className="text-xs text-gray-600 mb-0.5">คิวรับยา</p>
                <p className="text-xl font-bold text-blue-600 whitespace-nowrap">{Math.round(averageServiceTime)} นาที</p>
              </div>
            </div>

            {/* INS Queue */}
            <div className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg min-w-0">
              <div className="bg-purple-100 p-1.5 rounded-full flex-shrink-0">
                <Stethoscope className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-center w-full">
                <p className="text-xs text-gray-600 mb-0.5">คิวตรวจ</p>
                <p className="text-xl font-bold text-purple-600 whitespace-nowrap">{Math.round(averageInsServiceTime)} นาที</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* <Card className="shadow-sm bg-card">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ผู้รับบริการวันนี้</p>
              <h3 className="text-2xl font-bold">{completedQueueCount}</h3>
            </div>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default SummaryCards;
