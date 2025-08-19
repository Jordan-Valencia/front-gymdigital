"use client"

import { useState, useEffect } from "react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

export interface Board {
  id: string
  title: string
  description?: string
  color: string
  createdAt: string
  updatedAt: string
  lists: List[]
}

export interface List {
  id: string
  title: string
  position: number
  boardId: string
  cards: Card[]
  createdAt: string
  updatedAt: string
}

export interface Card {
  id: string
  title: string
  description?: string
  position: number
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  dueDate?: string
  completed: boolean
  listId: string
  labels: Label[]
  attachments: Attachment[]
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Label {
  id: string
  name: string
  color: string
  cardId: string
}

export interface Attachment {
  id: string
  name: string
  url: string
  size?: number
  type?: string
  cardId: string
  createdAt: string
}

export interface Comment {
  id: string
  content: string
  cardId: string
  createdAt: string
  updatedAt: string
}

export const useTrello = () => {
  const [boards, setBoards] = useState<Board[]>([])
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    try {
      const response = await fetch(`${API_URL}`)
      return response.ok
    } catch {
      return false
    }
  }

  // BOARDS
  const fetchBoards = async () => {
    try {
      setLoading(true)
      setError(null)

      const isConnected = await testConnection()
      if (!isConnected) {
        throw new Error(`No se puede conectar al servidor en ${API_URL}. Verifica que esté ejecutándose.`)
      }

      const response = await fetch(`${API_URL}/trello/boards`)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setBoards(Array.isArray(data) ? data : [])
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      console.error("Error fetching boards:", errorMessage)
      setBoards([])
    } finally {
      setLoading(false)
    }
  }

