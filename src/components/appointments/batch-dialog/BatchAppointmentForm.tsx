
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BatchAppointmentFormValues, batchAppointmentFormSchema, TimeSlot } from './types';
import { MultiPatientSelector } from './MultiPatientSelector';
import { CommonDetailsFields } from './CommonDetailsFields';
import { TimeSlotDistributor } from './TimeSlotDistributor';
import { BatchAppointmentReview } from './BatchAppointmentReview';
import { useMultiPatientSelection } from '@/hooks/appointments/useMultiPatientSelection';
import { useBatchAppointments } from '@/hooks/appointments/useBatchAppointments';
import { Patient } from '@/integrations/supabase/schema';
import { ArrowLeftIcon, ArrowRightIcon, Check } from 'lucide-react';

interface BatchAppointmentFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export const BatchAppointmentForm: React.FC<BatchAppointmentFormProps> = ({
  onCancel,
  onSuccess
}) => {
  const [currentTab, setCurrentTab] = useState<string>('patients');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const {
    selectedPatients,
    searchTerm,
    setSearchTerm,
    searchResults,
    handleSearch,
    addPatient,
    removePatient,
    reorderPatients,
    clearSelection
  } = useMultiPatientSelection();

  const { createBatchAppointments, loading, progress } = useBatchAppointments();

  const form = useForm<BatchAppointmentFormValues>({
    resolver: zodResolver(batchAppointmentFormSchema),
    defaultValues: {
      date: '',
      startTime: '',
      duration: 15,
      purpose: '',
      notes: '',
    },
  });

  // Handle time slot calculation
  const handleTimeSlotsChange = (slots: TimeSlot[]) => {
    setTimeSlots(slots);
  };

  // Navigate between tabs
  const navigateToTab = (tab: string) => {
    setCurrentTab(tab);
  };

  const canGoToDetails = selectedPatients.length > 0;
  const canGoToReview = canGoToDetails && form.formState.isValid;

  const handlePatientsNext = () => {
    if (canGoToDetails) {
      navigateToTab('details');
    }
  };

  const handleDetailsNext = () => {
    if (canGoToReview) {
      navigateToTab('review');
    }
  };

  const handleSubmit = async (values: BatchAppointmentFormValues) => {
    if (selectedPatients.length === 0 || timeSlots.length === 0) {
      return;
    }

    const result = await createBatchAppointments({
      date: values.date,
      patientSlots: timeSlots,
      purpose: values.purpose,
      notes: values.notes
    });

    if (result) {
      onSuccess();
    }
  };

  // Reset form when component unmounts
  useEffect(() => {
    return () => {
      clearSelection();
      form.reset();
    };
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="patients">เลือกผู้ป่วย</TabsTrigger>
            <TabsTrigger value="details" disabled={!canGoToDetails}>รายละเอียด</TabsTrigger>
            <TabsTrigger value="review" disabled={!canGoToReview}>ตรวจสอบ</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="patients" className="space-y-4">
              <MultiPatientSelector
                selectedPatients={selectedPatients}
                onAddPatient={addPatient}
                onRemovePatient={removePatient}
                onMovePatient={reorderPatients}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                onSearch={handleSearch}
                searchResults={searchResults}
              />
              
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                  ยกเลิก
                </Button>
                <Button
                  type="button"
                  onClick={handlePatientsNext}
                  disabled={!canGoToDetails}
                >
                  ถัดไป <ArrowRightIcon className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <CommonDetailsFields form={form} />
              
              {selectedPatients.length > 0 && (
                <TimeSlotDistributor
                  patients={selectedPatients}
                  date={form.watch('date')}
                  startTime={form.watch('startTime')}
                  duration={form.watch('duration')}
                  onTimeSlotsChange={handleTimeSlotsChange}
                />
              )}
              
              <div className="flex justify-between mt-4">
                <Button type="button" variant="outline" onClick={() => navigateToTab('patients')}>
                  <ArrowLeftIcon className="mr-1 h-4 w-4" /> ย้อนกลับ
                </Button>
                <Button
                  type="button"
                  onClick={handleDetailsNext}
                  disabled={!form.formState.isValid}
                >
                  ถัดไป <ArrowRightIcon className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="review">
              <BatchAppointmentReview
                patients={selectedPatients}
                date={form.watch('date')}
                timeSlots={timeSlots}
                purpose={form.watch('purpose')}
                notes={form.watch('notes')}
                isProcessing={loading}
                progress={progress}
              />
              
              <div className="flex justify-between mt-4">
                <Button type="button" variant="outline" onClick={() => navigateToTab('details')}>
                  <ArrowLeftIcon className="mr-1 h-4 w-4" /> ย้อนกลับ
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || selectedPatients.length === 0}
                >
                  <Check className="mr-1 h-4 w-4" /> ยืนยันการสร้างนัดหมาย
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </form>
    </Form>
  );
};
