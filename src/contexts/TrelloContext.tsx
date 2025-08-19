"use client"

import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from "react"
import { useTrello, type Board, type List, type Card, type Label, type Comment } from "../hooks/useTrello"

interface TrelloState {
  boards: Board[]
  currentBoard: Board | null
  loading: boolean
  error: string | null
  optimisticUpdates: Map<string, any>
}

type TrelloAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_BOARDS"; payload: Board[] }
  | { type: "SET_CURRENT_BOARD"; payload: Board | null }
  | { type: "ADD_BOARD_OPTIMISTIC"; payload: Board }
  | { type: "UPDATE_BOARD_OPTIMISTIC"; payload: { id: string; updates: Partial<Board> } }
  | { type: "DELETE_BOARD_OPTIMISTIC"; payload: string }
  | { type: "ADD_LIST_OPTIMISTIC"; payload: { boardId: string; list: List } }
  | { type: "UPDATE_LIST_OPTIMISTIC"; payload: { listId: string; updates: Partial<List> } }
  | { type: "DELETE_LIST_OPTIMISTIC"; payload: string }
  | { type: "ADD_CARD_OPTIMISTIC"; payload: { listId: string; card: Card } }
  | { type: "UPDATE_CARD_OPTIMISTIC"; payload: { cardId: string; updates: Partial<Card> } }
  | { type: "DELETE_CARD_OPTIMISTIC"; payload: string }
  | { type: "MOVE_CARD_OPTIMISTIC"; payload: { cardId: string; newListId: string; newPosition: number } }
  | { type: "REVERT_OPTIMISTIC"; payload: string }

const initialState: TrelloState = {
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
  optimisticUpdates: new Map(),
}

