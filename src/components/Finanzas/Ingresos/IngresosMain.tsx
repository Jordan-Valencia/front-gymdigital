// src/components/Finanzas/Ingresos/IngresosMain.tsx
"use client"

import { useState } from "react";
import { Plus, TrendingUp } from "lucide-react";
import { IngresosList } from "./IngresosList";
import { IngresosEstadisticas } from "./IngresosEstadisticas";
import { IngresoForm } from "./IngresoForm";
import type { IngresoAdicional } from "../../../types";

export function IngresosMain() {
  const [showForm, setShowForm] = useState(false);
  const [editingIngreso, setEditingIngreso] = useState<IngresoAdicional | null>(null);

  const handleAddIngreso = () => {
    setEditingIngreso(null);
    setShowForm(true);
  };

  const handleEditIngreso = (ingreso: IngresoAdicional) => {
    setEditingIngreso(ingreso);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingIngreso(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
            <span>Ingresos Adicionales</span>
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Gestión de ingresos extra fuera de membresías y ventas regulares
          </p>
        </div>
        <button
          onClick={handleAddIngreso}
          className="flex items-center space-x-2 bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Ingreso</span>
        </button>
      </div>

      {/* Estadísticas */}
      <IngresosEstadisticas />

      {/* Lista de ingresos */}
      <IngresosList onEditIngreso={handleEditIngreso} />

      {/* Form Modal */}
      {showForm && (
        <IngresoForm
          ingreso={editingIngreso}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
