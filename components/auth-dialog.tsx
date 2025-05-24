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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, UserPlus, LogIn } from "lucide-react"
import { type Language, useTranslation } from "@/lib/i18n"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuth: (name: string, password: string, isRegistering: boolean) => Promise<boolean>
  language?: Language
  existingParticipants: string[]
  isLoading?: boolean
}

export function AuthDialog({
  open,
  onOpenChange,
  onAuth,
  language = "cs",
  existingParticipants,
  isLoading = false,
}: AuthDialogProps) {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isRegistering, setIsRegistering] = useState(true)
  const [localLoading, setLocalLoading] = useState(false)
  const [error, setError] = useState("")

  const t = useTranslation(language)

  const handleSubmit = async () => {
    if (!name.trim() || !password.trim()) {
      setError(language === "cs" ? "Vyplňte všechna pole" : "Fill in all fields")
      return
    }

    if (password.length < 4) {
      setError(language === "cs" ? "Heslo musí mít alespoň 4 znaky" : "Password must be at least 4 characters")
      return
    }

    if (isRegistering && existingParticipants.includes(name.trim())) {
      setError(language === "cs" ? "Toto jméno už je použité" : "This name is already taken")
      return
    }

    if (!isRegistering && !existingParticipants.includes(name.trim())) {
      setError(language === "cs" ? "Účastník s tímto jménem neexistuje" : "No participant with this name exists")
      return
    }

    setLocalLoading(true)
    setError("")

    try {
      const success = await onAuth(name.trim(), password, isRegistering)
      if (!success) {
        setError(language === "cs" ? "Nesprávné heslo" : "Incorrect password")
      }
    } catch (err) {
      setError(language === "cs" ? "Došlo k chybě" : "An error occurred")
    } finally {
      setLocalLoading(false)
    }
  }

  const resetForm = () => {
    setName("")
    setPassword("")
    setError("")
    setShowPassword(false)
  }

  const handleModeSwitch = () => {
    setIsRegistering(!isRegistering)
    setError("")
  }

  const isButtonLoading = isLoading || localLoading

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen)
        if (!newOpen) resetForm()
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isRegistering ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
            <span>
              {isRegistering
                ? language === "cs"
                  ? "Připojit se k akci"
                  : "Join Event"
                : language === "cs"
                  ? "Přihlásit se"
                  : "Sign In"}
            </span>
          </DialogTitle>
          <DialogDescription>
            {isRegistering
              ? language === "cs"
                ? "Vytvořte si účet pro tuto akci"
                : "Create an account for this event"
              : language === "cs"
                ? "Přihlaste se ke svému účtu"
                : "Sign in to your account"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{language === "cs" ? "Vaše jméno" : "Your name"}</Label>
            <Input
              id="name"
              placeholder={language === "cs" ? "Jan Novák" : "John Doe"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isButtonLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {language === "cs" ? "Heslo" : "Password"}
              {isRegistering && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({language === "cs" ? "min. 4 znaky" : "min. 4 characters"})
                </span>
              )}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={language === "cs" ? "Zadejte heslo" : "Enter password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isButtonLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit()
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isButtonLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isRegistering && (
            <div className="text-xs text-muted-foreground">
              {language === "cs"
                ? "Heslo bude použito pouze pro tuto akci a umožní vám upravovat vaše odpovědi."
                : "Password will be used only for this event and will allow you to edit your responses."}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col space-y-2">
          <Button onClick={handleSubmit} disabled={isButtonLoading} className="w-full">
            {isButtonLoading
              ? language === "cs"
                ? "Načítání..."
                : "Loading..."
              : isRegistering
                ? language === "cs"
                  ? "Vytvořit účet"
                  : "Create Account"
                : language === "cs"
                  ? "Přihlásit se"
                  : "Sign In"}
          </Button>

          <Button variant="ghost" onClick={handleModeSwitch} disabled={isButtonLoading} className="w-full">
            {isRegistering
              ? language === "cs"
                ? "Už máte účet? Přihlaste se"
                : "Already have an account? Sign in"
              : language === "cs"
                ? "Nemáte účet? Vytvořte si ho"
                : "Don't have an account? Create one"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
