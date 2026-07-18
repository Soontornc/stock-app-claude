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

function revalidateAffected() {
  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath('/stock-in')
  revalidatePath('/low-stock')
  revalidatePath('/transactions')
}

export async function createStockIn(
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
      const updated = await tx.product.update({
        where: { id: productId },
        data: { quantity: { increment: quantity } },
      })
      await tx.stockTransaction.create({
        data: { productId, type: 'IN', quantity, note: note || null },
      })
      return updated
    })

    revalidateAffected()
    return {
      success: `รับสินค้าเข้าเรียบร้อย คงเหลือ ${product.quantity} ${product.unit}`,
    }
  } catch {
    return { message: 'บันทึกไม่สำเร็จ กรุณาลองใหม่' }
  }
}
