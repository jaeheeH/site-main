// components/nav-main.tsx
"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

interface MenuItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

interface FixedMenuItem {
  title: string
  url?: string
  icon?: LucideIcon
  onClick?: () => void
}

interface MenuGroup {
  label: string
  items: MenuItem[]
  fixedItems?: FixedMenuItem[]
}

export function NavMain({
  groups,
}: {
  groups: MenuGroup[]
}) {
  return (
    <>
      {groups.map((group, index) => (
        <SidebarGroup key={`${group.label}-${index}`}>
          {/* 고정 메뉴 (있는 경우만) */}
          {group.fixedItems && group.fixedItems.length > 0 && (
            <SidebarMenu>
              {group.fixedItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild={!!item.url}
                    onClick={item.onClick}
                  >
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.icon && <item.icon className="h-5 w-5" />}
                        <span>{item.title}</span>
                      </a>
                    ) : (
                      <>
                        {item.icon && <item.icon className="h-5 w-5" />}
                        <span>{item.title}</span>
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}

          {/* 그룹 라벨 */}
          {group.label && (
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          )}
          {/* 일반 메뉴 */}
          <SidebarMenu>
            {group.items.map((item) => {
              // 서브메뉴가 있는 경우
              if (item.items && item.items.length > 0) {
                return (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={item.isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <a href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              }

              // 서브메뉴가 없는 경우 - 바로 링크
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}

// 타입 export (다른 파일에서 사용 가능)
export type { MenuItem, FixedMenuItem, MenuGroup }