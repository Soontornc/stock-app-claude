// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StockBadge } from '@/components/stock-badge'

describe('<StockBadge />', () => {
  it('ต้องแสดงป้าย "หมด" เมื่อ quantity เป็น 0', () => {
    // arrange
    // act
    render(<StockBadge quantity={0} reorderPoint={5} />)

    // assert
    expect(screen.getByText('หมด')).toBeInTheDocument()
  })

  it('ต้องแสดงป้าย "ใกล้หมด" เมื่อ quantity ต่ำกว่าหรือเท่ากับ reorderPoint', () => {
    render(<StockBadge quantity={5} reorderPoint={5} />)

    expect(screen.getByText('ใกล้หมด')).toBeInTheDocument()
  })

  it('ต้องแสดงป้าย "ปกติ" เมื่อ quantity มากกว่า reorderPoint', () => {
    render(<StockBadge quantity={20} reorderPoint={5} />)

    expect(screen.getByText('ปกติ')).toBeInTheDocument()
  })
})
