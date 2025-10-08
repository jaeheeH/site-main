import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">로그인</h1>
        <p className="text-gray-500 dark:text-gray-400">
          계정에 로그인하세요
        </p>
      </div>

      <LoginForm />

      <div className="text-center text-sm">
        <span className="text-gray-500">계정이 없으신가요? </span>
        <Link 
          href="/signup" 
          className="text-primary font-medium hover:underline"
        >
          회원가입
        </Link>
      </div>
    </div>
  )
}