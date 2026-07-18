'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut, useSession } from '@/lib/auth-client'
import { getInitial } from '@/lib/utils'

export function UserMenu() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    router.push('/login')
    router.refresh()
  }

  if (isPending || !session) {
    return <div className="bg-muted size-[34px] shrink-0 rounded-full" />
  }

  const { name, email } = session.user

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="เมนูผู้ใช้งาน"
        className="bg-primary focus-visible:ring-ring/50 flex size-[34px] shrink-0 cursor-pointer items-center justify-center rounded-full text-[13.5px] font-bold text-white outline-none focus-visible:ring-3"
      >
        {getInitial(name, email)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        <div className="flex flex-col gap-0.5 px-1.5 py-1.5">
          <span className="truncate text-sm font-medium">{name}</span>
          <span className="text-muted-foreground truncate text-xs">
            {email}
          </span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={signingOut}
          onClick={handleSignOut}
        >
          <LogOut />
          {signingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
