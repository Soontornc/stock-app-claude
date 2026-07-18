import { z } from 'zod'

// ใช้ร่วมทั้ง client และ server (F2/F3 — รับเข้า/เบิกออก)
export const stockMoveSchema = z.object({
  productId: z.string().trim().min(1, 'กรุณาเลือกสินค้า'),
  quantity: z.coerce
    .number()
    .int('จำนวนต้องเป็นจำนวนเต็ม')
    .positive('จำนวนต้องมากกว่า 0'),
  note: z.string().trim().max(500, 'หมายเหตุยาวเกินไป').optional(),
})

export type StockMoveInput = z.infer<typeof stockMoveSchema>
