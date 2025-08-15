 import { useState } from "react"
import { Plus, Search, Edit2, Trash2, DollarSign, Calendar, Tag } from "lucide-react"
import { useGymData } from "../../hooks/useGymData"
import type { Gasto } from "../../types"

interface GastosListProps {
  onAddGasto: () => void
  onEditGasto: (gasto: Gasto) => void
}

export function GastosList({ onAddGasto, onEditGasto }: GastosListProps) {
  const { gastos, eliminarGasto } = useGymData()
  const [searchTerm, setSearchTerm] = useState("")

  const gastosFiltrados = gastos.filter(
    (gasto) =>
      (gasto.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (gasto.categoria || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      gasto.monto.toString().includes(searchTerm),
  )

  const handleEliminar = (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este gasto?")) {
      eliminarGasto(id)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6 p-4 ml-20">
      {/* Header con búsqueda y botón agregar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar gastos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
          />
        </div>
        <button
          onClick={onAddGasto}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          <span>Agregar Gasto</span>
        </button>
      </div>

      {/* Lista de gastos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gastosFiltrados.map((gasto) => (
          <div
            key={gasto.id}
            className="group bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 
              overflow-hidden transition-all duration-200
              hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500"
          >
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 
                    rounded-md flex items-center justify-center
                    group-hover:scale-105 transition-all duration-200"
                  >
                    <DollarSign className="text-white" size={16} />
                  </div>
                  <div>
                    <h3
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 
                      dark:group-hover:text-blue-400 transition-colors leading-tight"
                    >
                      {gasto.descripcion}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                      {gasto.categoria}
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  <button
                    onClick={() => onEditGasto(gasto)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 
                      dark:hover:bg-gray-700 dark:hover:text-blue-400 rounded-md transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleEliminar(gasto.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 
                      dark:hover:bg-gray-700 dark:hover:text-red-400 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 py-1.5 text-sm">
                  <DollarSign size={16} className="text-red-500" />
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">{formatCurrency(gasto.monto)}</span>
                </div>

                <div className="flex items-center gap-2 py-1.5 text-sm">
                  <Tag size={16} className="text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">{gasto.categoria}</span>
                </div>

                <div className="flex items-center gap-2 py-1.5 text-sm">
                  <Calendar size={16} className="text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(gasto.fecha).toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>

              {gasto.concepto && (
                <div className="mt-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
                  {gasto.concepto}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {gastosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No se encontraron gastos</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando el primer gasto"}
          </p>
        </div>
      )}
    </div>
  )
}
