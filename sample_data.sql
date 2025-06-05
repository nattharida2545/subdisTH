
-- Insert sample patients data
INSERT INTO public.patients (patient_id, name, phone, line_id, address, gender, birth_date, distance_from_hospital, profile_image, created_at, updated_at)
VALUES
  ('P1001', 'สมชาย ใจดี', '0812345678', 'somchai123', '123/45 หมู่ 6 ต.บางพลี อ.บางพลี จ.สมุทรปราการ 10540', 'ชาย', '1990-05-15', 5.2, NULL, now(), now()),
  ('P1002', 'สมหญิง จริงใจ', '0898765432', 'somying456', '567/89 หมู่ 10 ต.บางแก้ว อ.บางพลี จ.สมุทรปราการ 10540', 'หญิง', '1985-10-20', 3.7, NULL, now(), now()),
  ('P1003', 'ธนาคาร มั่นคง', '0851234567', NULL, '987/65 หมู่ 4 ต.ราชาเทวะ อ.บางพลี จ.สมุทรปราการ 10540', 'ชาย', '1978-03-01', 8.1, NULL, now(), now()),
  ('P1004', 'น้องเล็ก น่ารัก', '0834567890', 'nonglek789', '456/78 หมู่ 2 ต.หนองปรือ อ.บางพลี จ.สมุทรปราการ 10540', 'หญิง', '1995-12-25', 2.3, NULL, now(), now()),
  ('P1005', 'วิทยา เก่งกล้า', '0877890123', 'vittaya555', '789/01 หมู่ 8 ต.บางโฉลง อ.บางพลี จ.สมุทรปราการ 10540', 'ชาย', '1982-07-10', 6.9, NULL, now(), now()),
  ('P1006', 'สุภาพ สตรี', '0811223344', NULL, '321/65 หมู่ 3 ต.ศีรษะจรเข้น้อย อ.บางพลี จ.สมุทรปราการ 10540', 'หญิง', '1991-04-03', 4.5, NULL, now(), now()),
  ('P1007', 'เดชา ชาตรี', '0844556677', 'decha007', '654/32 หมู่ 7 ต.บางปลา อ.บางพลี จ.สมุทรปราการ 10540', 'ชาย', '1975-09-18', 9.2, NULL, now(), now()),
  ('P1008', 'อารียา ใจเย็น', '0866778899', 'areeya999', '210/54 หมู่ 9 ต.คลองสวน อ.บางพลี จ.สมุทรปราการ 10540', 'หญิง', '1988-06-24', 1.8, NULL, now(), now()),
  ('P1009', 'สมปอง รักดี', '0822334455', NULL, '543/12 หมู่ 5 ต.เปร็ง อ.บางพลี จ.สมุทรปราการ 10540', 'ชาย', '1970-11-02', 7.3, NULL, now(), now()),
  ('P1010', 'สายฝน พรำๆ', '0888990011', 'saifon888', '876/43 หมู่ 1 ต.คลองด่าน อ.บางพลี จ.สมุทรปราการ 10540', 'หญิง', '1993-01-07', 5.6, NULL, now(), now());

-- Insert sample medications data
INSERT INTO public.medications (code, name, description, unit, stock, min_stock, created_at, updated_at)
VALUES
  ('PARA500', 'Paracetamol 500 mg', 'ยาบรรเทาปวดลดไข้', 'เม็ด', 342, 50, now(), now()),
  ('AMOX500', 'Amoxicillin 500 mg', 'ยาปฏิชีวนะ', 'แคปซูล', 120, 30, now(), now()),
  ('LORAT10', 'Loratadine 10 mg', 'ยาแก้แพ้', 'เม็ด', 85, 20, now(), now()),
  ('OMEP20', 'Omeprazole 20 mg', 'ยาลดกรดในกระเพาะอาหาร', 'แคปซูล', 56, 20, now(), now()),
  ('SIMVA20', 'Simvastatin 20 mg', 'ยาลดคอเลสเตอรอล', 'เม็ด', 14, 20, now(), now()),
  ('METF500', 'Metformin 500 mg', 'ยารักษาโรคเบาหวาน', 'เม็ด', 78, 30, now(), now()),
  ('ATEN50', 'Atenolol 50 mg', 'ยารักษาความดันโลหิตสูง', 'เม็ด', 42, 20, now(), now()),
  ('SALB2', 'Salbutamol 2 mg', 'ยาขยายหลอดลม', 'เม็ด', 0, 15, now(), now()),
  ('DEXA0.5', 'Dexamethasone 0.5 mg', 'ยาสเตียรอยด์', 'เม็ด', 23, 10, now(), now()),
  ('IBUPR400', 'Ibuprofen 400 mg', 'ยาแก้ปวดอักเสบ', 'เม็ด', 65, 20, now(), now());

