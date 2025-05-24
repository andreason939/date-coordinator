import { kvDatabase } from "./kv-database"

export class OnlineEventAuth {
  private eventId: string
  private storageKey: string

  constructor(eventId: string) {
    this.eventId = eventId
    this.storageKey = `participant_${eventId}`
  }

  // Register a new participant
  async register(name: string, password: string): Promise<boolean> {
    try {
      const success = await kvDatabase.registerParticipant(this.eventId, name, password)

      if (success) {
        this.setCurrentParticipant(name)
      }

      return success
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  // Authenticate existing participant
  async authenticate(name: string, password: string): Promise<boolean> {
    try {
      const success = await kvDatabase.authenticateParticipant(this.eventId, name, password)

      if (success) {
        this.setCurrentParticipant(name)
      }

      return success
    } catch (error) {
      console.error("Authentication error:", error)
      return false
    }
  }

  // Set current participant session (still using localStorage for session)
  private setCurrentParticipant(name: string): void {
    localStorage.setItem(this.storageKey, name)
  }

  // Get current participant
  getCurrentParticipant(): string | null {
    return localStorage.getItem(this.storageKey)
  }

  // Sign out current participant
  signOut(): void {
    localStorage.removeItem(this.storageKey)
  }

  // Get all participant names
  async getParticipantNames(): Promise<string[]> {
    try {
      return await kvDatabase.getParticipantNames(this.eventId)
    } catch (error) {
      console.error("Error getting participant names:", error)
      return []
    }
  }

  // Delete participant
  async deleteParticipant(name: string): Promise<void> {
    try {
      await kvDatabase.deleteParticipantAuth(this.eventId, name)

      // If this was the current participant, sign them out
      if (this.getCurrentParticipant() === name) {
        this.signOut()
      }
    } catch (error) {
      console.error("Error deleting participant:", error)
    }
  }
}
