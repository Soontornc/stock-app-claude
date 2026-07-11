'use client'

import { useTransition } from 'react'
import { deleteProduct } from '@/app/products/actions'
import { Button } from '@/components/ui/button'

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
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      onClick={handleDelete}
      disabled={pending}
    >
      {pending ? 'กำลังลบ…' : 'ลบ'}
    </Button>
  )
}
