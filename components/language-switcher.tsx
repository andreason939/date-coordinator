"use client"

import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import type { Language } from "@/lib/i18n"

interface LanguageSwitcherProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <div className="flex space-x-1">
        <Button
          variant={currentLanguage === "cs" ? "default" : "ghost"}
          size="sm"
          onClick={() => onLanguageChange("cs")}
          className="h-8 px-2 text-xs"
        >
          CS
        </Button>
        <Button
          variant={currentLanguage === "en" ? "default" : "ghost"}
          size="sm"
          onClick={() => onLanguageChange("en")}
          className="h-8 px-2 text-xs"
        >
          EN
        </Button>
      </div>
    </div>
  )
}