  const createBoard = async (boardData: { title: string; description?: string; color?: string }) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/trello/boards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(boardData),
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const newBoard = await response.json()
      setBoards((prev) => [...prev, newBoard])
      return newBoard
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateBoard = async (id: string, boardData: Partial<Board>) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/trello/boards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(boardData),
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const updatedBoard = await response.json()
      setBoards((prev) => prev.map((board) => (board.id === id ? updatedBoard : board)))
      if (currentBoard?.id === id) setCurrentBoard(updatedBoard)
      return updatedBoard
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteBoard = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/trello/boards/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      setBoards((prev) => prev.filter((board) => board.id !== id))
      if (currentBoard?.id === id) setCurrentBoard(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchBoard = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_URL}/trello/boards/${id}`)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const board = await response.json()

      const normalizedBoard: Board = {
        ...board,
        lists: Array.isArray(board.lists)
          ? board.lists.map((list: any) => ({
              ...list,
              cards: Array.isArray(list.cards)
                ? list.cards.map((card: any) => ({
                    ...card,
                    labels: Array.isArray(card.labels) ? card.labels : [],
                    comments: Array.isArray(card.comments) ? card.comments : [],
                    attachments: Array.isArray(card.attachments) ? card.attachments : [],
                  }))
                : [],
            }))
          : [],
      }

      setCurrentBoard(normalizedBoard)
      return normalizedBoard
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      setCurrentBoard(null)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // LISTS
  const createList = async (listData: { title: string; boardId: string }) => {
    try {
      const response = await fetch(`${API_URL}/trello/lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listData),
      })
      if (!response.ok) throw new Error("Error creating list")
      const newList = await response.json()

      if (currentBoard) {
        setCurrentBoard((prev) =>
          prev
            ? {
                ...prev,
                lists: [...prev.lists, newList],
              }
            : null,
        )
      }
      return newList
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  const updateList = async (id: string, listData: Partial<List>) => {
    try {
      const response = await fetch(`${API_URL}/trello/lists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listData),
      })
      if (!response.ok) throw new Error("Error updating list")
      const updatedList = await response.json()

      if (currentBoard) {
        setCurrentBoard((prev) =>
          prev
            ? {
                ...prev,
                lists: prev.lists.map((list) => (list.id === id ? updatedList : list)),
              }
            : null,
        )
      }
      return updatedList
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  const deleteList = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/trello/lists/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Error deleting list")

      if (currentBoard) {
        setCurrentBoard((prev) =>
          prev
            ? {
                ...prev,
                lists: prev.lists.filter((list) => list.id !== id),
              }
            : null,
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  const reorderLists = async (boardId: string, listIds: string[]) => {
    try {
      const response = await fetch(`${API_URL}/trello/boards/${boardId}/lists/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listIds }),
      })
      if (!response.ok) throw new Error("Error reordering lists")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  // CARDS
  const createCard = async (cardData: { title: string; description?: string; listId: string; priority?: string }) => {
    try {
      const response = await fetch(`${API_URL}/trello/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      })
      if (!response.ok) throw new Error("Error creating card")
      const newCard = await response.json()

      if (currentBoard) {
        setCurrentBoard((prev) =>
          prev
            ? {
                ...prev,
                lists: prev.lists.map((list) =>
                  list.id === cardData.listId ? { ...list, cards: [...list.cards, newCard] } : list,
                ),
              }
            : null,
        )
      }
      return newCard
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  const updateCard = async (id: string, cardData: Partial<Card>) => {
    try {
      const response = await fetch(`${API_URL}/trello/cards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      })
      if (!response.ok) throw new Error("Error updating card")
      const updatedCard = await response.json()

      if (currentBoard) {
        setCurrentBoard((prev) =>
          prev
            ? {
                ...prev,
                lists: prev.lists.map((list) => ({
                  ...list,
                  cards: list.cards.map((card) => (card.id === id ? updatedCard : card)),
                })),
              }
            : null,
        )
      }
      return updatedCard
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  const deleteCard = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/trello/cards/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Error deleting card")

      if (currentBoard) {
        setCurrentBoard((prev) =>
          prev
            ? {
                ...prev,
                lists: prev.lists.map((list) => ({
                  ...list,
                  cards: list.cards.filter((card) => card.id !== id),
                })),
              }
            : null,
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  const moveCard = async (cardId: string, newListId: string, newPosition: number) => {
    try {
      const response = await fetch(`${API_URL}/trello/cards/${cardId}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId: newListId, position: newPosition }),
      })
      if (!response.ok) throw new Error("Error moving card")
      const movedCard = await response.json()

      // Actualizar el estado local
      if (currentBoard) {
        setCurrentBoard((prev) => {
          if (!prev) return null

          // Remover la tarjeta de su lista actual
          const listsWithoutCard = prev.lists.map((list) => ({
            ...list,
            cards: list.cards.filter((card) => card.id !== cardId),
          }))

          // Agregar la tarjeta a la nueva lista
          const listsWithMovedCard = listsWithoutCard.map((list) =>
            list.id === newListId
              ? { ...list, cards: [...list.cards, movedCard].sort((a, b) => a.position - b.position) }
              : list,
          )

          return { ...prev, lists: listsWithMovedCard }
        })
      }

      return movedCard
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  const reorderCards = async (listId: string, cardIds: string[]) => {
    try {
      const response = await fetch(`${API_URL}/trello/lists/${listId}/cards/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardIds }),
      })
      if (!response.ok) throw new Error("Error reordering cards")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  // LABELS
  const addLabel = async (cardId: string, labelData: { name: string; color: string }) => {
    try {
      const response = await fetch(`${API_URL}/trello/cards/${cardId}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(labelData),
      })
      if (!response.ok) throw new Error("Error adding label")
      const newLabel = await response.json()

      if (currentBoard) {
        setCurrentBoard((prev) =>
          prev
            ? {
                ...prev,
                lists: prev.lists.map((list) => ({
                  ...list,
                  cards: list.cards.map((card) =>
                    card.id === cardId ? { ...card, labels: [...card.labels, newLabel] } : card,
                  ),
                })),
              }
            : null,
        )
      }
      return newLabel
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  const removeLabel = async (labelId: string) => {
    try {
      const response = await fetch(`${API_URL}/trello/labels/${labelId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Error removing label")

      if (currentBoard) {
        setCurrentBoard((prev) =>
          prev
            ? {
                ...prev,
                lists: prev.lists.map((list) => ({
                  ...list,
                  cards: list.cards.map((card) => ({
                    ...card,
                    labels: card.labels.filter((label) => label.id !== labelId),
                  })),
                })),
              }
            : null,
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  // COMMENTS
  const addComment = async (cardId: string, content: string) => {
    try {
      const response = await fetch(`${API_URL}/trello/cards/${cardId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      if (!response.ok) throw new Error("Error adding comment")
      const newComment = await response.json()

      if (currentBoard) {
        setCurrentBoard((prev) =>
          prev
            ? {
                ...prev,
                lists: prev.lists.map((list) => ({
                  ...list,
                  cards: list.cards.map((card) =>
                    card.id === cardId ? { ...card, comments: [...card.comments, newComment] } : card,
                  ),
                })),
              }
            : null,
        )
      }
      return newComment
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  const removeComment = async (commentId: string) => {
    try {
      const response = await fetch(`${API_URL}/trello/comments/${commentId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Error removing comment")

      if (currentBoard) {
        setCurrentBoard((prev) =>
          prev
            ? {
                ...prev,
                lists: prev.lists.map((list) => ({
                  ...list,
                  cards: list.cards.map((card) => ({
                    ...card,
                    comments: card.comments.filter((comment) => comment.id !== commentId),
                  })),
                })),
              }
            : null,
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  useEffect(() => {
    fetchBoards()
  }, [])

  return {
    // State
    boards,
    currentBoard,
    loading,
    error,

    // Board methods
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    fetchBoard,
    setCurrentBoard,

    // List methods
    createList,
    updateList,
    deleteList,
    reorderLists,

    // Card methods
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    reorderCards,

    // Label methods
    addLabel,
    removeLabel,

    // Comment methods
    addComment,
    removeComment,
  }
}
