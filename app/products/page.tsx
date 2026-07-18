import { Plus } from 'lucide-react'
import Link from 'next/link'
import { DeleteProductButton } from '@/components/delete-product-button'
import { PageHeader } from '@/components/page-header'
import { ProductsFilter } from '@/components/products-filter'
import { StockBadge } from '@/components/stock-badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Prisma } from '@/lib/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { EditRowButton } from '@/components/edit-row-button'

const priceFormatter = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

type Props = {
  searchParams: Promise<{ q?: string; category?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams
  const q = sp.q?.trim() ?? ''
  const category = sp.category ?? ''

  const where: Prisma.ProductWhereInput = {
    ...(category ? { category } : {}),
    ...(q
      ? {
          OR: [
            { sku: { contains: q, mode: 'insensitive' } },
            { name: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const [products, categoryRows] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { sku: 'asc' } }),
    prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    }),
  ])

  const categories = categoryRows.map((row) => row.category)
  const isFiltered = q !== '' || category !== ''

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการสินค้า"
        subtitle={`${products.length} รายการ${isFiltered ? ' (กรองแล้ว)' : ''}`}
        actions={
          <Link
            href="/products/new"
            className={buttonVariants({ className: 'gap-1.5' })}
          >
            <Plus className="size-4" />
            เพิ่มสินค้า
          </Link>
        }
      />

      <ProductsFilter categories={categories} q={q} category={category} />

      <div className="border-border bg-card overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>ชื่อสินค้า</TableHead>
              <TableHead className="text-right">คงเหลือ</TableHead>
              <TableHead className="text-right">จุดสั่งซื้อ</TableHead>
              <TableHead className="text-right">มูลค่ารวม</TableHead>
              <TableHead className="text-right">สถานะ</TableHead>
              <TableHead className="text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-10 text-center"
                >
                  {isFiltered
                    ? 'ไม่พบสินค้าตามเงื่อนไข'
                    : 'ยังไม่มีสินค้า — เริ่มด้วยการเพิ่มสินค้าใหม่'}
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {product.sku}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {product.category}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.quantity} {product.unit}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right">
                    {product.reorderPoint}
                  </TableCell>
                  <TableCell className="text-right">
                    ฿
                    {priceFormatter.format(
                      product.quantity * Number(product.price),
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <StockBadge
                        quantity={product.quantity}
                        reorderPoint={product.reorderPoint}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1.5">
                      <EditRowButton href={`/products/${product.id}/edit`} />
                      <DeleteProductButton
                        id={product.id}
                        name={product.name}
                      />
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
