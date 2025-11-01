"use client"
import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import OverviewPage from "@/components/overview-page"
import AuthForm from "@/components/auth-form"
import { useAuth } from "@/hooks/use-auth"

export default function Home() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    const accountsStr = localStorage.getItem("accounts")
    const accounts = accountsStr ? JSON.parse(accountsStr) : []

    // Check if admin account exists
    const adminExists = accounts.some((acc: any) => acc.role === "admin")

    if (!adminExists) {
      // Create default admin account
      const adminAccount = {
        id: "admin-001",
        email: "admin@example.com",
        password: "admin123",
        fullName: "Administrator",
        role: "admin",
        createdAt: new Date().toISOString(),
      }
      accounts.push(adminAccount)
      localStorage.setItem("accounts", JSON.stringify(accounts))
    }
  }, [])

  if (isLoading) {
    return (
      <ThemeProvider>
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary"></div>
            <p className="mt-4 text-muted-foreground">Đang tải...</p>
          </div>
        </main>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      {user ? (
        <main className="min-h-screen bg-background">
          <OverviewPage user={user} />
        </main>
      ) : (
        <AuthForm />
      )}
    </ThemeProvider>
  )
}