'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/lib/auth-client'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await signUp.email({ name, email, password })

    if (authError) {
      setError(authError.message ?? 'สมัครสมาชิกไม่สำเร็จ')
      setLoading(false)
      return
    }

    router.push('/login')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">สมัครสมาชิก</CardTitle>
        <CardDescription>
          สร้างบัญชีใหม่เพื่อเริ่มใช้งาน StockApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">รหัสผ่าน (อย่างน้อย 8 ตัว)</Label>
            <Input
              id="password"
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error ? (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </Button>
        </form>

        <p className="text-muted-foreground mt-4 text-center text-sm">
          มีบัญชีแล้ว?{' '}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
