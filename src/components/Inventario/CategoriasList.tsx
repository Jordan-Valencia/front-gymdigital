"use client"

import React, { useState } from "react"
import { Search, Plus, Edit, Trash2, Tag } from "lucide-react"
import { useGymData } from "../../hooks/useGymData"
import { useToast } from "../../contexts/ToastContext"
import { CategoriaForm } from "./CategoriaForm"
import type { CategoriaInventario } from "../../types"

interface CategoriasListProps {
  refreshKey: number
}

export function CategoriasList({ refreshKey }: CategoriasListProps) {
  const { categorias, eliminarCategoria } = useGymData()
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<CategoriaInventario | null>(null)

  React.useEffect(() => {
    // Los datos se cargan automáticamente en useGymData
  }, [refreshKey])

  const filteredCategorias = categorias.filter(
    (categoria: CategoriaInventario) =>
      categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoria.tipo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      try {
        await eliminarCategoria(id)
        showToast("Categoría eliminada exitosamente", "success")
      } catch (error) {
        showToast("Error al eliminar la categoría", "error")
      }
    }
  }

  const handleEdit = (categoria: CategoriaInventario) => {
    setEditingCategoria(categoria)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCategoria(null)
  }

  const handleSaveCategoria = () => {
    showToast(editingCategoria ? "Categoría actualizada exitosamente" : "Categoría creada exitosamente", "success")
    handleCloseForm()
  }

  const getTipoColor = (tipo: string) => {
    return tipo === "implemento"
      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
      : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 
            rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
        >
          <Plus size={20} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      <div className="grid gap-4">
        {filteredCategorias.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {searchTerm ? "No se encontraron categorías" : "No hay categorías registradas"}
          </div>
        ) : (
          filteredCategorias.map((categoria: CategoriaInventario) => (
            <div
              key={categoria.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Tag className="text-blue-600 dark:text-blue-400" size={20} />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{categoria.nombre}</h3>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(categoria.tipo)}`}
                      >
                        {categoria.tipo}
                      </span>
                    </div>
                  </div>

                  {categoria.descripcion && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{categoria.descripcion}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(categoria)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 
                      hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Editar categoría"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(categoria.id)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 
                      hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Eliminar categoría"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <CategoriaForm categoria={editingCategoria} onClose={handleCloseForm} onSave={handleSaveCategoria} />
      )}
    </div>
  )
}
