import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { formatThaiDate } from "@/utils/dateUtils";
import { FileText, Pill, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Appointment {
  id: string;
  patient_id: string;
  date: string;
  purpose: string;
  notes: string | null;
  status: string;
  created_at: string;
}

interface Medication {
  id: string;
  name: string;
  code: string;
  stock: number;
  unit: string;
}

interface PatientMedication {
  id: string;
  medication_id: string;
  dosage: string;
  instructions: string | null;
  dispensed: number | null;
  patient_check_id: string | null;
  start_date: string;
  medication?: Medication;
}

interface PatientCheck {
  id: string;
  check_note: string | null;
  created_at: string;
}

interface PharmacyDispenseViewProps {
  patientId: string;
  queueId?: string;
}

const PharmacyDispenseView: React.FC<PharmacyDispenseViewProps> = ({
  patientId,
  queueId,
}) => {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [medications, setMedications] = useState<PatientMedication[]>([]);
  const [patientCheck, setPatientCheck] = useState<PatientCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [dispensing, setDispensing] = useState(false);

  useEffect(() => {
    fetchAppointmentAndMedications();
  }, [patientId, queueId]);

  const fetchAppointmentAndMedications = async () => {
    setLoading(true);
    try {
      // Fetch queue to get appointment_id
      let appointmentId: string | null = null;
      
      if (queueId) {
        const { data: queueData } = await supabase
          .from("queues")
          .select("appointment_id")
          .eq("id", queueId)
          .single();

        appointmentId = queueData?.appointment_id || null;
      }

      // If no appointment from queue, try to find today's appointment
      if (!appointmentId) {
        const today = new Date().toISOString().split("T")[0];
        const { data: appointmentData } = await supabase
          .from("appointments")
          .select("*")
          .eq("patient_id", patientId)
          .eq("date", today)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (appointmentData) {
          setAppointment(appointmentData);
          appointmentId = appointmentData.id;
        }
      } else {
        // Fetch appointment details
        const { data: appointmentData } = await supabase
          .from("appointments")
          .select("*")
          .eq("id", appointmentId)
          .single();

        if (appointmentData) {
          setAppointment(appointmentData);
        }
      }

      // Fetch today's medications for this patient
      const today = new Date().toISOString().split("T")[0];
      const { data: medicationsData, error: medError } = await supabase
        .from("patient_medications")
        .select(`
          *,
          medication:medications(*)
        `)
        .eq("patient_id", patientId)
        .eq("start_date", today)
        .order("created_at", { ascending: false });

      if (!medError && medicationsData) {
        setMedications(medicationsData);

        // If there's a patient_check_id, fetch the check note
        const checkId = medicationsData[0]?.patient_check_id;
        if (checkId) {
          const { data: checkData } = await supabase
            .from("patient_check")
            .select("*")
            .eq("id", checkId)
            .single();

          if (checkData) {
            setPatientCheck(checkData);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDispense = async () => {
    if (medications.length === 0) {
      toast.error("ไม่มียาที่ต้องจ่าย");
      return;
    }

    setDispensing(true);
    try {
      // Update queue status to completed if queueId exists
      if (queueId) {
        const { error: queueError } = await supabase
          .from("queues")
          .update({
            pharmacy_status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", queueId);

        if (queueError) throw queueError;
      }

      toast.success("จ่ายยาเรียบร้อยแล้ว");
      
      // Refresh data
      setTimeout(() => {
        fetchAppointmentAndMedications();
      }, 500);
    } catch (error) {
      console.error("Error completing dispense:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setDispensing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Appointment Info */}
      {appointment && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              ข้อมูลการนัดหมาย
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">วันที่นัด:</span>
                <p className="font-medium">{formatThaiDate(appointment.date)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">วัตถุประสงค์:</span>
                <p className="font-medium">{appointment.purpose}</p>
              </div>
            </div>
            {appointment.notes && (
              <div>
                <span className="text-sm text-gray-600">หมายเหตุ:</span>
                <p className="text-sm mt-1">{appointment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Patient Check Note */}
      {/* {patientCheck?.check_note && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              บันทึกการตรวจ/การรักษา
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-white rounded border border-green-200">
              <p className="text-sm whitespace-pre-wrap">{patientCheck.check_note}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              บันทึกเมื่อ: {formatThaiDate(patientCheck.created_at)}
            </p>
          </CardContent>
        </Card>
      )} */}

      {/* Medications to Dispense */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Pill className="h-5 w-5 text-pharmacy-600" />
            รายการยาที่ต้องจ่าย
            {medications.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {medications.length} รายการ
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="mb-1">ไม่มียาที่ต้องจ่ายในวันนี้</p>
              <p className="text-sm">
                กรุณาไปที่แท็บ "จ่ายยา" เพื่อเพิ่มรายการยา
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>ชื่อยา</TableHead>
                    <TableHead>รหัส</TableHead>
                    <TableHead>ขนาดยา</TableHead>
                    <TableHead>จำนวนที่จ่าย</TableHead>
                    <TableHead>คำแนะนำ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.map((med, index) => (
                    <TableRow key={med.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{med.medication?.name}</div>
                          <div className="text-xs text-gray-500">
                            คงเหลือ: {med.medication?.stock} {med.medication?.unit}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {med.medication?.code}
                      </TableCell>
                      <TableCell>{med.dosage}</TableCell>
                      <TableCell>
                        {med.dispensed ? (
                          <span className="font-medium text-green-600">
                            {med.dispensed} {med.medication?.unit}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {med.instructions || (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleCompleteDispense}
                  disabled={dispensing}
                  className="bg-pharmacy-600 hover:bg-pharmacy-700"
                  size="lg"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {dispensing ? "กำลังบันทึก..." : "ยืนยันจ่ายยาเรียบร้อย"}
                </Button>
              </div> */}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacyDispenseView;
