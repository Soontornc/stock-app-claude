import { getStockStatus, type StockStatus } from '@/lib/stock-status'

const styles: Record<StockStatus, { label: string; className: string }> = {
  out: {
    label: 'หมด',
    className: 'bg-status-out-bg text-status-out-fg',
  },
  low: {
    label: 'ใกล้หมด',
    className: 'bg-status-low-bg text-status-low-fg',
  },
  ok: {
    label: 'ปกติ',
    className: 'bg-status-ok-bg text-status-ok-fg',
  },
}

const dotColor: Record<StockStatus, string> = {
  out: 'bg-status-out',
  low: 'bg-status-low',
  ok: 'bg-status-ok',
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
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${style.className}`}
    >
      <span className={`size-1.5 rounded-full ${dotColor[status]}`} />
      {style.label}
    </span>
  )
}
