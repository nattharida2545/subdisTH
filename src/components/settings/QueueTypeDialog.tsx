
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QueueType } from '@/hooks/useQueueTypes';
import { FormatOption, algorithmOptions } from './schemas';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';
import { v4 as uuidv4 } from 'uuid';

interface QueueTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queueType?: QueueType | null;
  formatOptions: FormatOption[];
  onSave: (queueType: QueueType) => void;
}

const QueueTypeDialog: React.FC<QueueTypeDialogProps> = ({
  open,
  onOpenChange,
  queueType,
  formatOptions,
  onSave,
}) => {
  const [formData, setFormData] = useState<QueueType>({
    id: '',
    code: '',
    name: '',
    prefix: '',
    purpose: '',
    format: '0',
    enabled: true,
    algorithm: QueueAlgorithmType.FIFO,
    priority: 5
  });

  const isEdit = !!queueType;

  useEffect(() => {
    if (queueType) {
      setFormData(queueType);
    } else {
      setFormData({
        id: uuidv4(),
        code: '',
        name: '',
        prefix: '',
        purpose: '',
        format: '0',
        enabled: true,
        algorithm: QueueAlgorithmType.FIFO,
        priority: 5
      });
    }
  }, [queueType, open]);

  const handleSave = () => {
    if (!formData.code || !formData.name || !formData.prefix) {
      return;
    }
    
    onSave(formData);
    onOpenChange(false);
  };

  const handleFieldChange = (field: keyof QueueType, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'แก้ไขประเภทคิว' : 'เพิ่มประเภทคิวใหม่'}
          </DialogTitle>
          <DialogDescription>
            กรอกข้อมูลประเภทคิวที่ต้องการ
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="code">รหัสประเภทคิว</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleFieldChange('code', e.target.value)}
              placeholder="เช่น GENERAL, PRIORITY"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="name">ชื่อประเภทคิว</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="เช่น ทั่วไป, ด่วน"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="prefix">คำนำหน้า</Label>
            <Input
              id="prefix"
              value={formData.prefix}
              onChange={(e) => handleFieldChange('prefix', e.target.value)}
              placeholder="เช่น A, B, P"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="purpose">วัตถุประสงค์</Label>
            <Input
              id="purpose"
              value={formData.purpose || ''}
              onChange={(e) => handleFieldChange('purpose', e.target.value)}
              placeholder="เช่น สำหรับผู้ป่วยทั่วไป"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="format">รูปแบบหมายเลข</Label>
            <Select 
              value={formData.format} 
              onValueChange={(value) => handleFieldChange('format', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="algorithm">อัลกอริทึม</Label>
            <Select 
              value={formData.algorithm} 
              onValueChange={(value) => handleFieldChange('algorithm', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {algorithmOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="priority">ลำดับความสำคัญ (1-10)</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="10"
              value={formData.priority}
              onChange={(e) => handleFieldChange('priority', parseInt(e.target.value) || 5)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => handleFieldChange('enabled', checked)}
            />
            <Label htmlFor="enabled">เปิดใช้งาน</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มประเภทคิว'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QueueTypeDialog;
