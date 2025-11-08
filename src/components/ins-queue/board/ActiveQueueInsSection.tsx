import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { QueueIns, ServicePointIns } from "@/integrations/supabase/schema";
import { formatQueueInsNumber } from "@/utils/queueInsFormatters";
import { cancelSpeech } from "@/utils/tts/audioManager";
import { announceQueue } from "@/utils/textToSpeech";

interface ActiveQueueInsSectionProps {
  activeQueues: QueueIns[];
  findServicePoint: (servicePointId: string | null) => ServicePointIns | null;
}

const ActiveQueueInsSection: React.FC<ActiveQueueInsSectionProps> = ({
  activeQueues,
  findServicePoint,
}) => {
  // Track the last announced called_at per queue to avoid duplicate announcements
  const announcedMapRef = useRef<Map<string, string>>(new Map());
  // Queue to serialize announcements and avoid overlapping audio
  const pendingQueueRef = useRef<
    Array<{ id: string; called_at: string; chunks: string[] }>
  >([]);
  const enqueuedSetRef = useRef<Set<string>>(new Set()); // key: `${id}:${called_at}`
  const isDrainingRef = useRef<boolean>(false);

  // Build announcement chunks for INS queue
  const buildChunks = (q: QueueIns): string[] => {
    const servicePoint = findServicePoint(q.service_point_id ?? null);
    const servicePointName = servicePoint ? servicePoint.name : "";
    const numberText = formatQueueInsNumber(q.type, q.number);

    const chunks: string[] = [
      `ขอเชิญหมายเลข ${numberText}`,
      servicePointName ? `ที่ช่องบริการ ${servicePointName}` : "",
    ].filter(Boolean);
    return chunks;
  };

  // Drain pending announcements sequentially
  const drainQueue = async () => {
    if (isDrainingRef.current) return;
    isDrainingRef.current = true;
    try {
      while (pendingQueueRef.current.length > 0) {
        const item = pendingQueueRef.current.shift()!;
        try {
          // หาข้อมูล queue จากไอดี
          const queue = activeQueues.find((q) => q.id === item.id);
          if (queue) {
            const servicePoint = findServicePoint(
              queue.service_point_id ?? null
            );
            // ใช้ announceQueue แทนการใช้ initializeAudioChunks และ playNextChunk โดยตรง
            await announceQueue(
              queue.number,
              servicePoint || { name: "ช่องบริการ หนึ่ง" },
              queue.type
            );
          }
        } finally {
          // Mark this queue id as announced for this called_at
          announcedMapRef.current.set(item.id, item.called_at);
          // Small pause between announcements
          await new Promise((r) => setTimeout(r, 250));
        }
      }
    } finally {
      isDrainingRef.current = false;
    }
  };

  // Detect new or updated called_at and enqueue announcements
  useEffect(() => {
    const toAnnounce = activeQueues
      .filter((q) => !!q.called_at)
      .filter((q) => announcedMapRef.current.get(q.id) !== q.called_at);

    if (toAnnounce.length === 0) return;

    // Sort by number ascending to announce in queue number order
    toAnnounce.sort((a, b) => {
      return a.number - b.number;
    });

    for (const q of toAnnounce) {
      const key = `${q.id}:${q.called_at}`;
      if (!q.called_at || enqueuedSetRef.current.has(key)) continue;
      enqueuedSetRef.current.add(key);
      pendingQueueRef.current.push({
        id: q.id,
        called_at: q.called_at,
        chunks: buildChunks(q),
      });
    }

    // Start draining if not already
    drainQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQueues, findServicePoint]);

  // Cleanup: cancel any ongoing speech on unmount
  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  return (
    <div className="lg:col-span-12 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">กำลังให้บริการ</h2>

      {activeQueues.length === 0 ? (
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[200px]">
            <p className="text-gray-500 text-lg">ไม่มีคิวที่กำลังให้บริการ</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeQueues.map((queue) => {
            const servicePoint = findServicePoint(queue.service_point_id);
            const servicePointName = servicePoint
              ? servicePoint.name
              : "ไม่ระบุจุดบริการ";

            return (
              <Card
                key={queue.id}
                className="bg-white border-2 border-pharmacy-200 shadow-lg animate-pulse-gentle"
              >
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-sm font-medium text-pharmacy-700 mb-1">
                      กำลังเรียก
                    </div>
                    <div className="queue-number text-8xl font-bold text-pharmacy-600 mb-4">
                      {formatQueueInsNumber(queue.type, queue.number)}
                    </div>
                    {/* <div className="text-lg font-medium text-gray-800 mb-1">
                      {queue.ID_card
                        ? `บัตรประชาชน: ${queue.ID_card.slice(-4)}`
                        : "ไม่ระบุข้อมูล"}
                    </div> */}
                    <div className="text-sm text-gray-500">
                      {servicePointName}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActiveQueueInsSection;
