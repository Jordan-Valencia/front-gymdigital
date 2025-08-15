import { useState } from "react"
import { Plus, Search, Edit2, Trash2, Phone, Mail, Calendar } from "lucide-react"
import { useGymData } from "../../hooks/useGymData"
import { useToast } from "../../contexts/ToastContext"
import type { Usuario } from "../../types"

interface UsuariosListProps {
  onAddUser: () => void
  onEditUser: (usuario: Usuario) => void
}

export function UsuariosList({ onAddUser, onEditUser }: UsuariosListProps) {
  const { usuarios, eliminarUsuario } = useGymData()
  const { showToast } = useToast() // Added toast hook
  const [searchTerm, setSearchTerm] = useState("")

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.telefono.includes(searchTerm) ||
      usuario.documento.includes(searchTerm)
  )

  const handleEliminar = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        await eliminarUsuario(id)
        showToast("Usuario eliminado correctamente", "success")
      } catch (error) {
        showToast("Error al eliminar el usuario", "error")
      }
    }
  }

  return (
    <div className="space-y-6 p-4 ml-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar miembros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
          />
        </div>
        <button
          onClick={onAddUser}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          <span>Agregar Miembro</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usuariosFiltrados.map((usuario) => (
          <div
            key={usuario.id}
            className="group bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 
              overflow-hidden transition-all duration-200
              hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500"
          >
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 
                    rounded-md flex items-center justify-center
                    group-hover:scale-105 transition-all duration-200"
                  >
                    <span className="text-white text-xs font-medium">
                      {usuario.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 
                      dark:group-hover:text-blue-400 transition-colors leading-tight"
                    >
                      {usuario.nombre}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full
                      ${usuario.activo ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"}`}
                    >
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  <button
                    onClick={() => onEditUser(usuario)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 
                      dark:hover:bg-gray-700 dark:hover:text-blue-400 rounded-md transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleEliminar(usuario.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 
                      dark:hover:bg-gray-700 dark:hover:text-red-400 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 py-1.5 text-sm">
                  <Phone size={16} className="text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">{usuario.telefono}</span>
                </div>

                <div className="flex items-center gap-2 py-1.5 text-sm">
                  <Mail size={16} className="text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">{usuario.email}</span>
                </div>

                <div className="flex items-center gap-2 py-1.5 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {usuario.documento}
                  </span>
                </div>
              </div>

              {usuario.notas && (
                <div className="mt-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
                  {usuario.notas}
                </div>
              )}

              <div className="mt-3 pt-3 border-t dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Registrado: {new Date(usuario.fecha_registro).toLocaleDateString("es-ES")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {usuariosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No se encontraron miembros</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando el primer miembro"}
          </p>
        </div>
      )}
    </div>
  )
}
