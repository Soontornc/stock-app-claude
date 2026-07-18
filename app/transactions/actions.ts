'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { transactionEditSchema } from '@/lib/validations/transaction'

export type TransactionFormState = {
  errors?: Record<string, string[]>
  message?: string
}

class InsufficientStockError extends Error {}

function revalidateAffected() {
  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath('/low-stock')
  revalidatePath('/transactions')
}

export async function updateTransaction(
  id: string,
  _prevState: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const parsed = transactionEditSchema.safeParse({
    quantity: formData.get('quantity'),
    note: formData.get('note'),
  })
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }
  const { quantity: newQuantity, note } = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.stockTransaction.findUniqueOrThrow({
        where: { id },
      })
      const delta = newQuantity - existing.quantity
      // ผลกระทบสุทธิต่อ Product.quantity: IN เพิ่มตามจำนวน, OUT ลดตามจำนวน
      const productDelta = existing.type === 'IN' ? delta : -delta

      if (productDelta >= 0) {
        await tx.product.update({
          where: { id: existing.productId },
          data: { quantity: { increment: productDelta } },
        })
      } else {
        // ลดยอดคงเหลือ ต้องกันไม่ให้ติดลบแบบ atomic (re-validate กันเบิกเกิน)
        const result = await tx.product.updateMany({
          where: {
            id: existing.productId,
            quantity: { gte: -productDelta },
          },
          data: { quantity: { decrement: -productDelta } },
        })
        if (result.count === 0) {
          throw new InsufficientStockError()
        }
      }

      await tx.stockTransaction.update({
        where: { id },
        data: { quantity: newQuantity, note: note || null },
      })
    })
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return {
        message: 'ไม่สามารถแก้ไขได้ — ยอดคงเหลือของสินค้าจะติดลบ (เบิกเกิน)',
      }
    }
    return { message: 'บันทึกไม่สำเร็จ กรุณาลองใหม่' }
  }

  revalidateAffected()
  redirect('/transactions')
}

export async function deleteTransaction(
  id: string,
): Promise<{ error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.stockTransaction.findUniqueOrThrow({
        where: { id },
      })

      if (existing.type === 'IN') {
        // ย้อนกลับรายการรับเข้า: ต้องกันไม่ให้ยอดคงเหลือติดลบ
        const result = await tx.product.updateMany({
          where: {
            id: existing.productId,
            quantity: { gte: existing.quantity },
          },
          data: { quantity: { decrement: existing.quantity } },
        })
        if (result.count === 0) {
          throw new InsufficientStockError()
        }
      } else {
        await tx.product.update({
          where: { id: existing.productId },
          data: { quantity: { increment: existing.quantity } },
        })
      }

      await tx.stockTransaction.delete({ where: { id } })
    })
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return {
        error:
          'ไม่สามารถลบได้ — สินค้าถูกเบิกไปแล้วบางส่วน การลบจะทำให้ยอดคงเหลือติดลบ',
      }
    }
    return { error: 'ลบไม่สำเร็จ กรุณาลองใหม่' }
  }

  revalidateAffected()
  return {}
}
