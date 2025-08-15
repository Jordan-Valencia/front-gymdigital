"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Save } from "lucide-react"
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
  const { showToast } = useToast() // Added toast hook
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    documento: "",
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
        activo: usuario.activo,
        notas: usuario.notas || "",
      })
    }
  }, [usuario])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (usuario) {
        await actualizarUsuario(usuario.id, formData)
        showToast("Usuario actualizado correctamente", "success")
      } else {
        await agregarUsuario(formData)
        showToast("Usuario creado correctamente", "success")
      }

      onSave() // Call onSave to refresh the list
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ml-20">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre completo *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono *</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Documento *
            </label>
            <input
              type="number"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Usuario activo</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
              placeholder="Información adicional..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
            >
              <Save size={16} />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
