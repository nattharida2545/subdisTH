import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Patient } from "@/integrations/supabase/schema";

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (patient: Partial<Patient>) => void;
  onCancel: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<Patient>>(
    patient || {
      name: "",
      phone: "",
      line_id: "",
      address: "",
      ID_card: "",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-lg animate-scale-in">
      <CardHeader>
        <CardTitle className="text-xl text-pharmacy-800">
          {patient ? "แก้ไขข้อมูลผู้ป่วย" : "ลงทะเบียนผู้ป่วยใหม่"}
        </CardTitle>
        <CardDescription>
          กรอกข้อมูลให้ครบถ้วนเพื่อลงทะเบียนหรือแก้ไขข้อมูลผู้ป่วย
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ-นามสกุล</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="ชื่อ-นามสกุล"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ID_card">เลขบัตรประชาชน</Label>
              <Input
                id="ID_card"
                name="ID_card"
                value={formData.ID_card || ""}
                onChange={handleChange}
                placeholder="เลขบัตรประชาชน 13 หลัก"
                maxLength={13}
                pattern="[0-9]{13}"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              placeholder="เบอร์โทรศัพท์"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="line_id">LINE ID (ถ้ามี)</Label>
            <Input
              id="line_id"
              name="line_id"
              value={formData.line_id || ""}
              onChange={handleChange}
              placeholder="LINE ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">ที่อยู่</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              placeholder="ที่อยู่"
              rows={3}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button
            type="submit"
            className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white"
          >
            {patient ? "บันทึกการแก้ไข" : "ลงทะเบียน"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PatientForm;
