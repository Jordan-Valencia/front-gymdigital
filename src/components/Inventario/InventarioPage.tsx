"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Package, Tag, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react"
import { useGymData } from "../../hooks/useGymData"
import { useToast } from "../../contexts/ToastContext"
import { InventarioList } from "./InventarioList"
import { CategoriaForm } from "./CategoriaForm"
import type { CategoriaInventario } from "../../types"

interface InventarioPageProps {
  refreshKey: number
  onSave: () => void
}

export function InventarioPage({ refreshKey, onSave }: InventarioPageProps) {
  const { categorias, agregarCategoria, actualizarCategoria, eliminarCategoria } = useGymData()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<"items" | "categorias">("items")
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaInventario | null>(null)

  useEffect(() => {
    // Los datos se cargan automáticamente en useGymData
  }, [refreshKey])

  const handleAddCategoria = () => {
    setSelectedCategoria(null)
    setIsFormOpen(true)
  }

  const handleEditCategoria = (categoria: CategoriaInventario) => {
    setSelectedCategoria(categoria)
    setIsFormOpen(true)
  }

  const handleSaveCategoria = async (categoriaData: Omit<CategoriaInventario, "id">) => {
    try {
      if (selectedCategoria) {
        await actualizarCategoria(selectedCategoria.id, categoriaData)
        showToast("Categoría actualizada exitosamente", "success")
      } else {
        await agregarCategoria(categoriaData)
        showToast("Categoría creada exitosamente", "success")
      }
      setIsFormOpen(false)
      onSave()
    } catch (error) {
      showToast("Error al guardar la categoría", "error")
    }
  }

  const handleDeleteCategoria = async (categoria: CategoriaInventario) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
      try {
        await eliminarCategoria(categoria.id)
        showToast("Categoría eliminada exitosamente", "success")
      } catch (error) {
        showToast("Error al eliminar la categoría", "error")
      }
    }
  }

  const categoriasFiltradas = categorias.filter(
    (categoria: CategoriaInventario) =>
      categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoria.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="ml-20">
      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab("items")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "items"
              ? "bg-blue-600 dark:bg-blue-700 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          <Package size={16} className="inline mr-2" />
          Items de Inventario
        </button>
        <button
          onClick={() => setActiveTab("categorias")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "categorias"
              ? "bg-blue-600 dark:bg-blue-700 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          <Tag size={16} className="inline mr-2" />
          Categorías
        </button>
      </div>

      {activeTab === "items" ? (
        <InventarioList refreshKey={refreshKey} />
      ) : (
        <div>
          {/* Header de categorías */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <button
              onClick={handleAddCategoria}
              className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg 
                hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            >
              <Plus size={20} />
              <span>Nueva Categoría</span>
            </button>
          </div>

          {/* Lista de categorías */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriasFiltradas.map((categoria: CategoriaInventario) => (
              <div
                key={categoria.id}
                className="group bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700
                  overflow-hidden transition-all duration-200
                  hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        categoria.tipo === "producto"
                          ? "bg-gradient-to-br from-emerald-500 to-green-600"
                          : "bg-gradient-to-br from-blue-500 to-indigo-600"
                      }`}
                    >
                      <Tag className="text-white" size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{categoria.nombre}</h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
                          categoria.tipo === "producto"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        }`}
                      >
                        {categoria.tipo}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <button
                      onClick={() => handleEditCategoria(categoria)}
                      className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 
                        hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategoria(categoria)}
                      className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 
                        hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {categoria.descripcion && (
                  <p className="text-gray-600 dark:text-gray-400 text-xs mb-3">{categoria.descripcion}</p>
                )}
              </div>
            ))}
          </div>

          {categoriasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="text-gray-400 dark:text-gray-500" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hay categorías</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm
                  ? "No se encontraron categorías con esos términos"
                  : "Comienza creando la primera categoría"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Formulario de categoría */}
      {isFormOpen && (
        <CategoriaForm
          categoria={selectedCategoria}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveCategoria}
        />
      )}
    </div>
  )
}
