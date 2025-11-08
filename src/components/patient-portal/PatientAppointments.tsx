import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Edit,
  User,
  Home,
  CreditCard,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Patient } from "@/integrations/supabase/schema";
import { toast } from "sonner";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import PatientAppointmentDialog from "./PatientAppointmentDialog";
import DeleteAppointmentDialog from "@/components/appointments/DeleteAppointmentDialog";

interface PatientAppointmentsProps {
  patient: Patient;
}

interface AppointmentData {
  id: string;
  patient_id: string;
  date: string;
  purpose: string;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const PatientAppointments: React.FC<PatientAppointmentsProps> = ({
  patient,
}) => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<AppointmentData | null>(null);
  const [deleteAppointmentId, setDeleteAppointmentId] = useState<string | null>(
    null
  );

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", patient.id)
        .order("date", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลนัดหมาย");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [patient.id]);

  const handleCreateAppointment = () => {
    setEditingAppointment(null);
    setIsDialogOpen(true);
  };

  const handleEditAppointment = (appointment: AppointmentData) => {
    setEditingAppointment(appointment);
    setIsDialogOpen(true);
  };

  const handleDeleteAppointment = async () => {
    if (!deleteAppointmentId) return;

    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", deleteAppointmentId);

      if (error) throw error;

      toast.success("ลบนัดหมายเรียบร้อยแล้ว");
      setDeleteAppointmentId(null);
      fetchAppointments();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("เกิดข้อผิดพลาดในการลบนัดหมาย");
    }
  };

  const handleAppointmentSuccess = () => {
    setIsDialogOpen(false);
    setEditingAppointment(null);
    fetchAppointments();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "นัดหมาย";
      case "COMPLETED":
        return "เสร็จสิ้น";
      case "CANCELLED":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/patient-portal")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">นัดหมายของฉัน</h1>
          </div>
          {/* <Button onClick={handleCreateAppointment} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            นัดหมายใหม่
          </Button> */}
        </div>

        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">ข้อมูลผู้ป่วย</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-gray-700 mb-1">
              <User className="w-4 h-4" />
              <span>{patient.name}</span>
            </div>
            {/* Patient Info */}

            {/* <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{patient.phone}</span>
          </div> */}

            <div className="flex items-center gap-1 text-gray-700 mb-1">
              <CreditCard className="w-4 h-4" />
              {/* <span className="font-medium">เลขบัตรประจำตัวประชาชน:</span> */}
              <span>{patient.ID_card}</span>
            </div>

            {/* House number and Moo */}
            <div className="flex items-center gap-1 text-gray-700 mb-1">
              <Home className="w-4 h-4" />
              <span>{patient.address}</span>
            </div>

            {/* <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">รหัสผู้ป่วย:</span>
            <span>{patient.patient_id}</span>
          </div> */}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">ยังไม่มีนัดหมาย</p>
                {/* <Button
                  onClick={handleCreateAppointment}
                  className="mt-4 bg-green-600 hover:bg-green-700"
                >
                  สร้างนัดหมายแรก
                </Button> */}
              </CardContent>
            </Card>
          ) : (
            appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">
                          {format(
                            new Date(appointment.date),
                            "dd MMMM yyyy, HH:mm น.",
                            { locale: th }
                          )}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium mb-1">
                        {appointment.purpose}
                      </p>
                      {appointment.notes && (
                        <p className="text-gray-600 text-sm">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAppointment(appointment)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteAppointmentId(appointment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button> */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <PatientAppointmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        patient={patient}
        appointment={editingAppointment}
        onSuccess={handleAppointmentSuccess}
      />

      <DeleteAppointmentDialog
        open={!!deleteAppointmentId}
        onOpenChange={(open) => !open && setDeleteAppointmentId(null)}
        onConfirm={handleDeleteAppointment}
      />
    </div>
  );
};

export default PatientAppointments;
