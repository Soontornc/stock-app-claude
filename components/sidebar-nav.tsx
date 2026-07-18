'use client'

import {
  AlertTriangle,
  ChartLine,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  PackageMinus,
  PackagePlus,
  Settings,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { signOut } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/products', label: 'สินค้า', icon: Package },
  { href: '/stock-in', label: 'รับสินค้าเข้า', icon: PackagePlus },
  { href: '/stock-out', label: 'เบิกจ่ายสินค้า', icon: PackageMinus },
  { href: '/low-stock', label: 'สินค้าใกล้หมด', icon: AlertTriangle },
  { href: '/transactions', label: 'ประวัติการเคลื่อนไหว', icon: FileText },
]

const otherItems = [
  { href: '/reports', label: 'รายงาน', icon: ChartLine },
  { href: '/users', label: 'ผู้ใช้งาน', icon: Users },
  { href: '/settings', label: 'การตั้งค่า', icon: Settings },
]

const linkClass =
  'flex items-center gap-2.5 rounded-[11px] px-3.5 py-2.5 text-[13.5px] font-medium transition-colors'

type Props = {
  lowStockCount: number
  onNavigate?: () => void
}

export function SidebarNav({ lowStockCount, onNavigate }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    onNavigate?.()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-full flex-col gap-1">
      <div className="mb-6 flex items-center gap-2.5 px-1.5">
        <div className="from-primary to-primary flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br to-[color-mix(in_oklch,var(--primary),black_25%)]">
          <Package className="size-[19px] text-white" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-extrabold text-white">
            Genius Stock
          </div>
          <div className="truncate text-[10.5px] text-white/55">
            ระบบคงคลังสินค้า
          </div>
        </div>
      </div>

      <div className="px-1.5 pb-1.5 text-[10.5px] font-bold tracking-wide text-white/40">
        เมนูหลัก
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
          const Icon = item.icon
          const badge =
            item.href === '/low-stock' && lowStockCount > 0
              ? lowStockCount
              : null
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                linkClass,
                active
                  ? 'bg-primary font-bold text-white'
                  : 'text-white/85 hover:bg-white/[0.07]',
              )}
            >
              <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
              <span className="flex-1 truncate">{item.label}</span>
              {badge ? (
                <span className="bg-destructive rounded-full px-[7px] py-px text-[10.5px] font-bold text-white">
                  {badge}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="px-1.5 pt-5 pb-1.5 text-[10.5px] font-bold tracking-wide text-white/40">
        อื่น ๆ
      </div>
      <nav className="flex flex-col gap-1">
        {otherItems.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                linkClass,
                active
                  ? 'bg-primary font-bold text-white'
                  : 'text-white/85 hover:bg-white/[0.07]',
              )}
            >
              <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
              <span className="flex-1 truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className={cn(
            linkClass,
            'w-full text-white/85 hover:bg-white/[0.07] disabled:opacity-50',
          )}
        >
          <LogOut className="size-[18px] shrink-0" strokeWidth={1.8} />
          <span className="flex-1 truncate text-left">
            {signingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
          </span>
        </button>
      </div>
    </div>
  )
}
