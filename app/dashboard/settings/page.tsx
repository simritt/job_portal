import { getSession } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ThemeToggle from "@/components/settings/ThemeToggle"
import DeleteAccount from "@/components/settings/DeleteAccount"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium">{session.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{session.email}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Role</span>
            <span className="text-sm font-medium">
              {session.role.charAt(0).toUpperCase() + session.role.slice(1).toLowerCase()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-sm flex gap-2">Theme</span>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteAccount />
        </CardContent>
      </Card>
    </div>
  )
}
