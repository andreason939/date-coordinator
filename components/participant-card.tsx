"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Pencil, Trash2, Check, X } from "lucide-react"
import { type Language, useTranslation, formatDate } from "@/lib/i18n"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { EditDatesDialog } from "@/components/edit-dates-dialog"

interface Participant {
  name: string
  availableDates: string[]
}

interface ParticipantCardProps {
  participant: Participant
  index: number
  participants: Participant[]
  language?: Language
  onDeleteParticipant?: (participantIndex: number) => void
  onEditParticipantDates?: (participantIndex: number, newDates: Date[]) => void
  currentParticipant?: string
  isEditable?: boolean
  isLoading?: boolean
}

export function ParticipantCard({
  participant,
  index,
  participants,
  language = "cs",
  onDeleteParticipant,
  onEditParticipantDates,
  currentParticipant = "",
  isEditable = false,
  isLoading = false,
}: ParticipantCardProps) {
  const t = useTranslation(language)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (onDeleteParticipant) {
      onDeleteParticipant(index)
    }
  }

  const handleEditClick = () => {
    setEditDialogOpen(true)
  }

  const handleSaveEdit = (newDates: Date[]) => {
    if (onEditParticipantDates) {
      onEditParticipantDates(index, newDates)
    }
  }

  const canEditOrDelete = isEditable && participant.name === currentParticipant

  const displayDates = isExpanded ? participant.availableDates : participant.availableDates.slice(0, 3)
  const hasMoreDates = participant.availableDates.length > 3

  return (
    <>
      <Card className={`transition-all duration-200 ${canEditOrDelete ? "ring-1 ring-primary/20" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium">
                {participant.name}
                {participant.name === currentParticipant && (
                  <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    {language === "cs" ? "Vy" : "You"}
                  </span>
                )}
              </h4>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {participant.availableDates.length} {t.dates}
                </span>
              </Badge>
              {canEditOrDelete && (
                <div className="flex space-x-1">
                  {onEditParticipantDates && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={handleEditClick}
                      title={language === "cs" ? "Upravit termíny" : "Edit dates"}
                      disabled={isLoading}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDeleteParticipant && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={handleDeleteClick}
                      title={language === "cs" ? "Smazat účastníka" : "Delete participant"}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {participant.availableDates.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {displayDates.map((date, dateIndex) => (
                  <span
                    key={dateIndex}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded transition-colors hover:bg-primary/20"
                  >
                    {formatDate(new Date(date), language)}
                  </span>
                ))}
              </div>

              {hasMoreDates && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground p-0"
                  onClick={() => setIsExpanded(!isExpanded)}
                  disabled={isLoading}
                >
                  {isExpanded ? (
                    <>
                      <X className="h-3 w-3 mr-1" />
                      {language === "cs" ? "Zobrazit méně" : "Show less"}
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      {language === "cs"
                        ? `+${participant.availableDates.length - 3} dalších`
                        : `+${participant.availableDates.length - 3} more`}
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={t.deleteParticipantTitle}
        description={t.deleteParticipantDescription}
        confirmText={t.delete}
        cancelText={t.cancel}
        language={language}
        isLoading={isLoading}
      />

      <EditDatesDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        participantName={participant.name}
        availableDates={participant.availableDates.map((d) => new Date(d))}
        participants={participants}
        onSave={handleSaveEdit}
        language={language}
        isLoading={isLoading}
      />
    </>
  )
}
