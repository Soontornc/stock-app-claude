'use client'

import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'
import { deleteProduct } from '@/app/products/actions'

type Props = {
  id: string
  name: string
}

export function DeleteProductButton({ id, name }: Props) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (
      !confirm(
        `ลบสินค้า "${name}" ?\nประวัติการเคลื่อนไหวของสินค้านี้จะถูกลบด้วย`,
      )
    ) {
      return
    }
    startTransition(async () => {
      await deleteProduct(id)
    })
  }

  return (
    <button
      type="button"
      aria-label="ลบ"
      onClick={handleDelete}
      disabled={pending}
      className="bg-status-out-bg text-status-out flex size-8 items-center justify-center rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
    >
      <Trash2 className="size-3.5" strokeWidth={2} />
    </button>
  )
}
