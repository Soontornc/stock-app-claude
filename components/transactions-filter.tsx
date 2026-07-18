'use client'

import { Download } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'

type Product = {
  id: string
  sku: string
  name: string
}

type Props = {
  products: Product[]
  type: string
  productId: string
  from: string
  to: string
}

const typeChips: { value: string; label: string }[] = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'IN', label: 'รับเข้า' },
  { value: 'OUT', label: 'เบิกจ่าย' },
]

export function TransactionsFilter({
  products,
  type,
  productId,
  from,
  to,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const exportHref = `/transactions/export?${searchParams.toString()}`

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex gap-2">
          {typeChips.map((chip) => {
            const active = type === chip.value
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => setParam('type', chip.value)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors',
                  active
                    ? 'bg-primary border-primary font-bold text-white'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40',
                )}
              >
                {chip.label}
              </button>
            )
          })}
        </div>

        <select
          aria-label="กรองตามสินค้า"
          value={productId}
          onChange={(e) => setParam('productId', e.target.value)}
          className="border-border bg-card h-8 rounded-xl border px-2.5 text-[13px] outline-none"
        >
          <option value="">ทุกสินค้า</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} · {p.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          aria-label="ตั้งแต่วันที่"
          value={from}
          onChange={(e) => setParam('from', e.target.value)}
          className="border-border bg-card h-8 rounded-xl border px-2.5 text-[13px] outline-none"
        />
        <span className="text-muted-foreground text-xs">ถึง</span>
        <input
          type="date"
          aria-label="ถึงวันที่"
          value={to}
          onChange={(e) => setParam('to', e.target.value)}
          className="border-border bg-card h-8 rounded-xl border px-2.5 text-[13px] outline-none"
        />
      </div>

      <a
        href={exportHref}
        className="border-primary/60 text-primary flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[13px] font-bold"
      >
        <Download className="size-4" strokeWidth={2} />
        Export CSV
      </a>
    </div>
  )
}
