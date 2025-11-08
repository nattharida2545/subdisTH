import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings } from "lucide-react";
import { ServicePoint } from "@/integrations/supabase/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface PharmacyQueueHeaderProps {
  selectedServicePoint: ServicePoint | null;
  servicePoints: ServicePoint[];
  onServicePointChange: (value: string) => void;
  onRefresh?: () => void;
}

const PharmacyQueueHeader: React.FC<PharmacyQueueHeaderProps> = ({
  selectedServicePoint,
  servicePoints,
  onServicePointChange,
  onRefresh,
}) => {
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-pharmacy-600">
              บริการร้านยา
            </h1>
            <Select
              value={selectedServicePoint?.id || ""}
              onValueChange={onServicePointChange}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="เลือกจุดบริการ" />
              </SelectTrigger>
              <SelectContent>
                {servicePoints.map((servicePoint) => (
                  <SelectItem key={servicePoint.id} value={servicePoint.id}>
                    {servicePoint.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                รีเฟรช
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleSettingsClick}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              ตั้งค่า
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PharmacyQueueHeader;
