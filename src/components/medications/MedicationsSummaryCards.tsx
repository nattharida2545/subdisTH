
import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Medication } from '@/integrations/supabase/schema';
import { Pill, AlertCircle, Check } from 'lucide-react';

interface MedicationsSummaryCardsProps {
  medications: Medication[];
}

const MedicationsSummaryCards: React.FC<MedicationsSummaryCardsProps> = ({ medications }) => {
  // Ensure medications is an array even if undefined
  const medicationItems = medications || [];
  
  // Safe calculations with null checks
  const lowStockCount = medicationItems.filter(med => med.stock < med.min_stock && med.stock > 0).length;
  const readyCount = medicationItems.filter(med => med.stock >= med.min_stock).length;
  const percentage = medicationItems.length > 0 
    ? Math.round((readyCount / medicationItems.length) * 100)
    : 0;
    
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">รายการยาทั้งหมด</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{medicationItems.length}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Pill className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500">
              อัพเดทล่าสุด <span className="font-medium">วันนี้ {new Date().toLocaleTimeString('th-TH', {hour: '2-digit', minute: '2-digit'})}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">ยาที่ใกล้หมดสต๊อก</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{lowStockCount}</h3>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500">
              ต้องสั่งซื้อภายใน <span className="font-medium text-amber-600">7 วัน</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">ยาที่พร้อมจ่าย</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{readyCount}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500">
              คิดเป็น <span className="font-medium text-green-600">{percentage}%</span> ของรายการทั้งหมด
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicationsSummaryCards;
