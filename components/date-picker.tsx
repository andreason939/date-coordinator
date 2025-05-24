"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Trash2, CalendarIcon } from "lucide-react"
import { type Language, useTranslation, formatDate } from "@/lib/i18n"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { EnhancedCalendar } from "@/components/enhanced-calendar"

interface Participant {
  name: string
  availableDates: string[]
}

interface DatePickerProps {
  selectedDates: Date[]
  onDatesChange: (dates: Date[]) => void
  participants?: Participant[]
  currentParticipant?: string
  language?: Language
  allowDelete?: boolean
}

export function DatePicker({
  selectedDates,
  onDatesChange,
  participants = [],
  currentParticipant = "",
  language = "cs",
  allowDelete = false,
}: DatePickerProps) {
  const t = useTranslation(language)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dateToDelete, setDateToDelete] = useState<Date | null>(null)

  const removeDate = (dateToRemove: Date) => {
    onDatesChange(selectedDates.filter((d) => d.toDateString() !== dateToRemove.toDateString()))
  }

  const handleDeleteClick = (date: Date) => {
    if (allowDelete) {
      setDateToDelete(date)
      setDeleteDialogOpen(true)
    } else {
      removeDate(date)
    }
  }

  const handleConfirmDelete = () => {
    if (dateToDelete) {
      removeDate(dateToDelete)
    }
  }

  const handleDeleteAll = () => {
    setDeleteDialogOpen(true)
    setDateToDelete(null)
  }

  const clearAllDates = () => {
    onDatesChange([])
  }

  return (
    <div className="space-y-4">
      <EnhancedCalendar
        selectedDates={selectedDates}
        onDatesChange={onDatesChange}
        participants={participants}
        currentParticipant={currentParticipant}
        language={language}
        mode="multiple"
      />

      {selectedDates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {t.selectedDates} ({selectedDates.length})
            </h4>
            {selectedDates.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-destructive"
                onClick={allowDelete ? handleDeleteAll : clearAllDates}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {t.deleteAll}
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedDates
              .sort((a, b) => a.getTime() - b.getTime())
              .map((selectedDate, index) => (
                <Badge
                  key={index}
                  variant="default"
                  className="flex items-center space-x-1 bg-primary/90 hover:bg-primary text-primary-foreground"
                >
                  <span>{formatDate(selectedDate, language)}</span>
                  <button
                    onClick={() => handleDeleteClick(selectedDate)}
                    className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
                    aria-label={t.removeDate}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
          </div>
          <div className="text-xs text-muted-foreground">
            {language === "cs"
              ? "Klikněte na kalendář pro výběr více termínů najednou"
              : "Click on the calendar to select multiple dates at once"}
          </div>
        </div>
      )}

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={dateToDelete ? t.deleteDateTitle : t.deleteAllDatesTitle}
        description={dateToDelete ? t.deleteDateDescription : t.deleteAllDatesDescription}
        confirmText={t.delete}
        cancelText={t.cancel}
        language={language}
      />
    </div>
  )
}
