import * as z from "zod";

export const medicationFormSchema = z.object({
  code: z.string().min(1, { message: "กรุณาระบุรหัสยา" }),
  name: z.string().min(1, { message: "กรุณาระบุชื่อยา" }),
  description: z.string().optional(),
  unit: z.string().min(1, { message: "กรุณาระบุหน่วย" }),
  stock: z.preprocess(
    (v) => Number(v ?? 0),
    z.number().min(0, { message: "จำนวนต้องไม่น้อยกว่า 0" })
  ),
  min_stock: z.preprocess(
    (v) => Number(v ?? 0),
    z.number().min(0, { message: "จำนวนต้องไม่น้อยกว่า 0" })
  ),
  image: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
});

export type MedicationFormValues = z.infer<typeof medicationFormSchema>;
