'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProductFormState } from '@/app/products/actions'

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
  return <p className="text-destructive text-sm">{messages[0]}</p>
}

export function ProductForm({ action, defaultValues, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="grid max-w-xl gap-5">
      <div className="grid gap-2">
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" name="sku" defaultValue={defaultValues?.sku} />
        <FieldError messages={state.errors?.sku} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">ชื่อสินค้า</Label>
        <Input id="name" name="name" defaultValue={defaultValues?.name} />
        <FieldError messages={state.errors?.name} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category">หมวดหมู่</Label>
          <Input
            id="category"
            name="category"
            defaultValue={defaultValues?.category}
          />
          <FieldError messages={state.errors?.category} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="unit">หน่วยนับ</Label>
          <Input id="unit" name="unit" defaultValue={defaultValues?.unit} />
          <FieldError messages={state.errors?.unit} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
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
        <div className="grid gap-2">
          <Label htmlFor="price">ราคา/หน่วย</Label>
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

      {state.message ? (
        <p className="text-destructive text-sm">{state.message}</p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'กำลังบันทึก…' : submitLabel}
        </Button>
        <Link
          href="/products"
          className={buttonVariants({ variant: 'outline' })}
        >
          ยกเลิก
        </Link>
      </div>
    </form>
  )
}
