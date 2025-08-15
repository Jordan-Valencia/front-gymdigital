"use client"

import { useState, useEffect } from "react"
import { Home, Users, CreditCard, Package, ShoppingCart, UserCheck, User, Receipt, Settings } from "lucide-react"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "usuarios", label: "Miembros", icon: Users },
  { id: "membresias", label: "Membresías", icon: CreditCard },
  { id: "planes", label: "Gestionar Planes", icon: Settings },
  { id: "inventario", label: "Inventario", icon: Package },
  { id: "ventas", label: "Ventas", icon: ShoppingCart },
  { id: "entrenadores", label: "Entrenadores", icon: UserCheck },
  { id: "gastos", label: "Gastos", icon: Receipt },
]

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <aside className="fixed inset-y-0 left-0 w-64 h-screen bg-white dark:bg-gray-800 shadow-lg flex flex-col overflow-hidden z-[1000] dark:shadow-none dark:border-r dark:border-gray-700">
      <div className="flex items-center justify-center p-4 border-b border-gray-200 dark:border-gray-700 min-h-[56px]">
        <div className="flex flex-col justify-center h-[40px]">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Gimnasio Lina García</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Sistema de Gestión</p>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-gray-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <User size={20} />
          </div>
          <div className="overflow-hidden">
            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">Admin</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Administrador</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 font-medium border-l-4 border-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-400 dark:border-indigo-400"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
