"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Save } from "lucide-react"
import { useGymData } from "../../hooks/useGymData"
import type { Membresia } from "../../types"

export interface MembresiaFormProps {
  membresia?: Membresia | null
  onClose: () => void
  onSave: (membresiaData: Omit<Membresia, "id" | "fecha_registro" | "usuario" | "plan">) => void
}

export function MembresiaForm({ membresia, onClose, onSave }: MembresiaFormProps) {
  const { agregarMembresia, actualizarMembresia, usuarios, planes } = useGymData()

  const [formData, setFormData] = useState({
    usuario_id: "",
    plan_id: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin: "",
    precio_pagado: 0,
    metodo_pago: "efectivo",
    fecha_pago: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    if (membresia) {
      setFormData({
        usuario_id: membresia.usuario_id,
        plan_id: membresia.plan_id,
        fecha_inicio: membresia.fecha_inicio.split("T")[0],
        fecha_fin: membresia.fecha_fin.split("T")[0],
        precio_pagado: membresia.precio_pagado,
        metodo_pago: membresia.metodo_pago,
        fecha_pago: membresia.fecha_pago.split("T")[0],
      })
    }
  }, [membresia])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Datos del formulario:", formData)
    console.log("[v0] Usuarios disponibles:", usuarios.length)
    console.log("[v0] Planes disponibles:", planes.length)

    if (!formData.usuario_id || !formData.plan_id) {
      alert("Por favor selecciona un usuario y un plan")
      return
    }

    // Verificar que el usuario y plan existen
    const usuarioExiste = usuarios.find((u) => u.id === formData.usuario_id)
    const planExiste = planes.find((p) => p.id === formData.plan_id)

    if (!usuarioExiste) {
      alert("El usuario seleccionado no es válido")
      return
    }

    if (!planExiste) {
      alert("El plan seleccionado no es válido")
      return
    }

    const dataToSubmit: Omit<Membresia, "id" | "fecha_registro" | "usuario" | "plan"> = {
      usuario_id: formData.usuario_id,
      plan_id: formData.plan_id,
      fecha_inicio: formData.fecha_inicio, // Ya está en formato YYYY-MM-DD
      fecha_fin: formData.fecha_fin, // Ya está en formato YYYY-MM-DD
      precio_pagado: Number(formData.precio_pagado),
      metodo_pago: formData.metodo_pago,
      fecha_pago: formData.fecha_pago, // Ya está en formato YYYY-MM-DD
    }

    console.log("[v0] Datos a enviar:", dataToSubmit)
    console.log("[v0] Tipos de datos:", {
      usuario_id: typeof dataToSubmit.usuario_id,
      plan_id: typeof dataToSubmit.plan_id,
      fecha_inicio: typeof dataToSubmit.fecha_inicio,
      fecha_fin: typeof dataToSubmit.fecha_fin,
      precio_pagado: typeof dataToSubmit.precio_pagado,
      metodo_pago: typeof dataToSubmit.metodo_pago,
      fecha_pago: typeof dataToSubmit.fecha_pago,
    })

    if (membresia) {
      actualizarMembresia(membresia.id, dataToSubmit)
    } else {
      agregarMembresia(dataToSubmit)
    }

    onSave(dataToSubmit)
    onClose()
  }

  const calcularFechaFin = (fechaInicio: string, planId: string) => {
    const plan = planes.find((p) => p.id === planId)
    if (!plan) return ""

    const fecha = new Date(fechaInicio)
    // Default to 1 month if duration is not specified
    const meses = 1 // Default duration
    fecha.setMonth(fecha.getMonth() + meses)

    return fecha.toISOString().split("T")[0]
  }

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const planId = e.target.value
    const selectedPlan = planes.find((p) => p.id === planId)

    if (selectedPlan) {
      const startDate = new Date(formData.fecha_inicio)
      const endDate = new Date(startDate)
      // Assuming a default duration of 1 month if not specified
      const durationMonths = 1
      endDate.setMonth(startDate.getMonth() + durationMonths)

      setFormData((prev) => ({
        ...prev,
        plan_id: planId,
        fecha_fin: endDate.toISOString().split("T")[0],
        precio_pagado: selectedPlan.precio * durationMonths,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        plan_id: planId,
        fecha_fin: "",
        precio_pagado: 0,
      }))
    }
  }

  const handleFechaInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fechaInicio = e.target.value
    const fechaFin = formData.plan_id ? calcularFechaFin(fechaInicio, formData.plan_id) : ""

    setFormData((prev) => ({
      ...prev,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[900] ml-20">
      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 relative z-[901] shadow-2xl 
        border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {membresia ? "Editar Membresía" : "Nueva Membresía"}
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
            <label htmlFor="usuario_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Miembro
            </label>
            {usuarios.length === 0 && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                No hay usuarios disponibles. Crea un usuario primero.
              </p>
            )}
            <select
              id="usuario_id"
              name="usuario_id"
              value={formData.usuario_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar miembro</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="plan_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plan
            </label>
            {planes.length === 0 && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                No hay planes disponibles. Crea un plan primero.
              </p>
            )}
            <select
              id="plan_id"
              name="plan_id"
              value={formData.plan_id}
              onChange={handlePlanChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar plan</option>
              {planes.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.nombre} - ${plan.precio}/mes
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de inicio
              </label>
              <input
                type="date"
                id="fecha_inicio"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleFechaInicioChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de vencimiento
              </label>
              <input
                type="date"
                id="fecha_fin"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 
                  rounded-lg cursor-not-allowed text-gray-500 dark:text-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="precio_pagado"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Precio Pagado
              </label>
              <input
                type="number"
                id="precio_pagado"
                name="precio_pagado"
                value={formData.precio_pagado}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="metodo_pago" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Método de Pago
              </label>
              <select
                id="metodo_pago"
                name="metodo_pago"
                value={formData.metodo_pago}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="fecha_pago" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Pago
            </label>
            <input
              type="date"
              id="fecha_pago"
              name="fecha_pago"
              value={formData.fecha_pago}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

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
              <span>{membresia ? "Guardar cambios" : "Crear membresía"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
