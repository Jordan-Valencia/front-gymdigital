"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Bell, User, Calendar, Users, X, Edit2, Trash2, Sun, Moon, Clock, MapPin } from "lucide-react"
import { useGymData } from "../../hooks/useGymData"
import { useToast } from "../../contexts/ToastContext"
import type { Notificacion, Evento } from "../../types"

interface ScheduleData {
  title: string
  description: string
  date: string
  time: string
  type: "class" | "event" | "other"
  attendees?: string[]
}

interface HeaderProps {
  title: string
  onNotificationsClick: () => void
}

export function Header({ title, onNotificationsClick }: HeaderProps) {
  const { eventos, getNotificacionesNoLeidas, agregarEvento, actualizarEvento, eliminarEvento, agregarNotificacion } =
    useGymData()
  const { showToast } = useToast()
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true"
    setIsDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    const newIsDarkMode = !isDarkMode
    setIsDarkMode(newIsDarkMode)
    localStorage.setItem("darkMode", newIsDarkMode.toString())
    if (newIsDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // 📌 Estado para las notificaciones no leídas
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState<Notificacion[]>([])

  useEffect(() => {
    getNotificacionesNoLeidas().then((data) => {
      if (data) setNotificacionesNoLeidas(data)
    })
  }, [])

  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showClassesModal, setShowClassesModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null)
  const [scheduleForm, setScheduleForm] = useState<ScheduleData>({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    type: "class",
    attendees: [],
  })

  const today = new Date().toISOString().split("T")[0]
  const todayEvents = eventos.filter((evento) => evento.fecha_inicio.split("T")[0] === today)

  const classes = todayEvents.filter((evento) => evento.tipo === "class")
  const generalEvents = todayEvents.filter((evento) => evento.tipo === "event")

  const handleUpdateEvent = async (updatedEvent: Evento) => {
    try {
      await actualizarEvento(updatedEvent.id, updatedEvent)
      setEditingEvent(null)
      showToast("Evento actualizado exitosamente", "success")
    } catch (error) {
      showToast("Error al actualizar el evento", "error")
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este evento?")) {
      try {
        await eliminarEvento(eventId)
        showToast("Evento eliminado exitosamente", "success")
      } catch (error) {
        showToast("Error al eliminar el evento", "error")
      }
    }
  }

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newEvent = {
        titulo: scheduleForm.title,
        descripcion: scheduleForm.description,
        fecha_inicio: `${scheduleForm.date}T${scheduleForm.time}:00`,
        fecha_fin: `${scheduleForm.date}T${Number.parseInt(scheduleForm.time.split(":")[0]) + 1}:${scheduleForm.time.split(":")[1]}:00`,
        tipo: scheduleForm.type,
        ubicacion: "Gimnasio Principal",
      }

      const createdEvent = await agregarEvento(newEvent)

      const eventType = scheduleForm.type === "class" ? "clase" : "evento"
      const message = `¡${eventType.charAt(0).toUpperCase() + eventType.slice(1)} programado con éxito!`

      await agregarNotificacion({
        tipo: "nuevo_evento",
        mensaje: `Nuevo ${eventType} programado: ${scheduleForm.title} - ${scheduleForm.date} a las ${scheduleForm.time}`,
        leida: false,
        referencia_id: createdEvent.id,
        referencia_tipo: "evento",
      })

      // Mostrar notificación de éxito
      showToast(message, "success")

      // Resetear formulario y cerrar modal
      setScheduleForm({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        time: "09:00",
        type: "class",
        attendees: [],
      })

      setShowScheduleModal(false)
    } catch (error) {
      showToast("Error al programar el evento", "error")
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b px-6 py-4 sticky top-0 z-40 dark:border-gray-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium 
              text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Calendar size={16} />
              <span>Agendar</span>
            </button>
            <button
              onClick={() => setShowClassesModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium 
              text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Users size={16} />
              <span>Clases</span>
            </button>
          </div>

          {/* Notificaciones */}
          <button
            onClick={onNotificationsClick}
            className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700
              rounded-lg transition-colors"
          >
            <Bell size={20} />
            {notificacionesNoLeidas.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* Perfil */}
          <div className="flex items-center gap-4 pl-6 border-l border-gray-200 dark:border-gray-700">
            <div className="relative group">
              <div
                className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 
                rounded-lg flex items-center justify-center shadow-sm
                group-hover:shadow-md group-hover:scale-105 transition-all duration-200"
              >
                <User className="text-white/90 group-hover:text-white transition-colors" size={20} />
              </div>
              <div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 
                bg-emerald-500 ring-2 ring-white rounded-full
                group-hover:ring-4 transition-all duration-200"
              />
            </div>
            <div className="group cursor-pointer">
              <p
                className="text-sm font-medium text-gray-700 dark:text-gray-300
                group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
              >
                Admin
              </p>
              <p
                className="text-xs text-gray-500 dark:text-gray-400
                group-hover:text-indigo-400 dark:group-hover:text-indigo-500 transition-colors"
              >
                Administrador
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold dark:text-gray-100">Programar Evento</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                <input
                  type="text"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                <textarea
                  value={scheduleForm.description}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora</label>
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                <select
                  value={scheduleForm.type}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      type: e.target.value as "class" | "event" | "other",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="class">Clase</option>
                  <option value="event">Evento</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Programar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Classes Modal - Mostrar clases y eventos separados con mejor diseño */}
      {showClassesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold dark:text-gray-100">Actividades del Día</h3>
              <button
                onClick={() => setShowClassesModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Users size={18} className="text-blue-500" />
                  Clases ({classes.length})
                </h4>
                {classes.length > 0 ? (
                  <div className="grid gap-3">
                    {classes.map((clase: any) => (
                      <div
                        key={clase.id}
                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                      >
                        {editingEvent?.id === clase.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400">Título</label>
                                <input
                                  type="text"
                                  value={editingEvent?.titulo || ""}
                                  onChange={(e) =>
                                    setEditingEvent((prev) =>
                                      prev ? { ...prev, titulo: e.target.value } : null
                                    )
                                  }
                                  className="w-full px-2 py-1 border dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400">Ubicación</label>
                                <input
                                  type="text"
                                  value={editingEvent?.ubicacion || ""}
                                  onChange={(e) =>
                                    setEditingEvent((prev) =>
                                      prev
                                        ? { ...prev, ubicacion: e.target.value }
                                        : null
                                    )
                                  }
                                  className="w-full px-2 py-1 border dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 rounded text-sm"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-2">
                              <button
                                onClick={() => handleUpdateEvent(editingEvent!)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingEvent(null)}
                                className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-blue-900 dark:text-blue-100">{clase.titulo}</p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-blue-700 dark:text-blue-300">
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {new Date(clase.fecha_inicio).toLocaleTimeString("es-ES", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {clase.ubicacion && (
                                  <span className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    {clase.ubicacion}
                                  </span>
                                )}
                              </div>
                              {clase.descripcion && (
                                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{clase.descripcion}</p>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => setEditingEvent(clase)}
                                className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded"
                                title="Editar clase"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(clase.id)}
                                className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 hover:bg-red-100 dark:hover:bg-red-800/30 rounded"
                                title="Eliminar clase"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    No hay clases programadas para hoy.
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Calendar size={18} className="text-green-500" />
                  Eventos ({generalEvents.length})
                </h4>
                {generalEvents.length > 0 ? (
                  <div className="grid gap-3">
                    {generalEvents.map((evento) => (
                      <div
                        key={evento.id}
                        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
                      >
                        {editingEvent?.id === evento.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400">Título</label>
                                <input
                                  type="text"
                                  value={editingEvent.titulo}
                                  onChange={(e) =>
                                    setEditingEvent({
                                      ...editingEvent,
                                      titulo: e.target.value,
                                    })
                                  }
                                  className="w-full px-2 py-1 border dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400">Ubicación</label>
                                <input
                                  type="text"
                                  value={editingEvent.ubicacion || ""}
                                  onChange={(e) =>
                                    setEditingEvent({
                                      ...editingEvent,
                                      ubicacion: e.target.value,
                                    })
                                  }
                                  className="w-full px-2 py-1 border dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 rounded text-sm"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-2">
                              <button
                                onClick={() => handleUpdateEvent(editingEvent)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingEvent(null)}
                                className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-green-900 dark:text-green-100">{evento.titulo}</p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-green-700 dark:text-green-300">
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {new Date(evento.fecha_inicio).toLocaleTimeString("es-ES", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {evento.ubicacion && (
                                  <span className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    {evento.ubicacion}
                                  </span>
                                )}
                              </div>
                              {evento.descripcion && (
                                <p className="text-sm text-green-600 dark:text-green-400 mt-1">{evento.descripcion}</p>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => setEditingEvent(evento)}
                                className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 hover:bg-green-100 dark:hover:bg-green-800/30 rounded"
                                title="Editar evento"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(evento.id)}
                                className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 hover:bg-red-100 dark:hover:bg-red-800/30 rounded"
                                title="Eliminar evento"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    No hay eventos programados para hoy.
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowClassesModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
