import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Search,
  Calendar,
  Clock,
  Users,
  List,
  Calendar as CalendarIcon,
  Download,
  User,
  X,
} from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { th } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { QueueIns, QueueStatus, ServicePointIns } from "@/integrations/supabase/schema";
import {
  QueueType,
  ensureValidFormat,
  ensureValidAlgorithm,
} from "@/hooks/useQueueTypes";

interface PatientCheck {
  id: string;
  patient_id: string;
  check_note: string | null;
  created_at: string;
}

interface MedicationDetails {
  id: string;
  name: string;
  description?: string;
  unit?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

interface PatientMedication {
  id: string;
  medication_id: string;
  patient_id: string;
  dosage: string;
  instructions: string | null;
  dispensed: number | null;
  notes: string | null;
  patient_check_id: string | null;
  start_date: string;
  created_at: string;
  updated_at: string;
  medication?: MedicationDetails;
}

const InsQueueHistory = () => {
  const [queues, setQueues] = useState<QueueIns[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalServed: 0,
    averageWaitTime: 0,
    totalPatients: 0,
  });

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<QueueIns | null>(null);
  const [patientCheck, setPatientCheck] = useState<PatientCheck | null>(null);
  const [medications, setMedications] = useState<PatientMedication[]>([]);
  const [loadingCheckData, setLoadingCheckData] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const [servicePointId, setServicePointId] = useState<string>("all");
  const [servicePoints, setServicePoints] = useState<ServicePointIns[]>([]);
  const [queueTypes, setQueueTypes] = useState<QueueType[]>([]);

  // Fetch INS queue types from Supabase
  useEffect(() => {
    const fetchQueueTypes = async () => {
      try {
        const { data, error } = await supabase
          .from("queue_ins_types")
          .select("*")
          .eq("enabled", true);

        if (error) {
          throw error;
        }

        if (data) {
          // Transform the data to ensure format uses the correct type
          const formattedData: QueueType[] = data.map((item) => ({
            id: item.id,
            code: item.code,
            name: item.name,
            prefix: item.prefix,
            purpose: "ins",
            format: ensureValidFormat(item.format),
            enabled: item.enabled,
            algorithm: "FIFO",
            priority: 0,
          }));

          setQueueTypes(formattedData);
        }
      } catch (error) {
        console.error("Error fetching INS queue types:", error);
        toast.error("ไม่สามารถดึงข้อมูลประเภทคิวตรวจได้");
      }
    };

    fetchQueueTypes();
  }, []);

  // Fetch service points from Supabase
  useEffect(() => {
    const fetchServicePoints = async () => {
      try {
        const { data, error } = await supabase
          .from("service_points_ins")
          .select("*")
          .eq("enabled", true);

        if (error) {
          throw error;
        }

        if (data) {
          setServicePoints(data);
        }
      } catch (error) {
        console.error("Error fetching service points:", error);
        toast.error("ไม่สามารถดึงข้อมูลจุดบริการได้");
      }
    };

    fetchServicePoints();
  }, []);

