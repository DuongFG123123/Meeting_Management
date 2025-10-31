"use client"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  subtext: string
  trend?: string
  trendPositive?: boolean
}

export default function StatCard({ icon: Icon, label, value, subtext, trend, trendPositive }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        {/* Icon */}
        <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3">
          <Icon className="text-blue-600" size={24} />
        </div>

        {/* Content */}
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{subtext}</p>
        </div>

        {/* Trend */}
        {trend && (
          <p className={`mt-3 text-xs font-medium ${trendPositive ? "text-green-600" : "text-slate-500"}`}>
            {trendPositive && "↑ "} {trend}
          </p>
        )}
      </div>
    </div>
  )
}
