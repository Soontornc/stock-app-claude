import { describe, expect, it, vi } from 'vitest'
import { prismaMock } from '../helpers/prisma-mock'
import { createStockOut } from '@/app/stock-out/actions'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

function formData(fields: Record<string, string>) {
  const data = new FormData()
  data.set('note', '')
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value)
  }
  return data
}

describe('เบิกสินค้าออก (Stock Out)', () => {
  it('ต้อง reject เมื่อเบิกเกินจำนวนคงเหลือ (กันเบิกเกินแบบ atomic)', async () => {
    // arrange
    prismaMock.$transaction.mockImplementation(
      (callback) => callback(prismaMock) as Promise<unknown>,
    )
    prismaMock.product.updateMany.mockResolvedValue({ count: 0 })
    const input = formData({ productId: 'prod-1', quantity: '999' })

    // act
    const result = await createStockOut({}, input)

    // assert
    expect(result.message).toBe(
      'จำนวนที่เบิกเกินยอดคงเหลือ ไม่สามารถทำรายการได้',
    )
    expect(prismaMock.stockTransaction.create).not.toHaveBeenCalled()
  })

  it('ต้องลดยอดคงเหลือและสร้าง transaction type OUT เมื่อเบิกไม่เกินจำนวนคงเหลือ', async () => {
    prismaMock.$transaction.mockImplementation(
      (callback) => callback(prismaMock) as Promise<unknown>,
    )
    prismaMock.product.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.stockTransaction.create.mockResolvedValue({
      id: 'tx-1',
      productId: 'prod-1',
      type: 'OUT',
      quantity: 5,
      note: null,
      createdAt: new Date(),
    })
    prismaMock.product.findUniqueOrThrow.mockResolvedValue({
      id: 'prod-1',
      sku: 'SKU-1001',
      name: 'สินค้าทดสอบ',
      category: 'ทั่วไป',
      unit: 'ชิ้น',
      quantity: 5,
      reorderPoint: 2,
      price: 100 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const input = formData({ productId: 'prod-1', quantity: '5' })

    const result = await createStockOut({}, input)

    expect(result.success).toContain('คงเหลือ 5')
    expect(prismaMock.product.updateMany).toHaveBeenCalledWith({
      where: { id: 'prod-1', quantity: { gte: 5 } },
      data: { quantity: { decrement: 5 } },
    })
    expect(prismaMock.stockTransaction.create).toHaveBeenCalledWith({
      data: { productId: 'prod-1', type: 'OUT', quantity: 5, note: null },
    })
  })
})
