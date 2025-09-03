"use client"

import { useState, useEffect } from "react"
import { Plus, Search, CreditCard, Edit2, Trash2, Calendar, DollarSign } from "lucide-react"
import { useGymData } from "../../hooks/useGymData"
import { useToast } from "../../contexts/ToastContext"
import { MembresiaForm } from "./MembresiaForm"
import type { Membresia } from "../../types"

interface MembresiaListProps {
  refreshKey: number
}

export function MembresiasList({ refreshKey }: MembresiaListProps) {
  const { membresias, usuarios, planes, agregarMembresia, actualizarMembresia, eliminarMembresia } = useGymData()
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedMembresia, setSelectedMembresia] = useState<Membresia | null>(null)

  useEffect(() => {
    // Las membresías se cargan automáticamente en el hook
  }, [refreshKey])

  const handleAddMembresia = () => {
    setSelectedMembresia(null)
    setIsFormOpen(true)
  }

  const handleEditMembresia = (membresia: Membresia) => {
    setSelectedMembresia(membresia)
    setIsFormOpen(true)
  }

  const handleSaveMembresia = async (membresiaData: Omit<Membresia, "id" | "fecha_registro" | "usuario" | "plan">) => {
    try {
      if (selectedMembresia) {
        await actualizarMembresia(selectedMembresia.id, membresiaData)
        showToast("Membresía actualizada exitosamente", "success")
      } else {
        await agregarMembresia(membresiaData)
        showToast("Membresía creada exitosamente", "success")
      }
      setIsFormOpen(false)
    } catch (error) {
      console.log(error)
    }
  }

  const handleDeleteMembresia = async (membresia: Membresia) => {
    const usuario = usuarios.find((u) => u.id === membresia.usuario_id)
    const nombreUsuario = usuario ? usuario.nombre : "Usuario desconocido"

    if (window.confirm(`¿Estás seguro de eliminar la membresía de "${nombreUsuario}"?`)) {
      try {
        await eliminarMembresia(membresia.id)
        showToast("Membresía eliminada exitosamente", "success")
      } catch (error) {
        showToast("Error al eliminar la membresía", "error")
      }
    }
  }

  const membresiasFiltradas = membresias.filter((membresia: Membresia) => {
    const usuario = usuarios.find((u) => u.id === membresia.usuario_id)
    const plan = planes.find((p) => p.id === membresia.plan_id)

    const matchSearch =
      usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membresia.metodo_pago.toLowerCase().includes(searchTerm.toLowerCase())

    return matchSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const isExpired = (fechaFin: string) => {
    return new Date(fechaFin) < new Date()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar membresías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>
        <button
          onClick={handleAddMembresia}
          className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg 
            hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
        >
          <Plus size={20} />
          <span>Nueva Membresía</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {membresiasFiltradas.map((membresia: Membresia) => {
          const usuario = usuarios.find((u) => u.id === membresia.usuario_id)
          const plan = planes.find((p) => p.id === membresia.plan_id)
          const expired = isExpired(membresia.fecha_fin)

          return (
            <div
              key={membresia.id}
              className={`group bg-white dark:bg-gray-800 rounded-lg p-6 border 
                ${expired ? "border-red-200 dark:border-red-800" : "border-gray-100 dark:border-gray-700"}
                overflow-hidden transition-all duration-200
                hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center
                    ${expired ? "bg-gradient-to-br from-red-500 to-red-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"}`}
                  >
                    <CreditCard className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {usuario?.nombre || "Usuario desconocido"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{plan?.nombre || "Plan desconocido"}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditMembresia(membresia)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 
                      hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    aria-label="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteMembresia(membresia)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 
                      hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="text-gray-400 dark:text-gray-500" size={16} />
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatDate(membresia.fecha_inicio)} - {formatDate(membresia.fecha_fin)}
                  </span>
                  {expired && (
                    <span
                      className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 
                      text-xs rounded-full"
                    >
                      Vencida
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="text-gray-400 dark:text-gray-500" size={16} />
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatCurrency(membresia.precio_pagado)} - {membresia.metodo_pago}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {membresiasFiltradas.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="text-gray-400 dark:text-gray-500" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hay membresías</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? "No se encontraron membresías con esos términos" : "Comienza creando la primera membresía"}
          </p>
        </div>
      )}

      {isFormOpen && (
        <MembresiaForm
          membresia={selectedMembresia}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveMembresia}
        />
      )}
    </div>
  )
}
