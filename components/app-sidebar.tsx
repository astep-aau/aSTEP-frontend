"use client"

import { Users, Home, BookText, Clock, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Group 6",
    url: "/group6",
    icon: Users,
  },
  {
    title: "Time Series",
    url: "/time-series",
    icon: Users,
  },
]

const timeTravelItems = [
  {
    title: "cs-25-sw-5-03",
    url: "/cs-25-sw-5-03",
  },
  {
    title: "cs-25-sw-5-11",
    url: "/cs-25-sw-5-11",
  },
]

export function AppSidebar() {
  const [isTimeTravelOpen, setIsTimeTravelOpen] = useState(false)

  // Load the state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('timeTravelDropdownOpen')
    if (savedState !== null) {
      setIsTimeTravelOpen(savedState === 'true')
    }
  }, [])

  // Save the state to localStorage whenever it changes
  const toggleTimeTravelOpen = () => {
    const newState = !isTimeTravelOpen
    setIsTimeTravelOpen(newState)
    localStorage.setItem('timeTravelDropdownOpen', String(newState))
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={toggleTimeTravelOpen}
                  className="cursor-pointer"
                >
                  <Clock />
                  <span>Time Travel Estimation</span>
                  <ChevronDown className={`ml-auto transition-transform ${isTimeTravelOpen ? 'rotate-180' : ''}`} />
                </SidebarMenuButton>
                {isTimeTravelOpen && (
                  <SidebarMenuSub>
                    {timeTravelItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={item.url}>
                            <span>{item.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/docs">
                    <BookText />
                    <span>aSTEP Docs</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
