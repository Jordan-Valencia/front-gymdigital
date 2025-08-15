"use client"

import { useState } from "react"
import { Sidebar } from "./components/Layout/Sidebar"
import { Header } from "./components/Layout/Header"
import { Dashboard } from "./components/Dashboard/Dashboard"
import { UsuariosList } from "./components/Usuarios/UsuariosList"
import { UsuarioForm } from "./components/Usuarios/UsuarioForm"
import { GastosList } from "./components/Gastos/GastosList"
import { GastoForm } from "./components/Gastos/GastosForm"
import { MembresiasList } from "./components/Membresias/MembresiasList"
import { MembresiaForm } from "./components/Membresias/MembresiaForm"
import { PlanesList } from "./components/Membresias/PlanesList"
import { PlanMembresiaForm } from "./components/Membresias/PlanMembresiaForm"
import { VentasPage } from "./components/Ventas/VentasPage"
import { InventarioPage } from "./components/Inventario/InventarioPage"
import { EntrenadoresPage } from "./components/Entrenadores/EntrenadoresPage"
import { NotificacionesPanel } from "./components/Notificaciones/NotificacionesPanel"
import { ToastProvider } from "./contexts/ToastContext"
import type { Usuario, Gasto, Membresia, Plan } from "./types"

export default function Home() {
  const [activeSection, setActiveSection] = useState("dashboard")

  // Estados para formularios de usuario
  const [showUsuarioForm, setShowUsuarioForm] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | undefined>()

  // Estados para formularios de gasto
  const [showGastoForm, setShowGastoForm] = useState(false)
  const [editingGasto, setEditingGasto] = useState<Gasto | undefined>()

  // Estados para formularios de membresía
  const [showMembresiaForm, setShowMembresiaForm] = useState(false)
  const [editingMembresia, setEditingMembresia] = useState<Membresia | undefined>()

  // Estados para formularios de plan
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | undefined>()

  // Estados para notificaciones
  const [showNotificaciones, setShowNotificaciones] = useState(false)

  const [usuariosRefreshKey, setUsuariosRefreshKey] = useState(0)
  const [gastosRefreshKey, setGastosRefreshKey] = useState(0)
  const [planesRefreshKey, setPlanesRefreshKey] = useState(0)
  const [inventarioRefreshKey, setInventarioRefreshKey] = useState(0)

  const getSectionTitle = (section: string) => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      usuarios: "Gestión de Miembros",
      membresias: "Crear Membresías",
      planes: "Gestionar Planes",
      inventario: "Control de Inventario",
      ventas: "Punto de Venta",
      entrenadores: "Gestión de Entrenadores",
      gastos: "Control de Gastos",
    }
    return titles[section] || "Gimnasio Lina García"
  }

  // Handlers para usuarios
  const handleAddUser = () => {
    setEditingUsuario(undefined)
    setShowUsuarioForm(true)
  }

  const handleEditUser = (usuario: Usuario) => {
    setEditingUsuario(usuario)
    setShowUsuarioForm(true)
  }

  const handleUsuarioSave = () => {
    setUsuariosRefreshKey((prev) => prev + 1)
    setShowUsuarioForm(false)
    setEditingUsuario(undefined)
  }

  // Handlers para gastos
  const handleAddGasto = () => {
    setEditingGasto(undefined)
    setShowGastoForm(true)
  }

  const handleEditGasto = (gasto: Gasto) => {
    setEditingGasto(gasto)
    setShowGastoForm(true)
  }

  const handleGastoSave = () => {
    setGastosRefreshKey((prev) => prev + 1)
    setShowGastoForm(false)
    setEditingGasto(undefined)
  }

  const handleAddMembresia = () => {
    setEditingMembresia(undefined)
    setShowMembresiaForm(true)
  }

  const handleMembresiaSave = () => {
    setShowMembresiaForm(false)
    setEditingMembresia(undefined)
  }

  const handleAddPlan = () => {
    setEditingPlan(undefined)
    setShowPlanForm(true)
  }

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan)
    setShowPlanForm(true)
  }

  const handlePlanSave = () => {
    setPlanesRefreshKey((prev) => prev + 1)
    setShowPlanForm(false)
    setEditingPlan(undefined)
  }

  const handleInventarioSave = () => {
    setInventarioRefreshKey((prev) => prev + 1)
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

      case "membresias":
        return (
          <>
            <MembresiasList refreshKey={usuariosRefreshKey} />
            {showMembresiaForm && (
              <MembresiaForm
                membresia={editingMembresia}
                onClose={() => {
                  setShowMembresiaForm(false)
                  setEditingMembresia(undefined)
                }}
                onSave={handleMembresiaSave}
              />
            )}
          </>
        )

      case "planes":
        return (
          <>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestionar Planes de Membresía</h2>
                </div>
              </div>
              <PlanesList onAddPlan={handleAddPlan} onEditPlan={handleEditPlan} />
            </div>
            {showPlanForm && (
              <PlanMembresiaForm
                plan={editingPlan}
                onClose={() => {
                  setShowPlanForm(false)
                  setEditingPlan(undefined)
                }}
                onSave={handlePlanSave}
              />
            )}
          </>
        )

      case "inventario":
        return <InventarioPage refreshKey={inventarioRefreshKey} onSave={handleInventarioSave} />

      case "ventas":
        return <VentasPage />

      case "entrenadores":
        return <EntrenadoresPage />

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
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {getSectionTitle(activeSection)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Esta sección está en desarrollo...</p>
          </div>
        )
    }
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1 flex flex-col overflow-hidden ml-64">
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
