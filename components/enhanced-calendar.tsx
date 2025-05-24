"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type Language, useTranslation } from "@/lib/i18n"

interface Participant {
  name: string
  availableDates: string[]
}

interface EnhancedCalendarProps {
  selectedDates: Date[]
  onDatesChange: (dates: Date[]) => void
  participants?: Participant[]
  currentParticipant?: string
  language?: Language
  mode?: "single" | "multiple"
}

export function EnhancedCalendar({
  selectedDates,
  onDatesChange,
  participants = [],
  currentParticipant = "",
  language = "cs",
  mode = "multiple",
}: EnhancedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const t = useTranslation(language)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get the first day of the current month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  // Get the first day of the week for the calendar grid
  const firstDayOfWeek = new Date(firstDayOfMonth)
  const dayOfWeek = firstDayOfMonth.getDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Make Monday the first day
  firstDayOfWeek.setDate(firstDayOfMonth.getDate() - mondayOffset)

  // Generate calendar days
  const calendarDays = []
  const currentCalendarDate = new Date(firstDayOfWeek)

  for (let i = 0; i < 42; i++) {
    // 6 weeks * 7 days
    calendarDays.push(new Date(currentCalendarDate))
    currentCalendarDate.setDate(currentCalendarDate.getDate() + 1)
  }

  const isDateSelected = (date: Date) => {
    return selectedDates.some((selectedDate) => selectedDate.toDateString() === date.toDateString())
  }

  const getParticipantsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return participants.filter((participant) => participant.availableDates.includes(dateString))
  }

  const getDateStyle = (date: Date) => {
    const isSelected = isDateSelected(date)
    const participantsOnDate = getParticipantsForDate(date)
    const isCurrentMonth = date.getMonth() === currentDate.getMonth()
    const isPast = date < today
    const isToday = date.toDateString() === today.toDateString()

    // Base classes
    let classes = "relative h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 "

    // Past dates
    if (isPast) {
      classes += "text-muted-foreground cursor-not-allowed opacity-50 "
      return classes
    }

    // Current month vs other months
    if (!isCurrentMonth) {
      classes += "text-muted-foreground opacity-60 "
    }

    // Today
    if (isToday) {
      classes += "ring-2 ring-primary ring-offset-2 "
    }

    // Selected by current user
    if (isSelected) {
      classes += "bg-primary text-primary-foreground shadow-lg scale-105 "
    }
    // Has other participants but not selected by current user
    else if (participantsOnDate.length > 0) {
      const intensity = Math.min(participantsOnDate.length / Math.max(participants.length, 1), 1)
      if (intensity >= 0.7) {
        classes +=
          "bg-green-100 text-green-800 border-2 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 "
      } else if (intensity >= 0.4) {
        classes +=
          "bg-yellow-100 text-yellow-800 border-2 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700 "
      } else {
        classes +=
          "bg-orange-100 text-orange-800 border-2 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700 "
      }
    }
    // Default state
    else {
      classes += "hover:bg-accent hover:text-accent-foreground border-2 border-transparent "
    }

    return classes
  }

  const handleDateClick = (date: Date) => {
    const isPast = date < today
    if (isPast) return

    const isSelected = isDateSelected(date)

    if (mode === "single") {
      onDatesChange(isSelected ? [] : [date])
    } else {
      if (isSelected) {
        onDatesChange(selectedDates.filter((d) => d.toDateString() !== date.toDateString()))
      } else {
        onDatesChange([...selectedDates, date])
      }
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(currentDate.getMonth() - 1)
    } else {
      newDate.setMonth(currentDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const monthNames = [
    t.january,
    t.february,
    t.march,
    t.april,
    t.may,
    t.june,
    t.july,
    t.august,
    t.september,
    t.october,
    t.november,
    t.december,
  ]

  const dayNames = [t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday, t.sunday]

  return (
    <div className="p-4 border rounded-lg bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">
            {day.slice(0, 2)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const participantsOnDate = getParticipantsForDate(date)
          const isSelected = isDateSelected(date)

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              className={cn(getDateStyle(date))}
              disabled={date < today}
            >
              <span className="relative z-10">{date.getDate()}</span>

              {/* Participant indicators */}
              {participantsOnDate.length > 0 && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                  {participantsOnDate.slice(0, 3).map((participant, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        participant.name === currentParticipant
                          ? "bg-primary"
                          : isSelected
                            ? "bg-primary-foreground"
                            : "bg-current opacity-70",
                      )}
                      title={participant.name}
                    />
                  ))}
                  {participantsOnDate.length > 3 && (
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isSelected ? "bg-primary-foreground" : "bg-current opacity-70",
                      )}
                      title={`+${participantsOnDate.length - 3} more`}
                    />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          {language === "cs" ? "Legenda:" : "Legend:"}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary rounded border"></div>
            <span>{language === "cs" ? "Váš výběr" : "Your selection"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded dark:bg-green-900/30 dark:border-green-700"></div>
            <span>{language === "cs" ? "Vysoká obsazenost" : "High occupancy"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded dark:bg-yellow-900/30 dark:border-yellow-700"></div>
            <span>{language === "cs" ? "Střední obsazenost" : "Medium occupancy"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded dark:bg-orange-900/30 dark:border-orange-700"></div>
            <span>{language === "cs" ? "Nízká obsazenost" : "Low occupancy"}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {language === "cs"
            ? "Tečky pod datem ukazují účastníky dostupné v daný den"
            : "Dots below dates show participants available on that day"}
        </div>
      </div>
    </div>
  )
}
