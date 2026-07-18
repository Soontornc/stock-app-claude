'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type Product = {
  id: string
  sku: string
  name: string
  unit: string
  quantity: number
}

type FormState = {
  errors?: Record<string, string[]>
  message?: string
  success?: string
}

type Props = {
  isIn: boolean
  products: Product[]
  action: (state: FormState, formData: FormData) => Promise<FormState>
  initialProductId?: string
}

export function StockForm({ isIn, products, action, initialProductId }: Props) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(action, {})
  const [productId, setProductId] = useState(
    (initialProductId && products.some((p) => p.id === initialProductId)
      ? initialProductId
      : products[0]?.id) ?? '',
  )
  const [quantity, setQuantity] = useState('1')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (state.success) {
      setQuantity('1')
      setNote('')
      router.refresh()
    }
  }, [state.success, router])

  const product = products.find((p) => p.id === productId) ?? products[0]
  const qtyNum = Number(quantity) || 0
  const after = product
    ? isIn
      ? product.quantity + qtyNum
      : product.quantity - qtyNum
    : 0
  const blocked = !isIn && !!product && qtyNum > product.quantity

  if (!product) {
    return (
      <div className="border-border bg-card text-muted-foreground rounded-2xl border p-6 text-sm">
        ยังไม่มีสินค้าในระบบ — เพิ่มสินค้าก่อนเพื่อทำรายการรับ/เบิก
      </div>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <div className="border-border bg-card rounded-2xl border p-6 lg:p-7">
        {state.message ? (
          <div className="bg-status-out-bg text-status-out-fg mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm">
            <XCircle className="size-4 shrink-0" strokeWidth={2} />
            {state.message}
          </div>
        ) : null}
        {state.success ? (
          <div className="bg-status-ok-bg text-status-ok-fg mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm">
            <CheckCircle2 className="size-4 shrink-0" strokeWidth={2} />
            {state.success}
          </div>
        ) : null}

        <form action={formAction} className="grid gap-5">
          <div className="grid gap-1.5">
            <Label htmlFor="productId">เลือกสินค้า</Label>
            <select
              id="productId"
              name="productId"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="border-border bg-background focus-visible:border-ring h-9 rounded-xl border px-3 text-[13.5px] outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} · {p.name}
                </option>
              ))}
            </select>
            <p className="text-muted-foreground text-xs">
              คงเหลือปัจจุบัน {product.quantity} {product.unit}
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="quantity">
              {isIn ? 'จำนวนที่รับเข้า' : 'จำนวนที่เบิก'}
            </Label>
            <input
              id="quantity"
              name="quantity"
              inputMode="numeric"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value.replace(/[^0-9]/g, ''))
              }
              className="border-border bg-background focus-visible:border-ring h-9 rounded-xl border px-3 text-[13.5px] outline-none"
            />
            {state.errors?.quantity ? (
              <p className="text-destructive text-xs">
                {state.errors.quantity[0]}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="note">หมายเหตุ (ไม่บังคับ)</Label>
            <textarea
              id="note"
              name="note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border-border bg-background focus-visible:border-ring resize-vertical rounded-xl border px-3 py-2 text-[13.5px] outline-none"
            />
          </div>

          <Button type="submit" disabled={pending} className="gap-1.5">
            <CheckCircle2 className="size-4" strokeWidth={2} />
            {pending
              ? 'กำลังบันทึก…'
              : isIn
                ? 'ยืนยันรับเข้า'
                : 'ยืนยันการเบิกจ่าย'}
          </Button>
        </form>
      </div>

      <div className="border-border bg-card rounded-2xl border p-6">
        <div className="mb-4 text-sm font-bold">สรุปรายการ</div>
        <div className="flex flex-col gap-3.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">คงเหลือปัจจุบัน</span>
            <span className="font-bold">
              {product.quantity} {product.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isIn ? 'จำนวนที่รับเข้า' : 'จำนวนที่เบิก'}
            </span>
            <span
              className={
                isIn ? 'text-status-ok font-bold' : 'text-brand-amber font-bold'
              }
            >
              {isIn ? '+' : '-'}
              {qtyNum}
            </span>
          </div>
          <div className="border-border border-t" />
          <div className="flex justify-between">
            <span className="text-muted-foreground">คงเหลือหลังทำรายการ</span>
            <span
              className={`text-lg font-extrabold ${blocked ? 'text-destructive' : ''}`}
            >
              {after} {product.unit}
            </span>
          </div>
          <div className="bg-accent text-accent-foreground rounded-xl px-3.5 py-2.5 text-xs leading-relaxed">
            ระบบตรวจสอบยอดแบบเรียลไทม์ และตัดสต็อกใน transaction
            เดียวเพื่อกันเบิกเกิน
          </div>
        </div>
      </div>
    </div>
  )
}
