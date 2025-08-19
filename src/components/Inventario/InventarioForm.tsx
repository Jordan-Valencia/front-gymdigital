"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Save, Plus, Minus, AlertTriangle } from "lucide-react"
import { useGymData } from "../../hooks/useGymData"
import type { ItemInventario, CategoriaInventario } from "../../types"

// Tipo base que espera onSave
type InventarioBase = Omit<ItemInventario, "id" | "fecha_registro" | "categoria" | "tipo"> & { categoria_id: string }

// Tipo extendido con "tipo"
type InventarioNuevo = InventarioBase & { tipo: "IMPLEMENTO" | "PRODUCTO" }

// Extend the base ItemInventario type for the form
interface FormData {
  nombre: string
  descripcion: string
  categoria_id: string
  cantidad: number
  stock_minimo: number
  precio_unitario: number
  // Additional fields not in ItemInventario
  proveedor: string
  fecha_compra: string
  notas: string
}

export interface InventarioFormProps {
  item?: ItemInventario
  onClose: () => void
  onSave: (
    itemData: Omit<ItemInventario, "id" | "fecha_registro" | "categoria"> & {
      categoria_id: string
    },
  ) => void
  tipo: "IMPLEMENTO" | "PRODUCTO"
}

export function InventarioForm({ item, onClose, onSave, tipo }: InventarioFormProps) {
  const { categorias } = useGymData()

  const [formData, setFormData] = useState<FormData>({
    nombre: item?.nombre || "",
    descripcion: item?.descripcion || "",
    categoria_id: item?.categoria_id || "",
    cantidad: item?.cantidad || 1,
    stock_minimo: item?.stock_minimo || 1,
    precio_unitario: item?.precio_unitario || 0,
    proveedor: "",
    fecha_compra: new Date().toISOString().split("T")[0],
    notas: "",
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filteredCategorias, setFilteredCategorias] = useState<CategoriaInventario[]>([])

  useEffect(() => {
    // Filter categories by type
    const cats = categorias.filter((cat: CategoriaInventario) => cat.tipo === tipo)
    setFilteredCategorias(cats)
  }, [tipo, categorias])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number.parseFloat(value)) : value,
    }))
  }

  const handleIncrement = (field: "cantidad" | "stock_minimo") => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as number) + 1,
    }))
  }

  const handleDecrement = (field: "cantidad" | "stock_minimo") => {
    if (formData[field] > (field === "stock_minimo" ? 1 : 0)) {
      setFormData((prev) => ({
        ...prev,
        [field]: (prev[field] as number) - 1,
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.categoria_id) {
      alert("Por favor selecciona una categoría")
      return
    }

    let dataToSubmit: InventarioBase | InventarioNuevo = {
      nombre: formData.nombre,
      descripcion: formData.descripcion || undefined,
      categoria_id: formData.categoria_id,
      cantidad: Number(formData.cantidad),
      stock_minimo: Number(formData.stock_minimo),
      precio_unitario: formData.precio_unitario || undefined,
    }

    // Si es nuevo, añadimos tipo
    if (!item) {
      dataToSubmit = {
        ...dataToSubmit,
        tipo,
      }
    }

    onSave(dataToSubmit)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[900] ml-20">
      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto 
        relative z-[901] shadow-2xl border border-gray-200 dark:border-gray-700"
      >
        <div
          className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-gray-800 pb-4 
          border-b border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {item ? "Editar " : "Nuevo "}
            {tipo === "PRODUCTO" ? "Producto" : "Implemento"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 
              transition-colors"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre {tipo === "PRODUCTO" ? "del producto" : "del implemento"}
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={`Ej: ${tipo === "PRODUCTO" ? "Proteína en polvo" : "Mancuerna de 5kg"}`}
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={`Descripción del ${tipo}...`}
            />
          </div>

          {filteredCategorias.length === 0 ? (
            <div
              className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 
              text-sm rounded-lg border border-yellow-200 dark:border-yellow-800"
            >
              <p className="font-medium">No hay categorías disponibles para {tipo}s</p>
              <p>Crea una categoría de tipo "{tipo}" primero en la sección de Inventario.</p>
            </div>
          ) : (
            <div>
              <label htmlFor="categoria_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría *
              </label>
              <select
                id="categoria_id"
                name="categoria_id"
                value={formData.categoria_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar categoría</option>
                {filteredCategorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cantidad
              </label>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => handleDecrement("cantidad")}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 
                    rounded-l-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  id="cantidad"
                  name="cantidad"
                  min="0"
                  value={formData.cantidad}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-center border-t border-b border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => handleIncrement("cantidad")}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 
                    rounded-r-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="stock_minimo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mínimo
              </label>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => handleDecrement("stock_minimo")}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 
                    rounded-l-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  id="stock_minimo"
                  name="stock_minimo"
                  min="1"
                  value={formData.stock_minimo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-center border-t border-b border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => handleIncrement("stock_minimo")}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 
                    rounded-r-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {tipo === "PRODUCTO" && (
            <div>
              <label
                htmlFor="precio_unitario"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Precio unitario
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="precio_unitario"
                  name="precio_unitario"
                  min="0"
                  step="0.01"
                  value={formData.precio_unitario}
                  onChange={handleChange}
                  className="w-full pl-7 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 
                flex items-center transition-colors"
            >
              {showAdvanced ? "Ocultar opciones avanzadas" : "Mostrar opciones avanzadas"}
              {showAdvanced ? <Minus size={16} className="ml-1" /> : <Plus size={16} className="ml-1" />}
            </button>
          </div>

          {showAdvanced && (
            <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label htmlFor="proveedor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Proveedor
                </label>
                <input
                  type="text"
                  id="proveedor"
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Nombre del proveedor"
                />
              </div>

              <div>
                <label
                  htmlFor="fecha_compra"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Fecha de compra
                </label>
                <input
                  type="date"
                  id="fecha_compra"
                  name="fecha_compra"
                  value={formData.fecha_compra}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="notas" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notas
                </label>
                <textarea
                  id="notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>
          )}

          {formData.cantidad <= formData.stock_minimo && (
            <div
              className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 
              text-sm rounded-lg flex items-start border border-yellow-200 dark:border-yellow-800"
            >
              <AlertTriangle className="flex-shrink-0 mr-2 mt-0.5" size={16} />
              <span>La cantidad está por debajo o igual al stock mínimo. Considera realizar un nuevo pedido.</span>
            </div>
          )}

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                text-gray-700 dark:text-gray-300 rounded-lg 
                hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg 
                hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors 
                flex items-center justify-center space-x-2"
            >
              <Save size={18} />
              <span>{item ? "Guardar cambios" : "Agregar " + (tipo === "PRODUCTO" ? "producto" : "implemento")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}