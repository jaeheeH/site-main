// components/app-sidebar.tsx
"use client"

import * as React from "react"
import {
  LayoutDashboardIcon,
  UsersIcon,
  FileTextIcon,
  SettingsIcon,
  Settings,
  ShieldIcon,
  SquareArrowOutUpRight,
  Bell,
  LayoutDashboard,
  BarChart3,
  Users,
  FileText,
  Image,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { title } from "process"
import { link } from "fs"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    email: string
    username?: string | null
    full_name?: string | null
    avatar_url?: string | null
    role: string
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const data = {
    user: {
      name: user.full_name || user.username || "Admin",
      email: user.email,
      avatar: user.avatar_url || "/avatars/default.jpg",
    },
    menuGroups: [
      // ========== 고정 메뉴 (그룹 없음) ==========
      {
        label: "", // 라벨 없음
        items: [
          {
            title: "알림",
            url: "/admin/notifications",
            icon: Bell,
          },
          {
            title: "사이트 바로가기",
            url: "/",
            icon: SquareArrowOutUpRight,
          },
        ],
      },
      
      // ========== 그룹 1: 사이트 관리 ==========
      {
        label: "사이트 관리",
        items: [
          {
            title: "대시보드",
            url: "/admin/",
            icon: LayoutDashboard,
          },
          {
            title: "사용자 관리",
            url: "/admin/users",
            icon: Users,
          },
          {
            title: "통계",
            icon: BarChart3,
            items: [
              {
                title: "통계 홈",
                url: "/admin/stats",
              },
              {
                title: "방문자 분석",
                url: "/admin/stats/visitor",
              },
              {
                title: "검색 유입",
                url: "/admin/stats/search",
              },
              {
                title: "사용자 통계",
                url: "/admin/stats/users",
              },
              {
                title: "컨텐츠 통계",
                url: "/admin/stats/content",
              },
            ],
          },
          {
            title: "컨텐츠 관리",
            icon: FileText,
            items: [
              {
                title: "게시판 관리",
                url: "/admin/content/board",
              },
              {
                title: "페이지 관리",
                url: "/admin/content/pages",
              },
              {
                title: "블로그",
                url: "/admin/content/blog",
              },
              {
                title: "갤러리",
                url: "/admin/content/gallery",
              },
              {
                title: "매거진",
                url: "/admin/content/magazine",
              },
            ],
          },
          {
            title: "미디어",
            icon: Image,
            items: [
              {
                title: "미디어 라이브러리",
                url: "/admin/media/library",
              },
              {
                title: "파일 관리",
                url: "/admin/media/files",
              },
              {
                title: "지도/위치",
                url: "/admin/media/location",
              },
            ],
          },
          {
            title: "환경설정",
            icon: Settings,
            items: [
              {
                title: "일반 설정",
                url: "/admin/settings/general",
              },
              {
                title: "SEO 설정",
                url: "/admin/settings/seo",
              },
              {
                title: "팝업 관리",
                url: "/admin/settings/popup",
              },
              {
                title: "배너 관리",
                url: "/admin/settings/banner",
              },
              {
                title: "보안 설정",
                url: "/admin/settings/security",
              },
              {
                title: "알림 설정",
                url: "/admin/settings/notification",
              },
              {
                title: "연동 관리",
                url: "/admin/settings/integration",
              },
              {
                title: "개발자 도구",
                url: "/admin/settings/developer",
              },
            ],
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "관리자 가이드",
        url: "/admin/help",
        icon: ShieldIcon,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/admin">
                <ShieldIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Admin Panel</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* 여러 그룹을 한 번에 전달 */}
        <NavMain groups={data.menuGroups} />
        
        {/* 보조 메뉴 */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}