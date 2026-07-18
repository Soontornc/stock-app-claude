import { PackagePlus } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
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

export default async function LowStockPage() {
  const products = await prisma.product.findMany({ orderBy: { sku: 'asc' } })
  const items = products
    .filter((p) => p.quantity <= p.reorderPoint)
    .sort((a, b) => a.quantity - b.quantity)

  return (
    <div className="space-y-6">
      <PageHeader
        title="สินค้าใกล้หมด"
        subtitle={`รายการที่คงเหลือต่ำกว่าหรือเท่ากับจุดสั่งซื้อ (${items.length} รายการ)`}
      />

      <div className="border-border bg-card overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>ชื่อสินค้า</TableHead>
              <TableHead className="text-right">คงเหลือ</TableHead>
              <TableHead className="text-right">จุดสั่งซื้อ</TableHead>
              <TableHead className="text-right">สถานะ</TableHead>
              <TableHead className="text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-10 text-center"
                >
                  สต็อกทุกรายการอยู่ในระดับปกติ ไม่มีสินค้าใกล้หมด
                </TableCell>
              </TableRow>
            ) : (
              items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {p.sku}
                  </TableCell>
                  <TableCell className="font-semibold">{p.name}</TableCell>
                  <TableCell className="text-right">
                    {p.quantity} {p.unit}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right">
                    {p.reorderPoint}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <StockBadge
                        quantity={p.quantity}
                        reorderPoint={p.reorderPoint}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Link
                        href={`/stock-in?productId=${p.id}`}
                        className="bg-accent text-primary flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold"
                      >
                        <PackagePlus className="size-3.5" strokeWidth={2} />
                        รับเข้า
                      </Link>
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
