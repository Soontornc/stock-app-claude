import {
  AlertTriangle,
  Boxes,
  Layers,
  PackageMinus,
  PackagePlus,
  PackageX,
} from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { StockBadge } from '@/components/stock-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { prisma } from '@/lib/prisma'

const timeFormatter = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
  timeStyle: 'short',
})
const dayLabelFormatter = new Intl.DateTimeFormat('th-TH', {
  weekday: 'short',
})

export default async function DashboardPage() {
  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )
  const sevenDaysAgo = new Date(startOfToday)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

  const [products, weekTx, recentTx] = await Promise.all([
    prisma.product.findMany({ orderBy: { sku: 'asc' } }),
    prisma.stockTransaction.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.stockTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { product: { select: { sku: true, name: true, unit: true } } },
    }),
  ])

  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0)
  const lowItems = products
    .filter((p) => p.quantity <= p.reorderPoint)
    .sort((a, b) => a.quantity - b.quantity)
  const outCount = products.filter((p) => p.quantity <= 0).length
  const lowOnlyCount = lowItems.length - outCount

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysAgo)
    d.setDate(d.getDate() + i)
    return d
  })
  const trend = days.map((d) => {
    const dayEnd = new Date(d)
    dayEnd.setDate(dayEnd.getDate() + 1)
    const dayTx = weekTx.filter((t) => t.createdAt >= d && t.createdAt < dayEnd)
    return {
      label: dayLabelFormatter.format(d),
      inSum: dayTx
        .filter((t) => t.type === 'IN')
        .reduce((sum, t) => sum + t.quantity, 0),
      outSum: dayTx
        .filter((t) => t.type === 'OUT')
        .reduce((sum, t) => sum + t.quantity, 0),
    }
  })
  const maxTrend = Math.max(1, ...trend.flatMap((t) => [t.inSum, t.outSum]))

  return (
    <div className="space-y-6">
      <PageHeader title="ภาพรวมคลังสินค้า" subtitle="อัปเดตล่าสุดวันนี้" />

      {lowItems.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3.5 rounded-2xl border border-[color-mix(in_oklch,var(--brand-amber),transparent_80%)] bg-[color-mix(in_oklch,var(--brand-amber),transparent_88%)] px-5 py-3.5">
          <AlertTriangle
            className="text-brand-amber size-5 shrink-0"
            strokeWidth={1.9}
          />
          <div className="flex-1 text-[13.5px]">
            มีสินค้า {lowItems.length} รายการที่ยอดคงเหลือต่ำกว่าจุดสั่งซื้อ
            {outCount > 0
              ? ` และ ${outCount} รายการหมดสต็อกแล้ว — ควรเปิด PO รับเข้าโดยด่วน`
              : ''}
          </div>
          <Link
            href="/low-stock"
            className="bg-primary shrink-0 rounded-xl px-4 py-2 text-[13px] font-bold text-white"
          >
            ดูรายการ
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Boxes}
          label="สินค้าทั้งหมด"
          value={`${products.length} รายการ`}
          tag="รวม"
        />
        <StatCard
          icon={Layers}
          label="รวมชิ้นคงเหลือ"
          value={`${totalQuantity}`}
        />
        <StatCard
          icon={AlertTriangle}
          label="สินค้าใกล้หมด"
          value={`${lowOnlyCount}`}
          tag="เฝ้าระวัง"
          tagClassName="text-brand-amber"
        />
        <StatCard
          icon={PackageX}
          label="สินค้าหมดสต็อก"
          value={`${outCount}`}
          tag="ต้องรับเข้า"
          tagClassName="text-destructive"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="border-border bg-card overflow-hidden rounded-2xl border">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="text-sm font-bold">สินค้าใกล้หมด/หมดสต็อก</div>
            <Link
              href="/low-stock"
              className="text-primary text-xs font-semibold"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>ชื่อสินค้า</TableHead>
                <TableHead className="text-right">คงเหลือ</TableHead>
                <TableHead className="text-right">สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-muted-foreground py-8 text-center"
                  >
                    สต็อกทุกรายการอยู่ในระดับปกติ
                  </TableCell>
                </TableRow>
              ) : (
                lowItems.slice(0, 6).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {p.sku}
                    </TableCell>
                    <TableCell className="font-semibold">{p.name}</TableCell>
                    <TableCell className="text-right">
                      {p.quantity} {p.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <StockBadge
                          quantity={p.quantity}
                          reorderPoint={p.reorderPoint}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-5">
          <div className="border-border bg-card rounded-2xl border p-5">
            <div className="mb-4 text-sm font-bold">
              การเคลื่อนไหวสต็อก 7 วัน
            </div>
            <div className="flex h-[110px] items-end gap-2.5">
              {trend.map((t, i) => (
                <div
                  key={i}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                >
                  <div className="flex h-full items-end gap-[3px]">
                    <div
                      className="bg-status-ok w-1.5 rounded-sm"
                      style={{ height: `${(t.inSum / maxTrend) * 90}%` }}
                    />
                    <div
                      className="bg-brand-amber w-1.5 rounded-sm"
                      style={{ height: `${(t.outSum / maxTrend) * 90}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground text-[10px]">
                    {t.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-muted-foreground mt-3.5 flex gap-4 text-[11.5px]">
              <span className="flex items-center gap-1.5">
                <span className="bg-status-ok block size-2 rounded-sm" />
                รับเข้า
              </span>
              <span className="flex items-center gap-1.5">
                <span className="bg-brand-amber block size-2 rounded-sm" />
                เบิกจ่าย
              </span>
            </div>
          </div>

          <div className="border-border bg-card rounded-2xl border p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-bold">รายการล่าสุด</div>
              <Link
                href="/transactions"
                className="text-primary text-xs font-semibold"
              >
                ดูทั้งหมด →
              </Link>
            </div>
            {recentTx.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                ยังไม่มีรายการเคลื่อนไหว
              </p>
            ) : (
              <div className="flex flex-col gap-3.5">
                {recentTx.map((t) => (
                  <div key={t.id} className="flex items-start gap-2.5">
                    <div
                      className={`flex size-[30px] shrink-0 items-center justify-center rounded-[9px] ${t.type === 'IN' ? 'bg-status-ok-bg' : 'bg-status-low-bg'}`}
                    >
                      {t.type === 'IN' ? (
                        <PackagePlus
                          className="text-status-ok size-3.5"
                          strokeWidth={2}
                        />
                      ) : (
                        <PackageMinus
                          className="text-brand-amber size-3.5"
                          strokeWidth={2}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-semibold">
                        {t.type === 'IN' ? 'รับเข้า · ' : 'เบิกจ่าย · '}
                        {t.product.name}
                      </div>
                      <div className="text-muted-foreground truncate text-[11px]">
                        {t.note || timeFormatter.format(t.createdAt)}
                      </div>
                    </div>
                    <div
                      className={`shrink-0 text-[13px] font-bold whitespace-nowrap ${t.type === 'IN' ? 'text-status-ok' : 'text-brand-amber'}`}
                    >
                      {t.type === 'IN' ? '+' : '-'}
                      {t.quantity}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
