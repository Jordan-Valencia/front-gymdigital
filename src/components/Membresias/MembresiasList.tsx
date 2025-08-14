"use client"

import { useState } from "react"
import { Plus, Search, CreditCard, Calendar, User, DollarSign, Edit2 } from "lucide-react"
import { useGymData } from "../../hooks/useGymData"
import { MembresiaForm } from "./MembresiaForm"
import type { Membresia } from "../../types"

export function MembresiasList() {
  const { membresias, usuarios, planes, agregarMembresia, actualizarMembresia } = useGymData()
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedMembresia, setSelectedMembresia] = useState<Membresia | null>(null)

  const handleAddMembresia = () => {
    setSelectedMembresia(null)
    setIsFormOpen(true)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditMembresia = (membresia: any) => {
    setSelectedMembresia(membresia)
    setIsFormOpen(true)
  }

  const handleSaveMembresia = (membresiaData: Omit<Membresia, "id" | "fecha_registro" | "usuario" | "plan">) => {
    if (selectedMembresia) {
      actualizarMembresia(selectedMembresia.id, membresiaData)
    } else {
      agregarMembresia(membresiaData)
    }
    setIsFormOpen(false)
  }

  const membresiasFiltradas = membresias.filter((membresia) => {
    const usuario = usuarios.find((u) => u.id === membresia.usuario_id)
    const plan = planes.find((p) => p.id === membresia.plan_id)
    return (
      usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const getEstadoMembresia = (fechaFin: string) => {
    const hoy = new Date()
    const fechaFinDate = new Date(fechaFin)
    const diffTime = fechaFinDate.getTime() - hoy.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { estado: "Vencida", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" }
    } else if (diffDays <= 7) {
      return { estado: "Por vencer", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" }
    } else {
      return { estado: "Activa", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" }
    }
  }

  return (
    <div className="ml-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500
            group-hover:text-indigo-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar membresías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 dark:border-gray-700 rounded-xl
              bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200
              focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
              placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>
        <button
          onClick={handleAddMembresia}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r 
          from-indigo-500 to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/25
          hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 
          active:translate-y-0 transition-all duration-200"
        >
          <Plus size={20} />
          <span>Nueva Membresía</span>
        </button>
      </div>

      {/* Formulario de membresía */}
      {isFormOpen && (
        <MembresiaForm
          membresia={selectedMembresia}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveMembresia}
        />
      )}

      {/* Lista de membresías */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {membresiasFiltradas.map((membresia) => {
          const usuario = usuarios.find((u) => u.id === membresia.usuario_id)
          const plan = planes.find((p) => p.id === membresia.plan_id)
          const estadoInfo = getEstadoMembresia(membresia.fecha_fin)

          return (
            <div
              key={membresia.id}
              className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700
                overflow-hidden transition-all duration-300
                hover:shadow-[0_0_25px_-5px_rgba(0,0,0,0.1),0_0_10px_-5px_rgba(0,0,0,0.04)]
                dark:hover:shadow-[0_0_25px_-5px_rgba(0,0,0,0.3),0_0_10px_-5px_rgba(0,0,0,0.2)]
                hover:border-indigo-200 dark:hover:border-indigo-700"
            >
              <div
                className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 dark:from-indigo-900/20 via-transparent to-transparent 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleEditMembresia(membresia)}
                      className="absolute top-4 right-4 p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400
                      hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
                      aria-label="Editar membresía"
                    >
                      <Edit2 size={18} />
                    </button>
                    <div
                      className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 
                      rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20
                      group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative"
                    >
                      <CreditCard className="text-white/90 group-hover:text-white" size={24} />
                      {estadoInfo.estado === "Vencida" && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                      )}
                    </div>
                    <div>
                      <h3
                        className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400
                        transition-colors"
                      >
                        {plan?.nombre}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                        rounded-full shadow-sm transition-transform group-hover:scale-105 ${estadoInfo.color}`}
                      >
                        {estadoInfo.estado}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 group-hover:translate-x-1 transition-transform duration-300">
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r 
                    from-gray-50 dark:from-gray-700/50 to-transparent border border-gray-100/50 dark:border-gray-600/50
                    group-hover:border-indigo-100/50 dark:group-hover:border-indigo-600/50 transition-colors"
                  >
                    <User size={20} className="text-indigo-500 dark:text-indigo-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">{usuario?.nombre}</span>
                  </div>

                  <div
                    className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r 
                    from-gray-50 dark:from-gray-700/50 to-transparent border border-gray-100/50 dark:border-gray-600/50
                    group-hover:border-indigo-100/50 dark:group-hover:border-indigo-600/50 transition-colors"
                  >
                    <Calendar size={20} className="text-indigo-500 dark:text-indigo-400" />
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(membresia.fecha_inicio).toLocaleDateString("es-ES")}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(membresia.fecha_fin).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r 
                    from-emerald-50 dark:from-emerald-900/20 to-transparent border border-emerald-100/50 dark:border-emerald-800/50
                    group-hover:border-emerald-200/50 dark:group-hover:border-emerald-700/50 transition-colors"
                  >
                    <DollarSign size={20} className="text-emerald-500 dark:text-emerald-400" />
                    <div>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ${membresia.precio_pagado.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{membresia.metodo_pago}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p
                    className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 group-hover:text-indigo-500 dark:group-hover:text-indigo-400
                    transition-colors"
                  >
                    <span className="inline-block w-2 h-2 bg-current rounded-full animate-pulse"></span>
                    Último pago: {new Date(membresia.fecha_pago).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Estado vacío */}
      {membresiasFiltradas.length === 0 && (
        <div className="text-center py-16">
          <div
            className="w-24 h-24 bg-gradient-to-br from-gray-100 dark:from-gray-700 to-gray-50 dark:to-gray-800 rounded-2xl 
            flex items-center justify-center mx-auto mb-6 shadow-inner"
          >
            <CreditCard className="text-gray-400 dark:text-gray-500" size={36} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No hay membresías</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {searchTerm ? "No se encontraron membresías con esos términos" : "Comienza creando la primera membresía"}
          </p>
        </div>
      )}
    </div>
  )
}
