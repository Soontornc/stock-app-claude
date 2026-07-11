import Link from 'next/link'
import { DeleteProductButton } from '@/components/delete-product-button'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">สินค้าทั้งหมด</h1>
          <p className="text-muted-foreground text-sm">
            {products.length} รายการ{isFiltered ? ' (กรองแล้ว)' : ''}
          </p>
        </div>
        <Link href="/products/new" className={buttonVariants()}>
          + เพิ่มสินค้า
        </Link>
      </div>

      <ProductsFilter categories={categories} q={q} category={category} />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>ชื่อสินค้า</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead className="text-right">คงเหลือ</TableHead>
              <TableHead className="text-right">จุดสั่งซื้อ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">ราคา/หน่วย</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
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
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">
                    {product.quantity} {product.unit}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.reorderPoint}
                  </TableCell>
                  <TableCell>
                    <StockBadge
                      quantity={product.quantity}
                      reorderPoint={product.reorderPoint}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {priceFormatter.format(Number(product.price))}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/products/${product.id}/edit`}
                      className={buttonVariants({
                        variant: 'ghost',
                        size: 'sm',
                      })}
                    >
                      แก้ไข
                    </Link>
                    <DeleteProductButton id={product.id} name={product.name} />
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
