import React, { useState, useEffect } from "react";
import {
  Bell,
  User,
  Calendar,
  Users,
  X,
  Edit2,
  Trash2,
  Save,
  XCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useGymData } from "../../hooks/useGymData";
import { format } from "date-fns";
import { useToast } from "../../contexts/ToastContext";
import { Notificacion } from "../../types"; 

interface ScheduleData {
  title: string;
  description: string;
  date: string;
  time: string;
  type: "class" | "event" | "other";
  attendees?: string[];
}

interface ClassData {
  id: string;
  title: string;
  trainer: string;
  date: string;
  time: string;
  capacity: number;
  attendees: number;
}

interface HeaderProps {
  title: string;
  onNotificationsClick: () => void;
}

export function Header({ title, onNotificationsClick }: HeaderProps) {
  const { getNotificacionesNoLeidas, agregarEvento, agregarNotificacion } =
    useGymData();
  const { showToast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    localStorage.setItem("darkMode", newIsDarkMode.toString());
    if (newIsDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // 📌 Estado para las notificaciones no leídas
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState<Notificacion[]>([]);

  useEffect(() => {
    getNotificacionesNoLeidas().then((data) => {
      if (data) setNotificacionesNoLeidas(data);
    });
  }, []);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showClassesModal, setShowClassesModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [scheduleForm, setScheduleForm] = useState<ScheduleData>({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    type: "class",
    attendees: [],
  });

  // Mock data de clases
  const [classes, setClasses] = useState<ClassData[]>([
    {
      id: "1",
      title: "Yoga Matutino",
      trainer: "María García",
      date: new Date().toISOString().split("T")[0],
      time: "08:00",
      capacity: 15,
      attendees: 12,
    },
    {
      id: "2",
      title: "Spinning",
      trainer: "Carlos López",
      date: new Date().toISOString().split("T")[0],
      time: "18:00",
      capacity: 20,
      attendees: 15,
    },
  ]);

  const handleUpdateClass = (updatedClass: ClassData) => {
    setClasses((prev) =>
      prev.map((cls) => (cls.id === updatedClass.id ? updatedClass : cls)),
    );
    setEditingClass(null);

    // Show success message
    showToast("Clase actualizada exitosamente", "success");
  };

  const handleDeleteClass = (classId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta clase?")) {
      setClasses((prev) => prev.filter((cls) => cls.id !== classId));
      showToast("Clase eliminada exitosamente", "success");
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Create a new event
    const newEvent = {
      titulo: scheduleForm.title,
      descripcion: scheduleForm.description,
      fecha_inicio: `${scheduleForm.date}T${scheduleForm.time}:00`,
      fecha_fin: `${scheduleForm.date}T${parseInt(scheduleForm.time.split(":")[0]) + 1}:${scheduleForm.time.split(":")[1]}:00`,
      tipo: scheduleForm.type,
      ubicacion: "Gimnasio Principal",
    };

    // Add the event and get the created event with ID
    const createdEvent = await agregarEvento(newEvent);

    const eventType = scheduleForm.type === "class" ? "clase" : "evento";
    const message = `¡${eventType.charAt(0).toUpperCase() + eventType.slice(1)} programado con éxito!`;

    // Add notification to the system
    agregarNotificacion({
      tipo: "nuevo_evento",
      mensaje: `Nuevo ${eventType} programado: ${scheduleForm.title} - ${scheduleForm.date} a las ${scheduleForm.time}`,
      leida: false,
      referencia_id: createdEvent.id,
      referencia_tipo: "evento",
    });

    // Show toast notification
    showToast(message, "success");

    // Reset form and close modal
    setScheduleForm({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      type: "class",
      attendees: [],
    });

    setShowScheduleModal(false);
  };

  const handleJoinClass = (classId: string) => {
    // In a real app, this would update the class attendance
    setClasses((prev) =>
      prev.map((cls) =>
        cls.id === classId
          ? { ...cls, attendees: Math.min(cls.attendees + 1, cls.capacity) }
          : cls,
      ),
    );

    // Add a notification
    const classToJoin = classes.find((c) => c.id === classId);
    if (classToJoin) {
      const message = `¡Te has inscrito a la clase de ${classToJoin.title} a las ${classToJoin.time}!`;

      // Add to notification center
      agregarNotificacion({
        tipo: "clase_inscrito",
        mensaje: message,
        leida: false,
        referencia_id: classId,
        referencia_tipo: "clase",
      });

      // Show toast notification
      showToast(message, "success");
    }
  };

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b px-6 py-4 sticky top-0 z-40 dark:border-gray-700">
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
                <User
                  className="text-white/90 group-hover:text-white transition-colors"
                  size={20}
                />
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={scheduleForm.title}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, time: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo
                </label>
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

      {/* Classes Modal */}
      {showClassesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold dark:text-gray-100">Clases del Día</h3>
              <button
                onClick={() => setShowClassesModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 dark:bg-gray-700">
              {classes.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {classes.map((cls) => (
                    <li key={cls.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      {editingClass?.id === cls.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-500 dark:text-gray-400">
                                Título
                              </label>
                              <input
                                type="text"
                                value={editingClass.title}
                                onChange={(e) =>
                                  setEditingClass({
                                    ...editingClass,
                                    title: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 border dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 dark:text-gray-400">
                                Instructor
                              </label>
                              <input
                                type="text"
                                value={editingClass.trainer}
                                onChange={(e) =>
                                  setEditingClass({
                                    ...editingClass,
                                    trainer: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 border dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 rounded text-sm"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-xs text-gray-500 dark:text-gray-400">
                                Hora
                              </label>
                              <input
                                type="time"
                                value={editingClass.time}
                                onChange={(e) =>
                                  setEditingClass({
                                    ...editingClass,
                                    time: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 border dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 dark:text-gray-400">
                                Capacidad
                              </label>
                              <input
                                type="number"
                                min={editingClass.attendees}
                                value={editingClass.capacity}
                                onChange={(e) =>
                                  setEditingClass({
                                    ...editingClass,
                                    capacity: parseInt(e.target.value) || 1,
                                  })
                                }
                                className="w-full px-2 py-1 border dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 dark:text-gray-400">
                                Asistentes
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={editingClass.capacity}
                                value={editingClass.attendees}
                                onChange={(e) =>
                                  setEditingClass({
                                    ...editingClass,
                                    attendees: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-2 py-1 border dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 rounded text-sm"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingClass(null)}
                              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                              title="Cancelar"
                            >
                              <XCircle size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateClass(editingClass)}
                              className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                              title="Guardar cambios"
                            >
                              <Save size={18} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {cls.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {format(
                                new Date(`${cls.date}T${cls.time}`),
                                "HH:mm",
                              )}{" "}
                              • {cls.trainer}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {cls.attendees}/{cls.capacity} asistentes
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleJoinClass(cls.id)}
                              disabled={cls.attendees >= cls.capacity}
                              className={`px-3 py-1 text-sm font-medium rounded-md ${
                                cls.attendees >= cls.capacity
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"
                              }`}
                            >
                              {cls.attendees >= cls.capacity
                                ? "Lleno"
                                : "Unirse"}
                            </button>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => setEditingClass(cls)}
                                className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                title="Editar clase"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteClass(cls.id)}
                                className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                title="Eliminar clase"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No hay clases programadas para hoy.
                </div>
              )}
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
  );
}
