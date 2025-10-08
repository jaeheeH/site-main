'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/shared/api/supabaseClient"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersIcon, UserCheckIcon, UserPlusIcon, ActivityIcon } from "lucide-react"

interface Stats {
  totalUsers: number
  todayLogins: number
  weeklySignups: number
  activeUsers: number
}

interface RecentUser {
  id: string
  email: string
  username: string | null
  full_name: string | null
  role: string
  created_at: string
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    todayLogins: 0,
    weeklySignups: 0,
    activeUsers: 0,
  })
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)

        // 1. 전체 사용자 수
        const { count: totalUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })

        // 2. 오늘 로그인한 사용자 수
        const { count: todayLogins } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gte('last_login_at', today.toISOString())

        // 3. 이번 주 신규 가입자 수
        const { count: weeklySignups } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thisWeek.toISOString())

        // 4. 활성 사용자 수 (15분 이내 로그인)
        const { count: activeUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gte('last_login_at', fifteenMinutesAgo.toISOString())

        // 5. 최근 가입한 사용자 목록
        const { data: users } = await supabase
          .from('users')
          .select('id, email, username, full_name, role, created_at')
          .order('created_at', { ascending: false })
          .limit(5)

        setStats({
          totalUsers: totalUsers || 0,
          todayLogins: todayLogins || 0,
          weeklySignups: weeklySignups || 0,
          activeUsers: activeUsers || 0,
        })

        setRecentUsers(users || [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statsCards = [
    {
      title: "전체 사용자",
      value: stats.totalUsers,
      description: "등록된 총 사용자 수",
      icon: UsersIcon,
      color: "text-blue-600",
    },
    {
      title: "오늘 로그인",
      value: stats.todayLogins,
      description: "오늘 로그인한 사용자",
      icon: UserCheckIcon,
      color: "text-green-600",
    },
    {
      title: "이번 주 가입",
      value: stats.weeklySignups,
      description: "최근 7일간 신규 가입",
      icon: UserPlusIcon,
      color: "text-purple-600",
    },
    {
      title: "현재 활성",
      value: stats.activeUsers,
      description: "15분 이내 활동",
      icon: ActivityIcon,
      color: "text-orange-600",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">관리자 대시보드</h1>
        <p className="text-muted-foreground">
          시스템 통계 및 사용자 활동을 확인하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 최근 가입 사용자 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 가입 사용자</CardTitle>
          <CardDescription>
            최근에 가입한 사용자 목록입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentUsers && recentUsers.length > 0 ? (
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.full_name || user.username || '이름 없음'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {user.role}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              최근 가입한 사용자가 없습니다.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}