"use client"

import type React from "react"
import { useState } from "react"
import { Plus, Search, User, Phone, Mail, DollarSign, Edit2, Calendar, Star, UserCheck, UserX, Eye, EyeOff } from "lucide-react"
import { useGymData } from "../../hooks/useGymData"
import { useFinanzas } from "../../hooks/useFinanzas"
import type { Entrenador } from "../../types"

export function EntrenadoresPage() {
  const { entrenadores, agregarEntrenador, actualizarEntrenador, eliminarEntrenador } = useGymData()
  const { nominas, horasTrabajadas } = useFinanzas()
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingEntrenador, setEditingEntrenador] = useState<Entrenador | null>(null)
  const [showInactivos, setShowInactivos] = useState(false)
  const [formData, setFormData] = useState<Omit<Entrenador, "id" | "fecha_registro">>({
    nombre: "",
    telefono: "",
    email: "",
    especialidad: "",
    tarifa_hora: 0,
    activo: true,
  })

  const entrenadoresToShow = entrenadores.filter(entrenador => 
    showInactivos ? !entrenador.activo : entrenador.activo
  )

  const filteredEntrenadores = entrenadoresToShow.filter(
    (entrenador) =>
      entrenador.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entrenador.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entrenador.telefono.includes(searchTerm) ||
      (entrenador.especialidad?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingEntrenador) {
      actualizarEntrenador(editingEntrenador.id, formData)
    } else {
      agregarEntrenador(formData)
    }

    setShowForm(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      telefono: "",
      email: "",
      especialidad: "",
      tarifa_hora: 0,
      activo: true,
    })
    setEditingEntrenador(null)
  }

  const handleEdit = (entrenador: Entrenador) => {
    setEditingEntrenador(entrenador)
    setFormData({
      nombre: entrenador.nombre,
      telefono: entrenador.telefono,
      email: entrenador.email,
      especialidad: entrenador.especialidad || "",
      tarifa_hora: entrenador.tarifa_hora || 0,
      activo: entrenador.activo,
    })
    setShowForm(true)
  }

  // Verificar si un entrenador tiene datos vinculados
  const tieneVinculaciones = (entrenadorId: string) => {
    const tieneNominas = nominas.some(n => n.entrenador_id === entrenadorId)
    const tieneHoras = horasTrabajadas.some(h => h.entrenador_id === entrenadorId)
    return tieneNominas || tieneHoras
  }

  const handleToggleStatus = (entrenador: Entrenador) => {
    const nuevoEstado = !entrenador.activo
    const accion = nuevoEstado ? "habilitar" : "deshabilitar"
    
    if (window.confirm(`¿Estás seguro de que deseas ${accion} a ${entrenador.nombre}?`)) {
      actualizarEntrenador(entrenador.id, { ...entrenador, activo: nuevoEstado })
    }
  }

  const handleDelete = (entrenador: Entrenador) => {
    if (tieneVinculaciones(entrenador.id)) {
      alert("No se puede eliminar este entrenador porque tiene datos vinculados (nóminas o horas registradas). Puedes deshabilitarlo en su lugar.")
      return
    }
    
    if (window.confirm("¿Estás seguro de que deseas eliminar este entrenador? Esta acción no se puede deshacer.")) {
      eliminarEntrenador(entrenador.id)
    }
  }

  // Función para obtener estadísticas del entrenador
  const getEntrenadorStats = (entrenadorId: string) => {
    const nominasEntrenador = nominas.filter(n => n.entrenador_id === entrenadorId)
    const horasEntrenador = horasTrabajadas.filter(h => h.entrenador_id === entrenadorId)
    
    const totalPagado = nominasEntrenador.reduce((sum, n) => sum + n.total_pagar, 0)
    const totalHoras = horasEntrenador.reduce((sum, h) => sum + h.horas, 0)
    const nominasPendientes = nominasEntrenador.filter(n => n.estado === 'PENDIENTE').length
    
    // Calcular horas del mes actual
    const fechaActual = new Date()
    const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1)
    const horasMesActual = horasEntrenador.filter(h => {
      const fechaHora = new Date(h.fecha)
      return fechaHora >= inicioMes
    }).reduce((sum, h) => sum + h.horas, 0)
    
    return {
      totalPagado,
      totalHoras,
      horasMesActual,
      nominasPendientes,
      ultimaNomina: nominasEntrenador.length > 0 
        ? nominasEntrenador.sort((a, b) => b.año - a.año || b.mes - a.mes)[0]
        : null
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const entrenadoresTotales = entrenadores.length
  const entrenadoresActivos = entrenadores.filter(e => e.activo).length
  const entrenadoresInactivos = entrenadoresTotales - entrenadoresActivos

  return (
    <div className="p-6 ml-20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Gestión de Entrenadores</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {entrenadoresTotales} entrenadores registrados • {entrenadoresActivos} activos • {entrenadoresInactivos} inactivos
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Toggle para ver activos/inactivos */}
          <button
            onClick={() => setShowInactivos(!showInactivos)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showInactivos
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            }`}
          >
            {showInactivos ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{showInactivos ? `Ver Activos (${entrenadoresActivos})` : `Ver Inactivos (${entrenadoresInactivos})`}</span>
          </button>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
            <span>Nuevo Entrenador</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        {/* Header de la sección actual */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {showInactivos ? (
              <UserX className="text-red-600 dark:text-red-400" size={24} />
            ) : (
              <UserCheck className="text-green-600 dark:text-green-400" size={24} />
            )}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Entrenadores {showInactivos ? 'Inactivos' : 'Activos'}
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              showInactivos
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            }`}>
              {showInactivos ? entrenadoresInactivos : entrenadoresActivos}
            </span>
          </div>
        </div>

        <div className="relative mb-6">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={18}
          />
          <input
            type="text"
            placeholder={`Buscar entrenadores ${showInactivos ? 'inactivos' : 'activos'}...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {showForm && (
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6 border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">
              {editingEntrenador ? "Editar Entrenador" : "Nuevo Entrenador"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Ej: Juan Carlos Pérez"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Especialidad
                  </label>
                  <select
                    name="especialidad"
                    value={formData.especialidad}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Seleccionar especialidad</option>
                    <option value="Fitness General">Fitness General</option>
                    <option value="Musculación">Musculación</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Pilates">Pilates</option>
                    <option value="CrossFit">CrossFit</option>
                    <option value="Spinning">Spinning</option>
                    <option value="Zumba">Zumba</option>
                    <option value="Boxeo">Boxeo</option>
                    <option value="Natación">Natación</option>
                    <option value="Rehabilitación">Rehabilitación</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Ej: +57 300 123 4567"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="entrenador@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tarifa por Hora
                  </label>
                  <input
                    type="number"
                    name="tarifa_hora"
                    value={formData.tarifa_hora}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="25000"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Para clases personalizadas y cálculo de nómina</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                  <select
                    name="activo"
                    value={formData.activo ? "activo" : "inactivo"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        activo: e.target.value === "activo",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingEntrenador ? "Actualizar Entrenador" : "Crear Entrenador"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          {filteredEntrenadores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEntrenadores.map((entrenador: Entrenador) => {
                const stats = getEntrenadorStats(entrenador.id)
                const tieneVinculaciones = nominas.some(n => n.entrenador_id === entrenador.id) || 
                                         horasTrabajadas.some(h => h.entrenador_id === entrenador.id)
                
                return (
                  <div
                    key={entrenador.id}
                    className={`border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${
                      entrenador.activo 
                        ? 'bg-white dark:bg-gray-700' 
                        : 'bg-gray-50 dark:bg-gray-800 opacity-75'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          entrenador.activo 
                            ? 'bg-indigo-100 dark:bg-indigo-900' 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <User className={`${
                            entrenador.activo 
                              ? 'text-indigo-600 dark:text-indigo-400' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`} size={24} />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${
                            entrenador.activo 
                              ? 'text-gray-800 dark:text-gray-100' 
                              : 'text-gray-600 dark:text-gray-300'
                          }`}>
                            {entrenador.nombre}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
                            <span>{entrenador.especialidad || "Sin especialidad"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            entrenador.activo
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                          }`}
                        >
                          {entrenador.activo ? "Activo" : "Inactivo"}
                        </span>
                        {stats.nominasPendientes > 0 && entrenador.activo && (
                          <span className="px-2 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                            {stats.nominasPendientes} pago{stats.nominasPendientes > 1 ? 's' : ''} pendiente{stats.nominasPendientes > 1 ? 's' : ''}
                          </span>
                        )}
                        {tieneVinculaciones && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                            Con datos
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-4">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                        <span>{entrenador.telefono}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                        <span className="truncate">{entrenador.email}</span>
                      </div>
                      {entrenador.tarifa_hora && entrenador.tarifa_hora > 0 && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                          <span>{formatCurrency(entrenador.tarifa_hora)}/hora</span>
                        </div>
                      )}
                      {stats.totalHoras > 0 && entrenador.activo && (
                        <div className="bg-gray-50 dark:bg-gray-600 p-3 rounded-lg text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>Total pagado:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(stats.totalPagado)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Horas totales:</span>
                            <span className="font-medium">{stats.totalHoras}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Este mes:</span>
                            <span className="font-medium">{stats.horasMesActual}h</span>
                          </div>
                          {stats.ultimaNomina && (
                            <div className="flex justify-between text-gray-500 dark:text-gray-400">
                              <span>Último pago:</span>
                              <span>{stats.ultimaNomina.mes}/{stats.ultimaNomina.año}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        <span>Desde {new Date(entrenador.fecha_registro).toLocaleDateString("es-ES")}</span>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 dark:border-gray-600">
                      <button
                        onClick={() => handleEdit(entrenador)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        title="Editar entrenador"
                      >
                        <Edit2 size={18} />
                      </button>
                      
                      {/* Botón de habilitar/deshabilitar */}
                      <button
                        onClick={() => handleToggleStatus(entrenador)}
                        className={`p-2 rounded-lg transition-colors ${
                          entrenador.activo
                            ? 'text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30'
                            : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'
                        }`}
                        title={entrenador.activo ? "Deshabilitar entrenador" : "Habilitar entrenador"}
                      >
                        {entrenador.activo ? <UserX size={18} /> : <UserCheck size={18} />}
                      </button>

                      {/* Botón de eliminar (solo si no tiene vinculaciones) */}
                      {!tieneVinculaciones && (
                        <button
                          onClick={() => handleDelete(entrenador)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Eliminar entrenador"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              {showInactivos ? <UserX className="mx-auto h-12 w-12 text-red-400 dark:text-red-500" /> : <User className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />}
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No hay entrenadores {showInactivos ? 'inactivos' : 'activos'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? `No se encontraron entrenadores ${showInactivos ? 'inactivos' : 'activos'} que coincidan con la búsqueda.`
                  : showInactivos 
                    ? "Todos los entrenadores están activos."
                    : "Comienza agregando un nuevo entrenador."}
              </p>
              {!searchTerm && !showInactivos && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Nuevo Entrenador
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
