"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Package,
  Dumbbell,
  Pill,
  ShoppingBag,
  AlertTriangle,
  Edit2,
  Trash2,
  Shirt,
  Banana,
  Coffee,
  Apple,
  Beef,
} from "lucide-react"
import { useGymData } from "../../hooks/useGymData"
import { useToast } from "../../contexts/ToastContext"
import { InventarioForm } from "./InventarioForm"
import type { ItemInventario, CategoriaInventario } from "../../types"

interface InventarioListProps {
  refreshKey: number
}

export function InventarioList({ refreshKey }: InventarioListProps) {
  const { inventario, productos, categorias, agregarItemInventario, actualizarItemInventario, eliminarItemInventario } =
    useGymData()
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "implemento" | "producto">("todos")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ItemInventario | undefined>(undefined)
  const [itemTipo, setItemTipo] = useState<"implemento" | "producto">("implemento")

  useEffect(() => {
    // Los datos se refrescan automáticamente
  }, [refreshKey])

  const handleAddItem = (tipo: "implemento" | "producto") => {
    setItemTipo(tipo)
    setSelectedItem(undefined)
    setIsFormOpen(true)
  }

  const handleEditItem = (item: ItemInventario) => {
    setSelectedItem(item)
    const categoria = categorias.find((c) => c.id === item.categoria_id)
    setItemTipo(categoria?.tipo || "implemento")
    setIsFormOpen(true)
  }

  const handleSaveItem = async (
    itemData: Omit<ItemInventario, "id" | "fecha_registro" | "categoria"> & {
      categoria_id: string
    },
  ) => {
    try {
      if (selectedItem) {
        await actualizarItemInventario(selectedItem.id, itemData)
        showToast("Item actualizado exitosamente", "success")
      } else {
        await agregarItemInventario(itemData)
        showToast("Item creado exitosamente", "success")
      }
      setIsFormOpen(false)
    } catch (error) {
      showToast("Error al guardar el item", "error")
    }
  }

  const handleDeleteItem = async (item: ItemInventario) => {
    if (window.confirm(`¿Estás seguro de eliminar ${item.nombre}?`)) {
      try {
        await eliminarItemInventario(item.id)
        showToast("Item eliminado exitosamente", "success")
      } catch (error) {
        showToast("Error al eliminar el item", "error")
      }
    }
  }

  const todosLosItems = inventario

  const itemsFiltrados = todosLosItems.filter((item) => {
    const categoria = categorias.find((c) => c.id === item.categoria_id)
    const matchSearch =
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoria?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTipo = filtroTipo === "todos" || categoria?.tipo === filtroTipo

    return matchSearch && matchTipo
  })

  const itemsStockBajo = itemsFiltrados.filter((item) => item.cantidad <= item.stock_minimo)

  const getItemIcon = (tipo: string, nombre: string) => {
    if (tipo === "producto") {
      const nombreLower = nombre.toLowerCase()
      if (nombreLower.includes("proteina") || nombreLower.includes("suplemento")) {
        return <Pill className="text-white" size={16} />
      }
      if (nombreLower.includes("ropa") || nombreLower.includes("camiseta")) {
        return <Shirt className="text-white" size={16} />
      }
      if (nombreLower.includes("fruta") || nombreLower.includes("platano")) {
        return <Banana className="text-white" size={16} />
      }
      if (nombreLower.includes("bebida") || nombreLower.includes("café")) {
        return <Coffee className="text-white" size={16} />
      }
      if (nombreLower.includes("snack") || nombreLower.includes("barra")) {
        return <Apple className="text-white" size={16} />
      }
      if (nombreLower.includes("proteina") || nombreLower.includes("carne")) {
        return <Beef className="text-white" size={16} />
      }
      return <ShoppingBag className="text-white" size={16} />
    }
    if (nombre.toLowerCase().includes("mancuerna") || nombre.toLowerCase().includes("pesa")) {
      return <Dumbbell className="text-white" size={16} />
    }
    return <Package className="text-white" size={16} />
  }

  return (
    <div className="ml-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as "todos" | "implemento" | "producto")}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos los items</option>
            <option value="implemento">Implementos</option>
            <option value="producto">Productos</option>
          </select>
        </div>
        <div className="relative group">
          <button
            className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg 
              hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            onClick={() => handleAddItem("implemento")}
          >
            <Plus size={20} />
            <span>Agregar Item</span>
          </button>
          <div
            className="absolute right-0 mt-0 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 
            hidden group-hover:block border border-gray-200 dark:border-gray-700"
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleAddItem("implemento")
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-400 
                flex items-center"
            >
              <Package className="mr-2" size={16} />
              Nuevo Implemento
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleAddItem("producto")
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-400 
                flex items-center"
            >
              <ShoppingBag className="mr-2" size={16} />
              Nuevo Producto
            </button>
          </div>
        </div>
      </div>

      {itemsStockBajo.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="text-orange-600 dark:text-orange-400" size={20} />
            <h3 className="font-semibold text-orange-800 dark:text-orange-300">Items con stock bajo</h3>
          </div>
          <p className="text-orange-700 dark:text-orange-400 text-sm">
            {itemsStockBajo.length} items tienen stock por debajo del mínimo requerido.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {itemsFiltrados.map((item) => {
          const categoria = categorias.find((c: CategoriaInventario) => c.id === item.categoria_id)
          const stockBajo = item.cantidad <= item.stock_minimo

          return (
            <div
              key={item.id}
              className="group bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700
                overflow-hidden transition-all duration-200
                hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center
                    group-hover:scale-105 transition-all duration-200 ${
                      categoria?.tipo === "producto"
                        ? "bg-gradient-to-br from-emerald-500 to-green-600"
                        : "bg-gradient-to-br from-blue-500 to-indigo-600"
                    }`}
                  >
                    {getItemIcon(categoria?.tipo || "implemento", item.nombre)}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
                      {item.nombre}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
                        categoria?.tipo === "producto"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {categoria?.nombre}
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 
                      hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    aria-label="Editar"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 
                      hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Stock</span>
                  <span
                    className={`font-medium ${stockBajo ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"}`}
                  >
                    {item.cantidad}
                    {stockBajo && <AlertTriangle className="inline ml-1 mb-0.5" size={12} />}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Mínimo</span>
                  <span className="text-gray-900 dark:text-gray-100">{item.stock_minimo}</span>
                </div>

                {item.precio_unitario && (
                  <div className="flex items-center justify-between py-1.5 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Precio</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ${item.precio_unitario.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {item.descripcion && (
                <div className="mt-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
                  {item.descripcion}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {itemsFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-gray-400 dark:text-gray-500" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hay items en inventario</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? "No se encontraron items con esos términos" : "Comienza agregando el primer item"}
          </p>
        </div>
      )}

      {isFormOpen && (
        <InventarioForm
          item={selectedItem}
          tipo={itemTipo}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveItem}
        />
      )}
    </div>
  )
}
