import { SignUpForm } from '@/components/auth/signup-form'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">회원가입</h1>
        <p className="text-gray-500 dark:text-gray-400">
          새 계정을 만들어 시작하세요
        </p>
      </div>

      <SignUpForm />

      <div className="text-center text-sm">
        <span className="text-gray-500">이미 계정이 있으신가요? </span>
        <Link 
          href="/login" 
          className="text-primary font-medium hover:underline"
        >
          로그인
        </Link>
      </div>
    </div>
  )
}