  // Fetch completed queues from Supabase
  useEffect(() => {
    const fetchQueues = async () => {
      setLoading(true);
      try {
        // Fetch completed queues within date range
        let query = supabase
          .from("queues_ins")
          .select("*");

        // Apply date range filter
        if (dateRange?.from) {
          const fromDate = format(dateRange.from, "yyyy-MM-dd");
          query = query.gte("queue_date", fromDate);
        }

        if (dateRange?.to) {
          const toDate = format(dateRange.to, "yyyy-MM-dd");
          query = query.lte("queue_date", toDate);
        }

        // Only completed or skipped queues
        query = query.in("status", ["COMPLETED", "SKIPPED"]);

        const { data: queueData, error: queueError } = await query;

        if (queueError) {
          throw queueError;
        }

        if (queueData) {
          setQueues(queueData as QueueIns[]);

          // Calculate statistics
          const totalServed = queueData.length;

          // Calculate average wait time
          let totalWaitTime = 0;
          let validWaitTimeCount = 0;

          queueData.forEach((queue) => {
            if (queue.called_at && queue.created_at) {
              const calledTime = new Date(queue.called_at).getTime();
              const createdTime = new Date(queue.created_at).getTime();
              const waitTime = (calledTime - createdTime) / (1000 * 60); // in minutes

              if (waitTime > 0) {
                totalWaitTime += waitTime;
                validWaitTimeCount++;
              }
            }
          });

          const averageWaitTime =
            validWaitTimeCount > 0
              ? Math.round(totalWaitTime / validWaitTimeCount)
              : 0;

          // Count unique patients (by ID_card or phone_number)
          const uniquePatients = new Set(
            queueData
              .map((q) => q.ID_card || q.phone_number)
              .filter((id) => id)
          ).size;

          setStats({
            totalServed,
            averageWaitTime,
            totalPatients: uniquePatients,
          });
        }
      } catch (err) {
        console.error("Error fetching queue history:", err);
        toast.error("ไม่สามารถดึงข้อมูลประวัติคิวได้");
      } finally {
        setLoading(false);
      }
    };

    fetchQueues();
  }, [dateRange]);

  const filteredQueues = queues.filter((queue) => {
    // Filter by search term (queue number or patient name)
    const patientName = queue.full_name || "";
    const matchesSearch =
      searchTerm === "" ||
      queue.number.toString().includes(searchTerm) ||
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (queue.phone_number && queue.phone_number.includes(searchTerm)) ||
      (queue.ID_card && queue.ID_card.includes(searchTerm));

    // Filter by service point
    const matchesServicePoint =
      servicePointId === "all" || queue.service_point_id === servicePointId;

    return matchesSearch && matchesServicePoint;
  });

  const sortedQueues = [...filteredQueues].sort(
    (a, b) =>
      new Date(b.completed_at || b.created_at || 0).getTime() -
      new Date(a.completed_at || a.created_at || 0).getTime()
  );

  const getServicePointName = (servicePointId: string) => {
    const servicePoint = servicePoints.find((sp) => sp.id === servicePointId);
    return servicePoint ? servicePoint.name : "ไม่ระบุ";
  };

  const getQueueTypePrefix = (typeCode: string, number: number) => {
    const queueType = queueTypes.find((qt) => qt.code === typeCode);
    return queueType
      ? queueType.prefix +
          number.toString().padStart(queueType.format.length, "0")
      : "";
  };

  const getQueueTypeLabel = (typeCode: string) => {
    const queueType = queueTypes.find((qt) => qt.code === typeCode);
    return queueType ? queueType.name : "ไม่ระบุ";
  };

  const calculateServiceTime = (queue: QueueIns) => {
    if (!queue.called_at || !queue.completed_at) return "?";

    const calledTime = new Date(queue.called_at).getTime();
    const completedTime = new Date(queue.completed_at).getTime();
    const diffMinutes = Math.round((completedTime - calledTime) / (1000 * 60));

    return `${diffMinutes} นาที`;
  };

  const calculateWaitingTime = (queue: QueueIns) => {
    if (!queue.created_at || !queue.called_at) return "?";

    const createdTime = new Date(queue.created_at).getTime();
    const calledTime = new Date(queue.called_at).getTime();
    const diffMinutes = Math.round((calledTime - createdTime) / (1000 * 60));

    return `${diffMinutes} นาที`;
  };

