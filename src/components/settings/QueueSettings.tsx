
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormatOption } from './schemas';
import { QueueType } from '@/hooks/useQueueTypes';
import QueueConfigSection from './QueueConfigSection';
import QueueTypesList from './QueueTypesList';
// import QueueAnnouncementSection from './QueueAnnouncementSection';

interface QueueSettingsProps {
  form: UseFormReturn<any>;
  editingQueueType: string | null;
  setEditingQueueType: React.Dispatch<React.SetStateAction<string | null>>;
  newQueueType: boolean;
  setNewQueueType: React.Dispatch<React.SetStateAction<boolean>>;
  formatOptions: FormatOption[];
  handleAddQueueType: () => void;
  handleRemoveQueueType: (index: number) => void;
  handleEditQueueType: (id: string) => void;
  handleSaveQueueType: (index: number) => void;
  handleCancelEdit: (index: number) => void;
  handleDuplicateQueueType: (index: number) => void;
  handleQueueTypeChange: (index: number, field: keyof QueueType, value: any) => void;
}

const QueueSettings: React.FC<QueueSettingsProps> = ({
  form,
  editingQueueType,
  setEditingQueueType,
  newQueueType,
  setNewQueueType,
  formatOptions,
  handleAddQueueType,
  handleRemoveQueueType,
  handleEditQueueType,
  handleSaveQueueType,
  handleCancelEdit,
  handleDuplicateQueueType,
  handleQueueTypeChange,
}) => {
  const queueTypes = form.watch('queue_types');

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>การตั้งค่าคิว</CardTitle>
          <CardDescription>
            กำหนดค่าการทำงานของระบบคิว
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <QueueConfigSection form={form} />
          
          <QueueTypesList 
            queueTypes={queueTypes}
            editingQueueType={editingQueueType}
            formatOptions={formatOptions}
            onAddQueueType={handleAddQueueType}
            onRemoveQueueType={handleRemoveQueueType}
            onEditQueueType={handleEditQueueType}
            onSaveQueueType={handleSaveQueueType}
            onCancelEdit={handleCancelEdit}
            onDuplicateQueueType={handleDuplicateQueueType}
            onQueueTypeChange={handleQueueTypeChange}
          />
        </CardContent>
      </Card>
      
      {/* <Card>
        <CardHeader>
          <CardTitle>การประกาศเรียกคิว</CardTitle>
          <CardDescription>
            ตั้งค่าการแสดงผลและเสียงประกาศเรียกคิว
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <QueueAnnouncementSection form={form} />
        </CardContent>
      </Card> */}
    </>
  );
};

export default QueueSettings;
