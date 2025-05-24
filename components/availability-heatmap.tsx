"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar } from "lucide-react"
import { type Language, useTranslation, formatDate } from "@/lib/i18n"

interface Participant {
  name: string
  availableDates: string[]
}

interface AvailabilityHeatmapProps {
  participants: Participant[]
  language?: Language
}

export function AvailabilityHeatmap({ participants, language = "cs" }: AvailabilityHeatmapProps) {
  const t = useTranslation(language)

  // Calculate date availability counts
  const dateAvailability = new Map<string, { count: number; participants: string[] }>()

  participants.forEach((participant) => {
    participant.availableDates.forEach((date) => {
      if (!dateAvailability.has(date)) {
        dateAvailability.set(date, { count: 0, participants: [] })
      }
      const current = dateAvailability.get(date)!
      current.count += 1
      current.participants.push(participant.name)
    })
  })

  // Sort dates by availability count (descending) and then by date
  const sortedDates = Array.from(dateAvailability.entries()).sort((a, b) => {
    if (b[1].count !== a[1].count) {
      return b[1].count - a[1].count
    }
    return new Date(a[0]).getTime() - new Date(b[0]).getTime()
  })

  const maxCount = Math.max(...Array.from(dateAvailability.values()).map((v) => v.count), 1)
  const bestDates = sortedDates.filter(([_, data]) => data.count === maxCount)

  const getIntensityColor = (count: number) => {
    const intensity = count / maxCount
    if (intensity >= 0.8) return "bg-green-600 text-white"
    if (intensity >= 0.6) return "bg-green-500 text-white"
    if (intensity >= 0.4) return "bg-yellow-600 text-black"
    if (intensity >= 0.2) return "bg-orange-600 text-white"
    return "bg-red-600 text-white"
  }

  if (participants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>{t.availabilityOverview}</span>
          </CardTitle>
          <CardDescription>{t.availabilityDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>{t.noParticipantsYet}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Best Dates Summary */}
      {bestDates.length > 0 && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-500">
              <TrendingUp className="h-5 w-5" />
              <span>{t.bestDates}</span>
            </CardTitle>
            <CardDescription>
              {t.bestDatesDesc} ({maxCount} {language === "cs" ? "z" : "out of"} {participants.length} {t.people})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {bestDates.map(([date, data]) => (
                <Badge
                  key={date}
                  variant="outline"
                  className="bg-green-900/20 text-green-400 hover:bg-green-900/30 border-green-800"
                >
                  {formatDate(new Date(date), language)} ({data.count} {t.people})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Availability Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>{t.availabilityHeatmap}</span>
          </CardTitle>
          <CardDescription>{t.visualOverview}</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedDates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t.noDatesSelected}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedDates.map(([date, data]) => (
                <div key={date} className="flex items-center space-x-4">
                  <div className="w-32 text-sm font-medium">{formatDate(new Date(date), language)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getIntensityColor(data.count)}`}>
                        {data.count} / {participants.length}
                      </div>
                      <div className="text-sm text-muted-foreground">{data.participants.join(", ")}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t.availabilityScale}</span>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span>{t.low}</span>
                <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                <span>{t.medium}</span>
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span>{t.high}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
