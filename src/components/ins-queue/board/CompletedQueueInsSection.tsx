import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { QueueIns } from "@/integrations/supabase/schema";
import { formatQueueInsNumber } from "@/utils/queueInsFormatters";

interface CompletedQueueInsSectionProps {
  completedQueues: QueueIns[];
}

const CompletedQueueInsSection: React.FC<CompletedQueueInsSectionProps> = ({
  completedQueues,
}) => {
  return (
    <div className="lg:col-span-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">คิวที่เสร็จสิ้น</h2>

      <Card className="bg-white border border-gray-200">
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {completedQueues.length === 0 ? (
              <div className="p-6 flex items-center justify-center min-h-[200px]">
                <p className="text-gray-500">ยังไม่มีคิวที่เสร็จสิ้น</p>
              </div>
            ) : (
              completedQueues.map((queue) => {
                return (
                  <div
                    key={queue.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center mr-3">
                        {formatQueueInsNumber(queue.type, queue.number)}
                      </div>
                      <div className="text-sm">
                        {/* <div className="font-medium text-gray-900">
                          {queue.ID_card
                            ? `บัตรประชาชน: ***${queue.ID_card.slice(-4)}`
                            : "ไม่ระบุข้อมูล"}
                        </div> */}
                        <div className="text-xs text-gray-500">
                          เสร็จสิ้นเมื่อ{" "}
                          {queue.completed_at &&
                            new Date(queue.completed_at).toLocaleTimeString(
                              "th-TH",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              }
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompletedQueueInsSection;
