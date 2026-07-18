'use client'

import Link from 'next/link'
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
import { authClient } from '@/lib/auth-client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await authClient.requestPasswordReset({
      email,
      redirectTo: '/reset-password',
    })

    setLoading(false)

    if (authError) {
      setError(authError.message ?? 'ส่งลิงก์รีเซ็ตไม่สำเร็จ')
      return
    }

    setSent(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">ลืมรหัสผ่าน?</CardTitle>
        <CardDescription>กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <p className="text-sm">
            ส่งลิงก์รีเซ็ตรหัสผ่านไปที่{' '}
            <span className="font-medium">{email}</span> แล้ว
            กรุณาตรวจสอบอีเมลของคุณ
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

            {error ? (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            ) : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ต'}
            </Button>
          </form>
        )}

        <p className="text-muted-foreground mt-4 text-center text-sm">
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            กลับไปเข้าสู่ระบบ
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
