"use client"

import { useState, useEffect } from "react"
import {
  Home,
  Users,
  CreditCard,
  Package,
  ShoppingCart,
  UserCheck,
  User,
  Receipt,
  Settings,
  TrendingUp,
} from "lucide-react"

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
  { id: "finanzas", label: "Finanzas", icon: TrendingUp },
  { id: "trello", label: "Trello", icon: Receipt },
]

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // En móvil, la sidebar siempre está expandida cuando es visible
  const isExpanded = isMobile || isHovered

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", isExpanded ? "256px" : "64px")
  }, [isExpanded])

  return (
    <aside
      className={`fixed inset-y-0 left-0 h-screen bg-white dark:bg-gray-800 shadow-xl flex flex-col z-50 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
        isExpanded ? "w-64" : "w-16"
      }`}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-center p-4 border-b border-gray-200 dark:border-gray-700 min-h-[72px]">
        <div className="flex flex-col items-center justify-center">
          {isExpanded ? (
            <div className="text-start">
              <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                Gimnasio Lina García
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sistema de Gestión</p>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">G</span>
            </div>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className={`flex items-center ${isExpanded ? "space-x-3" : "justify-center"}`}>
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            <User size={20} />
          </div>
          {isExpanded && (
            <div className="overflow-hidden">
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">Admin</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Administrador</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-hidden scrollbar-hide">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`group relative w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 font-medium dark:bg-indigo-900/50 dark:text-indigo-400"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  } ${isExpanded ? "space-x-3" : "justify-center"}`}
                  title={!isExpanded ? item.label : undefined}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 dark:bg-indigo-400 rounded-r-full" />
                  )}

                  <div className="flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>

                  {isExpanded && <span className="text-sm font-medium truncate">{item.label}</span>}

                  {/* Tooltip para modo colapsado */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
                    </div>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className={`text-center ${isExpanded ? "" : "hidden"}`}>
          <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 Gimnasio Lina García</p>
        </div>
      </div>
    </aside>
  )
}
