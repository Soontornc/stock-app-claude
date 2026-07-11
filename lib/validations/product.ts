import { z } from 'zod'

// ใช้ร่วมทั้ง client และ server (F1 — จัดการสินค้า)
export const productSchema = z.object({
  sku: z.string().trim().min(1, 'กรุณากรอก SKU'),
  name: z.string().trim().min(1, 'กรุณากรอกชื่อสินค้า'),
  category: z.string().trim().min(1, 'กรุณากรอกหมวดหมู่'),
  unit: z.string().trim().min(1, 'กรุณากรอกหน่วยนับ'),
  reorderPoint: z.coerce
    .number()
    .int('จุดสั่งซื้อต้องเป็นจำนวนเต็ม')
    .min(0, 'จุดสั่งซื้อต้องไม่ติดลบ'),
  price: z.coerce.number().min(0, 'ราคาต้องไม่ติดลบ'),
})

export type ProductInput = z.infer<typeof productSchema>
