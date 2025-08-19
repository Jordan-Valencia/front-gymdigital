// src/components/Finanzas/Gastos/CategoriasGasto.tsx
"use client"

import { useState } from "react";
import { Plus, Edit2, Tag } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useToast } from "../../../contexts/ToastContext";
import { CategoriaGastoForm } from "./CategoriaGastoForm";
import type { CategoriaGasto, TipoGasto } from "../../../types";

export function CategoriasGasto() {
  const { categoriasGastos } = useFinanzas();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaGasto | null>(null);

  const handleAddCategoria = () => {
    setEditingCategoria(null);
    setShowForm(true);
  };

  const handleEditCategoria = (categoria: CategoriaGasto) => {
    setEditingCategoria(categoria);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategoria(null);
  };

  const getTipoColor = (tipo: TipoGasto) => {
    const colors = {
      OPERATIVO: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      NOMINA: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      MANTENIMIENTO: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      MARKETING: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      SERVICIOS: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
      IMPUESTOS: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      OTROS: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    };
    return colors[tipo] || colors.OTROS;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Categorías de Gastos
        </h3>
        <button
          onClick={handleAddCategoria}
          className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
        >
          <Plus size={20} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Lista de categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriasGastos.map((categoria) => (
          <div key={categoria.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Tag className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {categoria.nombre}
                  </h4>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(categoria.tipo)}`}>
                    {categoria.tipo}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditCategoria(categoria)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>

            {categoria.descripcion && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {categoria.descripcion}
              </p>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Gastos asociados
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {categoria.gastos_detallados?.length || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categoriasGastos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No hay categorías de gastos creadas
          </p>
          <button
            onClick={handleAddCategoria}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Crear la primera categoría
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <CategoriaGastoForm
          categoria={editingCategoria}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
