import { z } from 'zod'

// ใช้แก้ไขรายการเคลื่อนไหวย้อนหลัง (F5) — แก้ได้เฉพาะจำนวน/หมายเหตุ
// ประเภท (IN/OUT) และสินค้าคงเดิมเสมอ เพื่อให้คำนวณยอดคงเหลือใหม่ได้ถูกต้อง
export const transactionEditSchema = z.object({
  quantity: z.coerce
    .number()
    .int('จำนวนต้องเป็นจำนวนเต็ม')
    .positive('จำนวนต้องมากกว่า 0'),
  note: z.string().trim().max(500, 'หมายเหตุยาวเกินไป').optional(),
})

export type TransactionEditInput = z.infer<typeof transactionEditSchema>
