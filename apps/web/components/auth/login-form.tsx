'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/shared/api/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // 에러 메시지 초기화
    if (error) setError(null)
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return false
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식이 아닙니다.')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      // Supabase Auth로 로그인
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      if (!data.user) {
        throw new Error('로그인에 실패했습니다.')
      }

      // last_login_at 업데이트
      const { error: updateError } = await supabase
        .from('users')
        .update({
          last_login_at: new Date().toISOString(),
        })
        .eq('id', data.user.id)

      if (updateError) {
        console.error('last_login_at 업데이트 오류:', updateError)
        // last_login_at 업데이트 실패는 치명적이지 않으므로 계속 진행
      }

      // 사용자 정보 가져오기
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (userError) throw userError

      // 로그인 성공 - 역할에 따라 리다이렉트
      if (userData.role === 'admin') {
        window.location.href = '/admin'  // ← 이렇게 변경
      } else {
        router.push('/')
      }

    } catch (err: any) {
      console.error('로그인 오류:', err)
      
      // 에러 메시지 사용자 친화적으로 변경
      if (err.message.includes('Invalid login credentials')) {
        setError('이메일 또는 비밀번호가 일치하지 않습니다.')
      } else if (err.message.includes('Email not confirmed')) {
        setError('이메일 인증이 필요합니다. 인증 메일을 확인해주세요.')
      } else {
        setError(err.message || '로그인 중 오류가 발생했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>
          이메일과 비밀번호를 입력하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
              autoComplete="current-password"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}