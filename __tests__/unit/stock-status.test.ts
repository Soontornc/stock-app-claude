import { describe, expect, it } from 'vitest'
import { getStockStatus } from '@/lib/stock-status'

describe('getStockStatus (Reorder Point)', () => {
  it('ต้องคืนค่า "out" เมื่อ quantity เป็น 0', () => {
    // arrange
    const quantity = 0
    const reorderPoint = 5

    // act
    const status = getStockStatus(quantity, reorderPoint)

    // assert
    expect(status).toBe('out')
  })

  it('ต้องคืนค่า "out" เมื่อ quantity ติดลบ', () => {
    const quantity = -3
    const reorderPoint = 5

    const status = getStockStatus(quantity, reorderPoint)

    expect(status).toBe('out')
  })

  it('ต้องคืนค่า "low" เมื่อ quantity เท่ากับ reorderPoint พอดี', () => {
    const quantity = 5
    const reorderPoint = 5

    const status = getStockStatus(quantity, reorderPoint)

    expect(status).toBe('low')
  })

  it('ต้องคืนค่า "low" เมื่อ quantity ต่ำกว่า reorderPoint', () => {
    const quantity = 3
    const reorderPoint = 5

    const status = getStockStatus(quantity, reorderPoint)

    expect(status).toBe('low')
  })

  it('ต้องคืนค่า "ok" เมื่อ quantity มากกว่า reorderPoint', () => {
    const quantity = 10
    const reorderPoint = 5

    const status = getStockStatus(quantity, reorderPoint)

    expect(status).toBe('ok')
  })
})
