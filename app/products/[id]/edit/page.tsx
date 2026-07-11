import { notFound } from 'next/navigation'
import { updateProduct } from '@/app/products/actions'
import { ProductForm } from '@/components/product-form'
import { prisma } from '@/lib/prisma'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">แก้ไขสินค้า</h1>
        <p className="text-muted-foreground text-sm">
          คงเหลือปัจจุบัน {product.quantity} {product.unit} —
          ปรับยอดผ่านหน้ารับ/เบิก
        </p>
      </div>
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        submitLabel="บันทึกการแก้ไข"
        defaultValues={{
          sku: product.sku,
          name: product.name,
          category: product.category,
          unit: product.unit,
          reorderPoint: product.reorderPoint,
          price: product.price.toString(),
        }}
      />
    </div>
  )
}