  // Function to fetch patient check and medications
  const fetchCheckAndMedications = async (queue: QueueIns) => {
    if (!queue.ID_card && !queue.phone_number) return;
    if (!queue.queue_date) return;

    setLoadingCheckData(true);
    try {
      // Find patient by ID_card or phone
      let patientId: string | null = null;
      
      if (queue.ID_card) {
        const { data: patientData } = await supabase
          .from('patients')
          .select('id')
          .eq('ID_card', queue.ID_card)
          .single();
        
        if (patientData) {
          patientId = patientData.id;
        }
      }

      if (!patientId && queue.phone_number) {
        const { data: patientData } = await supabase
          .from('patients')
          .select('id')
          .eq('phone', queue.phone_number)
          .single();
        
        if (patientData) {
          patientId = patientData.id;
        }
      }

      if (!patientId) {
        setPatientCheck(null);
        setMedications([]);
        return;
      }

      // Fetch patient check for this date
      const { data: checkData } = await supabase
        .from('patient_check')
        .select('*')
        .eq('patient_id', patientId)
        .gte('created_at', queue.queue_date + 'T00:00:00')
        .lte('created_at', queue.queue_date + 'T23:59:59')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (checkData) {
        setPatientCheck(checkData);

        // Fetch medications for this check
        const { data: medData } = await supabase
          .from('patient_medications')
          .select(`
            *,
            medication:medications(*)
          `)
          .eq('patient_check_id', checkData.id)
          .order('created_at', { ascending: false });

        if (medData) {
          setMedications(medData as PatientMedication[]);
        }
      } else {
        setPatientCheck(null);
        setMedications([]);
      }
    } catch (error) {
      console.error('Error fetching check data:', error);
    } finally {
      setLoadingCheckData(false);
    }
  };

