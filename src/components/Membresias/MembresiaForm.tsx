"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, Save, AlertCircle, CheckCircle } from "lucide-react"
import { useGymData } from "../../hooks/useGymData"
import type { Membresia } from "../../types"

export interface MembresiaFormProps {
  membresia?: Membresia | null
  onClose: () => void
  onSave: (membresiaData: Omit<Membresia, "id" | "fecha_registro" | "usuario" | "plan">) => void
}

// Interfaz para errores más específicos
interface FormErrors {
  usuario_id?: string
  plan_id?: string
  fecha_inicio?: string
  fecha_fin?: string
  precio_pagado?: string
  metodo_pago?: string
  fecha_pago?: string
  general?: string
}

// Interfaz para respuestas de error del backend
interface BackendError {
  message: string | string[]
  statusCode?: number
  error?: string
}

export function MembresiaForm({ membresia, onClose, onSave }: MembresiaFormProps) {
  const { agregarMembresia, actualizarMembresia, usuarios, planes } = useGymData()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitAttempts, setSubmitAttempts] = useState(0)
  const [successMessage, setSuccessMessage] = useState("")
  
  // Corregir el tipo de useRef para setTimeout
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSubmitDataRef = useRef<string>("")

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
        metodo_pago: membresia.metodo_pago as "efectivo" | "tarjeta" | "transferencia",
        fecha_pago: membresia.fecha_pago.split("T")[0],
      })
    }
  }, [membresia])

  // Limpiar timeouts y resetear mensajes al desmontar
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current)
      }
    }
  }, [])

  // Función para parsear errores del backend
  const parseBackendError = useCallback((error: any): string => {
    console.error("[MembresiaForm] Error completo del backend:", error)
    
    if (typeof error === 'string') {
      return error
    }
    
    if (error?.response?.data) {
      const backendError = error.response.data as BackendError
      
      if (Array.isArray(backendError.message)) {
        return backendError.message.join('. ')
      }
      
      if (typeof backendError.message === 'string') {
        return backendError.message
      }
      
      if (backendError.error) {
        return backendError.error
      }
    }
    
    if (error?.message) {
      return error.message
    }
    
    return "Error inesperado al procesar la solicitud"
  }, [])

  // Función para mapear errores específicos a campos
  const mapErrorsToFields = useCallback((errorMessage: string): FormErrors => {
    const errors: FormErrors = {}
    
    const lowerMessage = errorMessage.toLowerCase()
    
    if (lowerMessage.includes("usuario")) {
      if (lowerMessage.includes("no existe") || lowerMessage.includes("no válido")) {
        errors.usuario_id = "El usuario seleccionado no existe o no es válido"
      } else if (lowerMessage.includes("requerido") || lowerMessage.includes("debe indicar")) {
        errors.usuario_id = "Debe seleccionar un usuario"
      } else if (lowerMessage.includes("activa")) {
        errors.general = "Este usuario ya tiene una membresía activa. Puede crear múltiples membresías si es necesario."
      }
    }
    
    if (lowerMessage.includes("plan")) {
      if (lowerMessage.includes("no existe") || lowerMessage.includes("no válido")) {
        errors.plan_id = "El plan seleccionado no existe o no es válido"
      } else if (lowerMessage.includes("requerido") || lowerMessage.includes("debe indicar")) {
        errors.plan_id = "Debe seleccionar un plan"
      }
    }
    
    if (lowerMessage.includes("precio")) {
      errors.precio_pagado = "El precio debe ser mayor que 0"
    }
    
    if (lowerMessage.includes("fecha")) {
      if (lowerMessage.includes("inicio")) {
        errors.fecha_inicio = "La fecha de inicio no es válida"
      } else if (lowerMessage.includes("fin") || lowerMessage.includes("posterior")) {
        errors.fecha_fin = "La fecha de fin debe ser posterior a la fecha de inicio"
      } else if (lowerMessage.includes("pago")) {
        errors.fecha_pago = "La fecha de pago no es válida"
      } else {
        errors.general = "Una o más fechas no son válidas"
      }
    }
    
    if (lowerMessage.includes("duplica") || lowerMessage.includes("idéntica") || lowerMessage.includes("recientemente")) {
      errors.general = "Esta membresía parece estar duplicada. Si es intencional, espere unos segundos antes de intentar nuevamente."
    }
    
    if (lowerMessage.includes("timeout") || lowerMessage.includes("time out")) {
      errors.general = "El servidor tardó demasiado en responder. Por favor, intente nuevamente."
    }
    
    if (lowerMessage.includes("network") || lowerMessage.includes("connection")) {
      errors.general = "Error de conexión. Verifique su conexión a internet e intente nuevamente."
    }
    
    // Si no se mapea ningún error específico, usar mensaje general
    if (Object.keys(errors).length === 0) {
      errors.general = errorMessage
    }
    
    return errors
  }, [])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.usuario_id.trim()) {
      newErrors.usuario_id = "Debe seleccionar un usuario"
    }

    if (!formData.plan_id.trim()) {
      newErrors.plan_id = "Debe seleccionar un plan"
    }

    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = "La fecha de inicio es requerida"
    }

    if (!formData.fecha_fin) {
      newErrors.fecha_fin = "La fecha de fin es requerida"
    }

    if (formData.fecha_inicio && formData.fecha_fin) {
      const fechaInicio = new Date(formData.fecha_inicio)
      const fechaFin = new Date(formData.fecha_fin)
      
      if (isNaN(fechaInicio.getTime())) {
        newErrors.fecha_inicio = "La fecha de inicio no es válida"
      }
      
      if (isNaN(fechaFin.getTime())) {
        newErrors.fecha_fin = "La fecha de fin no es válida"
      }
      
      if (!newErrors.fecha_inicio && !newErrors.fecha_fin && fechaFin <= fechaInicio) {
        newErrors.fecha_fin = "La fecha de fin debe ser posterior a la fecha de inicio"
      }
    }

    if (formData.precio_pagado <= 0) {
      newErrors.precio_pagado = "El precio debe ser mayor que 0"
    }

    if (!formData.metodo_pago.trim()) {
      newErrors.metodo_pago = "Debe seleccionar un método de pago"
    }

    if (!formData.fecha_pago) {
      newErrors.fecha_pago = "La fecha de pago es requerida"
    } else {
      const fechaPago = new Date(formData.fecha_pago)
      if (isNaN(fechaPago.getTime())) {
        newErrors.fecha_pago = "La fecha de pago no es válida"
      }
    }

    // Verificar que el usuario y plan existan
    if (formData.usuario_id && usuarios.length > 0) {
      const usuarioExiste = usuarios.find((u) => u.id === formData.usuario_id)
      if (!usuarioExiste) {
        newErrors.usuario_id = "El usuario seleccionado no es válido"
      }
    }

    if (formData.plan_id && planes.length > 0) {
      const planExiste = planes.find((p) => p.id === formData.plan_id)
      if (!planExiste) {
        newErrors.plan_id = "El plan seleccionado no es válido"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Limpiar errores y mensajes cuando el usuario modifica campos
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
    
    if (successMessage) {
      setSuccessMessage("")
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: name === "precio_pagado" ? Number(value) : value,
    }))
  }

  // Función para envío con retry y timeout
  const submitWithRetry = async (dataToSubmit: any, maxRetries = 2): Promise<void> => {
    let lastError: any = null
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Timeout de 10 segundos por intento
        const submitPromise = membresia 
          ? actualizarMembresia(membresia.id, dataToSubmit)
          : agregarMembresia(dataToSubmit)
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout: La operación tardó demasiado")), 10000)
        })
        
        await Promise.race([submitPromise, timeoutPromise])
        
        // Si llegamos aquí, fue exitoso
        console.log(`[MembresiaForm] Operación exitosa en intento ${attempt + 1}`)
        return
        
      } catch (error) {
        console.error(`[MembresiaForm] Intento ${attempt + 1} falló:`, error)
        lastError = error
        
        // Si no es el último intento, esperar antes de reintentar
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000) // Backoff exponencial
          console.log(`[MembresiaForm] Esperando ${delay}ms antes del siguiente intento`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    // Si llegamos aquí, todos los intentos fallaron
    throw lastError
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevenir múltiples submissions
    if (isSubmitting) {
      console.warn("[MembresiaForm] Intento de envío múltiple bloqueado")
      return
    }

    // Limpiar mensajes previos
    setErrors({})
    setSuccessMessage("")

    // Validar formulario
    if (!validateForm()) {
      console.error("[MembresiaForm] Validación del formulario falló")
      return
    }

    const dataToSubmit = {
      usuario_id: formData.usuario_id,
      plan_id: formData.plan_id,
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin,
      precio_pagado: Number(formData.precio_pagado),
      metodo_pago: formData.metodo_pago,
      fecha_pago: formData.fecha_pago,
    }

    // Detectar envío duplicado comparando con la última data enviada
    const currentDataString = JSON.stringify(dataToSubmit)
    if (currentDataString === lastSubmitDataRef.current && submitAttempts > 0) {
      console.warn("[MembresiaForm] Datos idénticos detectados, posible duplicación")
      setErrors({ 
        general: "Los datos son idénticos al último envío. Si necesita crear una membresía duplicada, modifique algún campo primero." 
      })
      return
    }

    console.log("[MembresiaForm] Iniciando envío:", dataToSubmit)

    setIsSubmitting(true)
    setSubmitAttempts(prev => prev + 1)
    lastSubmitDataRef.current = currentDataString

    try {
      await submitWithRetry(dataToSubmit)
      
      console.log("[MembresiaForm] Operación completada exitosamente")
      setSuccessMessage(membresia ? "Membresía actualizada exitosamente" : "Membresía creada exitosamente")
      
      onSave(dataToSubmit)
      
      // Cerrar modal después de un breve delay para mostrar el mensaje de éxito
      submitTimeoutRef.current = setTimeout(() => {
        onClose()
      }, 1500)

    } catch (error) {
      console.error("[MembresiaForm] Error final en envío:", error)
      
      const errorMessage = parseBackendError(error)
      const mappedErrors = mapErrorsToFields(errorMessage)
      
      setErrors(mappedErrors)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calcular fecha fin basada en la fecha de inicio
  const calcularFechaFin = (fechaInicio: string): string => {
    if (!fechaInicio) return ""

    const fecha = new Date(fechaInicio)
    fecha.setMonth(fecha.getMonth() + 1) // Agregar 1 mes por defecto

    return fecha.toISOString().split("T")[0]
  }

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const planId = e.target.value
    const selectedPlan = planes.find((p) => p.id === planId)

    if (errors.plan_id) {
      setErrors(prev => ({ ...prev, plan_id: undefined }))
    }

    if (selectedPlan && formData.fecha_inicio) {
      const fechaFin = calcularFechaFin(formData.fecha_inicio)
      
      setFormData((prev) => ({
        ...prev,
        plan_id: planId,
        fecha_fin: fechaFin,
        precio_pagado: selectedPlan.precio,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        plan_id: planId,
        fecha_fin: "",
        precio_pagado: selectedPlan?.precio || 0,
      }))
    }
  }

  const handleFechaInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fechaInicio = e.target.value
    
    if (errors.fecha_inicio) {
      setErrors(prev => ({ ...prev, fecha_inicio: undefined }))
    }
    
    const fechaFin = calcularFechaFin(fechaInicio)

    setFormData((prev) => ({
      ...prev,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    }))
  }

  // Calcular si el formulario es válido
  const isFormValid = formData.usuario_id && 
                      formData.plan_id && 
                      formData.fecha_inicio && 
                      formData.fecha_fin && 
                      formData.precio_pagado > 0 && 
                      formData.metodo_pago && 
                      formData.fecha_pago &&
                      usuarios.length > 0 && 
                      planes.length > 0 &&
                      Object.keys(errors).length === 0

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
            disabled={isSubmitting}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mensaje de error general */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
              <p className="text-sm text-red-700 dark:text-red-300">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start space-x-2">
            <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">Éxito</p>
              <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Usuario */}
          <div>
            <label htmlFor="usuario_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Miembro *
            </label>
            {usuarios.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-2 flex items-center space-x-1">
                <AlertCircle size={16} />
                <span>No hay usuarios disponibles. Crea un usuario primero.</span>
              </p>
            )}
            <select
              id="usuario_id"
              name="usuario_id"
              value={formData.usuario_id}
              onChange={handleChange}
              required
              disabled={isSubmitting || usuarios.length === 0}
              className={`w-full px-3 py-2 border rounded-lg 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${errors.usuario_id ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
            >
              <option value="">Seleccionar miembro</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre}
                </option>
              ))}
            </select>
            {errors.usuario_id && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center space-x-1">
                <AlertCircle size={14} />
                <span>{errors.usuario_id}</span>
              </p>
            )}
          </div>

          {/* Campo Plan */}
          <div>
            <label htmlFor="plan_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plan *
            </label>
            {planes.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-2 flex items-center space-x-1">
                <AlertCircle size={16} />
                <span>No hay planes disponibles. Crea un plan primero.</span>
              </p>
            )}
            <select
              id="plan_id"
              name="plan_id"
              value={formData.plan_id}
              onChange={handlePlanChange}
              required
              disabled={isSubmitting || planes.length === 0}
              className={`w-full px-3 py-2 border rounded-lg 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${errors.plan_id ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
            >
              <option value="">Seleccionar plan</option>
              {planes.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.nombre} - ${plan.precio}/mes
                </option>
              ))}
            </select>
            {errors.plan_id && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center space-x-1">
                <AlertCircle size={14} />
                <span>{errors.plan_id}</span>
              </p>
            )}
          </div>

          {/* Campos de Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de inicio *
              </label>
              <input
                type="date"
                id="fecha_inicio"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleFechaInicioChange}
                required
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.fecha_inicio ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.fecha_inicio && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.fecha_inicio}</p>
              )}
            </div>

            <div>
              <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de vencimiento *
              </label>
              <input
                type="date"
                id="fecha_fin"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                required
                disabled={true}
                className={`w-full px-3 py-2 border rounded-lg cursor-not-allowed
                  bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400
                  ${errors.fecha_fin ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
                readOnly
              />
              {errors.fecha_fin && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.fecha_fin}</p>
              )}
            </div>
          </div>

          {/* Campos de Precio y Método de Pago */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="precio_pagado"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Precio Pagado *
              </label>
              <input
                type="number"
                id="precio_pagado"
                name="precio_pagado"
                value={formData.precio_pagado}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.precio_pagado ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.precio_pagado && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.precio_pagado}</p>
              )}
            </div>

            <div>
              <label htmlFor="metodo_pago" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Método de Pago *
              </label>
              <select
                id="metodo_pago"
                name="metodo_pago"
                value={formData.metodo_pago}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.metodo_pago ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
              {errors.metodo_pago && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.metodo_pago}</p>
              )}
            </div>
          </div>

          {/* Campo Fecha de Pago */}
          <div>
            <label htmlFor="fecha_pago" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Pago *
            </label>
            <input
              type="date"
              id="fecha_pago"
              name="fecha_pago"
              value={formData.fecha_pago}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${errors.fecha_pago ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.fecha_pago && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.fecha_pago}</p>
            )}
          </div>

          {/* Botones */}
          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                text-gray-700 dark:text-gray-300 rounded-lg 
                hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg 
                hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors 
                flex items-center justify-center space-x-2
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
              <Save size={18} />
              <span>
                {isSubmitting 
                  ? 'Procesando...' 
                  : membresia 
                    ? 'Guardar cambios' 
                    : 'Crear membresía'
                }
              </span>
            </button>
          </div>

          {/* Información de intentos */}
          {submitAttempts > 1 && (
            <div className="pt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Intentos de envío: {submitAttempts}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
