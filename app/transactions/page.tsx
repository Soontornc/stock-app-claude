import Link from 'next/link'
import { DeleteTransactionButton } from '@/components/delete-transaction-button'
import { EditRowButton } from '@/components/edit-row-button'
import { PageHeader } from '@/components/page-header'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TransactionsFilter } from '@/components/transactions-filter'
import { Prisma } from '@/lib/generated/prisma/client'
import { prisma } from '@/lib/prisma'

const timeFormatter = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

type Props = {
  searchParams: Promise<{
    type?: string
    productId?: string
    from?: string
    to?: string
  }>
}

export default async function TransactionsPage({ searchParams }: Props) {
  const sp = await searchParams
  const type = sp.type === 'IN' || sp.type === 'OUT' ? sp.type : ''
  const productId = sp.productId ?? ''
  const from = sp.from ?? ''
  const to = sp.to ?? ''

  const where: Prisma.StockTransactionWhereInput = {
    ...(type ? { type } : {}),
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

  const [transactions, products] = await Promise.all([
    prisma.stockTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { sku: true, name: true, unit: true } } },
    }),
    prisma.product.findMany({
      orderBy: { sku: 'asc' },
      select: { id: true, sku: true, name: true },
    }),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="ประวัติการเคลื่อนไหว"
        subtitle={`${transactions.length} รายการ`}
      />

      <TransactionsFilter
        products={products}
        type={type}
        productId={productId}
        from={from}
        to={to}
      />

      <div className="border-border bg-card overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>วันที่</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>สินค้า</TableHead>
              <TableHead className="text-right">จำนวน</TableHead>
              <TableHead>หมายเหตุ</TableHead>
              <TableHead className="text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-10 text-center"
                >
                  ไม่พบรายการตามเงื่อนไข
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground text-xs">
                    {timeFormatter.format(t.createdAt)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${
                        t.type === 'IN'
                          ? 'bg-status-ok-bg text-status-ok-fg'
                          : 'bg-status-low-bg text-status-low-fg'
                      }`}
                    >
                      {t.type === 'IN' ? 'รับเข้า' : 'เบิกจ่าย'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{t.product.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {t.product.sku}
                    </div>
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${
                      t.type === 'IN' ? 'text-status-ok' : 'text-brand-amber'
                    }`}
                  >
                    {t.type === 'IN' ? '+' : '-'}
                    {t.quantity}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[220px] truncate">
                    {t.note || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1.5">
                      <EditRowButton href={`/transactions/${t.id}/edit`} />
                      <DeleteTransactionButton id={t.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
