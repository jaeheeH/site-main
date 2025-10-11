'use client'

import { useState, useEffect } from 'react'
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
]

export function SignUpForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  
  // 닉네임 중복 체크 상태
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
  })

  // 닉네임 중복 체크 함수
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 2) {
      setUsernameAvailable(null)
      return
    }

    setIsCheckingUsername(true)
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()

      if (error && error.code === 'PGRST116') {
        // 데이터가 없음 = 사용 가능
        setUsernameAvailable(true)
      } else if (data) {
        // 데이터가 있음 = 이미 사용 중
        setUsernameAvailable(false)
      }
    } catch (err) {
      console.error('닉네임 중복 체크 오류:', err)
    } finally {
      setIsCheckingUsername(false)
    }
  }

  // 닉네임 입력 시 debounce를 적용한 중복 체크
  useEffect(() => {
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout)
    }

    if (formData.username) {
      const timeout = setTimeout(() => {
        checkUsernameAvailability(formData.username)
      }, 500) // 500ms 후에 체크

      setUsernameCheckTimeout(timeout)
    } else {
      setUsernameAvailable(null)
    }

    return () => {
      if (usernameCheckTimeout) {
        clearTimeout(usernameCheckTimeout)
      }
    }
  }, [formData.username])

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

    // 닉네임 중복 체크
    if (usernameAvailable === false) {
      setError('이미 사용 중인 닉네임입니다.')
      return false
    }

    if (usernameAvailable === null) {
      setError('닉네임 중복 확인이 필요합니다.')
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
      // 1. Supabase Auth로 회원가입 (metadata에 username, full_name 포함)
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

      // 트리거가 자동으로 users 테이블에 레코드를 생성합니다

      // 2. 성공 - 로그인 페이지로 이동
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
            <Label htmlFor="username">닉네임</Label>
            <div className="relative">
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="닉네임 (2자 이상)"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                required
                className={
                  formData.username.length >= 2
                    ? usernameAvailable === true
                      ? 'border-green-500'
                      : usernameAvailable === false
                      ? 'border-red-500'
                      : ''
                    : ''
                }
              />
              {isCheckingUsername && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
            
            {/* 닉네임 중복 체크 피드백 */}
            {formData.username.length >= 2 && !isCheckingUsername && usernameAvailable !== null && (
              <div className="flex items-center gap-2 text-sm mt-2">
                {usernameAvailable ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">
                      사용 가능한 닉네임입니다
                    </span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">
                      이미 사용 중인 닉네임입니다
                    </span>
                  </>
                )}
              </div>
            )}
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
            disabled={
              isLoading || 
              !isPasswordValid() || 
              !passwordMatch || 
              usernameAvailable !== true ||
              isCheckingUsername
            }
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