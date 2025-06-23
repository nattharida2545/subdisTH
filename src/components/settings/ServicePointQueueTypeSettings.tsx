
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useServicePoints } from '@/hooks/useServicePoints';
import { useServicePointQueueTypes } from '@/hooks/useServicePointQueueTypes';
import { useQueueTypesData } from '@/hooks/useQueueTypesData';
import { QueueTypeConfig, ServicePoint } from '@/integrations/supabase/schema';
import { PlusCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import QueueTypeLabel from '@/components/queue/QueueTypeLabel';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ServicePointQueueTypeSettings: React.FC<{ className?: string }> = ({ className }) => {
  const { servicePoints, loading: loadingServicePoints } = useServicePoints();
  const { queueTypes, loading: loadingQueueTypes } = useQueueTypesData();
  const [selectedServicePointId, setSelectedServicePointId] = useState<string>('');
  const { 
    mappings, 
    loading: loadingMappings, 
    deletingId, 
    addMapping, 
    removeMapping, 
    fetchMappings,
    error: mappingsError
  } = useServicePointQueueTypes(selectedServicePointId);
  
  const [availableQueueTypes, setAvailableQueueTypes] = useState<QueueTypeConfig[]>([]);
  const [selectedQueueTypeId, setSelectedQueueTypeId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  // When service point changes, select first one if none selected
  useEffect(() => {
    if (servicePoints.length > 0 && !selectedServicePointId) {
      setSelectedServicePointId(servicePoints[0].id);
    }
  }, [servicePoints, selectedServicePointId]);

  // When mappings or queue types change, update available queue types
  useEffect(() => {
    if (queueTypes && mappings) {
      const mappedQueueTypeIds = mappings.map(m => m.queue_type_id);
      // Filter available queue types and ensure proper typing
      const available = queueTypes
        .filter(qt => qt.enabled && !mappedQueueTypeIds.includes(qt.id))
        .map(qt => qt as unknown as QueueTypeConfig);
      
      setAvailableQueueTypes(available);
      
      // Reset selected queue type if it's no longer available
      if (selectedQueueTypeId && !available.some(qt => qt.id === selectedQueueTypeId)) {
        setSelectedQueueTypeId('');
      }
    }
  }, [queueTypes, mappings, selectedQueueTypeId]);

  const handleServicePointChange = (value: string) => {
    setSelectedServicePointId(value);
    setSelectedQueueTypeId(''); // Reset selected queue type when service point changes
  };

  const handleQueueTypeSelect = (value: string) => {
    setSelectedQueueTypeId(value);
  };

  const handleAddMapping = async () => {
    if (selectedServicePointId && selectedQueueTypeId) {
      try {
        setIsAdding(true);
        const success = await addMapping(selectedServicePointId, selectedQueueTypeId);
        if (success) {
          setSelectedQueueTypeId('');
          toast.success('เชื่อมโยงประเภทคิวกับจุดบริการเรียบร้อยแล้ว');
          // Refresh the mappings to get updated data
          await fetchMappings();
        } else {
          toast.error('ไม่สามารถเชื่อมโยงประเภทคิวกับจุดบริการได้');
        }
      } catch (error: any) {
        console.error('Error adding mapping:', error);
        const errorMessage = error?.message || 'เกิดข้อผิดพลาดในการเชื่อมโยงประเภทคิว';
        toast.error(errorMessage);
        
        // Show specific error for RLS issues
        if (error?.code === '42501') {
          toast.error('ไม่มีสิทธิ์ในการเพิ่มการเชื่อมโยง กรุณาติดต่อผู้ดูแลระบบ');
        }
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleRemoveMapping = async (mappingId: string) => {
    try {
      const success = await removeMapping(mappingId);
      if (success) {
        toast.success('ยกเลิกการเชื่อมโยงประเภทคิวเรียบร้อยแล้ว');
        // Refresh the mappings to get updated data
        await fetchMappings();
      } else {
        toast.error('ไม่สามารถยกเลิกการเชื่อมโยงประเภทคิวได้');
      }
    } catch (error: any) {
      console.error('Error removing mapping:', error);
      const errorMessage = error?.message || 'เกิดข้อผิดพลาดในการยกเลิกการเชื่อมโยง';
      toast.error(errorMessage);
    }
  };

  // Find selected service point object
  const selectedServicePoint = servicePoints.find(sp => sp.id === selectedServicePointId);

  const isLoading = loadingServicePoints || loadingQueueTypes || loadingMappings;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>การเชื่อมโยงประเภทคิวกับจุดบริการ</CardTitle>
        <CardDescription>
          กำหนดว่าจุดบริการแต่ละจุดสามารถให้บริการคิวประเภทใดได้บ้าง
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mappingsError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              เกิดข้อผิดพลาด: {mappingsError}
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            กำลังโหลด...
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">เลือกจุดบริการ</label>
                <Select value={selectedServicePointId} onValueChange={handleServicePointChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกจุดบริการ" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicePoints.map(sp => (
                      <SelectItem key={sp.id} value={sp.id}>
                        {sp.code} - {sp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedServicePoint && (
                <>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">จัดการประเภทคิวสำหรับ {selectedServicePoint.name}</h3>
                    
                    <div className="flex gap-4 items-end mb-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium">เลือกประเภทคิว</label>
                        {availableQueueTypes.length === 0 ? (
                          <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                            ไม่มีประเภทคิวที่สามารถเพิ่มได้
                          </div>
                        ) : (
                          <Select value={selectedQueueTypeId} onValueChange={handleQueueTypeSelect}>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกประเภทคิวที่จะเพิ่ม" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableQueueTypes.map(qt => (
                                <SelectItem key={qt.id} value={qt.id}>
                                  {qt.name} - {qt.purpose || 'ไม่มีคำอธิบาย'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <Button 
                        onClick={handleAddMapping} 
                        disabled={!selectedQueueTypeId || availableQueueTypes.length === 0 || isAdding}
                      >
                        {isAdding ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <PlusCircle className="h-4 w-4 mr-2" />
                        )}
                        เพิ่ม
                      </Button>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">ประเภทคิวที่ให้บริการ</h4>
                      {mappings.length === 0 ? (
                        <div className="text-sm text-gray-500 p-2">ยังไม่มีประเภทคิวที่ให้บริการ</div>
                      ) : (
                        <div className="space-y-2">
                          {mappings.map(mapping => {
                            // Find the queue type using the ID
                            const queueType = queueTypes.find(qt => qt.id === mapping.queue_type_id);
                            const isDeleting = deletingId === mapping.id;
                            
                            return (
                              <div key={mapping.id} className="flex items-center justify-between bg-white p-2 rounded border">
                                <div className="flex items-center">
                                  {queueType && (
                                    <>
                                      <QueueTypeLabel queueType={queueType.code as any} />
                                      <span className="ml-2">{queueType.name}</span>
                                      {queueType.purpose && (
                                        <span className="ml-2 text-sm text-gray-500">
                                          - {queueType.purpose}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleRemoveMapping(mapping.id)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ServicePointQueueTypeSettings;
