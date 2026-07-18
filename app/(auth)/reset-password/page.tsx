'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
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

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await authClient.resetPassword({
      newPassword,
      token,
    })

    if (authError) {
      setError(authError.message ?? 'รีเซ็ตรหัสผ่านไม่สำเร็จ')
      setLoading(false)
      return
    }

    router.push('/login')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">ตั้งรหัสผ่านใหม่</CardTitle>
        <CardDescription>กรอกรหัสผ่านใหม่ของคุณ</CardDescription>
      </CardHeader>
      <CardContent>
        {!token ? (
          <p role="alert" className="text-destructive text-sm">
            ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่อีกครั้ง
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">
                รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)
              </Label>
              <Input
                id="newPassword"
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            {error ? (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            ) : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'กำลังบันทึก...' : 'ตั้งรหัสผ่านใหม่'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
