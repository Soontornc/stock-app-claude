import { beforeEach, vi } from 'vitest'
import { mockDeep, mockReset, type DeepMockProxy } from 'jest-mock-extended'
import { prisma } from '@/lib/prisma'
import type { PrismaClient } from '@/lib/generated/prisma/client'

vi.mock('@/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
