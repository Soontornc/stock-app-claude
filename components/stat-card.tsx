import type { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  label: string
  value: string
  tag?: string
  tagClassName?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  tag,
  tagClassName,
}: Props) {
  return (
    <div className="border-border bg-card rounded-2xl border p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="bg-accent flex size-9 items-center justify-center rounded-[11px]">
          <Icon className="text-primary size-[19px]" strokeWidth={1.8} />
        </div>
        {tag ? (
          <span
            className={`text-xs font-bold ${tagClassName ?? 'text-muted-foreground'}`}
          >
            {tag}
          </span>
        ) : null}
      </div>
      <div className="text-muted-foreground mb-1 text-[12.5px]">{label}</div>
      <div className="text-2xl font-extrabold">{value}</div>
    </div>
  )
}
