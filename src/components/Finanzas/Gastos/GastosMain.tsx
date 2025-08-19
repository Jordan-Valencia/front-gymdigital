// src/components/Finanzas/Gastos/GastosMain.tsx
"use client"

import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { GastosList } from "./GastosList";
import { GastoForm } from "./GastoForm";
import { CategoriasGasto } from "./CategoriasGasto";
import { useFinanzas } from "../../../hooks/useFinanzas";
import type { GastoDetallado } from "../../../types";

export function GastosMain() {
  const [activeSubTab, setActiveSubTab] = useState<'gastos' | 'categorias'>('gastos');
  const [showGastoForm, setShowGastoForm] = useState(false);
  const [editingGasto, setEditingGasto] = useState<GastoDetallado | null>(null);

  const handleAddGasto = () => {
    setEditingGasto(null);
    setShowGastoForm(true);
  };

  const handleEditGasto = (gasto: GastoDetallado) => {
    setEditingGasto(gasto);
    setShowGastoForm(true);
  };

  const handleCloseForm = () => {
    setShowGastoForm(false);
    setEditingGasto(null);
  };

  return (
    <div className="p-6">
      {/* Sub Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveSubTab('gastos')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSubTab === 'gastos'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Gastos
          </button>
          <button
            onClick={() => setActiveSubTab('categorias')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSubTab === 'categorias'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Categorías
          </button>
        </div>

        {activeSubTab === 'gastos' && (
          <button
            onClick={handleAddGasto}
            className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            <Plus size={20} />
            <span>Nuevo Gasto</span>
          </button>
        )}
      </div>

      {/* Content */}
      {activeSubTab === 'gastos' ? (
        <GastosList onEditGasto={handleEditGasto} />
      ) : (
        <CategoriasGasto />
      )}

      {/* Form Modal */}
      {showGastoForm && (
        <GastoForm
          gasto={editingGasto}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
