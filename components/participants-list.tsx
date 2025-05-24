"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { type Language, useTranslation } from "@/lib/i18n"
import { ParticipantCard } from "@/components/participant-card"

interface Participant {
  name: string
  availableDates: string[]
}

interface ParticipantsListProps {
  participants: Participant[]
  language?: Language
  onDeleteParticipant?: (participantIndex: number) => void
  onEditParticipantDates?: (participantIndex: number, newDates: Date[]) => void
  currentParticipant?: string
  isLoading?: boolean
}

export function ParticipantsList({
  participants,
  language = "cs",
  onDeleteParticipant,
  onEditParticipantDates,
  currentParticipant = "",
  isLoading = false,
}: ParticipantsListProps) {
  const t = useTranslation(language)

  if (participants.length === 0) {
    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>{t.participants}</span>
        </CardTitle>
        <CardDescription>
          {participants.length} {t.peopleJoined}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {participants.map((participant, index) => (
            <ParticipantCard
              key={index}
              participant={participant}
              index={index}
              participants={participants}
              language={language}
              onDeleteParticipant={onDeleteParticipant}
              onEditParticipantDates={onEditParticipantDates}
              currentParticipant={currentParticipant}
              isEditable={true}
              isLoading={isLoading}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