function trelloReducer(state: TrelloState, action: TrelloAction): TrelloState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }

    case "SET_BOARDS":
      return { ...state, boards: action.payload, loading: false, error: null }

    case "SET_CURRENT_BOARD":
      return { ...state, currentBoard: action.payload, loading: false, error: null }

    case "ADD_BOARD_OPTIMISTIC":
      return {
        ...state,
        boards: [...state.boards, action.payload],
        optimisticUpdates: new Map(state.optimisticUpdates).set(action.payload.id, "board"),
      }

    case "UPDATE_BOARD_OPTIMISTIC":
      return {
        ...state,
        boards: state.boards.map((board) =>
          board.id === action.payload.id ? { ...board, ...action.payload.updates } : board,
        ),
        currentBoard:
          state.currentBoard?.id === action.payload.id
            ? { ...state.currentBoard, ...action.payload.updates }
            : state.currentBoard,
        optimisticUpdates: new Map(state.optimisticUpdates).set(action.payload.id, "board"),
      }

    case "DELETE_BOARD_OPTIMISTIC":
      return {
        ...state,
        boards: state.boards.filter((board) => board.id !== action.payload),
        currentBoard: state.currentBoard?.id === action.payload ? null : state.currentBoard,
        optimisticUpdates: new Map(state.optimisticUpdates).set(action.payload, "board"),
      }

    case "ADD_LIST_OPTIMISTIC":
      const updatedBoardsAddList = state.boards.map((board) =>
        board.id === action.payload.boardId
          ? { ...board, lists: [...(board.lists || []), action.payload.list] }
          : board,
      )
      return {
        ...state,
        boards: updatedBoardsAddList,
        currentBoard:
          state.currentBoard?.id === action.payload.boardId
            ? { ...state.currentBoard, lists: [...(state.currentBoard.lists || []), action.payload.list] }
            : state.currentBoard,
        optimisticUpdates: new Map(state.optimisticUpdates).set(action.payload.list.id, "list"),
      }

    case "UPDATE_LIST_OPTIMISTIC":
      const updatedBoardsUpdateList = state.boards.map((board) => ({
        ...board,
        lists: (board.lists || []).map((list) =>
          list.id === action.payload.listId ? { ...list, ...action.payload.updates } : list,
        ),
      }))
      return {
        ...state,
        boards: updatedBoardsUpdateList,
        currentBoard: state.currentBoard
          ? {
              ...state.currentBoard,
              lists: (state.currentBoard.lists || []).map((list) =>
                list.id === action.payload.listId ? { ...list, ...action.payload.updates } : list,
              ),
            }
          : null,
        optimisticUpdates: new Map(state.optimisticUpdates).set(action.payload.listId, "list"),
      }

    case "DELETE_LIST_OPTIMISTIC":
      const updatedBoardsDeleteList = state.boards.map((board) => ({
        ...board,
        lists: (board.lists || []).filter((list) => list.id !== action.payload),
      }))
      return {
        ...state,
        boards: updatedBoardsDeleteList,
        currentBoard: state.currentBoard
          ? {
              ...state.currentBoard,
              lists: (state.currentBoard.lists || []).filter((list) => list.id !== action.payload),
            }
          : null,
        optimisticUpdates: new Map(state.optimisticUpdates).set(action.payload, "list"),
      }

    case "ADD_CARD_OPTIMISTIC":
      const updatedBoardsAddCard = state.boards.map((board) => ({
        ...board,
        lists: (board.lists || []).map((list) =>
          list.id === action.payload.listId ? { ...list, cards: [...(list.cards || []), action.payload.card] } : list,
        ),
      }))
      return {
        ...state,
        boards: updatedBoardsAddCard,
        currentBoard: state.currentBoard
          ? {
              ...state.currentBoard,
              lists: (state.currentBoard.lists || []).map((list) =>
                list.id === action.payload.listId
                  ? { ...list, cards: [...(list.cards || []), action.payload.card] }
                  : list,
              ),
            }
          : null,
        optimisticUpdates: new Map(state.optimisticUpdates).set(action.payload.card.id, "card"),
      }

    case "UPDATE_CARD_OPTIMISTIC":
      const updatedBoardsUpdateCard = state.boards.map((board) => ({
        ...board,
        lists: (board.lists || []).map((list) => ({
          ...list,
          cards: (list.cards || []).map((card) =>
            card.id === action.payload.cardId ? { ...card, ...action.payload.updates } : card,
          ),
        })),
      }))
      return {
        ...state,
        boards: updatedBoardsUpdateCard,
        currentBoard: state.currentBoard
          ? {
              ...state.currentBoard,
              lists: (state.currentBoard.lists || []).map((list) => ({
                ...list,
                cards: (list.cards || []).map((card) =>
                  card.id === action.payload.cardId ? { ...card, ...action.payload.updates } : card,
                ),
              })),
            }
          : null,
        optimisticUpdates: new Map(state.optimisticUpdates).set(action.payload.cardId, "card"),
      }

    case "DELETE_CARD_OPTIMISTIC":
      const updatedBoardsDeleteCard = state.boards.map((board) => ({
        ...board,
        lists: (board.lists || []).map((list) => ({
          ...list,
          cards: (list.cards || []).filter((card) => card.id !== action.payload),
        })),
      }))
      return {
        ...state,
        boards: updatedBoardsDeleteCard,
        currentBoard: state.currentBoard
          ? {
              ...state.currentBoard,
              lists: (state.currentBoard.lists || []).map((list) => ({
                ...list,
                cards: (list.cards || []).filter((card) => card.id !== action.payload),
              })),
            }
          : null,
        optimisticUpdates: new Map(state.optimisticUpdates).set(action.payload, "card"),
      }

    case "MOVE_CARD_OPTIMISTIC":
      const { cardId, newListId, newPosition } = action.payload
      let cardToMove: Card | undefined = undefined

      // Find and remove the card from its current list
      const boardsWithoutCard = state.boards.map((board) => ({
        ...board,
        lists: (board.lists || []).map((list) => {
          const cardIndex = (list.cards || []).findIndex((card) => card.id === cardId)
          if (cardIndex !== -1) {
            cardToMove = (list.cards || [])[cardIndex]
            return { ...list, cards: (list.cards || []).filter((card) => card.id !== cardId) }
          }
          return list
        }),
      }))

      if (!cardToMove) return state
      const card = cardToMove as Card
      // Add the card to the new list at the specified position
      const updatedCardToMove = { ...card, listId: newListId, position: newPosition }
      const finalBoards = boardsWithoutCard.map((board) => ({
        ...board,
        lists: (board.lists || []).map((list) =>
          list.id === newListId
            ? {
                ...list,
                cards: [
                  ...(list.cards || []).slice(0, newPosition),
                  updatedCardToMove,
                  ...(list.cards || []).slice(newPosition),
                ],
              }
            : list,
        ),
      }))

      return {
        ...state,
        boards: finalBoards,
        currentBoard: state.currentBoard
          ? {
              ...state.currentBoard,
              lists: (state.currentBoard.lists || []).map((list) => {
                if (list.id === newListId) {
                  return {
                    ...list,
                    cards: [
                      ...(list.cards || []).slice(0, newPosition),
                      updatedCardToMove,
                      ...(list.cards || []).slice(newPosition),
                    ],
                  }
                }
                return { ...list, cards: (list.cards || []).filter((card) => card.id !== cardId) }
              }),
            }
          : null,
        optimisticUpdates: new Map(state.optimisticUpdates).set(cardId, "card"),
      }

    case "REVERT_OPTIMISTIC":
      const newOptimisticUpdates = new Map(state.optimisticUpdates)
      newOptimisticUpdates.delete(action.payload)
      return {
        ...state,
        optimisticUpdates: newOptimisticUpdates,
      }

    default:
      return state
  }
}

