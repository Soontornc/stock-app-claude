import { createProduct } from '@/app/products/actions'
import { PageHeader } from '@/components/page-header'
import { ProductForm } from '@/components/product-form'

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="เพิ่มสินค้าใหม่"
        subtitle="ยอดคงเหลือเริ่มต้นที่ 0 — เพิ่มสต็อกได้ที่หน้ารับสินค้าเข้า"
      />
      <ProductForm action={createProduct} submitLabel="บันทึกสินค้า" />
    </div>
  )
}
