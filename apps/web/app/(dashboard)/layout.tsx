'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/shared/api/supabaseClient"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 사용자 정보 확인
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (!authUser) {
          router.push('/login')
          return
        }

        // 사용자 role 확인
        const { data, error } = await supabase
          .from('users')
          .select('role, username, email, avatar_url, full_name, last_login_at')
          .eq('id', authUser.id)
          .single()

        if (!data || data.role !== 'admin') {
          router.push('/')
          return
        }

        // Throttle: 마지막 로그인이 5분 이상 지났으면 업데이트
        const lastLogin = data.last_login_at ? new Date(data.last_login_at) : null
        const now = new Date()
        const fiveMinutes = 5 * 60 * 1000 // 5분을 밀리초로

        if (!lastLogin || (now.getTime() - lastLogin.getTime()) >= fiveMinutes) {
          // 5분 이상 지났으면 last_login_at 업데이트
          const { error: updateError } = await supabase
            .from('users')
            .update({ last_login_at: now.toISOString() })
            .eq('id', authUser.id)

          if (updateError) {
            console.error('Failed to update last_login_at:', updateError)
          } else {
            console.log('✅ last_login_at updated')
          }
        } else {
          console.log('⏭️ Skipped update (last update was less than 5 minutes ago)')
        }

        setUser(authUser)
        setUserData(data)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user || !userData) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />
      <SidebarInset>
        <SiteHeader user={userData} />
        <div className="flex flex-1 flex-col gap-4 p-8 pt-0 py-4 md:gap-6 md:py-6"> 
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}