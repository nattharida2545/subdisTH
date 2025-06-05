
import React from 'react';
import { Form } from '@/components/ui/form';
import { TabsContent } from '@/components/ui/tabs';
import QueueSettings from './QueueSettings';
import GeneralSettings from './GeneralSettings';
import LineSettings from './LineSettings';
import { useSettingsContext } from '@/contexts/SettingsContext';
import SettingsFormActions from './SettingsFormActions';
import ServicePointSettings from './ServicePointSettings';
import ServicePointQueueTypeSettings from './ServicePointQueueTypeSettings';
import { FormatOption } from './schemas';

// Define the format options
const formatOptions: FormatOption[] = [
  { value: '0', label: 'เลขเดี่ยว - เช่น 3, 12, 78', example: '1, 2, 3...' },
  { value: '00', label: 'เลขสองหลัก - เช่น 01, 12, 99', example: '01, 02, 03...' },
  { value: '000', label: 'เลขสามหลัก - เช่น 001, 012, 123', example: '001, 002, 003...' }
];

const SettingsForm: React.FC = () => {
  const { settings, onSubmit, isSubmitting } = useSettingsContext();

  // Ensure we have a valid form instance before rendering form-dependent components
  if (!settings.form) {
    return <div>Loading settings form...</div>;
  }

  return (
    <Form {...settings.form}>
      <TabsContent value="general" className="space-y-6">
        <GeneralSettings form={settings.form} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ServicePointSettings />
          <ServicePointQueueTypeSettings />
        </div>
      </TabsContent>

      <TabsContent value="queue" className="space-y-6">
        <form onSubmit={settings.form.handleSubmit(onSubmit)} className="space-y-6">
          <QueueSettings 
            form={settings.form}
            editingQueueType={settings.editingQueueType}
            setEditingQueueType={settings.setEditingQueueType}
            newQueueType={settings.newQueueType}
            setNewQueueType={settings.setNewQueueType}
            handleAddQueueType={settings.handleAddQueueType}
            handleRemoveQueueType={settings.handleRemoveQueueType}
            handleEditQueueType={settings.handleEditQueueType}
            handleSaveQueueType={settings.handleSaveQueueType}
            handleCancelEdit={settings.handleCancelEdit}
            handleDuplicateQueueType={settings.handleDuplicateQueueType}
            handleQueueTypeChange={settings.handleQueueTypeChange}
            formatOptions={formatOptions}
          />
          <SettingsFormActions isSubmitting={isSubmitting} />
        </form>
      </TabsContent>
      
      <TabsContent value="line" className="space-y-6">
        <LineSettings />
      </TabsContent>
    </Form>
  );
};

export default SettingsForm;