-- Queues sample data insertion (needs to be run after patients are inserted)
-- Queues require patient IDs from the patients table, so we need to get those first
DO $$
DECLARE
    patient_id_1 UUID;
    patient_id_2 UUID;
    patient_id_3 UUID;
    patient_id_4 UUID;
    patient_id_5 UUID;
BEGIN
    -- Get the first 5 patient IDs
    SELECT id INTO patient_id_1 FROM patients WHERE patient_id = 'P1001' LIMIT 1;
    SELECT id INTO patient_id_2 FROM patients WHERE patient_id = 'P1002' LIMIT 1;
    SELECT id INTO patient_id_3 FROM patients WHERE patient_id = 'P1003' LIMIT 1;
    SELECT id INTO patient_id_4 FROM patients WHERE patient_id = 'P1004' LIMIT 1;
    SELECT id INTO patient_id_5 FROM patients WHERE patient_id = 'P1005' LIMIT 1;

    -- Insert queues using the obtained patient IDs
    INSERT INTO public.queues (number, patient_id, type, status, notes, created_at, updated_at, called_at, completed_at)
    VALUES
      (1, patient_id_1, 'GENERAL', 'WAITING', NULL, now(), now(), NULL, NULL),
      (2, patient_id_2, 'PRIORITY', 'WAITING', 'ผู้ป่วยมีอาการเจ็บคอรุนแรง', now(), now(), NULL, NULL),
      (3, patient_id_3, 'ELDERLY', 'ACTIVE', NULL, now() - INTERVAL '30 minutes', now(), now() - INTERVAL '5 minutes', NULL),
      (4, patient_id_4, 'GENERAL', 'COMPLETED', NULL, now() - INTERVAL '2 hours', now(), now() - INTERVAL '1 hour', now() - INTERVAL '30 minutes'),
      (5, patient_id_5, 'FOLLOW_UP', 'WAITING', 'มาตามนัด', now(), now(), NULL, NULL);

    -- Insert appointments using the obtained patient IDs
    INSERT INTO public.appointments (patient_id, date, purpose, notes, status, created_at, updated_at)
    VALUES
      (patient_id_1, now() + INTERVAL '2 days', 'ติดตามการใช้ยาเบาหวาน', 'ตรวจระดับน้ำตาลในเลือดก่อนพบแพทย์', 'SCHEDULED', now(), now()),
      (patient_id_2, now() + INTERVAL '1 day', 'ปรับขนาดยาความดันโลหิตสูง', 'วัดความดันโลหิตที่บ้านทุกวัน', 'SCHEDULED', now(), now()),
      (patient_id_3, now() + INTERVAL '5 days', 'รับยาต่อเนื่อง', NULL, 'SCHEDULED', now(), now()),
      (patient_id_4, now() - INTERVAL '1 day', 'ติดตามอาการแพ้ยา', 'มีผื่นคันหลังได้รับยา', 'COMPLETED', now() - INTERVAL '7 days', now()),
      (patient_id_5, now() + INTERVAL '3 days', 'ติดตามผลข้างเคียงจากยา', NULL, 'SCHEDULED', now(), now());
END $$;
