"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Save, Calendar, AlertCircle, CheckCircle } from "lucide-react"
import type { Usuario } from "../../types"
import { useGymData } from "../../hooks/useGymData"
import { useToast } from "../../contexts/ToastContext"

interface UsuarioFormProps {
  usuario?: Usuario
  onClose: () => void
  onSave: () => void
}

interface ValidationErrors {
  nombre?: string
  telefono?: string
  email?: string
  documento?: string
  fecha_nacimiento?: string
}

export function UsuarioForm({ usuario, onClose, onSave }: UsuarioFormProps) {
  const { agregarUsuario, actualizarUsuario } = useGymData()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    documento: "",
    fecha_nacimiento: "",
    activo: true,
    notas: "",
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

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

  // Validaciones en tiempo real
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'nombre':
        if (!value.trim()) return 'El nombre es obligatorio'
        if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres'
        if (value.trim().length > 100) return 'El nombre no puede exceder 100 caracteres'
        if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(value)) return 'El nombre solo puede contener letras y espacios'
        return undefined

      case 'email':
        if (!value.trim()) return 'El email es obligatorio'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'Formato de email inválido'
        if (value.length > 255) return 'El email no puede exceder 255 caracteres'
        return undefined

      case 'telefono':
        if (!value.trim()) return 'El teléfono es obligatorio'
        // Acepta formatos colombianos: +57 300 123 4567, 300 123 4567, 3001234567
        const phoneRegex = /^(\+57\s?)?[13][0-9]{2}\s?[0-9]{3}\s?[0-9]{4}$/
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          return 'Formato de teléfono inválido. Ej: +57 300 123 4567 o 300 123 4567'
        }
        return undefined

      case 'documento':
        if (!value.trim()) return 'El documento es obligatorio'
        if (value.length > 15) return 'El documento no puede exceder 15 dígitos'
        return undefined

      case 'fecha_nacimiento':
        if (!value) return 'La fecha de nacimiento es obligatoria'
        const edad = calcularEdad(value)
        if (edad === null) return 'Fecha de nacimiento inválida'
        if (edad < 13) return 'La edad mínima es 13 años'
        if (edad > 100) return 'La edad máxima es 100 años'
        return undefined

      default:
        return undefined
    }
  }

  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {}
    
    Object.keys(formData).forEach((key) => {
      if (key !== 'activo' && key !== 'notas') {
        const error = validateField(key, formData[key as keyof typeof formData] as string)
        if (error) {
          newErrors[key as keyof ValidationErrors] = error
        }
      }
    })

    return newErrors
  }

  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return null
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    
    return edad >= 0 ? edad : null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    // Validar campo en tiempo real solo si ya fue tocado
    if (touchedFields.has(name) && type !== "checkbox") {
      const fieldError = validateField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTouchedFields(prev => new Set(prev).add(name))
    
    if (name !== 'activo' && name !== 'notas') {
      const fieldError = validateField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Marcar todos los campos como tocados
    const allFields = new Set(['nombre', 'telefono', 'email', 'documento', 'fecha_nacimiento'])
    setTouchedFields(allFields)

    // Validar todo el formulario
    const formErrors = validateForm()
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      setIsSubmitting(false)
      showToast("Por favor corrige los errores en el formulario", "warning")
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
    } catch (error: any) {
      setIsSubmitting(false)
      
      // Manejar errores específicos del servidor
      if (error?.response?.data?.message) {
        const message = error.response.data.message
        if (message.includes('email')) {
          setErrors(prev => ({ ...prev, email: 'Este email ya está registrado' }))
        } else if (message.includes('documento')) {
          setErrors(prev => ({ ...prev, documento: 'Este documento ya está registrado' }))
        } else {
          showToast(message, "error")
        }
      } else {
        showToast("Error al guardar el usuario. Verifica los datos.", "error")
      }
    }
  }

  const getFieldStatus = (fieldName: string) => {
    const hasError = errors[fieldName as keyof ValidationErrors]
    const isTouched = touchedFields.has(fieldName)
    const hasValue = formData[fieldName as keyof typeof formData]

    if (hasError && isTouched) return 'error'
    if (!hasError && isTouched && hasValue) return 'success'
    return 'default'
  }

  const getInputClassName = (fieldName: string) => {
    const status = getFieldStatus(fieldName)
    const baseClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 transition-colors"
    
    switch (status) {
      case 'error':
        return `${baseClass} border-red-300 focus:ring-red-500 dark:border-red-600`
      case 'success':
        return `${baseClass} border-green-300 focus:ring-green-500 dark:border-green-600`
      default:
        return `${baseClass} border-gray-300 focus:ring-blue-500 dark:border-gray-600`
    }
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
          {/* Nombre completo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre completo *
            </label>
            <div className="relative">
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClassName('nombre')}
                placeholder="Ej: Juan Carlos Pérez"
              />
              {getFieldStatus('nombre') === 'success' && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
              )}
              {getFieldStatus('nombre') === 'error' && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={16} />
              )}
            </div>
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.nombre}
              </p>
            )}
          </div>

          {/* Fecha de nacimiento */}
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
                onBlur={handleBlur}
                max={new Date().toISOString().split('T')[0]}
                min={new Date(new Date().getFullYear() - 100, 0, 1).toISOString().split('T')[0]}
                className={`pl-10 ${getInputClassName('fecha_nacimiento')}`}
              />
              {getFieldStatus('fecha_nacimiento') === 'success' && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
              )}
              {getFieldStatus('fecha_nacimiento') === 'error' && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={16} />
              )}
            </div>
            {errors.fecha_nacimiento && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.fecha_nacimiento}
              </p>
            )}
            {edad !== null && !errors.fecha_nacimiento && (
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

          {/* Teléfono y Documento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClassName('telefono')}
                  placeholder="300 123 4567"
                />
                {getFieldStatus('telefono') === 'success' && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
                )}
                {getFieldStatus('telefono') === 'error' && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={16} />
                )}
              </div>
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.telefono}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Documento *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="documento"
                  value={formData.documento}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClassName('documento')}
                  placeholder="12345678"
                />
                {getFieldStatus('documento') === 'success' && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
                )}
                {getFieldStatus('documento') === 'error' && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={16} />
                )}
              </div>
              {errors.documento && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.documento}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClassName('email')}
                placeholder="usuario@email.com"
              />
              {getFieldStatus('email') === 'success' && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
              )}
              {getFieldStatus('email') === 'error' && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={16} />
              )}
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.email}
              </p>
            )}
          </div>

          {/* Estado activo */}
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

          {/* Notas adicionales */}
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
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Máximo 500 caracteres ({formData.notas.length}/500)
            </p>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{usuario ? "Actualizar" : "Crear"} Miembro</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
