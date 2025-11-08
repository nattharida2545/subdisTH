export enum QueueType {
  GENERAL = 'GENERAL',
  PRIORITY = 'PRIORITY',
  ELDERLY = 'ELDERLY',
  URGENT = 'URGENT',
  APPOINTMENT = 'APPOINTMENT'
}

export enum QueueStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export interface Queue {
  id: string;
  number: number;
  patientId: string;
  type: QueueType;
  status: QueueStatus;
  createdAt: string;
  updatedAt: string;
  calledAt?: string;
  completedAt?: string;
  notes?: string; // Add notes field
}

export interface Patient {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  phone: string;     // Original property
  phoneNumber?: string; // Add compatibility with components
  address: string;
  createdAt: string;
  updatedAt: string;
  lineId?: string;   // Add lineId
  profileImage?: string; // Add profileImage
  distanceFromHospital?: number; // Add distanceFromHospital
}

export const mockQueues: Queue[] = [
  {
    id: "Q001",
    number: 1,
    patientId: "P001",
    type: QueueType.GENERAL,
    status: QueueStatus.WAITING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "Q002",
    number: 2,
    patientId: "P002",
    type: QueueType.PRIORITY,
    status: QueueStatus.WAITING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "Q003",
    number: 3,
    patientId: "P003",
    type: QueueType.ELDERLY,
    status: QueueStatus.WAITING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "Q004",
    number: 4,
    patientId: "P004",
    type: QueueType.GENERAL,
    status: QueueStatus.WAITING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "Q005",
    number: 5,
    patientId: "P005",
    type: QueueType.APPOINTMENT,
    status: QueueStatus.WAITING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "Q006",
    number: 6,
    patientId: "P006",
    type: QueueType.GENERAL,
    status: QueueStatus.WAITING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "Q007",
    number: 7,
    patientId: "P007",
    type: QueueType.PRIORITY,
    status: QueueStatus.WAITING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "Q008",
    number: 8,
    patientId: "P008",
    type: QueueType.ELDERLY,
    status: QueueStatus.WAITING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "Q009",
    number: 9,
    patientId: "P009",
    type: QueueType.GENERAL,
    status: QueueStatus.WAITING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "Q010",
    number: 10,
    patientId: "P010",
    type: QueueType.APPOINTMENT,
    status: QueueStatus.WAITING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "Q011",
    number: 11,
    patientId: "P001",
    type: QueueType.GENERAL,
    status: QueueStatus.COMPLETED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "Q012",
    number: 12,
    patientId: "P002",
    type: QueueType.PRIORITY,
    status: QueueStatus.COMPLETED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "Q013",
    number: 13,
    patientId: "P003",
    type: QueueType.ELDERLY,
    status: QueueStatus.COMPLETED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "Q014",
    number: 14,
    patientId: "P004",
    type: QueueType.GENERAL,
    status: QueueStatus.SKIPPED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "Q015",
    number: 15,
    patientId: "P005",
    type: QueueType.APPOINTMENT,
    status: QueueStatus.SKIPPED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockPatients: Patient[] = [
  {
    id: "P001",
    name: "สมชาย ใจดี",
    gender: "ชาย",
    birthDate: "1990-05-15",
    phone: "0812345678",
    address: "123/45 หมู่ 6 ต.บางพลี อ.บางพลี จ.สมุทรปราการ 10540",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "P002",
    name: "สมหญิง จริงใจ",
    gender: "หญิง",
    birthDate: "1985-10-20",
    phone: "0898765432",
    address: "567/89 หมู่ 10 ต.บางแก้ว อ.บางพลี จ.สมุทรปราการ 10540",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "P003",
    name: "ธนาคาร มั่นคง",
    gender: "ชาย",
    birthDate: "1978-03-01",
    phone: "0851234567",
    address: "987/65 หมู่ 4 ต.ราชาเทวะ อ.บางพลี จ.สมุทรปราการ 10540",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "P004",
    name: "น้องเล็ก น่ารัก",
    gender: "หญิง",
    birthDate: "1995-12-25",
    phone: "0834567890",
    address: "456/78 หมู่ 2 ต.หนองปรือ อ.บางพลี จ.สมุทรปราการ 10540",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "P005",
    name: "วิทยา เก่งกล้า",
    gender: "ชาย",
    birthDate: "1982-07-10",
    phone: "0877890123",
    address: "789/01 หมู่ 8 ต.บางโฉลง อ.บางพลี จ.สมุทรปราการ 10540",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "P006",
    name: "สุภาพ สตรี",
    gender: "หญิง",
    birthDate: "1991-04-03",
    phone: "0811223344",
    address: "321/65 หมู่ 3 ต.ศีรษะจรเข้น้อย อ.บางพลี จ.สมุทรปราการ 10540",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "P007",
    name: "เดชา ชาตรี",
    gender: "ชาย",
    birthDate: "1975-09-18",
    phone: "0844556677",
    address: "654/32 หมู่ 7 ต.บางปลา อ.บางพลี จ.สมุทรปราการ 10540",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "P008",
    name: "อารียา ใจเย็น",
    gender: "หญิง",
    birthDate: "1988-06-24",
    phone: "0866778899",
    address: "210/54 หมู่ 9 ต.คลองสวน อ.บางพลี จ.สมุทรปราการ 10540",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "P009",
    name: "สมปอง รักดี",
    gender: "ชาย",
    birthDate: "1970-11-02",
    phone: "0822334455",
    address: "543/12 หมู่ 5 ต.เปร็ง อ.บางพลี จ.สมุทรปราการ 10540",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "P010",
    name: "สายฝน พรำๆ",
    gender: "หญิง",
    birthDate: "1993-01-07",
    phone: "0888990011",
    address: "876/43 หมู่ 1 ต.คลองด่าน อ.บางพลี จ.สมุทรปราการ 10540",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockMedications = [
  {
    id: "MED001",
    code: "PARA500",
    name: "Paracetamol 500 mg",
    description: "ยาบรรเทาปวดลดไข้",
    unit: "เม็ด",
    stock: 342,
    minStock: 50,
    updatedAt: new Date().toISOString()
  },
  {
    id: "MED002",
    code: "AMOX500",
    name: "Amoxicillin 500 mg",
    description: "ยาปฏิชีวนะ",
    unit: "แคปซูล",
    stock: 120,
    minStock: 30,
    updatedAt: new Date().toISOString()
  },
  {
    id: "MED003",
    code: "LORAT10",
    name: "Loratadine 10 mg",
    description: "ยาแก้แพ้",
    unit: "เม็ด",
    stock: 85,
    minStock: 20,
    updatedAt: new Date().toISOString()
  },
  {
    id: "MED004",
    code: "OMEP20",
    name: "Omeprazole 20 mg",
    description: "ยาลดกรดในกระเพาะอาหาร",
    unit: "แคปซูล",
    stock: 56,
    minStock: 20,
    updatedAt: new Date().toISOString()
  },
  {
    id: "MED005",
    code: "SIMVA20",
    name: "Simvastatin 20 mg",
    description: "ยาลดคอเลสเตอรอล",
    unit: "เม็ด",
    stock: 14,
    minStock: 20,
    updatedAt: new Date().toISOString()
  },
  {
    id: "MED006",
    code: "METF500",
    name: "Metformin 500 mg",
    description: "ยารักษาโรคเบาหวาน",
    unit: "เม็ด",
    stock: 78,
    minStock: 30,
    updatedAt: new Date().toISOString()
  },
  {
    id: "MED007",
    code: "ATEN50",
    name: "Atenolol 50 mg",
    description: "ยารักษาความดันโลหิตสูง",
    unit: "เม็ด",
    stock: 42,
    minStock: 20,
    updatedAt: new Date().toISOString()
  },
  {
    id: "MED008",
    code: "SALB2",
    name: "Salbutamol 2 mg",
    description: "ยาขยายหลอดลม",
    unit: "เม็ด",
    stock: 0,
    minStock: 15,
    updatedAt: new Date().toISOString()
  },
  {
    id: "MED009",
    code: "DEXA0.5",
    name: "Dexamethasone 0.5 mg",
    description: "ยาสเตียรอยด์",
    unit: "เม็ด",
    stock: 23,
    minStock: 10,
    updatedAt: new Date().toISOString()
  },
  {
    id: "MED010",
    code: "IBUPR400",
    name: "Ibuprofen 400 mg",
    description: "ยาแก้ปวดอักเสบ",
    unit: "เม็ด",
    stock: 65,
    minStock: 20,
    updatedAt: new Date().toISOString()
  }
];

export const mockAppointments = [
  {
    id: "APP001",
    patientId: "P001",
    date: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
    purpose: "ติดตามการใช้ยาเบาหวาน",
    notes: "ตรวจระดับน้ำตาลในเลือดก่อนพบแพทย์",
    status: "SCHEDULED",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "APP002",
    patientId: "P002",
    date: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(),
    purpose: "ปรับขนาดยาความดันโลหิตสูง",
    notes: "วัดความดันโลหิตที่บ้านทุกวัน",
    status: "SCHEDULED",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "APP003",
    patientId: "P003",
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    purpose: "รับยาต่อเนื่อง",
    notes: "",
    status: "SCHEDULED",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "APP004",
    patientId: "P004",
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    purpose: "ติดตามอาการแพ้ยา",
    notes: "มีผื่นคันหลังได้รับยาครั้งก่อน",
    status: "SCHEDULED",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "APP005",
    patientId: "P005",
    date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    purpose: "ติดตามผลข้างเคียงจากยา",
    notes: "",
    status: "SCHEDULED",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "APP006",
    patientId: "P006",
    date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    purpose: "รับยาต่อเนื่อง",
    notes: "",
    status: "SCHEDULED",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "APP007",
    patientId: "P007",
    date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    purpose: "การบริหารยาฉีดอินซูลิน",
    notes: "สอนวิธีการฉีดยาด้วยตนเอง",
    status: "SCHEDULED",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(),
    updatedAt: new Date().toISOString()
  }
];
