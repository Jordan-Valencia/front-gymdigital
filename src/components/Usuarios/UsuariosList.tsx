import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Phone, Mail, Calendar, Cake, Gift, User, UserCheck, UserX, Eye, EyeOff, Loader2 } from "lucide-react"
import { useGymData } from "../../hooks/useGymData"
import { useToast } from "../../contexts/ToastContext"
import type { Usuario } from "../../types"

interface UsuariosListProps {
  onAddUser: () => void
  onEditUser: (usuario: Usuario) => void
}

export function UsuariosList({ onAddUser, onEditUser }: UsuariosListProps) {
  const { usuarios, actualizarUsuario } = useGymData()
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [showInactivos, setShowInactivos] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  // Funciones para manejar cumpleaños
  const esCumpleanosHoy = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return false
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    return (
      hoy.getDate() === nacimiento.getDate() &&
      hoy.getMonth() === nacimiento.getMonth()
    )
  }

  const diasHastaCumpleanos = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return Infinity
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    
    const cumpleanosEsteAno = new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate())
    
    if (cumpleanosEsteAno < hoy) {
      cumpleanosEsteAno.setFullYear(hoy.getFullYear() + 1)
    }
    
    const diffTime = cumpleanosEsteAno.getTime() - hoy.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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

  const formatearFecha = (fecha: string) => {
    if (!fecha) return ""
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long"
      })
    } catch {
      return ""
    }
  }

  // Separar usuarios activos e inactivos
  const usuariosActivos = usuarios.filter(u => u.activo)
  const usuariosInactivos = usuarios.filter(u => !u.activo)

  // Usuarios a mostrar según el toggle
  const usuariosParaMostrar = showInactivos ? usuariosInactivos : usuariosActivos

  // Filtrar usuarios según búsqueda con validación mejorada
  const usuariosFiltrados = usuariosParaMostrar.filter((usuario) => {
    const searchLower = searchTerm.toLowerCase().trim()
    if (!searchLower) return true

    return (
      usuario.nombre.toLowerCase().includes(searchLower) ||
      usuario.email.toLowerCase().includes(searchLower) ||
      usuario.telefono.replace(/\s/g, '').includes(searchTerm.replace(/\s/g, '')) ||
      usuario.documento.includes(searchTerm.trim())
    )
  })

  // Solo mostrar cumpleaños para usuarios activos
  const usuariosConFechaNacimiento = showInactivos 
    ? [] 
    : usuariosFiltrados.filter(u => u.fecha_nacimiento)
  
  const cumpleanosHoy = usuariosConFechaNacimiento.filter(u => 
    esCumpleanosHoy(u.fecha_nacimiento!)
  )

  const cumpleanosProximos = usuariosConFechaNacimiento
    .filter(u => {
      const dias = diasHastaCumpleanos(u.fecha_nacimiento!)
      return dias > 0 && dias <= 7
    })
    .sort((a, b) => diasHastaCumpleanos(a.fecha_nacimiento!) - diasHastaCumpleanos(b.fecha_nacimiento!))

  const usuariosRestantes = usuariosFiltrados.filter(u => 
    !cumpleanosHoy.some(c => c.id === u.id) && 
    !cumpleanosProximos.some(c => c.id === u.id)
  )

  const handleToggleStatus = async (usuario: Usuario) => {
    const nuevoEstado = !usuario.activo
    const accion = nuevoEstado ? "habilitar" : "deshabilitar"
    
    if (window.confirm(`¿Estás seguro de que deseas ${accion} a ${usuario.nombre}?`)) {
      setLoadingUsers(prev => new Set(prev).add(usuario.id))
      
      try {
        await actualizarUsuario(usuario.id, { ...usuario, activo: nuevoEstado })
        showToast(`Usuario ${accion}do correctamente`, "success")
      } catch (error: any) {
        console.error('Error al cambiar estado del usuario:', error)
        if (error?.response?.data?.message) {
          showToast(error.response.data.message, "error")
        } else {
          showToast(`Error al ${accion} el usuario`, "error")
        }
      } finally {
        setLoadingUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(usuario.id)
          return newSet
        })
      }
    }
  }

  const handleEditUser = (usuario: Usuario) => {
    if (loadingUsers.has(usuario.id)) return
    onEditUser(usuario)
  }

  const renderUserCard = (usuario: Usuario, showBirthdayBadge: boolean = false) => {
    const isUserLoading = loadingUsers.has(usuario.id)
    const edad = usuario.fecha_nacimiento ? calcularEdad(usuario.fecha_nacimiento) : null

    return (
      <div
        key={usuario.id}
        className={`group rounded-lg p-4 border transition-all duration-200 hover:shadow-md ${
          showBirthdayBadge 
            ? 'bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-700'
            : usuario.activo
              ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500'
              : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600 opacity-75'
        } ${isUserLoading ? 'pointer-events-none' : ''}`}
      >
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-all duration-200 ${
                showBirthdayBadge 
                  ? 'bg-gradient-to-br from-pink-500 to-purple-600'
                  : usuario.activo
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
              }`}>
                <span className="text-white text-sm font-medium">
                  {usuario.nombre
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              </div>
              <div>
                <h3 className={`text-sm font-medium leading-tight ${
                  usuario.activo 
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {usuario.nombre}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
                      usuario.activo 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" 
                        : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                    }`}
                  >
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </span>
                  {showBirthdayBadge && cumpleanosHoy.some(c => c.id === usuario.id) && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300 font-medium">
                      🎉 ¡Cumpleaños!
                    </span>
                  )}
                  {showBirthdayBadge && cumpleanosProximos.some(c => c.id === usuario.id) && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 font-medium">
                      🎂 Próximo
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-0.5">
              <button
                onClick={() => handleEditUser(usuario)}
                disabled={isUserLoading}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 dark:hover:text-blue-400 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Editar usuario"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleToggleStatus(usuario)}
                disabled={isUserLoading}
                className={`p-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  usuario.activo
                    ? 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 dark:hover:text-red-400'
                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-gray-700 dark:hover:text-green-400'
                }`}
                title={usuario.activo ? "Deshabilitar usuario" : "Habilitar usuario"}
              >
                {isUserLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : usuario.activo ? (
                  <UserX size={16} />
                ) : (
                  <UserCheck size={16} />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 py-1.5 text-sm">
              <Phone size={16} className="text-blue-500 flex-shrink-0" />
              <span className={usuario.activo ? "text-gray-600 dark:text-gray-400" : "text-gray-500 dark:text-gray-500"}>
                {usuario.telefono}
              </span>
            </div>

            <div className="flex items-center gap-2 py-1.5 text-sm">
              <Mail size={16} className="text-blue-500 flex-shrink-0" />
              <span className={`truncate ${usuario.activo ? "text-gray-600 dark:text-gray-400" : "text-gray-500 dark:text-gray-500"}`}>
                {usuario.email}
              </span>
            </div>

            <div className="flex items-center gap-2 py-1.5 text-sm">
              <User size={16} className="text-blue-500 flex-shrink-0" />
              <span className={usuario.activo ? "text-gray-600 dark:text-gray-400" : "text-gray-500 dark:text-gray-500"}>
                {usuario.documento}
              </span>
            </div>

            {usuario.fecha_nacimiento && (
              <div className="flex items-center gap-2 py-1.5 text-sm">
                <Calendar size={16} className="text-purple-500 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className={usuario.activo ? "text-gray-600 dark:text-gray-400" : "text-gray-500 dark:text-gray-500"}>
                    {formatearFecha(usuario.fecha_nacimiento)} 
                    {edad !== null && ` (${edad} años)`}
                  </span>
                  {usuario.activo && cumpleanosProximos.some(c => c.id === usuario.id) && (
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      Cumple en {diasHastaCumpleanos(usuario.fecha_nacimiento)} día{diasHastaCumpleanos(usuario.fecha_nacimiento) !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            )}
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
    )
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
            placeholder={`Buscar miembros ${showInactivos ? 'inactivos' : 'activos'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle para ver activos/inactivos */}
          <button
            onClick={() => setShowInactivos(!showInactivos)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showInactivos
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-700'
                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700'
            }`}
          >
            {showInactivos ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>
              {showInactivos ? `Ver Activos (${usuariosActivos.length})` : `Ver Inactivos (${usuariosInactivos.length})`}
            </span>
          </button>
          
          <button
            onClick={onAddUser}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            <span>Agregar Miembro</span>
          </button>
        </div>
      </div>

      {/* Header de la sección actual */}
      <div className="flex items-center gap-3 mb-4">
        {showInactivos ? (
          <UserX className="text-red-600 dark:text-red-400" size={24} />
        ) : (
          <UserCheck className="text-green-600 dark:text-green-400" size={24} />
        )}
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Miembros {showInactivos ? 'Inactivos' : 'Activos'}
        </h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          showInactivos
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        }`}>
          {usuariosFiltrados.length}
        </span>
      </div>

      {/* Solo mostrar cumpleaños para usuarios activos */}
      {!showInactivos && (
        <>
          {/* Sección de Cumpleaños del Día */}
          {cumpleanosHoy.length > 0 && (
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-xl p-6 border border-pink-200 dark:border-pink-700">
              <div className="flex items-center gap-3 mb-4">
                <Cake className="text-pink-600 dark:text-pink-400" size={28} />
                <div>
                  <h2 className="text-xl font-bold text-pink-800 dark:text-pink-200">
                    🎉 ¡Cumpleañeros de Hoy! 🎂
                  </h2>
                  <p className="text-pink-600 dark:text-pink-300 text-sm">
                    {cumpleanosHoy.length} miembro{cumpleanosHoy.length !== 1 ? 's' : ''} cumple{cumpleanosHoy.length === 1 ? '' : 'n'} años hoy
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cumpleanosHoy.map((usuario) => renderUserCard(usuario, true))}
              </div>
            </div>
          )}

          {/* Sección de Próximos Cumpleaños */}
          {cumpleanosProximos.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="text-purple-600 dark:text-purple-400" size={24} />
                <div>
                  <h2 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                    🎁 Próximos Cumpleaños (Esta Semana)
                  </h2>
                  <p className="text-purple-600 dark:text-purple-300 text-sm">
                    {cumpleanosProximos.length} cumpleaño{cumpleanosProximos.length !== 1 ? 's' : ''} en los próximos 7 días
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cumpleanosProximos.map((usuario) => renderUserCard(usuario, true))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Sección principal de usuarios */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="text-gray-600 dark:text-gray-400" size={20} />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {showInactivos ? 'Usuarios Inactivos' : 'Todos los Miembros Activos'}
          </h2>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full">
            {usuariosRestantes.length + (showInactivos ? 0 : cumpleanosHoy.length + cumpleanosProximos.length)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usuariosRestantes.map((usuario) => renderUserCard(usuario, false))}
        </div>
      </div>

      {/* Estado vacío mejorado */}
      {usuariosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
            showInactivos 
              ? 'bg-red-100 dark:bg-red-900/30' 
              : 'bg-gray-100 dark:bg-gray-800'
          }`}>
            {showInactivos ? (
              <UserX className="text-red-400" size={32} />
            ) : (
              <Search className="text-gray-400" size={32} />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm 
              ? `No se encontraron miembros ${showInactivos ? 'inactivos' : 'activos'} que coincidan con "${searchTerm}"`
              : `No hay miembros ${showInactivos ? 'inactivos' : 'activos'} registrados`
            }
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm
              ? `Intenta con otros términos de búsqueda o revisa la ortografía.`
              : showInactivos 
                ? "Todos los miembros están activos."
                : "Comienza agregando el primer miembro al sistema"
            }
          </p>
          {!searchTerm && !showInactivos && (
            <div className="mt-6">
              <button
                onClick={onAddUser}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Agregar Primer Miembro
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
