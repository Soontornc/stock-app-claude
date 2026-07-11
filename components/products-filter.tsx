'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
  categories: string[]
  q: string
  category: string
}

export function ProductsFilter({ categories, q, category }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

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

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          name="q"
          defaultValue={q}
          placeholder="ค้นหา SKU หรือชื่อสินค้า"
          className="w-64"
        />
        <Button type="submit" variant="outline" disabled={pending}>
          ค้นหา
        </Button>
      </form>

      <select
        aria-label="กรองตามหมวดหมู่"
        value={category || 'all'}
        onChange={(event) =>
          setParam(
            'category',
            event.target.value === 'all' ? '' : event.target.value,
          )
        }
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3"
      >
        <option value="all">ทุกหมวดหมู่</option>
        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  )
}
