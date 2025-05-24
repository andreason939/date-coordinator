import { Redis } from "@upstash/redis"
import type { Language } from "./i18n"

// Inicializace Redis klienta
const redis = new Redis({
  url: process.env.STORAGE_REST_API_URL || "",
  token: process.env.STORAGE_REST_API_TOKEN || "",
})

// Database interfaces
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

// Simple hash function for passwords
export function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

// KV Database client
export class KVDatabase {
  // Events
  async createEvent(eventData: Omit<EventData, "id" | "createdAt">): Promise<EventData> {
    // Generate unique ID
    const eventId = Math.random().toString(36).substring(2, 15)

    const newEvent: EventData = {
      ...eventData,
      id: eventId,
      participants: [],
      activitySuggestions: [],
      createdAt: new Date().toISOString(),
    }

    await redis.set(`event:${eventId}`, JSON.stringify(newEvent))
    return newEvent
  }

  async getEvent(eventId: string): Promise<EventData | null> {
    const event = await redis.get<string>(`event:${eventId}`)
    return event ? JSON.parse(event) : null
  }

  async updateEvent(eventId: string, eventData: EventData): Promise<EventData> {
    await redis.set(`event:${eventId}`, JSON.stringify(eventData))
    return eventData
  }

  // Authentication
  async registerParticipant(eventId: string, name: string, password: string): Promise<boolean> {
    const auth = await this.getEventAuth(eventId)

    // Check if name already exists
    if (auth.some((p) => p.name === name)) {
      return false
    }

    const newParticipant: ParticipantAuth = {
      name,
      passwordHash: simpleHash(password),
      createdAt: new Date().toISOString(),
    }

    auth.push(newParticipant)
    await redis.set(`auth:${eventId}`, JSON.stringify(auth))
    return true
  }

  async authenticateParticipant(eventId: string, name: string, password: string): Promise<boolean> {
    const auth = await this.getEventAuth(eventId)
    const participant = auth.find((p) => p.name === name)

    if (!participant) {
      return false
    }

    return participant.passwordHash === simpleHash(password)
  }

  async getEventAuth(eventId: string): Promise<ParticipantAuth[]> {
    const auth = await redis.get<string>(`auth:${eventId}`)
    return auth ? JSON.parse(auth) : []
  }

  async deleteParticipantAuth(eventId: string, name: string): Promise<boolean> {
    const auth = await this.getEventAuth(eventId)
    const filtered = auth.filter((p) => p.name !== name)
    await redis.set(`auth:${eventId}`, JSON.stringify(filtered))
    return true
  }

  // Helper methods
  async getParticipantNames(eventId: string): Promise<string[]> {
    const auth = await this.getEventAuth(eventId)
    return auth.map((p) => p.name)
  }
}

// Create a singleton instance
export const kvDatabase = new KVDatabase()
