import { describe, expect, it } from 'vitest'
import { stockMoveSchema } from '@/lib/validations/stock'

describe('stockMoveSchema', () => {
  it('accepts a valid stock move payload', () => {
    const result = stockMoveSchema.safeParse({
      productId: 'prod-1',
      quantity: '5',
      note: 'เบิกไปใช้งาน',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({
        productId: 'prod-1',
        quantity: 5,
        note: 'เบิกไปใช้งาน',
      })
    }
  })

  it('accepts a payload without a note (optional field)', () => {
    const result = stockMoveSchema.safeParse({
      productId: 'prod-1',
      quantity: '5',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a missing productId', () => {
    const result = stockMoveSchema.safeParse({
      productId: '',
      quantity: '5',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a productId that is only whitespace', () => {
    const result = stockMoveSchema.safeParse({
      productId: '   ',
      quantity: '5',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a zero quantity', () => {
    const result = stockMoveSchema.safeParse({
      productId: 'prod-1',
      quantity: '0',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a negative quantity', () => {
    const result = stockMoveSchema.safeParse({
      productId: 'prod-1',
      quantity: '-3',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a non-integer quantity', () => {
    const result = stockMoveSchema.safeParse({
      productId: 'prod-1',
      quantity: '1.5',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a non-numeric quantity', () => {
    const result = stockMoveSchema.safeParse({
      productId: 'prod-1',
      quantity: 'abc',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a missing quantity', () => {
    const result = stockMoveSchema.safeParse({
      productId: 'prod-1',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a note longer than 500 characters', () => {
    const result = stockMoveSchema.safeParse({
      productId: 'prod-1',
      quantity: '5',
      note: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('accepts a note exactly 500 characters (boundary)', () => {
    const result = stockMoveSchema.safeParse({
      productId: 'prod-1',
      quantity: '5',
      note: 'a'.repeat(500),
    })
    expect(result.success).toBe(true)
  })
})
