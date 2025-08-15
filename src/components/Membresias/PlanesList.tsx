"use client"

import { useState } from "react"
import { Plus, Search, Edit2, Trash2, Calendar, DollarSign, Tag } from "lucide-react"
import { useGymData } from "../../hooks/useGymData"
import { useToast } from "../../contexts/ToastContext"
import type { Plan } from "../../types"

interface PlanesListProps {
  onAddPlan: () => void
  onEditPlan: (plan: Plan) => void
}

export function PlanesList({ onAddPlan, onEditPlan }: PlanesListProps) {
  const { planes, eliminarPlan } = useGymData()
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")

  const handleDeletePlan = async (plan: Plan) => {
    if (window.confirm(`¿Estás seguro de eliminar el plan "${plan.nombre}"?`)) {
      try {
        await eliminarPlan(plan.id)
        showToast("Plan eliminado exitosamente", "success")
      } catch (error) {
        showToast("Error al eliminar el plan", "error")
      }
    }
  }

  const planesFiltrados = planes.filter((plan: Plan) =>
    plan.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar planes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <button
          onClick={onAddPlan}
          className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg 
            hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planesFiltrados.map((plan: Plan) => (
          <div
            key={plan.id}
            className="group bg-white dark:bg-gray-800 rounded-lg p-6 border 
              border-gray-100 dark:border-gray-700
              overflow-hidden transition-all duration-200
              hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center
                  bg-gradient-to-br from-purple-500 to-pink-600"
                >
                  <Tag className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {plan.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{plan.descripcion}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEditPlan(plan)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 
                    hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  aria-label="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeletePlan(plan)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 
                    hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  aria-label="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="text-gray-400 dark:text-gray-500" size={16} />
                <span className="text-gray-600 dark:text-gray-400">
                  {formatCurrency(plan.precio)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="text-gray-400 dark:text-gray-500" size={16} />
                <span className="text-gray-600 dark:text-gray-400">
                  Duración: {plan.duracion_dias} días
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {planesFiltrados.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No se encontraron planes.</p>
        </div>
      )}
    </div>
  )
}
