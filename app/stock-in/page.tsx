import { PackagePlus } from 'lucide-react'
import { createStockIn } from '@/app/stock-in/actions'
import { PageHeader } from '@/components/page-header'
import { StockForm } from '@/components/stock-form'
import { prisma } from '@/lib/prisma'

const timeFormatter = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

type Props = {
  searchParams: Promise<{ productId?: string }>
}

export default async function StockInPage({ searchParams }: Props) {
  const sp = await searchParams
  const [products, recent] = await Promise.all([
    prisma.product.findMany({
      orderBy: { sku: 'asc' },
      select: { id: true, sku: true, name: true, unit: true, quantity: true },
    }),
    prisma.stockTransaction.findMany({
      where: { type: 'IN' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { product: { select: { sku: true, name: true, unit: true } } },
    }),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="รับสินค้าเข้า"
        subtitle="บันทึกการรับเข้าและเพิ่มยอดสต็อกอัตโนมัติ"
      />
      <StockForm
        isIn
        products={products}
        action={createStockIn}
        initialProductId={sp.productId}
      />

      <div className="border-border bg-card rounded-2xl border p-6">
        <div className="mb-4 text-sm font-bold">รายการรับล่าสุด</div>
        {recent.length === 0 ? (
          <p className="text-muted-foreground text-sm">ยังไม่มีรายการรับเข้า</p>
        ) : (
          <div className="flex flex-col gap-3.5">
            {recent.map((t) => (
              <div key={t.id} className="flex items-start gap-3">
                <div className="bg-status-ok-bg flex size-8 shrink-0 items-center justify-center rounded-lg">
                  <PackagePlus
                    className="text-status-ok size-4"
                    strokeWidth={2}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold">
                    {t.product.sku} · {t.product.name}
                  </div>
                  <div className="text-muted-foreground truncate text-xs">
                    {t.note || '-'} · {timeFormatter.format(t.createdAt)}
                  </div>
                </div>
                <div className="text-status-ok shrink-0 text-sm font-bold">
                  +{t.quantity}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
