"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, Minus, Plus, Award, RotateCcw, Pencil, Trash2 } from "lucide-react"
import { type Language, useTranslation } from "@/lib/i18n"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

export type VoteType = "like" | "dislike" | "neutral"

export interface ActivityVote {
  participantName: string
  voteType: VoteType
}

export interface ActivitySuggestion {
  id: string
  name: string
  description: string
  suggestedBy: string
  votes: ActivityVote[]
  createdAt: string
}

interface ActivitySuggestionsProps {
  suggestions: ActivitySuggestion[]
  onAddSuggestion: (suggestion: Omit<ActivitySuggestion, "id" | "createdAt">) => void
  onEditSuggestion: (id: string, name: string, description: string) => void
  onDeleteSuggestion: (id: string) => void
  onVote: (suggestionId: string, participantName: string, voteType: VoteType | null) => void
  currentParticipantName: string
  language?: Language
  isLoading?: boolean
}

export function ActivitySuggestions({
  suggestions,
  onAddSuggestion,
  onEditSuggestion,
  onDeleteSuggestion,
  onVote,
  currentParticipantName,
  language = "cs",
  isLoading = false,
}: ActivitySuggestionsProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [activityName, setActivityName] = useState("")
  const [activityDescription, setActivityDescription] = useState("")
  const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [suggestionToDelete, setSuggestionToDelete] = useState<string | null>(null)

  const t = useTranslation(language)

  const handleAddSuggestion = () => {
    if (!activityName.trim() || !currentParticipantName) return

    onAddSuggestion({
      name: activityName,
      description: activityDescription,
      suggestedBy: currentParticipantName,
      votes: [], // Initially no votes
    })

    setActivityName("")
    setActivityDescription("")
    setShowAddForm(false)
  }

  const startEditing = (suggestion: ActivitySuggestion) => {
    setEditingSuggestionId(suggestion.id)
    setEditName(suggestion.name)
    setEditDescription(suggestion.description)
  }

  const cancelEditing = () => {
    setEditingSuggestionId(null)
    setEditName("")
    setEditDescription("")
  }

  const saveEditing = () => {
    if (editingSuggestionId && editName.trim()) {
      onEditSuggestion(editingSuggestionId, editName, editDescription)
      setEditingSuggestionId(null)
    }
  }

  const handleDeleteClick = (id: string) => {
    setSuggestionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (suggestionToDelete) {
      onDeleteSuggestion(suggestionToDelete)
    }
  }

  const handleVote = (suggestionId: string, voteType: VoteType) => {
    if (!currentParticipantName) return
    onVote(suggestionId, currentParticipantName, voteType)
  }

  const handleRemoveVote = (suggestionId: string) => {
    if (!currentParticipantName) return
    onVote(suggestionId, currentParticipantName, null)
  }

  const getUserVote = (votes: ActivityVote[]): VoteType | null => {
    const userVote = votes.find((vote) => vote.participantName === currentParticipantName)
    return userVote ? userVote.voteType : null
  }

  const getVoteCounts = (votes: ActivityVote[]) => {
    const likes = votes.filter((vote) => vote.voteType === "like").length
    const dislikes = votes.filter((vote) => vote.voteType === "dislike").length
    const neutral = votes.filter((vote) => vote.voteType === "neutral").length
    const score = likes - dislikes // Simple scoring system
    return { likes, dislikes, neutral, score }
  }

  const getVoteButtonStyle = (voteType: VoteType, userVote: VoteType | null) => {
    const isSelected = userVote === voteType

    if (voteType === "like") {
      return isSelected
        ? "bg-green-600 text-white hover:bg-green-700 border-green-600"
        : "text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300 dark:hover:bg-green-950"
    }

    if (voteType === "dislike") {
      return isSelected
        ? "bg-red-600 text-white hover:bg-red-700 border-red-600"
        : "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 dark:hover:bg-red-950"
    }

    // neutral
    return isSelected
      ? "bg-gray-600 text-white hover:bg-gray-700 border-gray-600"
      : "text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-300 dark:hover:bg-gray-800"
  }

  const canEditOrDelete = (suggestedBy: string) => {
    // Allow editing for the person who suggested it, or if they're the current participant
    return currentParticipantName === suggestedBy
  }

  // Sort suggestions by score (likes - dislikes) descending
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    const scoreA = getVoteCounts(a.votes).score
    const scoreB = getVoteCounts(b.votes).score
    return scoreB - scoreA
  })

  const mostPopular = sortedSuggestions.length > 0 ? sortedSuggestions[0] : null
  const mostPopularScore = mostPopular ? getVoteCounts(mostPopular.votes).score : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ThumbsUp className="h-5 w-5" />
          <span>{t.activitySuggestions}</span>
        </CardTitle>
        <CardDescription>
          {currentParticipantName ? t.suggestActivity : "Připojte se k události pro přidání návrhů a hlasování"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentParticipantName && !showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            variant="outline"
            className="mb-6 w-full flex items-center"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.suggestActivity}
          </Button>
        )}

        {showAddForm && (
          <div className="space-y-4 mb-6 p-4 border border-border rounded-md bg-card/50">
            <div>
              <label className="text-sm font-medium mb-2 block">{t.activityName}</label>
              <Input
                placeholder={t.activityNamePlaceholder}
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t.activityDescription}</label>
              <Textarea
                placeholder={t.activityDescriptionPlaceholder}
                value={activityDescription}
                onChange={(e) => setActivityDescription(e.target.value)}
                rows={3}
                disabled={isLoading}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddSuggestion} disabled={!activityName.trim() || isLoading} className="flex-1">
                {isLoading ? (language === "cs" ? "Ukládám..." : "Saving...") : t.addSuggestion}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} disabled={isLoading}>
                {t.cancel}
              </Button>
            </div>
          </div>
        )}

        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ThumbsUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{t.noSuggestionsYet}</p>
            {currentParticipantName && <p className="text-sm mt-1">{t.suggestFirst}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {mostPopular && mostPopularScore > 0 && (
              <div className="mb-6 p-4 border border-green-800/30 rounded-md bg-green-900/10">
                {editingSuggestionId === mostPopular.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder={t.activityName}
                      className="font-semibold text-lg"
                      disabled={isLoading}
                    />
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder={t.activityDescription}
                      rows={3}
                      disabled={isLoading}
                    />
                    <div className="flex space-x-2">
                      <Button onClick={saveEditing} disabled={!editName.trim() || isLoading} size="sm">
                        {isLoading ? (language === "cs" ? "Ukládám..." : "Saving...") : t.save}
                      </Button>
                      <Button variant="outline" onClick={cancelEditing} size="sm" disabled={isLoading}>
                        {t.cancel}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-green-500" />
                          <h3 className="font-medium text-green-400">{t.mostPopular}</h3>
                        </div>
                        <h4 className="font-semibold text-lg mt-1">{mostPopular.name}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-800">
                          {t.score}: +{mostPopularScore}
                        </Badge>
                        {currentParticipantName && canEditOrDelete(mostPopular.suggestedBy) && (
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => startEditing(mostPopular)}
                              disabled={isLoading}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteClick(mostPopular.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {mostPopular.description && (
                      <p className="text-sm text-muted-foreground">{mostPopular.description}</p>
                    )}
                  </>
                )}

                {/* Vote counts */}
                <div className="flex items-center space-x-4 mb-3 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-3 w-3 text-green-500" />
                    <span>
                      {getVoteCounts(mostPopular.votes).likes} {t.likes}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ThumbsDown className="h-3 w-3 text-red-500" />
                    <span>
                      {getVoteCounts(mostPopular.votes).dislikes} {t.dislikes}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Minus className="h-3 w-3 text-gray-500" />
                    <span>
                      {getVoteCounts(mostPopular.votes).neutral} {t.neutral}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {t.suggestedBy} {mostPopular.suggestedBy}
                  </p>

                  {currentParticipantName && !editingSuggestionId && (
                    <div className="flex items-center space-x-2">
                      {getUserVote(mostPopular.votes) && (
                        <div className="flex items-center space-x-2 mr-3">
                          <span className="text-xs text-muted-foreground">
                            {t.yourVote}{" "}
                            <span
                              className={
                                getUserVote(mostPopular.votes) === "like"
                                  ? "text-green-500 font-medium"
                                  : getUserVote(mostPopular.votes) === "dislike"
                                    ? "text-red-500 font-medium"
                                    : "text-gray-500 font-medium"
                              }
                            >
                              {getUserVote(mostPopular.votes) === "like"
                                ? t.like
                                : getUserVote(mostPopular.votes) === "dislike"
                                  ? t.dislike
                                  : t.dontCare}
                            </span>
                          </span>
                        </div>
                      )}

                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVote(mostPopular.id, "like")}
                          className={`h-8 px-2 ${getVoteButtonStyle("like", getUserVote(mostPopular.votes))}`}
                          disabled={isLoading}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVote(mostPopular.id, "neutral")}
                          className={`h-8 px-2 ${getVoteButtonStyle("neutral", getUserVote(mostPopular.votes))}`}
                          disabled={isLoading}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVote(mostPopular.id, "dislike")}
                          className={`h-8 px-2 ${getVoteButtonStyle("dislike", getUserVote(mostPopular.votes))}`}
                          disabled={isLoading}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>

                        {getUserVote(mostPopular.votes) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveVote(mostPopular.id)}
                            className="h-8 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            title={t.removeYourVote}
                            disabled={isLoading}
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {sortedSuggestions.map((suggestion, index) => {
              if (suggestion.id === mostPopular?.id && mostPopularScore > 0) return null

              const userVote = getUserVote(suggestion.votes)
              const counts = getVoteCounts(suggestion.votes)

              return (
                <div key={suggestion.id} className="p-4 border border-border rounded-md">
                  {editingSuggestionId === suggestion.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder={t.activityName}
                        className="font-medium"
                        disabled={isLoading}
                      />
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder={t.activityDescription}
                        rows={3}
                        disabled={isLoading}
                      />
                      <div className="flex space-x-2">
                        <Button onClick={saveEditing} disabled={!editName.trim() || isLoading} size="sm">
                          {isLoading ? (language === "cs" ? "Ukládám..." : "Saving...") : t.save}
                        </Button>
                        <Button variant="outline" onClick={cancelEditing} size="sm" disabled={isLoading}>
                          {t.cancel}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{suggestion.name}</h4>
                          {suggestion.description && (
                            <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge
                            variant="outline"
                            className={counts.score > 0 ? "text-green-400" : counts.score < 0 ? "text-red-400" : ""}
                          >
                            {t.score}: {counts.score > 0 ? "+" : ""}
                            {counts.score}
                          </Badge>
                          {currentParticipantName && canEditOrDelete(suggestion.suggestedBy) && (
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => startEditing(suggestion)}
                                disabled={isLoading}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteClick(suggestion.id)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Vote counts */}
                      <div className="flex items-center space-x-4 mb-3 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-3 w-3 text-green-500" />
                          <span>
                            {counts.likes} {t.likes}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsDown className="h-3 w-3 text-red-500" />
                          <span>
                            {counts.dislikes} {t.dislikes}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Minus className="h-3 w-3 text-gray-500" />
                          <span>
                            {counts.neutral} {t.neutral}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {t.suggestedBy} {suggestion.suggestedBy}
                        </p>

                        {currentParticipantName && (
                          <div className="flex items-center space-x-2">
                            {userVote && (
                              <div className="flex items-center space-x-2 mr-3">
                                <span className="text-xs text-muted-foreground">
                                  {t.yourVote}{" "}
                                  <span
                                    className={
                                      userVote === "like"
                                        ? "text-green-500 font-medium"
                                        : userVote === "dislike"
                                          ? "text-red-500 font-medium"
                                          : "text-gray-500 font-medium"
                                    }
                                  >
                                    {userVote === "like" ? t.like : userVote === "dislike" ? t.dislike : t.dontCare}
                                  </span>
                                </span>
                              </div>
                            )}

                            <div className="flex space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVote(suggestion.id, "like")}
                                className={`h-8 px-2 ${getVoteButtonStyle("like", userVote)}`}
                                disabled={isLoading}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVote(suggestion.id, "neutral")}
                                className={`h-8 px-2 ${getVoteButtonStyle("neutral", userVote)}`}
                                disabled={isLoading}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVote(suggestion.id, "dislike")}
                                className={`h-8 px-2 ${getVoteButtonStyle("dislike", userVote)}`}
                                disabled={isLoading}
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>

                              {userVote && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveVote(suggestion.id)}
                                  className="h-8 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  title={t.removeYourVote}
                                  disabled={isLoading}
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={t.deleteActivityTitle}
        description={t.deleteActivityDescription}
        confirmText={t.delete}
        cancelText={t.cancel}
        language={language}
        isLoading={isLoading}
      />
    </Card>
  )
}
