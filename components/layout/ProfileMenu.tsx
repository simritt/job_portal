"use client"

import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User } from "lucide-react"
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Settings } from "lucide-react"

// export default function ProfileMenu() {
export default function ProfileMenu(
  { name, role }: { name?: string; role?: "APPLICANT" | "RECRUITER" }) {
  const initials = name
  ?.split(" ")
  .map(word => word[0])
  .join("")
  .toUpperCase()

  const profileHref =
  role === "RECRUITER"
    ? "/dashboard/recruiter/profile"
    : "/dashboard/applicant/profile"


  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="cursor-pointer">
          <AvatarFallback className="text-xs font-medium">
            {initials ?? <User size={18} />}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
  <DropdownMenuItem asChild>
    <Link
      href={profileHref} 
      className="flex items-center gap-2"
    >
      <User className="h-4 w-4 opacity-80" />
      My Profile
    </Link>
  </DropdownMenuItem>

  <DropdownMenuItem asChild>
    <Link
      href="/dashboard/settings"
      className="flex items-center gap-2"
    >
      <Settings className="h-4 w-4 opacity-80" />
      Settings
    </Link>
  </DropdownMenuItem>

  <DropdownMenuSeparator />

  <DropdownMenuItem
    className="flex items-center gap-2 text-red-600 focus:text-red-600"
    onClick={handleLogout}
  >
    <LogOut className="h-4 w-4 opacity-80" />
    Logout
  </DropdownMenuItem>
</DropdownMenuContent>
    </DropdownMenu>
  )
}
