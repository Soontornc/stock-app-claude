'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useActionState } from 'react'
import type { TransactionFormState } from '@/app/transactions/actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type Props = {
  action: (
    state: TransactionFormState,
    formData: FormData,
  ) => Promise<TransactionFormState>
  productName: string
  unit: string
  type: 'IN' | 'OUT'
  defaultQuantity: number
  defaultNote: string
}

export function TransactionEditForm({
  action,
  productName,
  unit,
  type,
  defaultQuantity,
  defaultNote,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <div className="border-border bg-card max-w-lg rounded-2xl border p-6 lg:p-7">
      {state.message ? (
        <div className="bg-status-out-bg text-status-out-fg mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm">
          <XCircle className="size-4 shrink-0" strokeWidth={2} />
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="grid gap-5">
        <div className="grid gap-1.5">
          <Label>สินค้า</Label>
          <div className="text-muted-foreground bg-muted rounded-xl px-3 py-2 text-sm">
            {productName} ({type === 'IN' ? 'รับเข้า' : 'เบิกจ่าย'})
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="quantity">จำนวน ({unit})</Label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            step={1}
            defaultValue={defaultQuantity}
            className="border-border bg-background focus-visible:border-ring h-9 rounded-xl border px-3 text-[13.5px] outline-none"
          />
          {state.errors?.quantity ? (
            <p className="text-destructive text-xs">
              {state.errors.quantity[0]}
            </p>
          ) : null}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="note">หมายเหตุ</Label>
          <textarea
            id="note"
            name="note"
            rows={3}
            defaultValue={defaultNote}
            className="border-border bg-background focus-visible:border-ring resize-vertical rounded-xl border px-3 py-2 text-[13.5px] outline-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={pending} className="gap-1.5">
            <CheckCircle2 className="size-4" strokeWidth={2} />
            {pending ? 'กำลังบันทึก…' : 'บันทึกการแก้ไข'}
          </Button>
          <Link
            href="/transactions"
            className={buttonVariants({ variant: 'ghost' })}
          >
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  )
}
