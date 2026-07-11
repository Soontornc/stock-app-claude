'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { Prisma } from '@/lib/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validations/product'

export type ProductFormState = {
  errors?: Record<string, string[]>
  message?: string
}

function parseForm(formData: FormData) {
  return productSchema.safeParse({
    sku: formData.get('sku'),
    name: formData.get('name'),
    category: formData.get('category'),
    unit: formData.get('unit'),
    reorderPoint: formData.get('reorderPoint'),
    price: formData.get('price'),
  })
}

function isDuplicateSku(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  )
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  try {
    await prisma.product.create({ data: parsed.data })
  } catch (error) {
    if (isDuplicateSku(error)) {
      return { errors: { sku: ['SKU นี้มีอยู่แล้ว'] } }
    }
    return { message: 'บันทึกไม่สำเร็จ กรุณาลองใหม่' }
  }

  revalidatePath('/products')
  redirect('/products')
}

export async function updateProduct(
  id: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  try {
    await prisma.product.update({ where: { id }, data: parsed.data })
  } catch (error) {
    if (isDuplicateSku(error)) {
      return { errors: { sku: ['SKU นี้มีอยู่แล้ว'] } }
    }
    return { message: 'บันทึกไม่สำเร็จ กรุณาลองใหม่' }
  }

  revalidatePath('/products')
  revalidatePath(`/products/${id}/edit`)
  redirect('/products')
}

export async function deleteProduct(id: string) {
  // transaction ที่เกี่ยวข้องถูกลบตาม (onDelete: Cascade ใน schema)
  await prisma.product.delete({ where: { id } })
  revalidatePath('/products')
}
