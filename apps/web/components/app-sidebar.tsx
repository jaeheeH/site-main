"use client"

import * as React from "react"
import {
  LayoutDashboardIcon,
  UsersIcon,
  FileTextIcon,
  SettingsIcon,
  ShieldIcon,
  BarChart3Icon,
  ActivityIcon,
  UserCogIcon,
  HistoryIcon,
  MessageSquareIcon,
  FlagIcon,
  BellIcon,
  SlidersIcon,
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
    navMain: [
      {
        title: "대시보드",
        url: "/admin",
        icon: LayoutDashboardIcon,
        isActive: true,
        items: [
          {
            title: "전체 통계",
            url: "/admin",
          },
          {
            title: "사용자 통계",
            url: "/admin/stats/users",
          },
          {
            title: "활동 통계",
            url: "/admin/stats/activity",
          },
        ],
      },
      {
        title: "사용자 관리",
        url: "/admin/users",
        icon: UsersIcon,
        items: [
          {
            title: "전체 사용자",
            url: "/admin/users",
          },
          {
            title: "역할 관리",
            url: "/admin/users/roles",
          },
          {
            title: "활동 로그",
            url: "/admin/users/logs",
          },
        ],
      },
      {
        title: "게시글 관리",
        url: "/admin/posts",
        icon: FileTextIcon,
        items: [
          {
            title: "전체 게시글",
            url: "/admin/posts",
          },
          {
            title: "댓글 관리",
            url: "/admin/posts/comments",
          },
          {
            title: "신고 관리",
            url: "/admin/posts/reports",
          },
        ],
      },
      {
        title: "시스템 설정",
        url: "/admin/settings",
        icon: SettingsIcon,
        items: [
          {
            title: "일반 설정",
            url: "/admin/settings",
          },
          {
            title: "알림 설정",
            url: "/admin/settings/notifications",
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
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}