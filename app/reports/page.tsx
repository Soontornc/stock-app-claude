import {
  ArrowLeftRight,
  Layers,
  PackageMinus,
  PackagePlus,
  Wallet,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { prisma } from '@/lib/prisma'

const valueFormatter = new Intl.NumberFormat('th-TH', {
  maximumFractionDigits: 0,
})
const dayLabelFormatter = new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'short',
})

export default async function ReportsPage() {
  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )
  const thirtyDaysAgo = new Date(startOfToday)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
  const fourteenDaysAgo = new Date(startOfToday)
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13)

  const [products, periodTx] = await Promise.all([
    prisma.product.findMany({ orderBy: { sku: 'asc' } }),
    prisma.stockTransaction.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      include: { product: { select: { sku: true, name: true, unit: true } } },
    }),
  ])

  const totalValue = products.reduce(
    (sum, p) => sum + p.quantity * Number(p.price),
    0,
  )
  const totalIn = periodTx
    .filter((t) => t.type === 'IN')
    .reduce((sum, t) => sum + t.quantity, 0)
  const totalOut = periodTx
    .filter((t) => t.type === 'OUT')
    .reduce((sum, t) => sum + t.quantity, 0)
  const netMovement = totalIn - totalOut

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(fourteenDaysAgo)
    d.setDate(d.getDate() + i)
    return d
  })
  const trend = days.map((d) => {
    const dayEnd = new Date(d)
    dayEnd.setDate(dayEnd.getDate() + 1)
    const dayTx = periodTx.filter(
      (t) => t.createdAt >= d && t.createdAt < dayEnd,
    )
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

  const categoryMap = new Map<
    string,
    { count: number; quantity: number; value: number }
  >()
  for (const p of products) {
    const entry = categoryMap.get(p.category) ?? {
      count: 0,
      quantity: 0,
      value: 0,
    }
    entry.count += 1
    entry.quantity += p.quantity
    entry.value += p.quantity * Number(p.price)
    categoryMap.set(p.category, entry)
  }
  const categories = Array.from(categoryMap.entries())
    .map(([category, stat]) => ({ category, ...stat }))
    .sort((a, b) => b.value - a.value)

  const movementMap = new Map<
    string,
    { sku: string; name: string; inSum: number; outSum: number }
  >()
  for (const t of periodTx) {
    const entry = movementMap.get(t.productId) ?? {
      sku: t.product.sku,
      name: t.product.name,
      inSum: 0,
      outSum: 0,
    }
    if (t.type === 'IN') entry.inSum += t.quantity
    else entry.outSum += t.quantity
    movementMap.set(t.productId, entry)
  }
  const topMovers = Array.from(movementMap.values())
    .sort((a, b) => b.inSum + b.outSum - (a.inSum + a.outSum))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <PageHeader
        title="รายงาน"
        subtitle="สรุปมูลค่าสต็อกและการเคลื่อนไหว 30 วันล่าสุด"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="มูลค่าสต็อกคงเหลือ"
          value={`฿${valueFormatter.format(totalValue)}`}
        />
        <StatCard
          icon={PackagePlus}
          label="รับเข้า 30 วันล่าสุด"
          value={`+${totalIn}`}
        />
        <StatCard
          icon={PackageMinus}
          label="เบิกจ่าย 30 วันล่าสุด"
          value={`-${totalOut}`}
        />
        <StatCard
          icon={ArrowLeftRight}
          label="เคลื่อนไหวสุทธิ"
          value={`${netMovement >= 0 ? '+' : ''}${netMovement}`}
          tag={netMovement >= 0 ? 'เพิ่มขึ้น' : 'ลดลง'}
          tagClassName={
            netMovement >= 0 ? 'text-status-ok' : 'text-destructive'
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="border-border bg-card rounded-2xl border p-5">
          <div className="mb-4 text-sm font-bold">
            การเคลื่อนไหวสต็อก 14 วัน
          </div>
          <div className="flex h-[140px] items-end gap-2">
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
                <span className="text-muted-foreground text-[9.5px]">
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

        <div className="border-border bg-card overflow-hidden rounded-2xl border">
          <div className="flex items-center gap-2 px-5 py-4">
            <Layers className="text-primary size-4" strokeWidth={1.8} />
            <div className="text-sm font-bold">มูลค่าตามหมวดหมู่</div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead className="text-right">SKU</TableHead>
                <TableHead className="text-right">มูลค่า</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground py-8 text-center"
                  >
                    ยังไม่มีข้อมูลสินค้า
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((c) => (
                  <TableRow key={c.category}>
                    <TableCell className="font-semibold">
                      {c.category}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right">
                      {c.count}
                    </TableCell>
                    <TableCell className="text-right">
                      ฿{valueFormatter.format(c.value)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="border-border bg-card overflow-hidden rounded-2xl border">
        <div className="px-5 py-4 text-sm font-bold">
          สินค้าเคลื่อนไหวสูงสุด (30 วันล่าสุด)
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>ชื่อสินค้า</TableHead>
              <TableHead className="text-right">รับเข้า</TableHead>
              <TableHead className="text-right">เบิกจ่าย</TableHead>
              <TableHead className="text-right">สุทธิ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topMovers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground py-8 text-center"
                >
                  ยังไม่มีการเคลื่อนไหวในช่วง 30 วันล่าสุด
                </TableCell>
              </TableRow>
            ) : (
              topMovers.map((m) => (
                <TableRow key={m.sku}>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {m.sku}
                  </TableCell>
                  <TableCell className="font-semibold">{m.name}</TableCell>
                  <TableCell className="text-status-ok text-right font-bold">
                    +{m.inSum}
                  </TableCell>
                  <TableCell className="text-brand-amber text-right font-bold">
                    -{m.outSum}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {m.inSum - m.outSum >= 0 ? '+' : ''}
                    {m.inSum - m.outSum}
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
