import { randomUUID } from 'node:crypto'
import { afterAll, describe, expect, it, vi } from 'vitest'

// createStockOut calls revalidatePath, which relies on a Next.js request
// context that doesn't exist when the server action is invoked directly
// from a test. Stub it out so the action can run standalone.
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// These tests exercise the real Server Action against a real Postgres
// instance (via docker-compose). The overselling guard lives in a single
// atomic `UPDATE ... WHERE quantity >= qty` statement executed by
// Postgres itself, so mocking Prisma would not prove the guarantee holds
// -- only a real database can.
import { prisma } from '@/lib/prisma'
import { createStockOut } from '../actions'

const INSUFFICIENT_STOCK_MESSAGE =
  'จำนวนที่เบิกเกินยอดคงเหลือ ไม่สามารถทำรายการได้'

// `it.skipIf` is evaluated at collection time, before any `beforeAll`
// hook runs, so the reachability check has to happen here via a
// top-level await rather than inside `beforeAll`.
let dbAvailable = false
try {
  await prisma.$queryRaw`SELECT 1`
  dbAvailable = true
} catch {
  dbAvailable = false
  // eslint-disable-next-line no-console
  console.warn(
    '[stock-out tests] Postgres is not reachable at DATABASE_URL -- ' +
      'skipping integration tests. Run `docker compose up -d` and retry.',
  )
}

afterAll(async () => {
  await prisma.$disconnect()
})

const createdProductIds: string[] = []

async function createTestProduct(quantity: number) {
  const product = await prisma.product.create({
    data: {
      sku: `TEST-${randomUUID()}`,
      name: 'สินค้าทดสอบ',
      category: 'ทดสอบ',
      unit: 'ชิ้น',
      quantity,
      reorderPoint: 0,
      price: 1,
    },
  })
  createdProductIds.push(product.id)
  return product
}

afterAll(async () => {
  if (!dbAvailable || createdProductIds.length === 0) return
  // Product -> StockTransaction is an onDelete: Cascade relation, so
  // deleting the throwaway products also removes their transactions.
  await prisma.product.deleteMany({
    where: { id: { in: createdProductIds } },
  })
})

function buildFormData(
  productId: string,
  quantity: number | string,
  note = '',
) {
  // The real <StockForm> always renders a `note` input (defaulting to an
  // empty string), so formData.get('note') is never `null` in production.
  // zod's `.optional()` only accepts `undefined`, not `null`, so tests
  // must mirror that and always send a `note` field too.
  const formData = new FormData()
  formData.set('productId', productId)
  formData.set('quantity', String(quantity))
  formData.set('note', note)
  return formData
}

describe('createStockOut (overselling prevention)', () => {
  it.skipIf(!dbAvailable)(
    'succeeds when quantity requested exactly equals stock on hand (boundary)',
    async () => {
      const product = await createTestProduct(10)

      const result = await createStockOut({}, buildFormData(product.id, 10))

      expect(result.success).toBeDefined()
      expect(result.message).toBeUndefined()

      const updated = await prisma.product.findUniqueOrThrow({
        where: { id: product.id },
      })
      expect(updated.quantity).toBe(0)

      const transactions = await prisma.stockTransaction.findMany({
        where: { productId: product.id },
      })
      expect(transactions).toHaveLength(1)
      expect(transactions[0].type).toBe('OUT')
      expect(transactions[0].quantity).toBe(10)
    },
  )

  it.skipIf(!dbAvailable)(
    'fails with the Thai insufficient-stock message when quantity is one more than stock',
    async () => {
      const product = await createTestProduct(10)

      const result = await createStockOut({}, buildFormData(product.id, 11))

      expect(result.message).toBe(INSUFFICIENT_STOCK_MESSAGE)
      expect(result.success).toBeUndefined()

      const updated = await prisma.product.findUniqueOrThrow({
        where: { id: product.id },
      })
      expect(updated.quantity).toBe(10)

      const transactions = await prisma.stockTransaction.findMany({
        where: { productId: product.id },
      })
      expect(transactions).toHaveLength(0)
    },
  )

  it.skipIf(!dbAvailable)(
    'fails gracefully for a non-existent productId',
    async () => {
      const result = await createStockOut(
        {},
        buildFormData(`missing-${randomUUID()}`, 1),
      )

      expect(result.message).toBe(INSUFFICIENT_STOCK_MESSAGE)
      expect(result.success).toBeUndefined()
    },
  )

  it.skipIf(!dbAvailable)(
    'never allows quantity to go negative under concurrent requests',
    async () => {
      // Stock = 10, three concurrent requests of 4 each = 12 requested.
      // Only two can succeed (2 * 4 = 8 <= 10); the third must fail.
      const product = await createTestProduct(10)

      const results = await Promise.all([
        createStockOut({}, buildFormData(product.id, 4)),
        createStockOut({}, buildFormData(product.id, 4)),
        createStockOut({}, buildFormData(product.id, 4)),
      ])

      const succeeded = results.filter((r) => r.success !== undefined)
      const failed = results.filter(
        (r) => r.message === INSUFFICIENT_STOCK_MESSAGE,
      )

      expect(succeeded).toHaveLength(2)
      expect(failed).toHaveLength(1)

      const updated = await prisma.product.findUniqueOrThrow({
        where: { id: product.id },
      })
      expect(updated.quantity).toBe(2)
      expect(updated.quantity).toBeGreaterThanOrEqual(0)

      const transactions = await prisma.stockTransaction.findMany({
        where: { productId: product.id },
      })
      expect(transactions).toHaveLength(2)
    },
  )
})
