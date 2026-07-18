import type { NextRequest } from 'next/server'
import { Prisma } from '@/lib/generated/prisma/client'
import { prisma } from '@/lib/prisma'

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const type = sp.get('type')
  const productId = sp.get('productId')
  const from = sp.get('from')
  const to = sp.get('to')

  const where: Prisma.StockTransactionWhereInput = {
    ...(type === 'IN' || type === 'OUT' ? { type } : {}),
    ...(productId ? { productId } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to
              ? {
                  lt: new Date(
                    new Date(to).setDate(new Date(to).getDate() + 1),
                  ),
                }
              : {}),
          },
        }
      : {}),
  }

  const transactions = await prisma.stockTransaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { sku: true, name: true } } },
  })

  const header = ['วันที่', 'ประเภท', 'SKU', 'ชื่อสินค้า', 'จำนวน', 'หมายเหตุ']
  const rows = transactions.map((t) => [
    t.createdAt.toLocaleString('th-TH'),
    t.type === 'IN' ? 'รับเข้า' : 'เบิกจ่าย',
    t.product.sku,
    t.product.name,
    (t.type === 'IN' ? '' : '-') + t.quantity,
    t.note ?? '',
  ])

  const csv = [header, ...rows]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n')

  const bom = String.fromCharCode(0xfeff)
  return new Response(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="stockapp-transactions.csv"',
    },
  })
}
