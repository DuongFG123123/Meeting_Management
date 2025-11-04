
"use client"

import { Search } from "lucide-react"

interface SearchBoxProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
}

export default function SearchBox({ searchTerm, setSearchTerm }: SearchBoxProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
      <input
        type="text"
        placeholder="Tìm kiếm theo tên hoặc email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  )
}
