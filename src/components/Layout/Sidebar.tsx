"use client"

import { useState, useEffect } from "react"
import {
  Home,
  Users,
  CreditCard,
  Package,
  ShoppingCart,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  User,
  Menu,
  Receipt,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "usuarios", label: "Miembros", icon: Users },
  { id: "membresias", label: "Membresías", icon: CreditCard },
  { id: "inventario", label: "Inventario", icon: Package },
  { id: "ventas", label: "Ventas", icon: ShoppingCart },
  { id: "entrenadores", label: "Entrenadores", icon: UserCheck },
  { id: "gastos", label: "Gastos", icon: Receipt },
]

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // On mobile, we want to keep it collapsed by default
      setCollapsed(mobile)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const sidebarVariants = {
    open: { width: "260px", x: 0 },
    closed: { width: "80px", x: 0 },
    mobileOpen: { x: 0 },
    mobileClosed: { x: "-100%" },
  }

  const transition = {
    type: "tween" as const,
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1] as const,
  }

  const handleMouseEnter = () => {
    if (!isMobile) {
      setCollapsed(false)
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setCollapsed(true)
    }
  }

  const sidebarContent = (
    <div className="h-full flex flex-col z-[510] bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 min-h-[56px]">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col justify-center h-[40px]"
            >
              <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Gimnasio Lina García</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sistema de Gestión</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-gray-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <User size={20} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={transition}
                className="overflow-hidden"
              >
                <p className="font-medium text-sm text-gray-800 dark:text-gray-200">Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrador</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onSectionChange(item.id)
                    if (isMobile) setCollapsed(true)
                  }}
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
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-sm font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-[1000] p-2 rounded-md bg-white/80 backdrop-blur-sm text-gray-700 shadow-md md:hidden dark:bg-gray-800/80 dark:text-gray-300"
        aria-label="Abrir menú"
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {!collapsed && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ...transition, duration: 0.1 }}
            onClick={() => setCollapsed(true)}
            className="fixed inset-0 bg-black/30 z-[999] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={isMobile ? "mobileClosed" : "closed"}
        animate={isMobile ? (collapsed ? "mobileClosed" : "mobileOpen") : collapsed ? "closed" : "open"}
        variants={sidebarVariants}
        transition={transition}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed inset-y-0 left-0 h-screen bg-white dark:bg-gray-800 shadow-lg flex flex-col overflow-hidden z-[1000] dark:shadow-none dark:border-r dark:border-gray-700`}
      >
        {sidebarContent}
      </motion.aside>
    </>
  )
}
