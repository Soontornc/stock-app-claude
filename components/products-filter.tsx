'use client'

import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  categories: string[]
  q: string
  category: string
}

export function ProductsFilter({ categories, q, category }: Props) {
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

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setParam('q', String(formData.get('q') ?? '').trim())
  }

  const chips = ['ทั้งหมด', ...categories]

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form onSubmit={handleSearch} className="relative w-full max-w-[280px]">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <input
          name="q"
          defaultValue={q}
          placeholder="ค้นหาชื่อสินค้าหรือ SKU"
          className="border-border bg-card focus-visible:border-ring w-full rounded-xl border py-2 pr-3 pl-9 text-[13.5px] outline-none"
        />
      </form>

      <div className="flex flex-wrap gap-2">
        {chips.map((c) => {
          const active = c === 'ทั้งหมด' ? category === '' : category === c
          return (
            <button
              key={c}
              type="button"
              onClick={() => setParam('category', c === 'ทั้งหมด' ? '' : c)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors',
                active
                  ? 'bg-primary border-primary font-bold text-white'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40',
              )}
            >
              {c}
            </button>
          )
        })}
      </div>
    </div>
  )
}
