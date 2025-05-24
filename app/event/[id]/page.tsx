"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Share2, Users, Copy, Check, ThumbsUp, LogOut } from "lucide-react"
import { DatePicker } from "@/components/date-picker"
import { AvailabilityHeatmap } from "@/components/availability-heatmap"
import { ParticipantsList } from "@/components/participants-list"
import {
  ActivitySuggestions,
  type ActivitySuggestion,
  type VoteType,
  type ActivityVote,
} from "@/components/activity-suggestions"
import { AuthDialog } from "@/components/auth-dialog"
import { type Language, useTranslation } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OnlineEventAuth } from "@/lib/auth-online"
import { kvDatabase, type EventData, type Participant } from "@/lib/kv-database"
import { localStorageDatabase } from "@/lib/local-storage-database"
import { EventAuth } from "@/lib/auth"

export default function EventPage() {
  const params = useParams()
  const eventId = params.id as string

  const [eventData, setEventData] = useState<EventData | null>(null)
  const [participantName, setParticipantName] = useState("")
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [language, setLanguage] = useState<Language>("cs")
  const [currentParticipant, setCurrentParticipant] = useState<string>("")
  const [authDialog, setAuthDialog] = useState(false)
  const [eventAuth, setEventAuth] = useState<OnlineEventAuth | EventAuth | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [existingParticipants, setExistingParticipants] = useState<string[]>([])
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isLocalStorage, setIsLocalStorage] = useState(false)

  const t = useTranslation(language)

  // Initialize event auth and check storage type
  useEffect(() => {
    if (eventId) {
      checkStorageType()
    }
  }, [eventId])

  // Check if event exists in localStorage or needs to be fetched from API
  const checkStorageType = async () => {
    // Check if event exists in localStorage
    const localEvent = localStorage.getItem(`event:${eventId}`)

    if (localEvent) {
      // Event exists in localStorage
      setIsLocalStorage(true)
      const auth = new EventAuth(eventId)
      setEventAuth(auth)

      // Check if user is already authenticated
      const currentUser = auth.getCurrentParticipant()
      if (currentUser) {
        setCurrentParticipant(currentUser)
      }

      // Load existing participants
      const participants = auth.getParticipantNames()
      setExistingParticipants(participants)

      // Load event data
      loadLocalEventData()
    } else {
      // Try to load from API
      setIsLocalStorage(false)
      const auth = new OnlineEventAuth(eventId)
      setEventAuth(auth)

      // Check if user is already authenticated
      const currentUser = auth.getCurrentParticipant()
      if (currentUser) {
        setCurrentParticipant(currentUser)
      }

      // Load existing participants
      loadParticipants()

      // Load event data
      loadEventData()
    }
  }

  // Load event data from API
  const loadEventData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}`)

      if (response.status === 404) {
        // If not found in API, try localStorage as fallback
        const localEvent = await localStorageDatabase.getEvent(eventId)
        if (localEvent) {
          setEventData(localEvent)
          setIsLocalStorage(true)

          // Switch to local auth
          const auth = new EventAuth(eventId)
          setEventAuth(auth)

          // Check if user is already authenticated
          const currentUser = auth.getCurrentParticipant()
          if (currentUser) {
            setCurrentParticipant(currentUser)
          }

          // Load existing participants
          const participants = auth.getParticipantNames()
          setExistingParticipants(participants)
        } else {
          setEventData(null)
        }
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error("Failed to load event")
      }

      const data = await response.json()
      setEventData(data)

      // Use event's language if available
      if (data.language) {
        setLanguage(data.language)
      } else {
        const savedLanguage = localStorage.getItem("language") as Language
        if (savedLanguage && (savedLanguage === "cs" || savedLanguage === "en")) {
          setLanguage(savedLanguage)
        }
      }
    } catch (error) {
      console.error("Error loading event:", error)
      // Try localStorage as fallback
      loadLocalEventData()
    } finally {
      setIsLoading(false)
    }
  }

  // Load event data from localStorage
  const loadLocalEventData = async () => {
    setIsLoading(true)
    try {
      const data = await localStorageDatabase.getEvent(eventId)
      setEventData(data)

      // Use event's language if available
      if (data?.language) {
        setLanguage(data.language)
      } else {
        const savedLanguage = localStorage.getItem("language") as Language
        if (savedLanguage && (savedLanguage === "cs" || savedLanguage === "en")) {
          setLanguage(savedLanguage)
        }
      }
    } catch (error) {
      console.error("Error loading local event:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadParticipants = async () => {
    if (!eventAuth) return

    try {
      if (isLocalStorage) {
        const auth = eventAuth as EventAuth
        setExistingParticipants(auth.getParticipantNames())
      } else {
        const auth = eventAuth as OnlineEventAuth
        const names = await auth.getParticipantNames()
        setExistingParticipants(names)
      }
    } catch (error) {
      console.error("Error loading participants:", error)
    }
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  const handleAuth = async (name: string, password: string, isRegistering: boolean): Promise<boolean> => {
    if (!eventAuth) return false
    setIsAuthLoading(true)

    try {
      let success = false

      if (isLocalStorage) {
        const auth = eventAuth as EventAuth
        if (isRegistering) {
          success = auth.register(name, password)
        } else {
          success = auth.authenticate(name, password)
        }

        if (success) {
          setCurrentParticipant(name)
          setAuthDialog(false)
          setExistingParticipants(auth.getParticipantNames())

          // If registering, show the add form
          if (isRegistering) {
            setParticipantName(name)
            setShowAddForm(true)
          }
        }
      } else {
        const auth = eventAuth as OnlineEventAuth
        if (isRegistering) {
          success = await auth.register(name, password)
        } else {
          success = await auth.authenticate(name, password)
        }

        if (success) {
          setCurrentParticipant(name)
          setAuthDialog(false)
          await loadParticipants()

          // If registering, show the add form
          if (isRegistering) {
            setParticipantName(name)
            setShowAddForm(true)
          }
        }
      }

      return success
    } catch (error) {
      console.error("Auth error:", error)
      return false
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleSignOut = () => {
    if (eventAuth) {
      if (isLocalStorage) {
        const auth = eventAuth as EventAuth
        auth.signOut()
      } else {
        const auth = eventAuth as OnlineEventAuth
        auth.signOut()
      }

      setCurrentParticipant("")
      setShowAddForm(false)
      setParticipantName("")
      setSelectedDates([])
    }
  }

  const addParticipant = async () => {
    if (!participantName.trim() || selectedDates.length === 0 || !eventData) return
    setIsActionLoading(true)

    try {
      const newParticipant: Participant = {
        name: participantName,
        availableDates: selectedDates.map((date) => date.toISOString().split("T")[0]),
      }

      const updatedEvent = {
        ...eventData,
        participants: [...eventData.participants, newParticipant],
      }

      if (isLocalStorage) {
        await localStorageDatabase.updateEvent(eventId, updatedEvent)
      } else {
        await kvDatabase.updateEvent(eventId, updatedEvent)
      }

      setEventData(updatedEvent)
      setParticipantName("")
      setSelectedDates([])
      setShowAddForm(false)
    } catch (error) {
      console.error("Error adding participant:", error)
      alert(language === "cs" ? "Chyba při přidávání účastníka" : "Error adding participant")
    } finally {
      setIsActionLoading(false)
    }
  }

  const deleteParticipant = async (participantIndex: number) => {
    if (!eventData || !eventAuth) return
    setIsActionLoading(true)

    try {
      const participantToDelete = eventData.participants[participantIndex]
      const isCurrentParticipant = participantToDelete.name === currentParticipant

      // Create a new array without the deleted participant
      const updatedParticipants = [...eventData.participants]
      updatedParticipants.splice(participantIndex, 1)

      // Update event data
      const updatedEvent = {
        ...eventData,
        participants: updatedParticipants,
      }

      if (isLocalStorage) {
        await localStorageDatabase.updateEvent(eventId, updatedEvent)
        const auth = eventAuth as EventAuth
        auth.deleteParticipant(participantToDelete.name)
        setExistingParticipants(auth.getParticipantNames())
      } else {
        await kvDatabase.updateEvent(eventId, updatedEvent)
        const auth = eventAuth as OnlineEventAuth
        await auth.deleteParticipant(participantToDelete.name)
        await loadParticipants()
      }

      setEventData(updatedEvent)

      // If we deleted the current participant, clear the current participant state
      if (isCurrentParticipant) {
        setCurrentParticipant("")
      }
    } catch (error) {
      console.error("Error deleting participant:", error)
      alert(language === "cs" ? "Chyba při mazání účastníka" : "Error deleting participant")
    } finally {
      setIsActionLoading(false)
    }
  }

  const editParticipantDates = async (participantIndex: number, newDates: Date[]) => {
    if (!eventData) return
    setIsActionLoading(true)

    try {
      // Convert dates to ISO string format
      const formattedDates = newDates.map((date) => date.toISOString().split("T")[0])

      // Create a new array with the updated participant
      const updatedParticipants = [...eventData.participants]
      updatedParticipants[participantIndex] = {
        ...updatedParticipants[participantIndex],
        availableDates: formattedDates,
      }

      // Update event data
      const updatedEvent = {
        ...eventData,
        participants: updatedParticipants,
      }

      if (isLocalStorage) {
        await localStorageDatabase.updateEvent(eventId, updatedEvent)
      } else {
        await kvDatabase.updateEvent(eventId, updatedEvent)
      }

      setEventData(updatedEvent)
    } catch (error) {
      console.error("Error updating participant dates:", error)
      alert(language === "cs" ? "Chyba při aktualizaci termínů" : "Error updating dates")
    } finally {
      setIsActionLoading(false)
    }
  }

  const addActivitySuggestion = async (suggestion: Omit<ActivitySuggestion, "id" | "createdAt">) => {
    if (!eventData) return
    setIsActionLoading(true)

    try {
      const newSuggestion: ActivitySuggestion = {
        ...suggestion,
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date().toISOString(),
      }

      const updatedEvent = {
        ...eventData,
        activitySuggestions: [...eventData.activitySuggestions, newSuggestion],
      }

      if (isLocalStorage) {
        await localStorageDatabase.updateEvent(eventId, updatedEvent)
      } else {
        await kvDatabase.updateEvent(eventId, updatedEvent)
      }

      setEventData(updatedEvent)
    } catch (error) {
      console.error("Error adding activity suggestion:", error)
      alert(language === "cs" ? "Chyba při přidávání aktivity" : "Error adding activity")
    } finally {
      setIsActionLoading(false)
    }
  }

  const editActivitySuggestion = async (id: string, name: string, description: string) => {
    if (!eventData) return
    setIsActionLoading(true)

    try {
      const updatedSuggestions = eventData.activitySuggestions.map((suggestion) => {
        if (suggestion.id === id) {
          return {
            ...suggestion,
            name,
            description,
          }
        }
        return suggestion
      })

      const updatedEvent = {
        ...eventData,
        activitySuggestions: updatedSuggestions,
      }

      if (isLocalStorage) {
        await localStorageDatabase.updateEvent(eventId, updatedEvent)
      } else {
        await kvDatabase.updateEvent(eventId, updatedEvent)
      }

      setEventData(updatedEvent)
    } catch (error) {
      console.error("Error editing activity suggestion:", error)
      alert(language === "cs" ? "Chyba při úpravě aktivity" : "Error editing activity")
    } finally {
      setIsActionLoading(false)
    }
  }

  const deleteActivitySuggestion = async (id: string) => {
    if (!eventData) return
    setIsActionLoading(true)

    try {
      const updatedSuggestions = eventData.activitySuggestions.filter((suggestion) => suggestion.id !== id)

      const updatedEvent = {
        ...eventData,
        activitySuggestions: updatedSuggestions,
      }

      if (isLocalStorage) {
        await localStorageDatabase.updateEvent(eventId, updatedEvent)
      } else {
        await kvDatabase.updateEvent(eventId, updatedEvent)
      }

      setEventData(updatedEvent)
    } catch (error) {
      console.error("Error deleting activity suggestion:", error)
      alert(language === "cs" ? "Chyba při mazání aktivity" : "Error deleting activity")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleVote = async (suggestionId: string, participantName: string, voteType: VoteType | null) => {
    if (!eventData) return
    setIsActionLoading(true)

    try {
      const updatedSuggestions = eventData.activitySuggestions.map((suggestion) => {
        if (suggestion.id === suggestionId) {
          // Remove any existing vote from this participant
          const filteredVotes = suggestion.votes.filter((vote) => vote.participantName !== participantName)

          // If voteType is null, just remove the vote
          if (voteType === null) {
            return {
              ...suggestion,
              votes: filteredVotes,
            }
          }

          // Add the new vote
          const newVote: ActivityVote = {
            participantName,
            voteType,
          }

          return {
            ...suggestion,
            votes: [...filteredVotes, newVote],
          }
        }
        return suggestion
      })

      const updatedEvent = {
        ...eventData,
        activitySuggestions: updatedSuggestions,
      }

      if (isLocalStorage) {
        await localStorageDatabase.updateEvent(eventId, updatedEvent)
      } else {
        await kvDatabase.updateEvent(eventId, updatedEvent)
      }

      setEventData(updatedEvent)
    } catch (error) {
      console.error("Error voting for activity:", error)
      alert(language === "cs" ? "Chyba při hlasování" : "Error voting")
    } finally {
      setIsActionLoading(false)
    }
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-primary mx-auto animate-pulse mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {language === "cs" ? "Načítání události..." : "Loading event..."}
          </h2>
        </div>
      </div>
    )
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t.eventNotFound}</h2>
            <p className="text-muted-foreground">{t.eventNotFoundDesc}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Language Switcher */}
        <div className="flex justify-end pt-4 mb-4">
          <LanguageSwitcher currentLanguage={language} onLanguageChange={handleLanguageChange} />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{eventData.name}</h1>
          <p className="text-muted-foreground mb-4">
            {t.organizedBy} {eventData.organizer}
          </p>

          <div className="flex items-center justify-center space-x-4">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>
                {eventData.participants.length} {t.participants}
              </span>
            </Badge>

            <Button variant="outline" size="sm" onClick={copyLink} className="flex items-center space-x-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? t.copied : t.copyLink}</span>
            </Button>
          </div>

          {/* Storage type indicator */}
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              {isLocalStorage
                ? language === "cs"
                  ? "Lokální úložiště"
                  : "Local storage"
                : language === "cs"
                  ? "Online databáze"
                  : "Online database"}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Add Availability */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>{t.addYourAvailability}</span>
                </CardTitle>
                <CardDescription>{t.selectDatesDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                {!currentParticipant ? (
                  <div className="space-y-3">
                    <Button onClick={() => setAuthDialog(true)} className="w-full" disabled={isAuthLoading}>
                      <Share2 className="h-4 w-4 mr-2" />
                      {isAuthLoading ? (language === "cs" ? "Načítání..." : "Loading...") : t.joinEvent}
                    </Button>
                    <div className="text-xs text-muted-foreground text-center">
                      {language === "cs"
                        ? "Vytvořte si heslo pro bezpečné upravování vašich odpovědí"
                        : "Create a password to securely edit your responses"}
                    </div>
                  </div>
                ) : !showAddForm ? (
                  <div className="space-y-3">
                    <div className="text-center py-4 border rounded-lg bg-card/50">
                      <p className="mb-3">
                        {language === "cs" ? "Přihlášeno jako" : "Signed in as"} <strong>{currentParticipant}</strong>
                      </p>
                      <div className="flex space-x-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setParticipantName(currentParticipant)
                            setShowAddForm(true)
                          }}
                          disabled={isActionLoading}
                        >
                          {language === "cs" ? "Přidat termíny" : "Add dates"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={isActionLoading}>
                          <LogOut className="h-4 w-4 mr-1" />
                          {language === "cs" ? "Odhlásit" : "Sign out"}
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      {language === "cs"
                        ? "Můžete upravovat své termíny a aktivity v seznamu účastníků"
                        : "You can edit your dates and activities in the participants list"}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t.availableDates}</label>
                      <DatePicker
                        selectedDates={selectedDates}
                        onDatesChange={setSelectedDates}
                        participants={eventData.participants}
                        currentParticipant={participantName}
                        language={language}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={addParticipant}
                        disabled={selectedDates.length === 0 || isActionLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isActionLoading ? (language === "cs" ? "Ukládám..." : "Saving...") : t.addAvailability}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddForm(false)} disabled={isActionLoading}>
                        {t.cancel}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Participants List */}
            <ParticipantsList
              participants={eventData.participants}
              language={language}
              onDeleteParticipant={deleteParticipant}
              onEditParticipantDates={editParticipantDates}
              currentParticipant={currentParticipant}
              isLoading={isActionLoading}
            />
          </div>

          {/* Right Column - Tabs for Availability and Activities */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="availability" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="availability">
                  <Calendar className="h-4 w-4 mr-2" />
                  {language === "cs" ? "Dostupnost" : "Availability"}
                </TabsTrigger>
                <TabsTrigger value="activities">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {language === "cs" ? "Aktivity" : "Activities"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="availability">
                <AvailabilityHeatmap participants={eventData.participants} language={language} />
              </TabsContent>

              <TabsContent value="activities">
                <ActivitySuggestions
                  suggestions={eventData.activitySuggestions}
                  onAddSuggestion={addActivitySuggestion}
                  onEditSuggestion={editActivitySuggestion}
                  onDeleteSuggestion={deleteActivitySuggestion}
                  onVote={handleVote}
                  currentParticipantName={currentParticipant}
                  language={language}
                  isLoading={isActionLoading}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog
        open={authDialog}
        onOpenChange={setAuthDialog}
        onAuth={handleAuth}
        language={language}
        existingParticipants={existingParticipants}
        isLoading={isAuthLoading}
      />
    </div>
  )
}
