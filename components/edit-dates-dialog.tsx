"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/date-picker"
import { type Language, useTranslation } from "@/lib/i18n"

interface Participant {
  name: string
  availableDates: string[]
}

interface EditDatesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  participantName: string
  availableDates: Date[]
  participants: Participant[]
  onSave: (dates: Date[]) => void
  language?: Language
  isLoading?: boolean
}

export function EditDatesDialog({
  open,
  onOpenChange,
  participantName,
  availableDates,
  participants,
  onSave,
  language = "cs",
  isLoading = false,
}: EditDatesDialogProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>(availableDates)
  const t = useTranslation(language)

  const handleSave = () => {
    onSave(selectedDates)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {t.editDatesFor} {participantName}
          </DialogTitle>
          <DialogDescription>{t.editDatesDescription}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <DatePicker
            selectedDates={selectedDates}
            onDatesChange={setSelectedDates}
            participants={participants}
            currentParticipant={participantName}
            language={language}
            allowDelete={true}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t.cancel}
          </Button>
          <Button onClick={handleSave} disabled={selectedDates.length === 0 || isLoading}>
            {isLoading ? (language === "cs" ? "Ukládám..." : "Saving...") : t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
