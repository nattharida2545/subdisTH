import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ServicePointIns } from "@/integrations/supabase/schema";

interface InsQueueTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransfer: (targetServicePointId: string) => void;
  servicePoints: ServicePointIns[];
  currentServicePointId: string;
}

const InsQueueTransferDialog: React.FC<InsQueueTransferDialogProps> = ({
  open,
  onOpenChange,
  onTransfer,
  servicePoints,
  currentServicePointId,
}) => {
  const [selectedServicePointId, setSelectedServicePointId] = useState<string>("");

  // Filter out the current service point
  const availableServicePoints = servicePoints.filter(
    (sp) => sp.id !== currentServicePointId
  );

  const handleTransfer = () => {
    if (selectedServicePointId) {
      onTransfer(selectedServicePointId);
      setSelectedServicePointId("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>โอนคิวไปยังจุดบริการอื่น</DialogTitle>
          <DialogDescription>
            เลือกจุดบริการที่ต้องการโอนคิวไป
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select
            value={selectedServicePointId}
            onValueChange={setSelectedServicePointId}
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกจุดบริการ" />
            </SelectTrigger>
            <SelectContent>
              {availableServicePoints.map((sp) => (
                <SelectItem key={sp.id} value={sp.id}>
                  {sp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedServicePointId("");
              onOpenChange(false);
            }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!selectedServicePointId}
          >
            โอนคิว
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InsQueueTransferDialog;
