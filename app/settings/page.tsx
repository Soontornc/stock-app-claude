'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
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
import { authClient, useSession } from '@/lib/auth-client'

export default function SettingsPage() {
  const { data: session, isPending } = useSession()

  return (
    <div className="max-w-xl space-y-6">
      <PageHeader title="การตั้งค่า" subtitle="จัดการข้อมูลบัญชีของคุณ" />

      {isPending || !session ? (
        <p className="text-muted-foreground text-sm">กำลังโหลด...</p>
      ) : (
        <>
          <ProfileForm name={session.user.name} email={session.user.email} />
          <PasswordForm />
        </>
      )}
    </div>
  )
}

function ProfileForm({
  name: initialName,
  email,
}: {
  name: string
  email: string
}) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const { error: authError } = await authClient.updateUser({ name })

    setLoading(false)

    if (authError) {
      setError(authError.message ?? 'บันทึกข้อมูลไม่สำเร็จ')
      return
    }

    setSuccess(true)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">ข้อมูลส่วนตัว</CardTitle>
        <CardDescription>ชื่อที่แสดงในระบบ</CardDescription>
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
            <Input id="email" value={email} disabled />
          </div>

          {error ? (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="text-status-ok text-sm">บันทึกข้อมูลแล้ว</p>
          ) : null}

          <Button type="submit" disabled={loading} className="w-fit">
            {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const { error: authError } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    })

    setLoading(false)

    if (authError) {
      setError(authError.message ?? 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setSuccess(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">เปลี่ยนรหัสผ่าน</CardTitle>
        <CardDescription>
          ต้องยืนยันรหัสผ่านปัจจุบันก่อนตั้งรหัสใหม่
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currentPassword">รหัสผ่านปัจจุบัน</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)</Label>
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
          {success ? (
            <p className="text-status-ok text-sm">เปลี่ยนรหัสผ่านแล้ว</p>
          ) : null}

          <Button type="submit" disabled={loading} className="w-fit">
            {loading ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
