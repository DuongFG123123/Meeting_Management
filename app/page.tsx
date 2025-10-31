"use client"
import { ThemeProvider } from "@/components/theme-provider"
import OverviewPage from "@/components/overview-page"

export default function Home() {
  return (
    <ThemeProvider>
      <main className="min-h-screen bg-background">
        <OverviewPage />
      </main>
    </ThemeProvider>
  )
}
