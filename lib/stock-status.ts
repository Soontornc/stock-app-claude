export type StockStatus = 'out' | 'low' | 'ok'

// สถานะสต็อก (F1/F4): หมด -> ใกล้หมด -> ปกติ
export function getStockStatus(
  quantity: number,
  reorderPoint: number,
): StockStatus {
  if (quantity <= 0) {
    return 'out'
  }
  if (quantity <= reorderPoint) {
    return 'low'
  }
  return 'ok'
}
