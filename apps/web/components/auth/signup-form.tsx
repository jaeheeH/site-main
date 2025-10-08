'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/shared/api/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Check, X } from 'lucide-react'

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  {
    label: '최소 8자 이상',
    test: (password) => password.length >= 8,
  },
  {
    label: '영문 대문자 포함',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: '영문 소문자 포함',
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: '숫자 포함',
    test: (password) => /\d/.test(password),
  },
  // 특수문자는 제거 (백엔드에서만 체크하거나 보너스로 처리)
]

export function SignUpForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // 에러 메시지 초기화
    if (error) setError(null)
  }

  // 비밀번호 요구사항 체크
  const getPasswordRequirementStatus = () => {
    return passwordRequirements.map((req) => ({
      ...req,
      satisfied: req.test(formData.password),
    }))
  }

  // 필수 비밀번호 조건 충족 여부
  const isPasswordValid = () => {
    // 모든 조건이 필수 (특수문자 제거됨)
    return passwordRequirements.every((req) => req.test(formData.password))
  }

  // 비밀번호 확인 일치 여부
  const isPasswordMatch = () => {
    if (!formData.confirmPassword) return null
    return formData.password === formData.confirmPassword
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.username || !formData.fullName) {
      setError('모든 필드를 입력해주세요.')
      return false
    }

    if (!isPasswordValid()) {
      setError('비밀번호가 필수 조건을 충족하지 않습니다.')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
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
      // 1. Supabase Auth로 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.fullName,
          }
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('회원가입에 실패했습니다.')
      }

      // 2. users 테이블 업데이트 (username, full_name 추가)
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: formData.username,
          full_name: formData.fullName,
        })
        .eq('id', authData.user.id)

      if (updateError) throw updateError

      // 3. 성공 - 로그인 페이지로 이동
      alert('회원가입이 완료되었습니다! 로그인해주세요.')
      router.push('/login')

    } catch (err: any) {
      console.error('회원가입 오류:', err)
      setError(err.message || '회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordMatch = isPasswordMatch()

  return (
    <Card>
      <CardHeader>
        <CardTitle>계정 정보</CardTitle>
        <CardDescription>
          아래 정보를 입력하여 새 계정을 만드세요.
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">사용자명</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">이름</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="홍길동"
              value={formData.fullName}
              onChange={handleChange}
              disabled={isLoading}
              required
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
              onFocus={() => setShowPasswordRequirements(true)}
              disabled={isLoading}
              required
            />
            
            {/* 비밀번호 요구사항 실시간 피드백 */}
            {showPasswordRequirements && formData.password && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  비밀번호 조건
                </p>
                {getPasswordRequirementStatus().map((req, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm"
                  >
                    {req.satisfied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={
                        req.satisfied
                          ? 'text-green-600'
                          : 'text-gray-500 dark:text-gray-400'
                      }
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
            
            {/* 비밀번호 일치 여부 피드백 */}
            {formData.confirmPassword && passwordMatch !== null && (
              <div className="flex items-center gap-2 text-sm mt-2">
                {passwordMatch ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">
                      비밀번호가 일치합니다
                    </span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">
                      비밀번호가 일치하지 않습니다
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !isPasswordValid() || !passwordMatch}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              '회원가입'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}