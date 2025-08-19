"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Save, Calendar } from "lucide-react"
import type { Usuario } from "../../types"
import { useGymData } from "../../hooks/useGymData"
import { useToast } from "../../contexts/ToastContext"

interface UsuarioFormProps {
  usuario?: Usuario
  onClose: () => void
  onSave: () => void
}

export function UsuarioForm({ usuario, onClose, onSave }: UsuarioFormProps) {
  const { agregarUsuario, actualizarUsuario } = useGymData()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    documento: "",
    fecha_nacimiento: "",
    activo: true,
    notas: "",
  })

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        telefono: usuario.telefono,
        email: usuario.email,
        documento: usuario.documento,
        fecha_nacimiento: usuario.fecha_nacimiento 
          ? new Date(usuario.fecha_nacimiento).toISOString().split('T')[0] 
          : "",
        activo: usuario.activo,
        notas: usuario.notas || "",
      })
    }
  }, [usuario])

  // Calcular edad basada en la fecha de nacimiento
  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return null
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    
    return edad
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación adicional para fecha de nacimiento
    if (!formData.fecha_nacimiento) {
      showToast("La fecha de nacimiento es obligatoria", "warning")
      return
    }

    const edad = calcularEdad(formData.fecha_nacimiento)
    if (edad !== null && (edad < 13 || edad > 100)) {
      showToast("La edad debe estar entre 13 y 100 años", "warning")
      return
    }

    try {
      if (usuario) {
        await actualizarUsuario(usuario.id, formData)
        showToast("Usuario actualizado correctamente", "success")
      } else {
        await agregarUsuario(formData)
        showToast("Usuario creado correctamente", "success")
      }

      onSave()
      onClose()
    } catch (error) {
      showToast("Error al guardar el usuario", "error")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const edad = formData.fecha_nacimiento ? calcularEdad(formData.fecha_nacimiento) : null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ml-20">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {usuario ? "Editar Miembro" : "Agregar Miembro"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
              placeholder="Ej: Juan Carlos Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de nacimiento *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
              <input
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                min={new Date(new Date().getFullYear() - 100, 0, 1).toISOString().split('T')[0]}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
              />
            </div>
            {edad !== null && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Edad: {edad} año{edad !== 1 ? 's' : ''}
                {edad < 18 && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs rounded-full">
                    Menor de edad
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                placeholder="300 123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Documento *
              </label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                placeholder="12345678"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
              placeholder="usuario@email.com"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Usuario activo
              </span>
            </label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Los usuarios inactivos no aparecerán en búsquedas y reportes
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notas adicionales
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 resize-none"
              placeholder="Información médica, preferencias, observaciones..."
            />
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-medium"
            >
              <Save size={16} />
              <span>{usuario ? "Actualizar" : "Crear"} Miembro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
