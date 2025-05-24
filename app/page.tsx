"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Clock, Database, HardDrive, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { type Language, useTranslation } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { localStorageDatabase } from "@/lib/local-storage-database"

export default function HomePage() {
  const [eventName, setEventName] = useState("")
  const [organizerName, setOrganizerName] = useState("")
  const [language, setLanguage] = useState<Language>("cs")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useLocalStorage, setUseLocalStorage] = useState(true) // Defaultně používáme localStorage
  const [isCheckingEnv, setIsCheckingEnv] = useState(true)
  const [envStatus, setEnvStatus] = useState<{ valid: boolean; details?: any } | null>(null)
  const router = useRouter()

  const t = useTranslation(language)

  // Kontrola proměnných prostředí při načtení stránky
  useEffect(() => {
    checkEnvironment()
  }, [])

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "cs" || savedLanguage === "en")) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Kontrola proměnných prostředí
  const checkEnvironment = async () => {
    setIsCheckingEnv(true)
    try {
      const response = await fetch("/api/check-env")
      const data = await response.json()

      setEnvStatus(data)

      if (data.valid) {
        // Proměnné prostředí jsou platné, můžeme používat online databázi
        setUseLocalStorage(false)
      } else {
        // Proměnné prostředí nejsou platné, musíme používat localStorage
        setUseLocalStorage(true)
        console.log("Using localStorage due to invalid environment variables:", data.details)
      }
    } catch (error) {
      // Při chybě defaultně používáme localStorage
      setUseLocalStorage(true)
      setEnvStatus({ valid: false, details: { error: "Failed to check environment" } })
      console.error("Error checking environment:", error)
    } finally {
      setIsCheckingEnv(false)
    }
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  // Vždy používáme localStorage pokud nejsou env variables platné
  const createEvent = async () => {
    if (!eventName.trim() || !organizerName.trim()) return

    setIsLoading(true)
    setError(null)

    // Pokud env variables nejsou platné nebo je vybrané localStorage, použijeme localStorage
    if (useLocalStorage || !envStatus?.valid) {
      await createLocalEvent()
      return
    }

    // Pokusíme se použít online databázi pouze pokud jsou env variables platné
    try {
      const eventData = {
        name: eventName,
        organizer: organizerName,
        participants: [],
        language: language,
      }

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        // Při jakékoli chybě přepneme na localStorage
        console.log("API failed, switching to localStorage")
        await createLocalEvent()
        return
      }

      const newEvent = await response.json()
      router.push(`/event/${newEvent.id}`)
    } catch (error) {
      console.error("Error creating event:", error)
      // Při chybě automaticky zkusíme lokální úložiště
      await createLocalEvent()
    } finally {
      setIsLoading(false)
    }
  }

  const createLocalEvent = async () => {
    if (!eventName.trim() || !organizerName.trim()) return

    try {
      const eventData = {
        name: eventName,
        organizer: organizerName,
        participants: [],
        language: language,
      }

      const newEvent = await localStorageDatabase.createEvent(eventData)
      router.push(`/event/${newEvent.id}`)
    } catch (error) {
      console.error("Error creating local event:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Language Switcher */}
        <div className="flex justify-end pt-4 mb-8">
          <LanguageSwitcher currentLanguage={language} onLanguageChange={handleLanguageChange} />
        </div>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-foreground">{t.appName}</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t.appDescription}</p>
        </div>

        {/* Informace o stavu databáze */}
        {!isCheckingEnv && envStatus && !envStatus.valid && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {language === "cs" ? (
                <>
                  <strong>Informace:</strong> Online databáze není dostupná (neplatné nastavení). Používáme lokální
                  úložiště. Vaše data budou uložena pouze v tomto prohlížeči.
                </>
              ) : (
                <>
                  <strong>Info:</strong> Online database is not available (invalid configuration). Using local storage.
                  Your data will be stored only in this browser.
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Storage Mode Selector - pouze pokud je online databáze dostupná */}
        {!isCheckingEnv && envStatus?.valid && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center rounded-md border p-1 text-muted-foreground">
              <Button
                variant={useLocalStorage ? "ghost" : "secondary"}
                size="sm"
                onClick={() => setUseLocalStorage(false)}
                className="flex items-center gap-1"
              >
                <Database className="h-4 w-4" />
                <span>{language === "cs" ? "Online databáze" : "Online database"}</span>
              </Button>
              <Button
                variant={useLocalStorage ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setUseLocalStorage(true)}
                className="flex items-center gap-1"
              >
                <HardDrive className="h-4 w-4" />
                <span>{language === "cs" ? "Lokální úložiště" : "Local storage"}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Informace o úložišti */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">
            {isCheckingEnv
              ? language === "cs"
                ? "Kontroluji nastavení..."
                : "Checking settings..."
              : useLocalStorage || !envStatus?.valid
                ? language === "cs"
                  ? "Používáte lokální úložiště. Data budou uložena pouze v tomto prohlížeči."
                  : "Using local storage. Data will be stored only in this browser."
                : language === "cs"
                  ? "Používáte online databázi. Data budou dostupná z jakéhokoli zařízení."
                  : "Using online database. Data will be accessible from any device."}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader className="text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle>{t.createNewEvent}</CardTitle>
              <CardDescription>{t.startPlanning}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t.eventName}</label>
                <Input
                  placeholder={t.eventNamePlaceholder}
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t.yourName}</label>
                <Input
                  placeholder={t.yourNamePlaceholder}
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={createEvent}
                className="w-full"
                disabled={!eventName.trim() || !organizerName.trim() || isLoading}
              >
                {isLoading ? (language === "cs" ? "Vytvářím..." : "Creating...") : t.createEvent}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <CardTitle>{t.howItWorks}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">{t.createEventStep}</h4>
                    <p className="text-sm text-muted-foreground">{t.createEventDesc}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">{t.shareLinkStep}</h4>
                    <p className="text-sm text-muted-foreground">{t.shareLinkDesc}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">{t.findBestDatesStep}</h4>
                    <p className="text-sm text-muted-foreground">{t.findBestDatesDesc}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground text-sm">{t.noRegistration}</p>
        </div>
      </div>
    </div>
  )
}