  // Function to handle opening the patient details dialog
  const handleOpenDetailsDialog = (queue: QueueIns) => {
    setSelectedQueue(queue);
    setIsDialogOpen(true);
    fetchCheckAndMedications(queue);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleExportData = async () => {
    toast.loading("กำลังเตรียมข้อมูลสำหรับการดาวน์โหลด...");

    // Create CSV content with additional columns
    let csvContent =
      "วันที่,เวลา,หมายเลขคิว,จุดบริการ,ชื่อผู้ป่วย,เบอร์โทร,บัตรประชาชน,เวลารอคิว,เวลาให้บริการ,สถานะ,บันทึกการตรวจ,รายการยาที่จ่าย\n";

    // Process each queue
    for (const queue of sortedQueues) {
      const date = format(
        new Date(queue.completed_at || queue.created_at || 0),
        "dd/MM/yyyy",
        { locale: th }
      );
      const time = format(
        new Date(queue.completed_at || queue.created_at || 0),
        "HH:mm น.",
        { locale: th }
      );
      const queueNumber = getQueueTypePrefix(queue.type, queue.number);
      const servicePointName = getServicePointName(queue.service_point_id);
      const patientName = queue.full_name || "-";
      const phoneNumber = queue.phone_number || "-";
      const idCard = queue.ID_card || "-";
      const waitTime = calculateWaitingTime(queue);
      const serviceTime = calculateServiceTime(queue);
      const status = queue.status === "COMPLETED" ? "เสร็จสิ้น" : "ข้าม";

      // Fetch patient check and medications for this queue
      let checkNote = "-";
      let medicationsList = "-";

      try {
        if ((queue.ID_card || queue.phone_number) && queue.queue_date) {
          // Find patient by ID_card or phone
          let patientId: string | null = null;

          if (queue.ID_card) {
            const { data: patientData } = await supabase
              .from("patients")
              .select("id")
              .eq("ID_card", queue.ID_card)
              .single();

            if (patientData) {
              patientId = patientData.id;
            }
          }

          if (!patientId && queue.phone_number) {
            const { data: patientData } = await supabase
              .from("patients")
              .select("id")
              .eq("phone", queue.phone_number)
              .single();

            if (patientData) {
              patientId = patientData.id;
            }
          }

          if (patientId) {
            // Fetch patient check for this date
            const { data: checkData } = await supabase
              .from("patient_check")
              .select("*")
              .eq("patient_id", patientId)
              .gte("created_at", queue.queue_date + "T00:00:00")
              .lte("created_at", queue.queue_date + "T23:59:59")
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            if (checkData) {
              // Clean check note for CSV (remove newlines and quotes)
              checkNote = checkData.check_note
                ? checkData.check_note.replace(/[\n\r]/g, " ").replace(/"/g, '""')
                : "-";

              // Fetch medications for this check
              const { data: medData } = await supabase
                .from("patient_medications")
                .select(
                  `
                  *,
                  medication:medications(*)
                `
                )
                .eq("patient_check_id", checkData.id)
                .order("created_at", { ascending: false });

              if (medData && medData.length > 0) {
                // Format medications list
                const medList = medData
                  .map((med: any, index: number) => {
                    const medName = med.medication?.name || med.medication_id;
                    const dosage = med.dosage;
                    const dispensed = med.dispensed || 0;
                    const unit = med.medication?.unit || "";
                    return `${index + 1}. ${medName} ${dosage}${unit} จำนวน ${dispensed} ${unit}`;
                  })
                  .join("; ");
                medicationsList = medList.replace(/"/g, '""');
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching check data for export:", error);
      }

      // Escape values for CSV (wrap in quotes if contains comma or newline)
      const escapeCSV = (value: string) => {
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
          return `"${value}"`;
        }
        return value;
      };

      csvContent += `${date},${time},${queueNumber},${servicePointName},${patientName},${idCard},${waitTime},${serviceTime},${escapeCSV(checkNote)},${escapeCSV(medicationsList)}\n`;
    }

    // Create download link
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `ประวัติคิวตรวจ_${format(new Date(), "dd-MM-yyyy")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.dismiss();
    toast.success("ดาวน์โหลดข้อมูลเรียบร้อยแล้ว");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ประวัติคิวตรวจ</h1>
          <p className="text-gray-500">ดูประวัติการให้บริการตรวจย้อนหลัง</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExportData}
          >
            <Download className="w-4 h-4" />
            ส่งออกข้อมูล
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  ให้บริการทั้งหมด
                </p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalServed}
                </h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <List className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                อัพเดทล่าสุด{" "}
                <span className="font-medium">
                  {format(new Date(), "dd MMM HH:mm น.", { locale: th })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  เวลารอเฉลี่ย
                </p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.averageWaitTime} นาที
                </h3>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                จากคิวที่ให้บริการแล้วในช่วงเวลาที่เลือก
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  ผู้รับบริการทั้งหมด
                </p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalPatients}
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                เฉลี่ย{" "}
                <span className="font-medium">
                  {stats.totalPatients > 0
                    ? Math.round(
                        (stats.totalServed / stats.totalPatients) * 10
                      ) / 10
                    : 0}
                </span>{" "}
                คิว/คน
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>ค้นหาประวัติคิวตรวจ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm mb-1.5">ช่วงวันที่</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>เลือกวันที่</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <p className="text-sm mb-1.5">จุดบริการ</p>
              <Select value={servicePointId} onValueChange={setServicePointId}>
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {servicePoints.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm mb-1.5">ค้นหา</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="ค้นหาด้วยหมายเลขคิว, ชื่อ, เบอร์โทร หรือบัตรประชาชน"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่</TableHead>
                <TableHead>เวลา</TableHead>
                <TableHead>หมายเลขคิว</TableHead>
                <TableHead>ประเภทคิว</TableHead>
                <TableHead>จุดบริการ</TableHead>
                <TableHead>ชื่อผู้ป่วย</TableHead>
                <TableHead>เวลารอคิว</TableHead>
                <TableHead>เวลาให้บริการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-4">
                    กำลังโหลดข้อมูล...
                  </TableCell>
                </TableRow>
              ) : sortedQueues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-4">
                    ไม่พบข้อมูลประวัติคิวตรวจ
                  </TableCell>
                </TableRow>
              ) : (
                sortedQueues.map((queue) => (
                  <TableRow
                    key={queue.id}
                    onClick={() => handleOpenDetailsDialog(queue)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell>
                      {format(
                        new Date(queue.completed_at || queue.created_at || 0),
                        "dd MMM yyyy",
                        { locale: th }
                      )}
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(queue.completed_at || queue.created_at || 0),
                        "HH:mm น.",
                        { locale: th }
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getQueueTypePrefix(queue.type, queue.number)}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-600">
                        {getQueueTypeLabel(queue.type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-600">
                        {getServicePointName(queue.service_point_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleOpenDetailsDialog(queue)}
                        className="text-left hover:text-blue-600 hover:underline focus:outline-none"
                      >
                        {queue.full_name || "-"}
                      </button>
                    </TableCell>
                    <TableCell>{calculateWaitingTime(queue)}</TableCell>
                    <TableCell>{calculateServiceTime(queue)}</TableCell>
                 
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              รายละเอียดผู้ป่วยและการตรวจ
            </DialogTitle>
            <DialogDescription>
              ข้อมูลผู้ป่วย, การตรวจ และยาที่จ่าย
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {selectedQueue ? (
              <div className="space-y-6">
                {/* ข้อมูลผู้ป่วย */}
                {/* <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">ข้อมูลผู้ป่วย</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">หมายเลขคิว</p>
                      <p className="font-medium">
                        {getQueueTypePrefix(selectedQueue.type, selectedQueue.number)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">รหัสคิว</p>
                      <p className="font-medium font-mono">
                        {selectedQueue.type || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">จุดบริการ</p>
                      <p className="font-medium">
                        {getServicePointName(selectedQueue.service_point_id)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">วันที่รับบริการ</p>
                      <p className="font-medium">
                        {selectedQueue.queue_date
                          ? format(
                              new Date(selectedQueue.queue_date),
                              "dd MMMM yyyy",
                              { locale: th }
                            )
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">ชื่อ-นามสกุล</p>
                    <p className="font-medium">
                      {selectedQueue.full_name || "-"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                      <p className="font-medium">
                        {selectedQueue.phone_number || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">บัตรประชาชน</p>
                      <p className="font-medium">
                        {selectedQueue.ID_card || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">บ้านเลขที่</p>
                      <p className="font-medium">
                        {selectedQueue.house_number || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">หมู่</p>
                      <p className="font-medium">{selectedQueue.moo || "-"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-sm text-gray-500">เวลารอคิว</p>
                      <p className="font-medium">
                        {calculateWaitingTime(selectedQueue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">เวลาให้บริการ</p>
                      <p className="font-medium">
                        {calculateServiceTime(selectedQueue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">สถานะ</p>
                      <p className="font-medium">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            selectedQueue.status === "COMPLETED"
                              ? "bg-green-50 text-green-600"
                              : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {selectedQueue.status === "COMPLETED"
                            ? "เสร็จสิ้น"
                            : "ข้าม"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div> */}

                {/* บันทึกการตรวจ */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">บันทึกการตรวจ</h3>
                  {loadingCheckData ? (
                    <div className="text-center py-4 text-gray-500">
                      <p>กำลังโหลดข้อมูล...</p>
                    </div>
                  ) : patientCheck ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">
                        บันทึกเมื่อ:{" "}
                        {format(
                          new Date(patientCheck.created_at),
                          "dd MMMM yyyy HH:mm น.",
                          { locale: th }
                        )}
                      </p>
                      <p className="whitespace-pre-wrap">
                        {patientCheck.check_note || "ไม่มีบันทึกการตรวจ"}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>ไม่พบข้อมูลการตรวจในวันนี้</p>
                    </div>
                  )}
                </div>

                {/* รายการยาที่จ่าย */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">รายการยาที่จ่าย</h3>
                  {loadingCheckData ? (
                    <div className="text-center py-4 text-gray-500">
                      <p>กำลังโหลดข้อมูล...</p>
                    </div>
                  ) : medications.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>ชื่อยา</TableHead>
                            <TableHead>ขนาด</TableHead>
                            <TableHead>วิธีใช้</TableHead>
                            <TableHead className="text-right">จำนวน</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {medications.map((med, index) => (
                            <TableRow key={med.id}>
                              <TableCell className="text-center">
                                {index + 1}
                              </TableCell>
                              <TableCell className="font-medium">
                                {med.medication?.name || med.medication_id}
                              </TableCell>
                              <TableCell>
                                {med.dosage}
                                {med.medication?.unit}
                              </TableCell>
                              <TableCell>
                                {med.instructions || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                {med.dispensed || 0} {med.medication?.unit}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>ไม่พบรายการยาที่จ่าย</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>กำลังโหลดข้อมูล...</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>ปิด</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InsQueueHistory;
