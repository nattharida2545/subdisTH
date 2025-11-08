import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";
import {
  Search,
  History,
  Calendar,
  Clock,
  Users,
  List,
  Calendar as CalendarIcon,
  Download,
  Pill,
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
import { Queue, QueueStatus, ServicePoint } from "@/integrations/supabase/schema";
import {
  QueueType,
  ensureValidFormat,
  ensureValidAlgorithm,
} from "@/hooks/useQueueTypes";

interface MedicationDetails {
  id: string;
  name: string;
  description?: string;
  unit?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

interface Medication {
  id: string;
  medication_id: string;
  patient_id: string;
  dosage: string;
  instructions: string;
  dispensed: number;
  notes: string;
  created_at: string;
  updated_at: string;
  start_date: string;
  end_date: string;
  queue_date?: string;
  medication?: MedicationDetails;
}

const QueueHistory = () => {
  const [queues, setQueues] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalServed: 0,
    averageWaitTime: 0,
    totalPatients: 0,
  });

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedQueueDate, setSelectedQueueDate] = useState<string>("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loadingMedications, setLoadingMedications] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const [queueType, setQueueType] = useState<string>("all");
  const [queueTypes, setQueueTypes] = useState<QueueType[]>([]);
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);

  // Fetch queue types from Supabase
  useEffect(() => {
    const fetchQueueTypes = async () => {
      try {
        const { data, error } = await supabase.from("queue_types").select("*");

        if (error) {
          throw error;
        }

        if (data) {
          // Transform the data to ensure format and algorithm use the correct types
          const formattedData: QueueType[] = data.map((item) => ({
            id: item.id,
            code: item.code,
            name: item.name,
            prefix: item.prefix,
            purpose: item.purpose || "",
            format: ensureValidFormat(item.format),
            enabled: item.enabled,
            algorithm: ensureValidAlgorithm(item.algorithm),
            priority: item.priority,
          }));

          setQueueTypes(formattedData);
        }
      } catch (error) {
        console.error("Error fetching queue types:", error);
        toast.error("ไม่สามารถดึงข้อมูลประเภทคิวได้");

        // Try to load from localStorage as fallback
        const savedQueueTypes = localStorage.getItem("queue_types");
        if (savedQueueTypes) {
          try {
            const parsedTypes = JSON.parse(savedQueueTypes);
            // Ensure the format and algorithm properties are valid
            const validTypes: QueueType[] = parsedTypes.map((item: any) => ({
              ...item,
              format: ensureValidFormat(item.format),
              algorithm: ensureValidAlgorithm(item.algorithm),
              purpose: item.purpose || "",
            }));
            setQueueTypes(validTypes);
          } catch (parseError) {
            console.error(
              "Error parsing queue types from localStorage:",
              parseError
            );
          }
        }
      }
    };

    fetchQueueTypes();
  }, []);

  // Fetch completed queues and patients from Supabase
  useEffect(() => {
    const fetchQueuesAndPatients = async () => {
      setLoading(true);
      try {
        // Fetch completed queues within date range
        let query = supabase
          .from("queues")
          .select("*, patient:patient_id(id, name, phone)");

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
          setQueues(queueData);

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

          // Count unique patients
          const uniquePatients = new Set(queueData.map((q) => q.patient_id))
            .size;

          setStats({
            totalServed,
            averageWaitTime,
            totalPatients: uniquePatients,
          });
        }

        // Fetch all patients mentioned in the queues
        const patientIds = [
          ...new Set(queueData?.map((q) => q.patient_id) || []),
        ];

        if (patientIds.length > 0) {
          const { data: patientData, error: patientError } = await supabase
            .from("patients")
            .select("*")
            .in("id", patientIds);

          if (patientError) {
            throw patientError;
          }

          if (patientData) {
            setPatients(patientData);
          }
        }
      } catch (err) {
        console.error("Error fetching queue history:", err);
        toast.error("ไม่สามารถดึงข้อมูลประวัติคิวได้");
      } finally {
        setLoading(false);
      }
    };

    fetchQueuesAndPatients();
  }, [dateRange]);

    // Fetch service points from Supabase
  useEffect(() => {
    const fetchServicePoints = async () => {
      try {
        const { data, error } = await supabase
          .from("service_points")
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

    const getServicePointName = (servicePointId: string) => {
    const servicePoint = servicePoints.find((sp) => sp.id === servicePointId);
    return servicePoint ? servicePoint.name : "ไม่ระบุ";
  };


  const filteredQueues = queues.filter((queue) => {
    // Filter by search term (queue number or patient name)
    const patientName = queue.patient?.name || "";
    const matchesSearch =
      searchTerm === "" ||
      queue.number.toString().includes(searchTerm) ||
      patientName.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by queue type
    const matchesType = queueType === "all" || queue.type === queueType;

    return matchesSearch && matchesType;
  });

  const sortedQueues = [...filteredQueues].sort(
    (a, b) =>
      new Date(b.completed_at || b.created_at).getTime() -
      new Date(a.completed_at || a.created_at).getTime()
  );

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.name : "ไม่ระบุชื่อ";
  };

  const getQueueTypeLabel = (typeCode: string) => {
    const queueType = queueTypes.find((qt) => qt.code === typeCode);
    return queueType ? queueType.name : "ไม่ระบุ";
  };

  const getQueueTypePrefix = (typeCode: string, number: number) => {
    const queueType = queueTypes.find((qt) => qt.code === typeCode);
    return queueType
      ? queueType.prefix +
          number.toString().padStart(queueType.format.length, "0")
      : "";
  };

  const getQueueTypeClass = (typeCode: string) => {
    const queueType = queueTypes.find((qt) => qt.code === typeCode);
    if (!queueType) return "text-gray-600 bg-gray-50";

    console.log("queueType", queueType);

    // Assign colors based on priority or other characteristics
    const priority = queueType.priority || 0;

    if (priority >= 8) return "text-red-600 bg-red-50";
    if (priority >= 6) return "text-amber-600 bg-amber-50";
    if (priority >= 4) return "text-blue-600 bg-blue-50";
    return "text-purple-600 bg-purple-50";
  };

  const calculateServiceTime = (queue: any) => {
    if (!queue.called_at || !queue.completed_at) return "?";

    const calledTime = new Date(queue.called_at).getTime();
    const completedTime = new Date(queue.completed_at).getTime();
    const diffMinutes = Math.round((completedTime - calledTime) / (1000 * 60));

    return `${diffMinutes} นาที`;
  };

  const calculateWaitingTime = (queue: any) => {
    if (!queue.created_at || !queue.called_at) return "?";

    const createdTime = new Date(queue.created_at).getTime();
    const calledTime = new Date(queue.called_at).getTime();
    const diffMinutes = Math.round((calledTime - createdTime) / (1000 * 60));

    return `${diffMinutes} นาที`;
  };

  // Function to fetch patient medications
  const fetchPatientMedications = async (
    patientId: string,
    queueDate: string
  ) => {
    if (!patientId) return;

    setLoadingMedications(true);
    try {
      // Fetch medications for this patient on the specific queue date
      const { data, error } = (await supabase
        .from("patient_medications")
        .select(
          `
          *,
          medication:medications(*)
        `
        )
        .eq("patient_id", patientId)
        .eq("start_date", queueDate)) as {
        data: Medication[] | null;
        error: any;
      };

      if (error) {
        console.error("Error fetching medications:", error);
        toast.error("ไม่สามารถดึงข้อมูลยาได้");
        return;
      }

      if (data) {
        setMedications(data);
      } else {
        setMedications([]);
      }
    } catch (err) {
      console.error("Error in fetchPatientMedications:", err);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลยา");
    } finally {
      setLoadingMedications(false);
    }
  };

  // Function to handle opening the medications dialog
  const handleOpenMedicationsDialog = (queue: any) => {
    const patientId = queue.patient_id;
    const queueDate = queue.queue_date;
    const patient = patients.find((p) => p.id === patientId);

    setSelectedPatient(patient);
    setSelectedQueueDate(queueDate);
    setIsDialogOpen(true);
    fetchPatientMedications(patientId, queueDate);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleExportData = async () => {
    toast.loading("กำลังเตรียมข้อมูลสำหรับการดาวน์โหลด...");

    // Create CSV content
    let csvContent =
      "วันที่,เวลา,หมายเลขคิว,ประเภท,ผู้ป่วย,เวลารอคิว,เวลาให้บริการ,รายการยา\n";

    // Process each queue and fetch medications
    for (const queue of sortedQueues) {
      const date = format(
        new Date(queue.completed_at || queue.created_at),
        "dd/MM/yyyy",
        { locale: th }
      );
      const time = format(
        new Date(queue.completed_at || queue.created_at),
        "HH:mm น.",
        { locale: th }
      );
      const queueNumber = getQueueTypePrefix(queue.type, queue.number);
      const queueTypeLabel = getQueueTypeLabel(queue.type);
      const patientName =
        queue.patient?.name || getPatientName(queue.patient_id);
      const waitTime = calculateWaitingTime(queue);
      const serviceTime = calculateServiceTime(queue);

      // Fetch medications for this patient on this date
      let medicationText = "";
      try {
        const { data: medData, error } = await supabase
          .from("patient_medications")
          .select(
            `
            *,
            medication:medications(*)
          `
          )
          .eq("patient_id", queue.patient_id)
          .eq("start_date", queue.queue_date);

        if (!error && medData && medData.length > 0) {
          // Format medications as a single string with semicolons between items
          medicationText = medData
            .map(
              (med: any) =>
                `${med.medication?.name || med.medication_id} ${med.dosage}${
                  med.medication?.unit
                } ${med.instructions} (จำนวน ${med.dispensed || 0}${
                  med.medication?.unit
                })`
            )
            .join("; ");
        }
      } catch (err) {
        console.error("Error fetching medications for export:", err);
      }

      // Escape any commas in the medication text to prevent CSV format issues
      medicationText = `"${medicationText.replace(/"/g, '""')}"`;

      csvContent += `${date},${time},${queueNumber},${queueTypeLabel},${patientName},${waitTime},${serviceTime},${medicationText}\n`;
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
      `ประวัติคิว_${format(new Date(), "dd-MM-yyyy")}.csv`
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
          <h1 className="text-3xl font-bold text-gray-900">ประวัติคิวรับยา</h1>
          <p className="text-gray-500">ดูประวัติการให้บริการย้อนหลัง</p>
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
          <CardTitle>ค้นหาประวัติคิวรับยา</CardTitle>
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
              <p className="text-sm mb-1.5">ประเภทคิว</p>
              <Select value={queueType} onValueChange={setQueueType}>
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {queueTypes.map((type) => (
                    <SelectItem key={type.code} value={type.code}>
                      {type.name}
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
                  placeholder="ค้นหาด้วยหมายเลขคิวหรือชื่อผู้ป่วย"
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
                <TableHead>ประเภท</TableHead>
                <TableHead>จุดบริการ</TableHead>
                <TableHead>ผู้ป่วย</TableHead>
                <TableHead>เวลารอคิว</TableHead>
                <TableHead>เวลาให้บริการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    กำลังโหลดข้อมูล...
                  </TableCell>
                </TableRow>
              ) : sortedQueues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    ไม่พบข้อมูลประวัติคิว
                  </TableCell>
                </TableRow>
              ) : (
                sortedQueues.map((queue) => (
                  <TableRow
                    key={queue.id}
                    onClick={() => handleOpenMedicationsDialog(queue)}
                  >
                    <TableCell>
                      {format(
                        new Date(queue.completed_at || queue.created_at),
                        "dd MMM yyyy",
                        { locale: th }
                      )}
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(queue.completed_at || queue.created_at),
                        "HH:mm น.",
                        { locale: th }
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getQueueTypePrefix(queue.type, queue.number)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getQueueTypeClass(
                          queue.type
                        )}`}
                      >
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
                        onClick={() => handleOpenMedicationsDialog(queue)}
                        className="text-left hover:text-blue-600 hover:underline focus:outline-none"
                      >
                        {queue.patient?.name ||
                          getPatientName(queue.patient_id)}
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

      {/* Medications Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              รายการยาของผู้ป่วย
            </DialogTitle>
            <DialogDescription>
              {selectedPatient ? (
                <div className="mt-2">
                  <p className="font-medium text-base">
                    {selectedPatient.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    วันที่:{" "}
                    {selectedQueueDate
                      ? format(new Date(selectedQueueDate), "dd MMMM yyyy", {
                          locale: th,
                        })
                      : "-"}
                  </p>
                </div>
              ) : (
                "กำลังโหลดข้อมูล..."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loadingMedications ? (
              <div className="flex justify-center py-8">
                <p>กำลังโหลดข้อมูลยา...</p>
              </div>
            ) : medications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>ไม่พบข้อมูลยาสำหรับผู้ป่วยรายนี้ในวันที่เลือก</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">ชื่อยา</TableHead>
                        <TableHead>ขนาด</TableHead>
                        <TableHead>วิธีใช้</TableHead>
                        <TableHead className="text-right">
                          จำนวนที่จ่าย
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medications.map((med) => {
                        // Fetch medication name from medication_id
                        // For now, just display the ID until we implement medication lookup
                        const medicationName =
                          med.medication?.name || med.medication_id;

                        return (
                          <TableRow key={med.id}>
                            <TableCell className="font-medium">
                              {medicationName}
                            </TableCell>
                            <TableCell>
                              {med.dosage}
                              {med.medication?.unit}
                            </TableCell>
                            <TableCell>{med.instructions}</TableCell>
                            <TableCell className="text-right">
                              {med.dispensed}
                              {med.medication?.unit}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="text-sm text-gray-500 mt-2">
                  <p>หมายเหตุ: แสดงเฉพาะรายการยาที่จ่ายในวันที่เลือกเท่านั้น</p>
                </div>
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

export default QueueHistory;
