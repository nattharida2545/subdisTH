
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ServicePoint } from '@/integrations/supabase/schema';
import { useServicePoints } from '@/hooks/useServicePoints';
import { toast } from 'sonner';
import ServicePointForm from './service-points/ServicePointForm';
import ServicePointListItem from './service-points/ServicePointListItem';

const ServicePointSettings: React.FC<{ className?: string }> = ({ className }) => {
  const { servicePoints, loading, saveServicePoint, deleteServicePoint } = useServicePoints();
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
        toast.error('กรุณากรอกรหัสและชื่อจุดบริการ');
        return;
      }
      
      await saveServicePoint(formData);
      setEditingId(null);
      setIsAdding(false);
      toast.success('บันทึกจุดบริการเรียบร้อยแล้ว');
    } catch (err) {
      console.error('Error saving service point:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteServicePoint(id);
    } catch (err) {
      console.error('Error deleting service point:', err);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>จุดบริการ</CardTitle>
            <CardDescription>
              จัดการจุดบริการที่จะให้บริการคิวประเภทต่าง ๆ
            </CardDescription>
          </div>
          <Button onClick={handleAdd} disabled={isAdding}>
            <Plus className="h-4 w-4 mr-2" /> เพิ่มจุดบริการ
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <ServicePointForm
            formData={formData}
            onCancel={handleCancel}
            onSave={handleSave}
            onChange={handleChange}
          />
        )}
        
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-4">กำลังโหลด...</div>
          ) : servicePoints.length === 0 ? (
            <div className="text-center py-4 text-gray-500">ไม่พบข้อมูลจุดบริการ</div>
          ) : (
            servicePoints.map(servicePoint => (
              <div key={servicePoint.id}>
                {editingId === servicePoint.id ? (
                  <ServicePointForm
                    formData={formData}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    onChange={handleChange}
                  />
                ) : (
                  <ServicePointListItem
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

export default ServicePointSettings;
