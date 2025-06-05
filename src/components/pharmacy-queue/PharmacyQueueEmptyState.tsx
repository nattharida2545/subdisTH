
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const PharmacyQueueEmptyState: React.FC = () => {
  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-medium mb-4">เลือกจุดบริการ</h2>
          <p className="text-gray-500">กรุณาเลือกจุดบริการเพื่อดูคิวที่ได้รับมอบหมาย</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PharmacyQueueEmptyState;
