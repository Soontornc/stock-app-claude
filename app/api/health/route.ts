import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// A health check must hit the DB live on every request, never a cached result.
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok' })
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503 })
  }
}
