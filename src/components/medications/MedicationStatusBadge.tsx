
import * as React from 'react';
import { Badge } from '@/components/ui/badge';

interface MedicationStatusBadgeProps {
  stock: number;
  minStock: number;
}

const MedicationStatusBadge: React.FC<MedicationStatusBadgeProps> = ({ stock, minStock }) => {
  const getStockStatusClass = (stock: number, minStock: number) => {
    if (stock <= 0) return "text-red-600 bg-red-50";
    if (stock < minStock) return "text-amber-600 bg-amber-50";
    return "text-green-600 bg-green-50";
  };
  
  const getStockStatusText = (stock: number, minStock: number) => {
    if (stock <= 0) return "หมดสต๊อก";
    if (stock < minStock) return "ใกล้หมด";
    return "พร้อมจ่าย";
  };

  return (
    <Badge className={getStockStatusClass(stock, minStock)}>
      {getStockStatusText(stock, minStock)}
    </Badge>
  );
};

export default MedicationStatusBadge;
