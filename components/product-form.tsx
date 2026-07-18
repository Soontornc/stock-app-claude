'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useActionState } from 'react'
import type { ProductFormState } from '@/app/products/actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type ProductFormValues = {
  sku: string
  name: string
  category: string
  unit: string
  reorderPoint: number
  price: string
}

type Props = {
  action: (
    state: ProductFormState,
    formData: FormData,
  ) => Promise<ProductFormState>
  defaultValues?: ProductFormValues
  submitLabel: string
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) {
    return null
  }
  return (
    <p className="text-destructive flex items-center gap-1.5 text-xs">
      <XCircle className="size-3.5" strokeWidth={2} />
      {messages[0]}
    </p>
  )
}

export function ProductForm({ action, defaultValues, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <div className="border-border bg-card max-w-2xl rounded-2xl border p-6 lg:p-7">
      <form action={formAction} className="grid gap-5">
        {state.message ? (
          <div className="bg-status-out-bg text-status-out-fg flex items-center gap-2 rounded-xl px-4 py-3 text-sm">
            <XCircle className="size-4 shrink-0" strokeWidth={2} />
            {state.message}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              name="sku"
              placeholder="SKU-1008"
              defaultValue={defaultValues?.sku}
            />
            <FieldError messages={state.errors?.sku} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="name">ชื่อสินค้า</Label>
            <Input
              id="name"
              name="name"
              placeholder="ชื่อสินค้า"
              defaultValue={defaultValues?.name}
            />
            <FieldError messages={state.errors?.name} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="category">หมวดหมู่</Label>
            <Input
              id="category"
              name="category"
              placeholder="เช่น เครื่องเขียน"
              defaultValue={defaultValues?.category}
            />
            <FieldError messages={state.errors?.category} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="unit">หน่วยนับ</Label>
            <Input
              id="unit"
              name="unit"
              placeholder="เช่น ชิ้น, กล่อง, ลัง"
              defaultValue={defaultValues?.unit}
            />
            <FieldError messages={state.errors?.unit} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="reorderPoint">จุดสั่งซื้อขั้นต่ำ</Label>
            <Input
              id="reorderPoint"
              name="reorderPoint"
              type="number"
              min={0}
              step={1}
              defaultValue={defaultValues?.reorderPoint ?? 0}
            />
            <FieldError messages={state.errors?.reorderPoint} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="price">ราคา/หน่วย (บาท)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              step="0.01"
              defaultValue={defaultValues?.price ?? '0'}
            />
            <FieldError messages={state.errors?.price} />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={pending} className="gap-1.5">
            <CheckCircle2 className="size-4" strokeWidth={2} />
            {pending ? 'กำลังบันทึก…' : submitLabel}
          </Button>
          <Link
            href="/products"
            className={buttonVariants({ variant: 'ghost' })}
          >
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  )
}
