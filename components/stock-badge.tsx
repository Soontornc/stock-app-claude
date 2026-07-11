import { badgeVariants } from '@/components/ui/badge'
import { getStockStatus, type StockStatus } from '@/lib/stock-status'
import { cn } from '@/lib/utils'

const styles: Record<StockStatus, { label: string; className: string }> = {
  out: {
    label: 'หมด',
    className: badgeVariants({ variant: 'destructive' }),
  },
  low: {
    label: 'ใกล้หมด',
    className: cn(
      badgeVariants({ variant: 'outline' }),
      'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400',
    ),
  },
  ok: {
    label: 'ปกติ',
    className: cn(
      badgeVariants({ variant: 'outline' }),
      'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    ),
  },
}

export function StockBadge({
  quantity,
  reorderPoint,
}: {
  quantity: number
  reorderPoint: number
}) {
  const status = getStockStatus(quantity, reorderPoint)
  const style = styles[status]
  return <span className={style.className}>{style.label}</span>
}