interface TrelloContextType extends TrelloState {
  // Board operations
  createBoardOptimistic: (boardData: Omit<Board, "id" | "createdAt" | "updatedAt" | "lists">) => Promise<void>
  updateBoardOptimistic: (id: string, updates: Partial<Board>) => Promise<void>
  deleteBoardOptimistic: (id: string) => Promise<void>
  fetchBoard: (id: string) => Promise<void>

  // List operations
  createListOptimistic: (listData: Omit<List, "id" | "createdAt" | "updatedAt" | "cards" | "position">) => Promise<void>
  updateListOptimistic: (id: string, updates: Partial<List>) => Promise<void>
  deleteListOptimistic: (id: string) => Promise<void>

  // Card operations
  createCardOptimistic: (
    cardData: Omit<Card, "id" | "createdAt" | "updatedAt" | "position" | "labels" | "attachments" | "comments">,
  ) => Promise<string>
  updateCardOptimistic: (id: string, updates: Partial<Card>) => Promise<void>
  deleteCardOptimistic: (id: string) => Promise<void>
  moveCardOptimistic: (cardId: string, newListId: string, newPosition: number) => Promise<void>

  // Label operations
  addLabelOptimistic: (cardId: string, labelData: { name: string; color: string }) => Promise<void>
  removeLabelOptimistic: (labelId: string) => Promise<void>

  // Comment operations
  addCommentOptimistic: (cardId: string, content: string) => Promise<void>
  removeCommentOptimistic: (commentId: string) => Promise<void>

  // Utility
  isOptimistic: (id: string) => boolean
}

const TrelloContext = createContext<TrelloContextType | undefined>(undefined)

