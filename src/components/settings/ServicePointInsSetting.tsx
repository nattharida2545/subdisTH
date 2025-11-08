import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ServicePoint } from '@/integrations/supabase/schema';
import { useServicePointsIns } from '@/hooks/useServicePointsIns';
import { toast } from 'sonner';
import ServicePointInsForm from './service-points-ins/ServicePointInsForm';
import ServicePointInsListItem from './service-points-ins/ServicePointInsListItem';

const ServicePointInsSetting: React.FC<{ className?: string }> = ({ className }) => {
  const { servicePointsIns, loading, saveServicePointIns, deleteServicePointIns } = useServicePointsIns();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<ServicePoint>>({
    code: '',
    name: '',
    location: '',
    enabled: true
  });

  const handleEdit = (servicePoint: ServicePoint) => {
    setFormData({
      id: servicePoint.id,
      code: servicePoint.code,
      name: servicePoint.name,
      location: servicePoint.location || '',
      enabled: servicePoint.enabled
    });
    setEditingId(servicePoint.id);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setFormData({
      code: '',
      name: '',
      location: '',
      enabled: true
    });
    setEditingId(null);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  const handleChange = (field: keyof ServicePoint, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (!formData.code || !formData.name) {
        toast.error('กรุณากรอกรหัสและชื่อจุดบริการ INS');
        return;
      }
      
      await saveServicePointIns(formData);
      setEditingId(null);
      setIsAdding(false);
      toast.success('บันทึกจุดบริการ INS เรียบร้อยแล้ว');
    } catch (err) {
      console.error('Error saving INS service point:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteServicePointIns(id);
    } catch (err) {
      console.error('Error deleting INS service point:', err);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>จุดบริการตรวจ</CardTitle>
            {/* <CardDescription>
              จัดการจุดบริการตรวจที่จะให้บริการคิวประเภทต่าง ๆ
            </CardDescription> */}
          </div>
          <Button onClick={handleAdd} disabled={isAdding}>
            <Plus className="h-4 w-4 mr-2" /> เพิ่มจุดบริการตรวจ
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <ServicePointInsForm
            formData={formData}
            onCancel={handleCancel}
            onSave={handleSave}
            onChange={handleChange}
          />
        )}
        
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-4">กำลังโหลด...</div>
          ) : servicePointsIns.length === 0 ? (
            <div className="text-center py-4 text-gray-500">ไม่พบข้อมูลจุดบริการตรวจ</div>
          ) : (
            servicePointsIns.map(servicePoint => (
              <div key={servicePoint.id}>
                {editingId === servicePoint.id ? (
                  <ServicePointInsForm
                    formData={formData}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    onChange={handleChange}
                  />
                ) : (
                  <ServicePointInsListItem
                    servicePoint={servicePoint}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicePointInsSetting;
