"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  MessageSquare,
  Paperclip,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Zap,
  X,
  ArrowLeft,
  GripVertical,
} from "lucide-react"
import { useTrelloContext } from "../../contexts/TrelloContext"
import type { Card, Board, List } from "../../hooks/useTrello"

interface TrelloBoardProps {
  onBack: () => void
}

export function TrelloBoard({ onBack }: TrelloBoardProps) {
  const {
    currentBoard,
    loading,
    error,
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
  } = useTrelloContext()

  // Estado local del board - ÚNICA FUENTE DE VERDAD PARA LA UI
  const [localBoard, setLocalBoard] = useState<Board | null>(null)
  
  // Estados del componente
  const [newListTitle, setNewListTitle] = useState("")
  const [showNewListForm, setShowNewListForm] = useState(false)
  const [editingList, setEditingList] = useState<string | null>(null)
  const [editingCard, setEditingCard] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [draggedCard, setDraggedCard] = useState<Card | null>(null)
  const [draggedOverList, setDraggedOverList] = useState<string | null>(null)

  // Card form states
  const [newCardTitle, setNewCardTitle] = useState("")
  const [showNewCardForm, setShowNewCardForm] = useState<string | null>(null)

  // Label form states
  const [showLabelForm, setShowLabelForm] = useState(false)
  const [labelFormData, setLabelFormData] = useState({ name: "", color: "#0891b2" })

  // Comment form states
  const [newComment, setNewComment] = useState("")

  const newListInputRef = useRef<HTMLInputElement>(null)
  const newCardInputRef = useRef<HTMLInputElement>(null)

  // Sincronizar localBoard con currentBoard SOLO al inicio o cambio de board
  useEffect(() => {
    if (currentBoard && (!localBoard || currentBoard.id !== localBoard.id)) {
      setLocalBoard(currentBoard)
    }
  }, [currentBoard?.id])

  // Actualizar selectedCard cuando cambie localBoard
  useEffect(() => {
    if (selectedCard && localBoard) {
      const updatedCard = localBoard.lists.flatMap((list) => list.cards).find((card) => card.id === selectedCard.id)
      if (updatedCard) {
        setSelectedCard(updatedCard)
      }
    }
  }, [localBoard])

  useEffect(() => {
    if (showNewListForm && newListInputRef.current) {
      newListInputRef.current.focus()
    }
  }, [showNewListForm])

  useEffect(() => {
    if (showNewCardForm && newCardInputRef.current) {
      newCardInputRef.current.focus()
    }
  }, [showNewCardForm])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border rounded-lg p-4 dark:border-destructive/30">
        <p className="text-destructive dark:text-red-400">Error: {error}</p>
      </div>
    )
  }

  if (!localBoard) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay tablero seleccionado</p>
      </div>
    )
  }

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newListTitle.trim() || !localBoard) return

    const tempId = `temp-list-${Date.now()}`
    const newList: List = {
      id: tempId,
      title: newListTitle,
      cards: [],
      boardId: localBoard.id,
      position: localBoard.lists.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Actualizar estado local INMEDIATAMENTE
    setLocalBoard(prev => prev ? {
      ...prev,
      lists: [...prev.lists, newList],
    } : null)

    // Limpiar formulario INMEDIATAMENTE
    setNewListTitle("")
    setShowNewListForm(false)

    // Llamar backend sin ID temporal
    try {
      await createListOptimistic({ title: newList.title, boardId: localBoard.id })
    } catch (error) {
      console.error('Error creating list:', error)
      // Remover lista temporal si falla
      setLocalBoard(prev => prev ? {
        ...prev,
        lists: prev.lists.filter(list => list.id !== tempId),
      } : null)
    }
  }

  const handleUpdateList = async (listId: string, title: string) => {
    if (!localBoard) return

    // Si es ID temporal, solo actualizar localmente
    if (listId.startsWith('temp-')) {
      setLocalBoard(prev => prev ? {
        ...prev,
        lists: prev.lists.map((list) =>
          list.id === listId ? { ...list, title, updatedAt: new Date().toISOString() } : list
        ),
      } : null)
      setEditingList(null)
      return
    }

    // Actualizar estado local INMEDIATAMENTE
    setLocalBoard(prev => prev ? {
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === listId ? { ...list, title, updatedAt: new Date().toISOString() } : list
      ),
    } : null)

    setEditingList(null)

    // Llamar backend solo con ID real
    try {
      await updateListOptimistic(listId, { title })
    } catch (error) {
      console.error('Error updating list:', error)
    }
  }

  const handleDeleteList = async (listId: string) => {
    if (!localBoard) return
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta lista?")) return

    // Actualizar estado local INMEDIATAMENTE
    setLocalBoard(prev => prev ? {
      ...prev,
      lists: prev.lists.filter((list) => list.id !== listId),
    } : null)

    // Solo llamar backend si NO es temporal
    if (!listId.startsWith('temp-')) {
      try {
        await deleteListOptimistic(listId)
      } catch (error) {
        console.error('Error deleting list:', error)
      }
    }
  }

  const handleCreateCard = async (listId: string, e: React.FormEvent) => {
    e.preventDefault()
    if (!newCardTitle.trim() || !localBoard) return
  
    // Llamar primero al backend para crear la card y obtener el ID real
    try {
      // createCardOptimistic debe devolver el ID real creado
      const realId: string = await createCardOptimistic({ title: newCardTitle, listId, priority: "LOW", completed: false })
  
      const newCard: Card = {
        id: realId,
        title: newCardTitle,
        description: "",
        priority: "LOW",
        completed: false,
        listId,
        position: localBoard.lists.find((list) => list.id === listId)?.cards.length || 0,
        dueDate: undefined,
        labels: [],
        comments: [],
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
  
      // Actualizar estado local con el ID real
      setLocalBoard(prev => prev ? {
        ...prev,
        lists: prev.lists.map((list) =>
          list.id === listId ? { ...list, cards: [...list.cards, newCard] } : list
        ),
      } : null)
  
      // Limpiar formulario después de crear en backend
      setNewCardTitle("")
      setShowNewCardForm(null)
  
    } catch (error) {
      console.error('Error creating card:', error)
    }
  }
  

  const handleUpdateCard = async (cardId: string, updates: Partial<Card>) => {
    if (!localBoard) return

    // Actualizar estado local INMEDIATAMENTE
    setLocalBoard(prev => prev ? {
      ...prev,
      lists: prev.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
          card.id === cardId ? { ...card, ...updates, updatedAt: new Date().toISOString() } : card
        ),
      })),
    } : null)

    setEditingCard(null)

    // Solo llamar backend si NO es temporal
    if (!cardId.startsWith('temp-')) {
      try {
        await updateCardOptimistic(cardId, updates)
      } catch (error) {
        console.error('Error updating card:', error)
      }
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!localBoard) return
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta tarjeta?")) return

    // Actualizar estado local INMEDIATAMENTE
    setLocalBoard(prev => prev ? {
      ...prev,
      lists: prev.lists.map((list) => ({
        ...list,
        cards: list.cards.filter((card) => card.id !== cardId),
      })),
    } : null)

    setSelectedCard(null)

    // Solo llamar backend si NO es temporal
    if (!cardId.startsWith('temp-')) {
      try {
        await deleteCardOptimistic(cardId)
      } catch (error) {
        console.error('Error deleting card:', error)
      }
    }
  }

  const handleDragStart = (e: React.DragEvent, card: Card) => {
    setDraggedCard(card)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, listId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDraggedOverList(listId)
  }

  const handleDragLeave = () => {
    setDraggedOverList(null)
  }

  const handleDrop = async (e: React.DragEvent, targetListId: string) => {
    e.preventDefault()
    setDraggedOverList(null)

    if (!draggedCard || draggedCard.listId === targetListId || !localBoard) {
      setDraggedCard(null)
      return
    }

    const targetList = localBoard.lists.find((list) => list.id === targetListId)
    const newPosition = targetList ? targetList.cards.length : 0

    // Actualizar estado local INMEDIATAMENTE
    setLocalBoard(prev => prev ? {
      ...prev,
      lists: prev.lists.map((list) => {
        if (list.id === draggedCard.listId) {
          return {
            ...list,
            cards: list.cards.filter((card) => card.id !== draggedCard.id),
          }
        }
        if (list.id === targetListId) {
          return {
            ...list,
            cards: [...list.cards, { ...draggedCard, listId: targetListId, position: newPosition }],
          }
        }
        return list
      }),
    } : null)

    setDraggedCard(null)

    // Solo llamar backend si ambos IDs NO son temporales
    if (!draggedCard.id.startsWith('temp-') && !targetListId.startsWith('temp-')) {
      try {
        await moveCardOptimistic(draggedCard.id, targetListId, newPosition)
      } catch (error) {
        console.error('Error moving card:', error)
      }
    }
  }

  const handleAddLabel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCard || !labelFormData.name.trim() || !localBoard) return

    const tempId = `temp-label-${Date.now()}`
    const newLabel = {
      id: tempId,
      name: labelFormData.name,
      color: labelFormData.color,
      cardId: selectedCard.id,
    }

    // Actualizar estado local INMEDIATAMENTE
    setLocalBoard(prev => prev ? {
      ...prev,
      lists: prev.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
          card.id === selectedCard.id ? { ...card, labels: [...card.labels, newLabel] } : card
        ),
      })),
    } : null)

    // Limpiar formulario INMEDIATAMENTE
    setLabelFormData({ name: "", color: "#0891b2" })
    setShowLabelForm(false)

    // Solo llamar backend si la tarjeta NO es temporal
    if (!selectedCard.id.startsWith('temp-')) {
      try {
        await addLabelOptimistic(selectedCard.id, { name: newLabel.name, color: newLabel.color })
      } catch (error) {
        console.error('Error adding label:', error)
        // Remover label temporal si falla
        setLocalBoard(prev => prev ? {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) => ({
              ...card,
              labels: card.labels.filter((label) => label.id !== tempId),
            })),
          })),
        } : null)
      }
    }
  }

  const handleRemoveLabel = async (labelId: string) => {
    if (!localBoard) return

    // Actualizar estado local INMEDIATAMENTE
    setLocalBoard(prev => prev ? {
      ...prev,
      lists: prev.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) => ({
          ...card,
          labels: card.labels.filter((label) => label.id !== labelId),
        })),
      })),
    } : null)

    // Solo llamar backend si NO es temporal
    if (!labelId.startsWith('temp-')) {
      try {
        await removeLabelOptimistic(labelId)
      } catch (error) {
        console.error('Error removing label:', error)
      }
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCard || !newComment.trim() || !localBoard) return

    const tempId = `temp-comment-${Date.now()}`
    const newCommentObj = {
      id: tempId,
      content: newComment,
      cardId: selectedCard.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Actualizar estado local INMEDIATAMENTE
    setLocalBoard(prev => prev ? {
      ...prev,
      lists: prev.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
          card.id === selectedCard.id ? { ...card, comments: [...card.comments, newCommentObj] } : card
        ),
      })),
    } : null)

    // Limpiar formulario INMEDIATAMENTE
    setNewComment("")

    // Solo llamar backend si la tarjeta NO es temporal
    if (!selectedCard.id.startsWith('temp-')) {
      try {
        await addCommentOptimistic(selectedCard.id, newComment)
      } catch (error) {
        console.error('Error adding comment:', error)
        // Remover comentario temporal si falla
        setLocalBoard(prev => prev ? {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) => ({
              ...card,
              comments: card.comments.filter((comment) => comment.id !== tempId),
            })),
          })),
        } : null)
      }
    }
  }

  const handleRemoveComment = async (commentId: string) => {
    if (!localBoard) return

    // Actualizar estado local INMEDIATAMENTE
    setLocalBoard(prev => prev ? {
      ...prev,
      lists: prev.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) => ({
          ...card,
          comments: card.comments.filter((comment) => comment.id !== commentId),
        })),
      })),
    } : null)

    // Solo llamar backend si NO es temporal
    if (!commentId.startsWith('temp-')) {
      try {
        await removeCommentOptimistic(commentId)
      } catch (error) {
        console.error('Error removing comment:', error)
      }
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "LOW":
        return <Circle className="w-4 h-4 text-green-500" />
      case "MEDIUM":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "HIGH":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case "URGENT":
        return <Zap className="w-4 h-4 text-red-500" />
      default:
        return <Circle className="w-4 h-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "border-l-green-500 bg-green-50/30 dark:bg-green-900/10"
      case "MEDIUM":
        return "border-l-yellow-500 bg-yellow-50/30 dark:bg-yellow-900/10"
      case "HIGH":
        return "border-l-orange-500 bg-orange-50/30 dark:bg-orange-900/10"
      case "URGENT":
        return "border-l-red-500 bg-red-50/30 dark:bg-red-900/10"
      default:
        return "border-l-gray-500 bg-gray-50/30 dark:bg-gray-900/10"
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
      case "HIGH":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
      case "URGENT":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300"
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background to-muted/20 dark:from-gray-950 dark:to-gray-900">
      <div className="flex items-center justify-between mb-6 p-6 bg-card/50 dark:bg-gray-900/60 backdrop-blur-sm border-b border-border/50 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white hover:bg-accent dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-white">{localBoard.title}</h1>
            {localBoard.description && (
              <p className="text-muted-foreground dark:text-gray-400 mt-1">{localBoard.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-gray-400">
          <span className="flex items-center gap-1">
            <GripVertical className="w-4 h-4" />
            {localBoard.lists.length} listas
          </span>
          <span className="flex items-center gap-1">
            <Circle className="w-4 h-4" />
            {localBoard.lists.reduce((total, list) => total + list.cards.length, 0)} tarjetas
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto px-6">
        <div className="flex gap-6 h-full pb-6" style={{ minWidth: "max-content" }}>
          {/* Lists */}
          {localBoard.lists.map((list) => (
            <div
              key={list.id}
              className={`flex-shrink-0 w-80 bg-card/80 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 h-fit max-h-full flex flex-col border border-border/50 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 ${
                draggedOverList === list.id ? "ring-2 ring-primary shadow-primary/25" : ""
              } ${list.id.startsWith('temp-') ? "opacity-75 animate-pulse" : ""}`}
              onDragOver={(e) => handleDragOver(e, list.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, list.id)}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/30 dark:border-gray-700">
                {editingList === list.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      const title = formData.get("title") as string
                      handleUpdateList(list.id, title)
                    }}
                    className="flex-1"
                  >
                    <input
                      name="title"
                      defaultValue={list.title}
                      className="w-full px-3 py-2 text-sm font-semibold bg-input dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg text-foreground dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      onBlur={() => setEditingList(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setEditingList(null)
                      }}
                      autoFocus
                    />
                  </form>
                ) : (
                  <h3
                    className="font-semibold text-foreground dark:text-gray-100 cursor-pointer hover:text-primary dark:hover:text-secondary transition-colors flex items-center gap-2"
                    onClick={() => setEditingList(list.id)}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground dark:text-gray-400" />
                    {list.title}
                    <span className="text-xs bg-muted dark:bg-gray-700 text-muted-foreground dark:text-gray-300 px-2 py-1 rounded-full">
                      {list.cards.length}
                    </span>
                  </h3>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingList(list.id)}
                    className="p-1.5 text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white hover:bg-accent dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteList(list.id)}
                    className="p-1.5 text-muted-foreground dark:text-red-400 hover:text-destructive dark:hover:text-red-500 hover:bg-destructive/10 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-hidden max-h-96 scrollbar-thin scrollbar-thumb-muted dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {list.cards.map((card) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card)}
                    onClick={() => setSelectedCard(card)}
                    className={`bg-background/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border-l-4 ${getPriorityColor(card.priority)} cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group ${
                      draggedCard?.id === card.id ? "opacity-50 rotate-2" : ""
                    } ${card.id.startsWith('temp-') ? "opacity-75" : ""} ${card.completed ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4
                        className={`font-medium text-foreground dark:text-gray-100 text-sm leading-tight flex-1 pr-2 ${
                          card.completed ? "line-through text-muted-foreground dark:text-gray-400" : ""
                        }`}
                      >
                        {card.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityBadge(card.priority)} shadow-sm border`}
                        >
                          {card.priority}
                        </span>
                        {card.completed && <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />}
                      </div>
                    </div>

                    {card.description && (
                      <p
                        className={`text-xs text-muted-foreground dark:text-gray-300 mb-3 line-clamp-2 leading-relaxed ${
                          card.completed ? "opacity-60" : ""
                        }`}
                      >
                        {card.description}
                      </p>
                    )}

                    {card.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {card.labels.map((label) => (
                          <span
                            key={label.id}
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm hover:shadow-md transition-all ${
                              card.completed ? "opacity-60" : ""
                            } ${label.id.startsWith('temp-') ? "opacity-75" : ""}`}
                            style={{ backgroundColor: label.color }}
                          >
                            {label.name}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveLabel(label.id)
                              }}
                              className="hover:bg-black/20 dark:hover:bg-white/20 rounded-full p-0.5 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-gray-400">
                      <div className="flex items-center gap-3">
                        {card.dueDate && (
                          <span className="flex items-center gap-1 bg-muted/50 dark:bg-gray-700/50 px-2 py-1 rounded">
                            <Calendar className="w-3 h-3" />
                            {new Date(card.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {card.comments.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {card.comments.length}
                          </span>
                        )}
                        {card.attachments.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            {card.attachments.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {showNewCardForm === list.id ? (
                <form onSubmit={(e) => handleCreateCard(list.id, e)} className="mt-4">
                  <input
                    ref={newCardInputRef}
                    type="text"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    placeholder="Título de la tarjeta..."
                    className="w-full px-3 py-2 text-sm bg-input dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg text-foreground dark:text-gray-100 placeholder-muted-foreground dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary dark:bg-blue-700 text-primary-foreground dark:text-white text-sm rounded-lg hover:bg-primary/90 dark:hover:bg-blue-800 transition-all duration-200 hover:scale-105"
                    >
                      Agregar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCardForm(null)
                        setNewCardTitle("")
                      }}
                      className="px-4 py-2 text-muted-foreground dark:text-gray-400 text-sm hover:text-foreground dark:hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowNewCardForm(list.id)}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-3 text-sm text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white hover:bg-accent dark:hover:bg-gray-700 rounded-lg transition-all duration-200 border-2 border-dashed border-border dark:border-gray-700 hover:border-primary dark:hover:border-blue-500"
                >
                  <Plus className="w-4 h-4" />
                  Agregar tarjeta
                </button>
              )}
            </div>
          ))}

          {showNewListForm ? (
            <div className="flex-shrink-0 w-72 bg-card/80 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 border border-border/50 dark:border-gray-800 shadow-lg">
              <form onSubmit={handleCreateList}>
                <input
                  ref={newListInputRef}
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="Título de la lista..."
                  className="w-full px-3 py-2 text-sm bg-input dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg text-foreground dark:text-gray-100 placeholder-muted-foreground dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-primary dark:bg-blue-700 text-primary-foreground dark:text-white text-sm rounded-lg hover:bg-primary/90 dark:hover:bg-blue-800 transition-all duration-200"
                  >
                    Agregar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewListForm(false)
                      setNewListTitle("")
                    }}
                    className="px-3 py-1.5 text-muted-foreground dark:text-gray-400 text-sm hover:text-foreground dark:hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setShowNewListForm(true)}
              className="flex-shrink-0 w-56 h-fit bg-muted/30 dark:bg-gray-700/30 hover:bg-muted/50 dark:hover:bg-gray-700/60 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center gap-2 text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-all duration-200 border-2 border-dashed border-border dark:border-gray-700 hover:border-primary dark:hover:border-blue-500"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Agregar lista</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de la tarjeta seleccionada */}
      {selectedCard && (
        <div className="fixed inset-0 bg-white/90 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card/95 dark:bg-gray-850 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border/50 dark:border-gray-800">
            <div className="flex items-center justify-between p-6 border-b border-border/50 dark:border-gray-800">
              <div className="flex items-center gap-3">
                {getPriorityIcon(selectedCard.priority)}
                <h3 className="text-xl font-semibold text-foreground dark:text-gray-100">{selectedCard.title}</h3>
                {isOptimistic(selectedCard.id) && (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full animate-pulse dark:bg-gray-700 dark:text-gray-400">
                    Guardando...
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white hover:bg-accent dark:hover:bg-gray-700 rounded-lg p-2 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-foreground dark:text-gray-100 mb-3">Prioridad</h4>
                <div className="flex gap-2">
                  {["LOW", "MEDIUM", "HIGH", "URGENT"].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => handleUpdateCard(selectedCard.id, { priority: priority as any })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                        selectedCard.priority === priority
                          ? getPriorityBadge(priority) + " shadow-md"
                          : "bg-muted text-muted-foreground dark:bg-gray-700 dark:text-gray-300 hover:bg-accent dark:hover:bg-gray-800 hover:text-foreground dark:hover:text-white"
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleUpdateCard(selectedCard.id, { completed: !selectedCard.completed })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    selectedCard.completed
                      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                      : "bg-muted text-muted-foreground dark:bg-gray-700 dark:text-gray-300 hover:bg-accent dark:hover:bg-gray-800 hover:text-foreground dark:hover:text-white"
                  }`}
                >
                  {selectedCard.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  {selectedCard.completed ? "Completada" : "Marcar como completada"}
                </button>
                <button
                  onClick={() => handleDeleteCard(selectedCard.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-destructive/10 dark:bg-red-900/20 text-destructive dark:text-red-400 rounded-lg text-sm font-medium hover:bg-destructive/20 dark:hover:bg-red-900/40 transition-all duration-200 hover:scale-105"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-foreground dark:text-gray-100 mb-3">Descripción</h4>
                {editingCard === selectedCard.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      const description = formData.get("description") as string
                      handleUpdateCard(selectedCard.id, { description })
                    }}
                  >
                    <textarea
                      name="description"
                      defaultValue={selectedCard.description || ""}
                      className="w-full px-4 py-3 border border-border dark:border-gray-700 rounded-lg bg-input dark:bg-gray-800 text-foreground dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      rows={4}
                      placeholder="Agregar descripción..."
                    />
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary dark:bg-blue-700 text-primary-foreground dark:text-white text-sm rounded-lg hover:bg-primary/90 dark:hover:bg-blue-800 transition-all duration-200"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCard(null)}
                        className="px-4 py-2 text-muted-foreground dark:text-gray-400 text-sm hover:text-foreground dark:hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div
                    onClick={() => setEditingCard(selectedCard.id)}
                    className="min-h-[80px] p-4 border border-border dark:border-gray-700 rounded-lg bg-muted/30 dark:bg-gray-700/30 cursor-pointer hover:bg-muted/50 dark:hover:bg-gray-700/60 transition-all duration-200"
                  >
                    {selectedCard.description ? (
                      <p className="text-foreground dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                        {selectedCard.description}
                      </p>
                    ) : (
                      <p className="text-muted-foreground dark:text-gray-400">
                        Haz clic para agregar una descripción...
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground dark:text-gray-100">Etiquetas</h4>
                  <button
                    onClick={() => setShowLabelForm(true)}
                    className="text-primary dark:text-blue-400 hover:text-primary/80 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    Agregar etiqueta
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCard.labels.map((label) => (
                    <span
                      key={label.id}
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm hover:shadow-md transition-all ${
                        label.id.startsWith('temp-') ? "opacity-75" : ""
                      }`}
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                      <button
                        onClick={() => handleRemoveLabel(label.id)}
                        className="hover:bg-black/20 dark:hover:bg-white/20 rounded-full p-0.5 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {showLabelForm && (
                  <form
                    onSubmit={handleAddLabel}
                    className="mt-4 p-4 border border-border dark:border-gray-700 rounded-lg bg-muted/30 dark:bg-gray-700/30"
                  >
                    <div className="flex gap-3 mb-3">
                      <input
                        type="text"
                        value={labelFormData.name}
                        onChange={(e) => setLabelFormData({ ...labelFormData, name: e.target.value })}
                        placeholder="Nombre de la etiqueta"
                        className="flex-1 px-3 py-2 text-sm border border-border dark:border-gray-700 rounded-lg bg-input dark:bg-gray-800 text-foreground dark:text-gray-100"
                      />
                      <input
                        type="color"
                        value={labelFormData.color}
                        onChange={(e) => setLabelFormData({ ...labelFormData, color: e.target.value })}
                        className="w-12 h-10 border border-border dark:border-gray-700 rounded-lg"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary dark:bg-blue-700 text-primary-foreground dark:text-white text-sm rounded-lg hover:bg-primary/90 dark:hover:bg-blue-800 transition-all"
                      >
                        Agregar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLabelForm(false)
                          setLabelFormData({ name: "", color: "#0891b2" })
                        }}
                        className="px-4 py-2 text-muted-foreground dark:text-gray-400 text-sm hover:text-foreground dark:hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-foreground dark:text-gray-100 mb-4">
                  Comentarios ({selectedCard.comments.length})
                </h4>
                <form onSubmit={handleAddComment} className="mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribir un comentario..."
                    className="w-full px-4 py-3 border border-border dark:border-gray-700 rounded-lg bg-input dark:bg-gray-800 text-foreground dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    rows={3}
                  />
                  <button
                    type="submit"
                    className="mt-3 px-4 py-2 bg-primary dark:bg-blue-700 text-primary-foreground dark:text-white text-sm rounded-lg hover:bg-primary/90 dark:hover:bg-blue-800 transition-all duration-200"
                  >
                    Comentar
                  </button>
                </form>
                <div className="space-y-4">
                  {selectedCard.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`bg-muted/30 dark:bg-gray-700/30 rounded-lg p-4 border border-border/30 dark:border-gray-700 ${
                        comment.id.startsWith('temp-') ? "opacity-75" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleRemoveComment(comment.id)}
                          className="text-destructive dark:text-red-400 hover:text-destructive/80 dark:hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-foreground dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