export function TrelloProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(trelloReducer, initialState)
  const trelloHook = useTrello()

  const createBoardOptimistic = useCallback(
    async (boardData: Omit<Board, "id" | "createdAt" | "updatedAt" | "lists">) => {
      const optimisticId = `temp-${Date.now()}`
      const optimisticBoard: Board = {
        ...boardData,
        id: optimisticId,
        lists: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      dispatch({ type: "ADD_BOARD_OPTIMISTIC", payload: optimisticBoard })

      try {
        const realBoard = await trelloHook.createBoard(boardData)
        dispatch({ type: "UPDATE_BOARD_OPTIMISTIC", payload: { id: optimisticId, updates: realBoard } })
        dispatch({ type: "REVERT_OPTIMISTIC", payload: optimisticId })
      } catch (error) {
        dispatch({ type: "DELETE_BOARD_OPTIMISTIC", payload: optimisticId })
        dispatch({ type: "SET_ERROR", payload: "Error creating board" })
      }
    },
    [trelloHook],
  )

  const updateBoardOptimistic = useCallback(
    async (id: string, updates: Partial<Board>) => {
      dispatch({ type: "UPDATE_BOARD_OPTIMISTIC", payload: { id, updates } })

      try {
        await trelloHook.updateBoard(id, updates)
        dispatch({ type: "REVERT_OPTIMISTIC", payload: id })
      } catch (error) {
        // Revert optimistic update by refetching
        const boards = await trelloHook.fetchBoards()
        dispatch({ type: "SET_BOARDS", payload: boards })
        dispatch({ type: "SET_ERROR", payload: "Error updating board" })
      }
    },
    [trelloHook],
  )

  const deleteBoardOptimistic = useCallback(
    async (id: string) => {
      dispatch({ type: "DELETE_BOARD_OPTIMISTIC", payload: id })

      try {
        await trelloHook.deleteBoard(id)
        dispatch({ type: "REVERT_OPTIMISTIC", payload: id })
      } catch (error) {
        // Revert by refetching
        const boards = await trelloHook.fetchBoards()
        dispatch({ type: "SET_BOARDS", payload: boards })
        dispatch({ type: "SET_ERROR", payload: "Error deleting board" })
      }
    },
    [trelloHook],
  )

  const fetchBoard = useCallback(
    async (id: string) => {
      dispatch({ type: "SET_LOADING", payload: true })
      try {
        const board = await trelloHook.fetchBoard(id)
        dispatch({ type: "SET_CURRENT_BOARD", payload: board })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Error fetching board" })
      }
    },
    [trelloHook],
  )

  const createListOptimistic = useCallback(
    async (listData: Omit<List, "id" | "createdAt" | "updatedAt" | "cards" | "position">) => {
      const optimisticId = `temp-${Date.now()}`
      const optimisticList: List = {
        ...listData,
        id: optimisticId,
        cards: [],
        position: (state.currentBoard?.lists || []).length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      dispatch({ type: "ADD_LIST_OPTIMISTIC", payload: { boardId: listData.boardId, list: optimisticList } })

      try {
        const realList = await trelloHook.createList(listData)
        dispatch({ type: "UPDATE_LIST_OPTIMISTIC", payload: { listId: optimisticId, updates: realList } })
        dispatch({ type: "REVERT_OPTIMISTIC", payload: optimisticId })
      } catch (error) {
        dispatch({ type: "DELETE_LIST_OPTIMISTIC", payload: optimisticId })
        dispatch({ type: "SET_ERROR", payload: "Error creating list" })
      }
    },
    [trelloHook, state.currentBoard],
  )

  const updateListOptimistic = useCallback(
    async (id: string, updates: Partial<List>) => {
      dispatch({ type: "UPDATE_LIST_OPTIMISTIC", payload: { listId: id, updates } })

      try {
        await trelloHook.updateList(id, updates)
        dispatch({ type: "REVERT_OPTIMISTIC", payload: id })
      } catch (error) {
        if (state.currentBoard) {
          const board = await trelloHook.fetchBoard(state.currentBoard.id)
          dispatch({ type: "SET_CURRENT_BOARD", payload: board })
        }
        dispatch({ type: "SET_ERROR", payload: "Error updating list" })
      }
    },
    [trelloHook, state.currentBoard],
  )

  const deleteListOptimistic = useCallback(
    async (id: string) => {
      dispatch({ type: "DELETE_LIST_OPTIMISTIC", payload: id })

      try {
        await trelloHook.deleteList(id)
        dispatch({ type: "REVERT_OPTIMISTIC", payload: id })
      } catch (error) {
        if (state.currentBoard) {
          const board = await trelloHook.fetchBoard(state.currentBoard.id)
          dispatch({ type: "SET_CURRENT_BOARD", payload: board })
        }
        dispatch({ type: "SET_ERROR", payload: "Error deleting list" })
      }
    },
    [trelloHook, state.currentBoard],
  )

  const createCardOptimistic = useCallback(
    async (
      cardData: Omit<Card, "id" | "createdAt" | "updatedAt" | "position" | "labels" | "attachments" | "comments">,
    ) => {
      const optimisticId = `temp-${Date.now()}`
      const currentList = (state.currentBoard?.lists || []).find((list) => list.id === cardData.listId)
      const optimisticCard: Card = {
        ...cardData,
        id: optimisticId,
        position: (currentList?.cards || []).length,
        labels: [],
        attachments: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      dispatch({ type: "ADD_CARD_OPTIMISTIC", payload: { listId: cardData.listId, card: optimisticCard } })

      try {
        const realCard = await trelloHook.createCard(cardData)
        dispatch({ type: "UPDATE_CARD_OPTIMISTIC", payload: { cardId: optimisticId, updates: realCard } })
        dispatch({ type: "REVERT_OPTIMISTIC", payload: optimisticId })
        return optimisticId
      } catch (error) {
        dispatch({ type: "DELETE_CARD_OPTIMISTIC", payload: optimisticId })
        dispatch({ type: "SET_ERROR", payload: "Error creating card" })
        return optimisticId
      }
    },
    [trelloHook, state.currentBoard],
  )

  const updateCardOptimistic = useCallback(
    async (id: string, updates: Partial<Card>) => {
      dispatch({ type: "UPDATE_CARD_OPTIMISTIC", payload: { cardId: id, updates } })

      try {
        await trelloHook.updateCard(id, updates)
        dispatch({ type: "REVERT_OPTIMISTIC", payload: id })
      } catch (error) {
        if (state.currentBoard) {
          const board = await trelloHook.fetchBoard(state.currentBoard.id)
          dispatch({ type: "SET_CURRENT_BOARD", payload: board })
        }
        dispatch({ type: "SET_ERROR", payload: "Error updating card" })
      }
    },
    [trelloHook, state.currentBoard],
  )

  const deleteCardOptimistic = useCallback(
    async (id: string) => {
      dispatch({ type: "DELETE_CARD_OPTIMISTIC", payload: id })

      try {
        await trelloHook.deleteCard(id)
        dispatch({ type: "REVERT_OPTIMISTIC", payload: id })
      } catch (error) {
        if (state.currentBoard) {
          const board = await trelloHook.fetchBoard(state.currentBoard.id)
          dispatch({ type: "SET_CURRENT_BOARD", payload: board })
        }
        dispatch({ type: "SET_ERROR", payload: "Error deleting card" })
      }
    },
    [trelloHook, state.currentBoard],
  )

  const moveCardOptimistic = useCallback(
    async (cardId: string, newListId: string, newPosition: number) => {
      dispatch({ type: "MOVE_CARD_OPTIMISTIC", payload: { cardId, newListId, newPosition } })

      try {
        await trelloHook.moveCard(cardId, newListId, newPosition)
        dispatch({ type: "REVERT_OPTIMISTIC", payload: cardId })
      } catch (error) {
        if (state.currentBoard) {
          const board = await trelloHook.fetchBoard(state.currentBoard.id)
          dispatch({ type: "SET_CURRENT_BOARD", payload: board })
        }
        dispatch({ type: "SET_ERROR", payload: "Error moving card" })
      }
    },
    [trelloHook, state.currentBoard],
  )

  const addLabelOptimistic = useCallback(
    async (cardId: string, labelData: { name: string; color: string }) => {
      const optimisticLabel: Label = {
        id: `temp-${Date.now()}`,
        ...labelData,
        cardId,
      }

      const currentCard = (state.currentBoard?.lists || [])
        .flatMap((list) => list.cards || [])
        .find((card) => card.id === cardId)

      if (currentCard) {
        dispatch({
          type: "UPDATE_CARD_OPTIMISTIC",
          payload: {
            cardId,
            updates: { labels: [...(currentCard.labels || []), optimisticLabel] },
          },
        })
      }

      try {
        const realLabel = await trelloHook.addLabel(cardId, labelData)
        if (currentCard) {
          const updatedLabels = (currentCard.labels || []).map((label) =>
            label.id === optimisticLabel.id ? realLabel : label,
          )
          dispatch({
            type: "UPDATE_CARD_OPTIMISTIC",
            payload: { cardId, updates: { labels: updatedLabels } },
          })
        }
        dispatch({ type: "REVERT_OPTIMISTIC", payload: optimisticLabel.id })
      } catch (error) {
        if (state.currentBoard) {
          const board = await trelloHook.fetchBoard(state.currentBoard.id)
          dispatch({ type: "SET_CURRENT_BOARD", payload: board })
        }
        dispatch({ type: "SET_ERROR", payload: "Error adding label" })
      }
    },
    [trelloHook, state.currentBoard],
  )

  const removeLabelOptimistic = useCallback(
    async (labelId: string) => {
      const currentCard = (state.currentBoard?.lists || [])
        .flatMap((list) => list.cards || [])
        .find((card) => (card.labels || []).some((label) => label.id === labelId))

      if (currentCard) {
        const updatedLabels = (currentCard.labels || []).filter((label) => label.id !== labelId)
        dispatch({
          type: "UPDATE_CARD_OPTIMISTIC",
          payload: {
            cardId: currentCard.id,
            updates: { labels: updatedLabels },
          },
        })
      }

      try {
        await trelloHook.removeLabel(labelId)
        dispatch({ type: "REVERT_OPTIMISTIC", payload: labelId })
      } catch (error) {
        if (state.currentBoard) {
          const board = await trelloHook.fetchBoard(state.currentBoard.id)
          dispatch({ type: "SET_CURRENT_BOARD", payload: board })
        }
        dispatch({ type: "SET_ERROR", payload: "Error removing label" })
      }
    },
    [trelloHook, state.currentBoard],
  )

  const addCommentOptimistic = useCallback(
    async (cardId: string, content: string) => {
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        content,
        cardId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const currentCard = (state.currentBoard?.lists || [])
        .flatMap((list) => list.cards || [])
        .find((card) => card.id === cardId)

      if (currentCard) {
        dispatch({
          type: "UPDATE_CARD_OPTIMISTIC",
          payload: {
            cardId,
            updates: { comments: [...(currentCard.comments || []), optimisticComment] },
          },
        })
      }

      try {
        const realComment = await trelloHook.addComment(cardId, content)
        if (currentCard) {
          const updatedComments = (currentCard.comments || []).map((comment) =>
            comment.id === optimisticComment.id ? realComment : comment,
          )
          dispatch({
            type: "UPDATE_CARD_OPTIMISTIC",
            payload: { cardId, updates: { comments: updatedComments } },
          })
        }
        dispatch({ type: "REVERT_OPTIMISTIC", payload: optimisticComment.id })
      } catch (error) {
        if (state.currentBoard) {
          const board = await trelloHook.fetchBoard(state.currentBoard.id)
          dispatch({ type: "SET_CURRENT_BOARD", payload: board })
        }
        dispatch({ type: "SET_ERROR", payload: "Error adding comment" })
      }
    },
    [trelloHook, state.currentBoard],
  )

  const removeCommentOptimistic = useCallback(
    async (commentId: string) => {
      const currentCard = (state.currentBoard?.lists || [])
        .flatMap((list) => list.cards || [])
        .find((card) => (card.comments || []).some((comment) => comment.id === commentId))

      if (currentCard) {
        const updatedComments = (currentCard.comments || []).filter((comment) => comment.id !== commentId)
        dispatch({
          type: "UPDATE_CARD_OPTIMISTIC",
          payload: {
            cardId: currentCard.id,
            updates: { comments: updatedComments },
          },
        })
      }

      try {
        await trelloHook.removeComment(commentId)
        dispatch({ type: "REVERT_OPTIMISTIC", payload: commentId })
      } catch (error) {
        if (state.currentBoard) {
          const board = await trelloHook.fetchBoard(state.currentBoard.id)
          dispatch({ type: "SET_CURRENT_BOARD", payload: board })
        }
        dispatch({ type: "SET_ERROR", payload: "Error removing comment" })
      }
    },
    [trelloHook, state.currentBoard],
  )

  const isOptimistic = useCallback(
    (id: string) => {
      return state.optimisticUpdates.has(id)
    },
    [state.optimisticUpdates],
  )

  // Initialize boards on mount
  React.useEffect(() => {
    const initializeBoards = async () => {
      dispatch({ type: "SET_LOADING", payload: true })
      try {
        const boards = await trelloHook.fetchBoards()
        dispatch({ type: "SET_BOARDS", payload: boards })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Error loading boards" })
      }
    }

    initializeBoards()
  }, [])

  const value: TrelloContextType = {
    ...state,
    createBoardOptimistic,
    updateBoardOptimistic,
    deleteBoardOptimistic,
    fetchBoard,
    createListOptimistic,
    updateListOptimistic,
    deleteListOptimistic,
    createCardOptimistic,
    updateCardOptimistic,
    deleteCardOptimistic,
    moveCardOptimistic,
    addLabelOptimistic,
    removeLabelOptimistic,
    addCommentOptimistic,
    removeCommentOptimistic,
    isOptimistic,
  }

  return <TrelloContext.Provider value={value}>{children}</TrelloContext.Provider>
}

export function useTrelloContext() {
  const context = useContext(TrelloContext)
  if (context === undefined) {
    throw new Error("useTrelloContext must be used within a TrelloProvider")
  }
  return context
}
