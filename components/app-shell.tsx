'use client'

import { Menu, Package } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { SidebarNav } from '@/components/sidebar-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/user-menu'
import { PUBLIC_AUTH_PATHS } from '@/lib/auth-paths'
import { cn } from '@/lib/utils'

type Props = {
  children: React.ReactNode
  lowStockCount: number
}

export function AppShell({ children, lowStockCount }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  if (PUBLIC_AUTH_PATHS.includes(pathname)) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen w-full">
      {open ? (
        <div
          className="fixed inset-0 z-20 bg-black/45 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          'bg-sidebar fixed inset-y-0 left-0 z-30 w-64 p-3.5 transition-transform duration-200 ease-out lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarNav
          lowStockCount={lowStockCount}
          onNavigate={() => setOpen(false)}
        />
      </aside>

      <aside className="bg-sidebar hidden w-64 shrink-0 p-3.5 lg:flex lg:flex-col">
        <SidebarNav lowStockCount={lowStockCount} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border flex items-center gap-3 border-b px-4 py-3 lg:px-9">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="เปิดเมนู"
            className="text-foreground p-1 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex items-center gap-2 lg:hidden">
            <Package className="text-primary size-4.5" strokeWidth={2} />
            <span className="text-sm font-bold">Genius Stock</span>
          </div>
          <div className="flex-1" />
          <ThemeToggle />
          <UserMenu />
        </header>
        <main className="flex-1 p-4 lg:p-9">{children}</main>
      </div>
    </div>
  )
}
