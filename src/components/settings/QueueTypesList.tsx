
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import QueueTypeItem from './QueueTypeItem';
import QueueTypeDisplay from './QueueTypeDisplay';
import QueueTypeEditForm from './QueueTypeEditForm';
import QueueTypeDialog from './QueueTypeDialog';
import { QueueType } from '@/hooks/useQueueTypes';
import { FormatOption } from './schemas';
import { toast } from 'sonner';
import { useQueueTypesData } from '@/hooks/useQueueTypesData';

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
  queueTypes: formQueueTypes,
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQueueType, setSelectedQueueType] = useState<QueueType | null>(null);
  const { queueTypes: dbQueueTypes, saveQueueType, deleteQueueType, fetchQueueTypes } = useQueueTypesData();
  
  // Use database queue types as the primary source
  const queueTypes = dbQueueTypes.length > 0 ? dbQueueTypes : formQueueTypes;
  
  const handleSaveQueueType = async (index: number) => {
    try {
      setIsProcessing(true);
      const queueType = queueTypes[index];
      
      const success = await saveQueueType(queueType);
      
      if (success) {
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
        
        const success = await deleteQueueType(queueType.id);
        
        if (success) {
          onRemoveQueueType(index);
          toast.success(`ลบประเภทคิว ${queueType.name} เรียบร้อยแล้ว`);
        }
      } else {
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
      
      const duplicatedQueueType = {
        ...originalQueueType,
        id: crypto.randomUUID(),
        code: `${originalQueueType.code}_COPY`,
        name: `${originalQueueType.name} (สำเนา)`
      };
      
      const success = await saveQueueType(duplicatedQueueType);
      
      if (success) {
        await fetchQueueTypes();
        toast.success(`คัดลอกประเภทคิว ${originalQueueType.name} เรียบร้อยแล้ว`);
      }
    } catch (error) {
      console.error("Error duplicating queue type:", error);
      toast.error("ไม่สามารถคัดลอกประเภทคิวได้");
    }
  };

  const handleAddNewQueueType = () => {
    setSelectedQueueType(null);
    setDialogOpen(true);
  };

  const handleEditQueueType = (queueType: QueueType) => {
    setSelectedQueueType(queueType);
    setDialogOpen(true);
  };

  const handleDialogSave = async (queueType: QueueType) => {
    try {
      setIsProcessing(true);
      const success = await saveQueueType(queueType);
      
      if (success) {
        await fetchQueueTypes();
        toast.success(`บันทึกประเภทคิว ${queueType.name} เรียบร้อยแล้ว`);
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("Error saving queue type:", error);
      toast.error("ไม่สามารถบันทึกประเภทคิวได้");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
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
                    onEditQueueType={() => handleEditQueueType(queueType)}
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
            onClick={handleAddNewQueueType}
            disabled={isProcessing}
          >
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มประเภทคิวใหม่
          </Button>
        </CardContent>
      </Card>

      <QueueTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        queueType={selectedQueueType}
        formatOptions={formatOptions}
        onSave={handleDialogSave}
      />
    </>
  );
};

export default QueueTypesList;
