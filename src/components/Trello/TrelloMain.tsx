"use client"

import type React from "react"
import { useState } from "react"
import { Plus, Trello, Edit2, Trash2, Eye, Sparkles, BarChart3 } from "lucide-react"
import { useTrelloContext } from "../../contexts/TrelloContext"
import { TrelloBoard } from "./TrelloBoard"
import { Board } from "../../hooks/useTrello"

export function TrelloMain() {
    const {
        boards,
        currentBoard,
        loading,
        error,
        createBoardOptimistic,
        updateBoardOptimistic,
        deleteBoardOptimistic,
        fetchBoard,
    } = useTrelloContext()

    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingBoard, setEditingBoard] = useState<any>(null)
    const [viewMode, setViewMode] = useState<"boards" | "board">("boards")
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        color: "#0891b2",
    })

    const handleCreateBoard = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title.trim()) return

        await createBoardOptimistic(formData)
        setFormData({ title: "", description: "", color: "#0891b2" })
        setShowCreateForm(false)
    }

    const handleUpdateBoard = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingBoard || !formData.title.trim()) return

        await updateBoardOptimistic(editingBoard.id, formData)
        setFormData({ title: "", description: "", color: "#0891b2" })
        setEditingBoard(null)
    }

    const handleDeleteBoard = async (boardId: string) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este tablero?")) {
            await deleteBoardOptimistic(boardId)
        }
    }

    const handleOpenBoard = async (board: any) => {
        await fetchBoard(board.id)
        setViewMode("board")
    }

    const handleEditBoard = (board: any) => {
        setEditingBoard(board)
        setFormData({
            title: board.title,
            description: board.description || "",
            color: board.color,
        })
    }

    const resetForm = () => {
        setFormData({ title: "", description: "", color: "#0891b2" })
        setShowCreateForm(false)
        setEditingBoard(null)
    }

    if (viewMode === "board" && currentBoard) {
        return <TrelloBoard onBack={() => setViewMode("boards")} />
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-primary/30"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                    <p className="text-destructive font-medium">Error de conexión</p>
                </div>
                <p className="text-destructive/80 text-sm">{error}</p>
                <p className="text-destructive/60 text-xs mt-2">
                    Asegúrate de que tu servidor NestJS esté ejecutándose y que la variable NEXT_PUBLIC_API_URL esté configurada.
                </p>
            </div>
        )
    }
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 
dark:from-blue-900/30 dark:via-purple-900/20 dark:to-indigo-900/30 
rounded-2xl p-8 border border-border/50 dark:border-gray-700 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-gray-950 dark:to-gray-900"></div>
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative p-3 bg-primary/10 dark:bg-gray-900 rounded-xl border border-primary/20 dark:border-gray-700 group hover:scale-110 transition-transform duration-300">
                            <Trello className="w-8 h-8 text-primary dark:text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary dark:bg-blue-700 rounded-full animate-bounce"></div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text dark:from-blue-400 dark:to-purple-500 dark:text-transparent">
                                Mis Tableros
                            </h1>
                            <p className="text-muted-foreground dark:text-gray-400 mt-1 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Organiza tus tareas
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="group flex items-center gap-3 px-6 py-3 bg-primary dark:bg-blue-700 text-primary-foreground dark:text-white rounded-xl hover:bg-primary/90 dark:hover:bg-blue-800 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-medium">Nuevo Tablero</span>
                    </button>
                </div>


            </div>

            {(showCreateForm || editingBoard) && (
                <div className="animate-in slide-in-from-top duration-500 bg-card/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-border/50 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 dark:bg-gray-800 rounded-lg">
                            <Edit2 className="w-5 h-5 text-primary dark:text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-semibold text-foreground dark:text-gray-100">
                            {editingBoard ? "Editar Tablero" : "Crear Nuevo Tablero"}
                        </h3>
                    </div>

                    <form onSubmit={editingBoard ? handleUpdateBoard : handleCreateBoard} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-foreground dark:text-gray-100">Título</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 border border-border dark:border-gray-900 rounded-xl bg-input dark:bg-gray-800 text-foreground dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-primary/50"
                                placeholder="Nombre del tablero..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-foreground dark:text-gray-100">Descripción (opcional)</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 border border-border dark:border-gray-900 rounded-xl bg-input dark:bg-gray-800 text-foreground dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-primary/50 resize-none"
                                placeholder="Descripción del tablero..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-foreground dark:text-gray-100">Color del tablero</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-16 h-12 border border-border dark:border-gray-900 rounded-xl cursor-pointer hover:scale-105 transition-transform duration-200"
                                />
                                <div
                                    className="flex-1 h-12 rounded-xl border border-border dark:border-gray-900 shadow-inner transition-all duration-300 hover:shadow-lg"
                                    style={{ backgroundColor: formData.color }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-3 bg-primary dark:bg-blue-700 text-primary-foreground dark:text-white rounded-xl hover:bg-primary/90 dark:hover:bg-blue-800 transition-all duration-200 hover:scale-105 hover:shadow-lg font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                {editingBoard ? "Actualizar" : "Crear Tablero"}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white hover:bg-accent dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {boards.map((board: Board, index: number) => (
                    <div
                        key={board.id}
                        className="group animate-in fade-in slide-in-from-bottom bg-card/80 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-lg border border-border/50 dark:border-gray-900 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Board Header */}
                        <div
                            className="h-24 p-6 flex items-center justify-between relative overflow-hidden"
                            style={{ backgroundColor: board.color }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent dark:from-black/30 dark:to-black/0"></div>
                            <h3 className="relative font-semibold text-white truncate text-lg group-hover:scale-105 transition-transform duration-200">
                                {board.title}
                            </h3>
                            <div className="relative flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleOpenBoard(board)
                                    }}
                                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 dark:hover:bg-black/20 rounded-lg transition-all duration-200 hover:scale-110"
                                    title="Abrir tablero"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleEditBoard(board)
                                    }}
                                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 dark:hover:bg-black/20 rounded-lg transition-all duration-200 hover:scale-110"
                                    title="Editar tablero"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteBoard(board.id)
                                    }}
                                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 dark:hover:bg-black/20 rounded-lg transition-all duration-200 hover:scale-110"
                                    title="Eliminar tablero"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Board Content */}
                        <div className="p-6 space-y-4">
                            {board.description && (
                                <p className="text-sm text-muted-foreground dark:text-gray-400 line-clamp-2 leading-relaxed">{board.description}</p>
                            )}

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                                    <div className="w-2 h-2 bg-primary dark:bg-blue-400 rounded-full"></div>
                                    <span>{board.lists?.length || 0} listas</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                                    <div className="w-2 h-2 bg-secondary dark:bg-purple-400 rounded-full"></div>
                                    <span>
                                        {board.lists?.reduce((total: number, list: any) => total + (list.cards?.length || 0), 0) || 0} tarjetas
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleOpenBoard(board)}
                                className="w-full px-4 py-3 text-sm font-medium text-primary dark:text-blue-400 hover:text-primary-foreground dark:hover:text-white hover:bg-primary dark:hover:bg-blue-700 rounded-xl transition-all duration-200 hover:scale-105 border border-primary/20 dark:border-blue-900 hover:border-primary dark:hover:border-blue-500"
                            >
                                Abrir Tablero
                            </button>
                        </div>
                    </div>
                ))}

                {boards.length === 0 && !loading && (
                    <div className="col-span-full text-center py-16 animate-in fade-in slide-in-from-bottom duration-700">
                        <div className="relative mx-auto mb-8 w-24 h-24">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 dark:from-gray-900/20 dark:to-gray-800/20 rounded-full"></div>
                            <div className="relative p-6 bg-muted/50 dark:bg-gray-900/50 rounded-full backdrop-blur-sm border border-border/50 dark:border-gray-800">
                                <Trello className="w-12 h-12 text-muted-foreground dark:text-gray-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-semibold text-foreground dark:text-gray-100 mb-3">¡Comienza tu organización!</h3>
                        <p className="text-muted-foreground dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                            Crea tu primer tablero para empezar a organizar tus proyectos de manera visual y eficiente
                        </p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-secondary dark:from-blue-700 dark:to-purple-700 text-white dark:text-gray-100 rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105 font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Crear Primer Tablero
                        </button>
                    </div>
                )}
            </div>
        </div>
    )

}
