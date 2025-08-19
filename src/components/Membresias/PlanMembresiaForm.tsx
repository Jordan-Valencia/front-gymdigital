"use client"

import React, { useState, useEffect } from "react"
import { X, Save } from "lucide-react"
import { useToast } from "../../contexts/ToastContext"
import { useGymData } from "../../hooks/useGymData"
import type { Plan } from "../../types"

interface PlanMembresiaFormProps {
  plan?: Plan | null
  onClose: () => void
  onSave?: () => void
}

export function PlanMembresiaForm({ plan, onClose, onSave }: PlanMembresiaFormProps) {
  const { agregarPlan, actualizarPlan } = useGymData()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    nombre: plan?.nombre || "",
    descripcion: plan?.descripcion || "",
    precio: plan?.precio || 0
  })

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Si el plan cambia (editar uno distinto), actualizar formulario
    setFormData({
      nombre: plan?.nombre || "",
      descripcion: plan?.descripcion || "",
      precio: plan?.precio || 0
    })
  }, [plan])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (plan) {
        // Editar plan existente
        await actualizarPlan(plan.id, formData)
        showToast("Plan actualizado exitosamente", "success")
      } else {
        // Crear plan nuevo
        await agregarPlan(formData)
        showToast("Plan creado exitosamente", "success")
      }
      if (onSave) {
        onSave()
      } else {
        onClose()
      }
    } catch (error) {
      showToast("Error guardando el plan", "error")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[900] ml-20">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {plan ? "Editar Plan" : "Nuevo Plan de Membresía"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300"
            disabled={isSaving}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del Plan
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Plan Básico"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción del plan..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Precio Mensual($)
            </label>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600
                  text-gray-700 dark:text-gray-300 rounded-lg
                  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg
                  hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors
                  flex items-center justify-center space-x-2"
            >
              <Save size={18} />
              <span>{plan ? "Guardar cambios" : "Crear plan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
