import { createProduct } from '@/app/products/actions'
import { ProductForm } from '@/components/product-form'

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">เพิ่มสินค้าใหม่</h1>
        <p className="text-muted-foreground text-sm">
          ยอดคงเหลือเริ่มต้นที่ 0 — เพิ่มสต็อกได้ที่หน้ารับสินค้าเข้า
        </p>
      </div>
      <ProductForm action={createProduct} submitLabel="บันทึกสินค้า" />
    </div>
  )
}
