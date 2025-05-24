// Database interface for events
export interface EventData {
  id: string
  name: string
  organizer: string
  participants: Participant[]
  activitySuggestions: ActivitySuggestion[]
  createdAt: string
  language?: Language
}

export interface Participant {
  name: string
  availableDates: string[]
}

export interface ActivitySuggestion {
  id: string
  name: string
  description: string
  suggestedBy: string
  votes: ActivityVote[]
  createdAt: string
}

export interface ActivityVote {
  participantName: string
  voteType: "like" | "dislike" | "neutral"
}

export interface ParticipantAuth {
  name: string
  passwordHash: string
  createdAt: string
}

import type { Language } from "./i18n"

// API client for database operations
export class DatabaseClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = "/api"
  }

  // Events
  async createEvent(eventData: Omit<EventData, "id" | "createdAt">): Promise<EventData> {
    const response = await fetch(`${this.baseUrl}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      throw new Error("Failed to create event")
    }

    return response.json()
  }

  async getEvent(eventId: string): Promise<EventData | null> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}`)

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error("Failed to get event")
    }

    return response.json()
  }

  async updateEvent(eventId: string, eventData: EventData): Promise<EventData> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      throw new Error("Failed to update event")
    }

    return response.json()
  }

  // Authentication
  async registerParticipant(eventId: string, name: string, passwordHash: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/auth/${eventId}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, passwordHash }),
    })

    return response.ok
  }

  async authenticateParticipant(eventId: string, name: string, passwordHash: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/auth/${eventId}/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, passwordHash }),
    })

    return response.ok
  }

  async getParticipantAuth(eventId: string): Promise<ParticipantAuth[]> {
    const response = await fetch(`${this.baseUrl}/auth/${eventId}`)

    if (!response.ok) {
      return []
    }

    return response.json()
  }

  async deleteParticipantAuth(eventId: string, name: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/auth/${eventId}/${name}`, {
      method: "DELETE",
    })

    return response.ok
  }
}
