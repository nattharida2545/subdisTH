
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import QueueTypeItem from './QueueTypeItem';
import QueueTypeDisplay from './QueueTypeDisplay';
import QueueTypeEditForm from './QueueTypeEditForm';
import { QueueType } from '@/hooks/useQueueTypes';
import { FormatOption } from './schemas';
import { toast } from 'sonner';
import { useQueueTypesData } from '@/hooks/useQueueTypesData';
import { v4 as uuidv4 } from 'uuid';

interface QueueTypesListProps {
  queueTypes: QueueType[];
  editingQueueType: string | null;
  formatOptions: FormatOption[];
  onAddQueueType: () => void;
  onRemoveQueueType: (index: number) => void;
  onEditQueueType: (id: string) => void;
  onSaveQueueType: (index: number) => void;
  onCancelEdit: (index: number) => void;
  onDuplicateQueueType: (index: number) => void;
  onQueueTypeChange: (index: number, field: keyof QueueType, value: any) => void;
}

const QueueTypesList: React.FC<QueueTypesListProps> = ({
  queueTypes,
  editingQueueType,
  formatOptions,
  onAddQueueType,
  onRemoveQueueType,
  onEditQueueType,
  onSaveQueueType,
  onCancelEdit,
  onDuplicateQueueType,
  onQueueTypeChange,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { saveQueueType, deleteQueueType } = useQueueTypesData();
  
  const handleSaveQueueType = async (index: number) => {
    try {
      setIsProcessing(true);
      const queueType = queueTypes[index];
      
      // Ensure it has a valid UUID
      if (!queueType.id || queueType.id === 'NEW') {
        queueType.id = uuidv4();
      }
      
      // Save to Supabase
      const success = await saveQueueType(queueType);
      
      if (success) {
        // Call the original save function to update the UI
        onSaveQueueType(index);
        toast.success(`บันทึกประเภทคิว ${queueType.name} เรียบร้อยแล้ว`);
      }
    } catch (error) {
      console.error("Error saving queue type:", error);
      toast.error("ไม่สามารถบันทึกประเภทคิวได้");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleRemoveQueueType = async (index: number) => {
    try {
      const queueType = queueTypes[index];
      
      if (queueType.id && queueType.id !== 'NEW') {
        setIsProcessing(true);
        
        // Delete from Supabase
        const success = await deleteQueueType(queueType.id);
        
        if (success) {
          // Call the original remove function to update the UI
          onRemoveQueueType(index);
          toast.success(`ลบประเภทคิว ${queueType.name} เรียบร้อยแล้ว`);
        }
      } else {
        // If it's a new queue type that hasn't been saved yet
        onRemoveQueueType(index);
      }
    } catch (error) {
      console.error("Error removing queue type:", error);
      toast.error("ไม่สามารถลบประเภทคิวได้");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDuplicateQueueType = async (index: number) => {
    try {
      const originalQueueType = queueTypes[index];
      
      // Create a duplicate in the UI first
      onDuplicateQueueType(index);
      
      // Get the duplicated queue type (the last one in the array)
      const duplicatedIndex = queueTypes.length;
      const duplicatedQueueType = {
        ...originalQueueType,
        id: uuidv4(), // Generate a new ID
        code: `${originalQueueType.code}_COPY`,
        name: `${originalQueueType.name} (สำเนา)`
      };
      
      // Save to Supabase
      await saveQueueType(duplicatedQueueType);
      
      toast.success(`คัดลอกประเภทคิว ${originalQueueType.name} เรียบร้อยแล้ว`);
    } catch (error) {
      console.error("Error duplicating queue type:", error);
      toast.error("ไม่สามารถคัดลอกประเภทคิวได้");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ประเภทคิว</CardTitle>
        <CardDescription>
          กำหนดค่าประเภทคิวสำหรับผู้ป่วยกลุ่มต่างๆ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {queueTypes.map((queueType, index) => (
            <QueueTypeItem key={queueType.id || index}>
              {editingQueueType === queueType.id ? (
                <QueueTypeEditForm
                  queueType={queueType}
                  index={index}
                  formatOptions={formatOptions}
                  onQueueTypeChange={onQueueTypeChange}
                  onSaveQueueType={() => handleSaveQueueType(index)}
                  onCancelEdit={() => onCancelEdit(index)}
                  isProcessing={isProcessing}
                />
              ) : (
                <QueueTypeDisplay
                  queueType={queueType}
                  onEditQueueType={() => onEditQueueType(queueType.id)}
                  onRemoveQueueType={() => handleRemoveQueueType(index)}
                  onDuplicateQueueType={() => handleDuplicateQueueType(index)}
                  isProcessing={isProcessing}
                />
              )}
            </QueueTypeItem>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onAddQueueType}
          disabled={isProcessing}
        >
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มประเภทคิวใหม่
        </Button>
      </CardContent>
    </Card>
  );
};

export default QueueTypesList;
