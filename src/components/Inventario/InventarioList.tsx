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
  const { inventario, categorias, agregarItemInventario, actualizarItemInventario, eliminarItemInventario } =
    useGymData()
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "IMPLEMENTO" | "PRODUCTO">("todos")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ItemInventario | undefined>(undefined)
  const [itemTipo, setItemTipo] = useState<"IMPLEMENTO" | "PRODUCTO">("IMPLEMENTO")

  useEffect(() => {
    // Los datos se refrescan automáticamente
  }, [refreshKey])

  const handleAddItem = (tipo: "IMPLEMENTO" | "PRODUCTO") => {
    setItemTipo(tipo)
    setSelectedItem(undefined)
    setIsFormOpen(true)
  }

  const handleEditItem = (item: ItemInventario) => {
    setSelectedItem(item)
    const categoria = categorias.find((c) => c.id === item.categoria_id)
    setItemTipo(categoria?.tipo || "IMPLEMENTO")
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
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg 
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800
                  placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as "todos" | "IMPLEMENTO" | "PRODUCTO")}
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg 
                bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800
                min-w-[160px] transition-all duration-200"
            >
              <option value="todos">Todos los items</option>
              <option value="IMPLEMENTO">Implementos</option>
              <option value="PRODUCTO">Productos</option>
            </select>
          </div>
          <div className="relative group">
            <button
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 
                text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 
                transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={() => handleAddItem("IMPLEMENTO")}
            >
              <Plus size={18} />
              <span className="font-medium">Agregar</span>
            </button>
            <div
              className="absolute right-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 z-10 
              hidden group-hover:block border border-gray-200 dark:border-gray-700"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddItem("IMPLEMENTO")
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 
                  hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-400 
                  flex items-center transition-colors duration-200"
              >
                <Package className="mr-2" size={14} />
                Implemento
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddItem("PRODUCTO")
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 
                  hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-400 
                  flex items-center transition-colors duration-200"
              >
                <ShoppingBag className="mr-2" size={14} />
                Producto
              </button>
            </div>
          </div>
        </div>
      </div>

      {itemsStockBajo.length > 0 && (
        <div
          className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 
          border border-orange-200 dark:border-orange-800 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
              <AlertTriangle className="text-orange-600 dark:text-orange-400" size={18} />
            </div>
            <h3 className="font-semibold text-orange-800 dark:text-orange-300">Stock bajo</h3>
          </div>
          <p className="text-sm text-orange-700 dark:text-orange-400">{itemsStockBajo.length} items con stock bajo.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3">
        {itemsFiltrados.map((item) => {
          const categoria = categorias.find((c: CategoriaInventario) => c.id === item.categoria_id)
          const stockBajo = item.cantidad <= item.stock_minimo

          return (
            <div
              key={item.id}
              className="group bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700
                shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]
                hover:border-blue-200 dark:hover:border-blue-600"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    group-hover:scale-110 transition-all duration-300 shadow-md ${categoria?.tipo === "PRODUCTO"
                        ? "bg-gradient-to-br from-emerald-500 to-green-600"
                        : "bg-gradient-to-br from-blue-500 to-indigo-600"
                      }`}
                  >
                    {getItemIcon(categoria?.tipo || "implemento", item.nombre)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-0.5 truncate">
                      {item.nombre}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${categoria?.tipo === "PRODUCTO"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        }`}
                    >
                      {categoria?.nombre}
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5 ml-1">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 
                      hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-all duration-200 hover:scale-110"
                    aria-label="Editar"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 
                      hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200 hover:scale-110"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Stock</span>
                  <span
                    className={`text-sm font-semibold flex items-center gap-1 ${stockBajo ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"
                      }`}
                  >
                    {item.cantidad}
                    {stockBajo && <AlertTriangle size={12} />}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Mínimo</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.stock_minimo}</span>
                </div>

                {item.precio_unitario && (
                  <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Precio</span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      }).format(item.precio_unitario)}
                    </span>
                  </div>
                )}
              </div>

              {item.descripcion && (
                <div
                  className="mt-2 p-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 
                  text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600"
                >
                  {item.descripcion}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {itemsFiltrados.length === 0 && (
        <div className="text-center py-8">
          <div
            className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 
            rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <Package className="text-gray-400 dark:text-gray-500" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No hay items</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {searchTerm ? "No se encontraron items" : "Agrega el primer item"}
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
