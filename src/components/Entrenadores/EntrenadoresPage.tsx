import React, { useState } from "react";
import {
  Plus,
  Search,
  User,
  Phone,
  Mail,
  DollarSign,
  Edit2,
  Trash2,
  Calendar,
  Star,
} from "lucide-react";
import { useGymData } from "../../hooks/useGymData";
import { Entrenador } from "../../types";

export function EntrenadoresPage() {
  const {
    entrenadores,
    agregarEntrenador,
    actualizarEntrenador,
    eliminarEntrenador,
  } = useGymData();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEntrenador, setEditingEntrenador] = useState<Entrenador | null>(
    null,
  );
  const [formData, setFormData] = useState<
    Omit<Entrenador, "id" | "fecha_registro">
  >({
    nombre: "",
    telefono: "",
    email: "",
    especialidad: "",
    tarifa_hora: 0,
    activo: true,
  });

  const filteredEntrenadores = entrenadores.filter(
    (entrenador) =>
      entrenador.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entrenador.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entrenador.telefono.includes(searchTerm) ||
      (entrenador.especialidad
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ??
        false),
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEntrenador) {
      actualizarEntrenador(editingEntrenador.id, formData);
    } else {
      agregarEntrenador(formData);
    }

    setShowForm(false);
    setFormData({
      nombre: "",
      telefono: "",
      email: "",
      especialidad: "",
      tarifa_hora: 0,
      activo: true,
    });
    setEditingEntrenador(null);
  };

  const handleEdit = (entrenador: Entrenador) => {
    setEditingEntrenador(entrenador);
    setFormData({
      nombre: entrenador.nombre,
      telefono: entrenador.telefono,
      email: entrenador.email,
      especialidad: entrenador.especialidad || "",
      tarifa_hora: entrenador.tarifa_hora,
      activo: entrenador.activo,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar este entrenador?")
    ) {
      eliminarEntrenador(id);
    }
  };

  return (
    <div className="p-6 ml-20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Gestión de Entrenadores
        </h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingEntrenador(null);
            setFormData({
              nombre: "",
              telefono: "",
              email: "",
              especialidad: "",
              tarifa_hora: 0,
              activo: true,
            });
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>Nuevo Entrenador</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="relative mb-6">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar entrenadores..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {showForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              {editingEntrenador ? "Editar Entrenador" : "Nuevo Entrenador"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialidad
                  </label>
                  <input
                    type="text"
                    name="especialidad"
                    value={formData.especialidad}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tarifa por Hora ($)
                  </label>
                  <input
                    type="number"
                    name="tarifa_hora"
                    value={formData.tarifa_hora}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    name="activo"
                    value={formData.activo ? "activo" : "inactivo"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        activo: e.target.value === "activo",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEntrenador(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingEntrenador ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          {filteredEntrenadores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEntrenadores.map((entrenador) => (
                <div
                  key={entrenador.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="text-indigo-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {entrenador.nombre}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star
                            className="w-4 h-4 text-yellow-400 mr-1"
                            fill="currentColor"
                          />
                          <span>
                            {entrenador.especialidad || "Sin especialidad"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${entrenador.activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {entrenador.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{entrenador.telefono}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="truncate">{entrenador.email}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                      <span>${entrenador.tarifa_hora.toFixed(2)}/hora</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      <span>
                        Registrado el{" "}
                        {new Date(entrenador.fecha_registro).toLocaleDateString(
                          "es-ES",
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(entrenador)}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(entrenador.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay entrenadores
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? "No se encontraron entrenadores que coincidan con la búsqueda."
                  : "Comienza agregando un nuevo entrenador."}
              </p>
              {!searchTerm && (
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
  );
}
