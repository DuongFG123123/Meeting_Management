"use client"
import { Clock, Users, MapPin, Video, ChevronRight } from "lucide-react"

interface Meeting {
  id: string
  title: string
  time: string
  duration: string
  attendees: number
  type: "video" | "hybrid"
  platform?: string
  color: string
}

const meetings: Meeting[] = [
  {
    id: "1",
    title: "Họp kế hoạch dự án Q4",
    time: "09:00 - 10:00",
    duration: "1 giờ",
    attendees: 8,
    type: "video",
    platform: "Zoom",
    color: "blue",
  },
  {
    id: "2",
    title: "Đánh giá tiến độ sprint",
    time: "10:30 - 11:30",
    duration: "1 giờ",
    attendees: 6,
    type: "video",
    platform: "Teams",
    color: "purple",
  },
  {
    id: "3",
    title: "Đàm phán với khách hàng",
    time: "14:00 - 15:00",
    duration: "1 giờ",
    attendees: 4,
    type: "hybrid",
    color: "orange",
  },
  {
    id: "4",
    title: "Buổi training cho nhân viên mới",
    time: "15:30 - 17:00",
    duration: "1.5 giờ",
    attendees: 12,
    type: "video",
    platform: "Google Meet",
    color: "green",
  },
]

export default function UpcomingMeetings() {
  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: {
        bg: "bg-blue-500/10 dark:bg-blue-500/20",
        text: "text-blue-700 dark:text-blue-400",
        border: "border-l-4 border-l-blue-500",
      },
      purple: {
        bg: "bg-purple-500/10 dark:bg-purple-500/20",
        text: "text-purple-700 dark:text-purple-400",
        border: "border-l-4 border-l-purple-500",
      },
      orange: {
        bg: "bg-orange-500/10 dark:bg-orange-500/20",
        text: "text-orange-700 dark:text-orange-400",
        border: "border-l-4 border-l-orange-500",
      },
      green: {
        bg: "bg-green-500/10 dark:bg-green-500/20",
        text: "text-green-700 dark:text-green-400",
        border: "border-l-4 border-l-green-500",
      },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Cuộc họp sắp tới</h2>
            <p className="text-sm text-muted-foreground">Hôm nay - {new Date().toLocaleDateString("vi-VN")}</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg text-primary hover:bg-primary/10 px-3 py-2 transition text-sm font-medium">
            Xem tất cả
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Meetings List */}
      <div className="divide-y divide-border">
        {meetings.map((meeting) => {
          const colorClasses = getColorClasses(meeting.color)
          return (
            <div
              key={meeting.id}
              className={`group relative overflow-hidden ${colorClasses.bg} hover:bg-opacity-75 p-4 sm:p-6 transition-colors cursor-pointer ${colorClasses.border}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-base mb-3">{meeting.title}</h3>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock size={16} />
                      {meeting.time}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users size={16} />
                      {meeting.attendees} người
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {meeting.platform && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs font-medium text-foreground border border-border">
                        <Video size={12} />
                        {meeting.platform}
                      </span>
                    )}
                    {meeting.type === "hybrid" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs font-medium text-foreground border border-border">
                        <MapPin size={12} />
                        Hybrid
                      </span>
                    )}
                  </div>
                </div>

                <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-muted px-6 py-4">
        <button className="w-full rounded-lg border border-border bg-card py-2.5 text-sm font-medium text-foreground hover:bg-muted transition">
          + Thêm cuộc họp mới
        </button>
      </div>
    </div>
  )
}
