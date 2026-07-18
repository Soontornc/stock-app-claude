'use client'

import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'
import { deleteTransaction } from '@/app/transactions/actions'

export function DeleteTransactionButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('ลบรายการนี้และคืนยอดสต็อกให้สอดคล้อง?')) {
      return
    }
    startTransition(async () => {
      const result = await deleteTransaction(id)
      if (result.error) {
        alert(result.error)
      }
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
