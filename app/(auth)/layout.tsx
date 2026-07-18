import { Check, Package } from 'lucide-react'

const FEATURES = [
  'ติดตามสต็อกแบบ Real-time',
  'ป้องกันการเบิกเกินจำนวน',
  'รายงานการเคลื่อนไหวครบถ้วน',
]

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full">
      <div className="bg-background relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        <div
          className="text-foreground/15 pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <div className="bg-primary flex size-10 items-center justify-center rounded-xl">
            <Package
              className="text-primary-foreground size-5"
              strokeWidth={2}
            />
          </div>
          <div>
            <p className="font-heading text-base leading-tight font-bold">
              StockApp
            </p>
            <p className="text-muted-foreground text-xs">
              ระบบคลังสินค้าเบิกจ่าย
            </p>
          </div>
        </div>

        <div className="relative flex flex-col gap-6">
          <h1 className="font-heading text-4xl leading-tight font-bold text-balance">
            จัดการคลังสินค้า
            <br />
            อย่างชาญฉลาด
          </h1>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
            ระบบเบิกจ่ายสินค้าที่ออกแบบมาเพื่อประสิทธิภาพสูงสุดขององค์กรคุณ
          </p>
          <ul className="flex flex-col gap-2.5">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="text-primary size-4 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-muted-foreground relative text-xs">
          © 2026 StockApp · IT Genius Engineering
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
