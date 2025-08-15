import { useState } from "react"
import { Sidebar } from "./components/Layout/Sidebar"
import { Header } from "./components/Layout/Header"
import { Dashboard } from "./components/Dashboard/Dashboard"
import { UsuariosList } from "./components/Usuarios/UsuariosList"
import { UsuarioForm } from "./components/Usuarios/UsuarioForm"
import { GastosList } from "./components/Gastos/GastosList"
import { GastoForm } from "./components/Gastos/GastosForm"
import { NotificacionesPanel } from "./components/Notificaciones/NotificacionesPanel"
import { ToastProvider } from "./contexts/ToastContext"
import type { Usuario, Gasto } from "./types"

export default function Home() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [showUsuarioForm, setShowUsuarioForm] = useState(false)
  const [showGastoForm, setShowGastoForm] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | undefined>()
  const [editingGasto, setEditingGasto] = useState<Gasto | undefined>()
  const [showNotificaciones, setShowNotificaciones] = useState(false)
  const [usuariosRefreshKey, setUsuariosRefreshKey] = useState(0)
  const [gastosRefreshKey, setGastosRefreshKey] = useState(0)

  const getSectionTitle = (section: string) => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      usuarios: "Gestión de Miembros",
      membresias: "Gestión de Membresías",
      inventario: "Control de Inventario",
      ventas: "Punto de Venta",
      entrenadores: "Gestión de Entrenadores",
      gastos: "Control de Gastos",
      eventos: "Calendario de Eventos",
      galeria: "Galería de Recuerdos",
    }
    return titles[section] || "Gimnasio Lina García"
  }

  const handleAddUser = () => {
    setEditingUsuario(undefined)
    setShowUsuarioForm(true)
  }

  const handleEditUser = (usuario: Usuario) => {
    setEditingUsuario(usuario)
    setShowUsuarioForm(true)
  }

  const handleAddGasto = () => {
    setEditingGasto(undefined)
    setShowGastoForm(true)
  }

  const handleEditGasto = (gasto: Gasto) => {
    setEditingGasto(gasto)
    setShowGastoForm(true)
  }

  const handleUsuarioSave = () => {
    setUsuariosRefreshKey((prev) => prev + 1)
    setShowUsuarioForm(false)
    setEditingUsuario(undefined)
  }

  const handleGastoSave = () => {
    setGastosRefreshKey((prev) => prev + 1)
    setShowGastoForm(false)
    setEditingGasto(undefined)
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />
      case "usuarios":
        return (
          <>
            <UsuariosList
              key={`usuarios-${usuariosRefreshKey}`}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
            />
            {showUsuarioForm && (
              <UsuarioForm
                usuario={editingUsuario}
                onClose={() => {
                  setShowUsuarioForm(false)
                  setEditingUsuario(undefined)
                }}
                onSave={handleUsuarioSave}
              />
            )}
          </>
        )
      case "gastos":
        return (
          <>
            <GastosList key={`gastos-${gastosRefreshKey}`} onAddGasto={handleAddGasto} onEditGasto={handleEditGasto} />
            {showGastoForm && (
              <GastoForm
                gasto={editingGasto}
                onClose={() => {
                  setShowGastoForm(false)
                  setEditingGasto(undefined)
                }}
                onSave={handleGastoSave}
              />
            )}
          </>
        )
      default:
        return (
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{getSectionTitle(activeSection)}</h3>
            <p className="text-gray-600">Esta sección está en desarrollo...</p>
          </div>
        )
    }
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={getSectionTitle(activeSection)} onNotificationsClick={() => setShowNotificaciones(true)} />
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">{renderContent()}</main>
        </div>

        {showNotificaciones && (
          <NotificacionesPanel isOpen={showNotificaciones} onClose={() => setShowNotificaciones(false)} />
        )}
      </div>
    </ToastProvider>
  )
}
