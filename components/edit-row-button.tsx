import { Pencil } from 'lucide-react'
import Link from 'next/link'

export function EditRowButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="แก้ไข"
      className="bg-accent text-primary flex size-8 items-center justify-center rounded-lg transition-opacity hover:opacity-80"
    >
      <Pencil className="size-3.5" strokeWidth={2} />
    </Link>
  )
}
