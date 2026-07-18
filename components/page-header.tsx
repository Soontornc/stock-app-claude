type Props = {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-extrabold tracking-tight lg:text-2xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-muted-foreground mt-0.5 truncate text-sm">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
