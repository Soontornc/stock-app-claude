'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { stockMoveSchema } from '@/lib/validations/stock'

export type StockFormState = {
  errors?: Record<string, string[]>
  message?: string
  success?: string
}

class InsufficientStockError extends Error {}

function revalidateAffected() {
  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath('/stock-out')
  revalidatePath('/low-stock')
  revalidatePath('/transactions')
}

export async function createStockOut(
  _prevState: StockFormState,
  formData: FormData,
): Promise<StockFormState> {
  const parsed = stockMoveSchema.safeParse({
    productId: formData.get('productId'),
    quantity: formData.get('quantity'),
    note: formData.get('note'),
  })
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }
  const { productId, quantity, note } = parsed.data

  try {
    const product = await prisma.$transaction(async (tx) => {
      // กันเบิกเกินแบบ atomic: UPDATE ... WHERE quantity >= qty ในสเตตเมนต์เดียว
      // กัน race condition เมื่อมีการเบิกพร้อมกันหลายรายการ (F3)
      const result = await tx.product.updateMany({
        where: { id: productId, quantity: { gte: quantity } },
        data: { quantity: { decrement: quantity } },
      })
      if (result.count === 0) {
        throw new InsufficientStockError()
      }
      await tx.stockTransaction.create({
        data: { productId, type: 'OUT', quantity, note: note || null },
      })
      return tx.product.findUniqueOrThrow({ where: { id: productId } })
    })

    revalidateAffected()
    return {
      success: `บันทึกการเบิกจ่ายเรียบร้อย คงเหลือ ${product.quantity} ${product.unit}`,
    }
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return { message: 'จำนวนที่เบิกเกินยอดคงเหลือ ไม่สามารถทำรายการได้' }
    }
    return { message: 'บันทึกไม่สำเร็จ กรุณาลองใหม่' }
  }
}
