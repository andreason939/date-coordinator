// Simple hash function for passwords (not cryptographically secure, but sufficient for this use case)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

export interface ParticipantAuth {
  name: string
  passwordHash: string
  createdAt: string
}

export class EventAuth {
  private eventId: string
  private storageKey: string

  constructor(eventId: string) {
    this.eventId = eventId
    this.storageKey = `auth_${eventId}`
  }

  // Get all authenticated participants for this event
  getParticipants(): ParticipantAuth[] {
    const stored = localStorage.getItem(this.storageKey)
    return stored ? JSON.parse(stored) : []
  }

  // Register a new participant
  register(name: string, password: string): boolean {
    const participants = this.getParticipants()

    // Check if name already exists
    if (participants.some((p) => p.name === name)) {
      return false
    }

    const newParticipant: ParticipantAuth = {
      name,
      passwordHash: simpleHash(password),
      createdAt: new Date().toISOString(),
    }

    participants.push(newParticipant)
    localStorage.setItem(this.storageKey, JSON.stringify(participants))

    // Set current session
    this.setCurrentParticipant(name)

    return true
  }

  // Authenticate existing participant
  authenticate(name: string, password: string): boolean {
    const participants = this.getParticipants()
    const participant = participants.find((p) => p.name === name)

    if (!participant) {
      return false
    }

    const isValid = participant.passwordHash === simpleHash(password)

    if (isValid) {
      this.setCurrentParticipant(name)
    }

    return isValid
  }

  // Set current participant session
  private setCurrentParticipant(name: string): void {
    localStorage.setItem(`participant_${this.eventId}`, name)
  }

  // Get current participant
  getCurrentParticipant(): string | null {
    return localStorage.getItem(`participant_${this.eventId}`)
  }

  // Sign out current participant
  signOut(): void {
    localStorage.removeItem(`participant_${this.eventId}`)
  }

  // Check if participant exists
  participantExists(name: string): boolean {
    const participants = this.getParticipants()
    return participants.some((p) => p.name === name)
  }

  // Get all participant names
  getParticipantNames(): string[] {
    return this.getParticipants().map((p) => p.name)
  }

  // Delete participant (for cleanup when participant is removed from event)
  deleteParticipant(name: string): void {
    const participants = this.getParticipants()
    const filtered = participants.filter((p) => p.name !== name)
    localStorage.setItem(this.storageKey, JSON.stringify(filtered))

    // If this was the current participant, sign them out
    if (this.getCurrentParticipant() === name) {
      this.signOut()
    }
  }
}
