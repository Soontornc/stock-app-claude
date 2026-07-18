import type { Metadata } from 'next'
import { Anuphan, Inter } from 'next/font/google'
import Script from 'next/script'
import { AppShell } from '@/components/app-shell'
import { prisma } from '@/lib/prisma'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const anuphan = Anuphan({
  variable: '--font-anuphan',
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'StockApp — ระบบคลังสินค้า',
  description: 'ระบบคลังสินค้าเบิกจ่ายสำหรับใช้งานภายในองค์กร',
}

// Low-stock count must reflect live inventory on every request, so this
// layout can't be statically prerendered (it would also fail at build time
// with no reachable DB, e.g. inside a Docker build stage).
export const dynamic = 'force-dynamic'

const noFlashScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const products = await prisma.product.findMany({
    select: { quantity: true, reorderPoint: true },
  })
  const lowStockCount = products.filter(
    (p) => p.quantity <= p.reorderPoint,
  ).length

  return (
    <html
      lang="th"
      className={`${inter.variable} ${anuphan.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="no-flash-theme" strategy="beforeInteractive">
          {noFlashScript}
        </Script>
      </head>
      <body className="flex h-full min-h-screen flex-col">
        <AppShell lowStockCount={lowStockCount}>{children}</AppShell>
      </body>
    </html>
  )
}
