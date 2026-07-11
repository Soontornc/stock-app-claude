import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">StockApp</h1>
        <p className="text-muted-foreground text-sm">
          ระบบคลังสินค้าเบิกจ่าย — Dashboard จะมาในขั้นถัดไปของ Phase 2
        </p>
      </div>
      <Link href="/products" className={buttonVariants()}>
        ไปที่รายการสินค้า
      </Link>
    </div>
  )
}
