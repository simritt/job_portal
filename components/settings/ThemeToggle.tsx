"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Monitor } from "lucide-react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  async function handleThemeChange(
    newTheme: "light" | "dark" | "system"
  ) {
    // 1️⃣ update UI immediately
    setTheme(newTheme)

    // 2️⃣ persist to DB + cookie
    await fetch("/api/user/theme", {
      method: "PATCH",
      body: JSON.stringify({ theme: newTheme }),
    })
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={theme === "light" ? "default" : "outline"}
        onClick={() => handleThemeChange("light")}
        className="flex gap-2 items-center rounded-lg"
      >
        <Sun size={16} />
        Light
      </Button>

      <Button
        size="sm"
        variant={theme === "dark" ? "default" : "outline"}
        onClick={() => handleThemeChange("dark")}
        className="flex gap-2 items-center rounded-lg"
      >
        <Moon size={16} />
        Dark
      </Button>

      <Button
        size="sm"
        variant={theme === "system" ? "default" : "outline"}
        onClick={() => handleThemeChange("system")}
        className="flex gap-2 items-center rounded-lg"
      >
        <Monitor size={16} />
        System
      </Button>
    </div>
  )
}
