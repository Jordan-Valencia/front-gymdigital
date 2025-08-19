// src/components/Finanzas/Nomina/NominaMain.tsx
"use client"

import { useState } from "react";
import { Plus } from "lucide-react";
import { NominaList } from "./NominaList";
import { HorasList } from "./HorasList";
import { NominaForm } from "./NominaForm";
import { HorasForm } from "./HorasForm";
import type { Nomina, HorasEntrenador } from "../../../types";

export function NominaMain() {
  const [activeSubTab, setActiveSubTab] = useState<'nomina' | 'horas'>('nomina');
  const [showNominaForm, setShowNominaForm] = useState(false);
  const [showHorasForm, setShowHorasForm] = useState(false);
  const [editingNomina, setEditingNomina] = useState<Nomina | null>(null);
  const [editingHoras, setEditingHoras] = useState<HorasEntrenador | null>(null);

  const handleAddNomina = () => {
    setEditingNomina(null);
    setShowNominaForm(true);
  };

  const handleEditNomina = (nomina: Nomina) => {
    setEditingNomina(nomina);
    setShowNominaForm(true);
  };

  const handleAddHoras = () => {
    setEditingHoras(null);
    setShowHorasForm(true);
  };

  const handleEditHoras = (horas: HorasEntrenador) => {
    setEditingHoras(horas);
    setShowHorasForm(true);
  };

  return (
    <div className="p-6">
      {/* Sub Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveSubTab('nomina')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSubTab === 'nomina'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Nómina
          </button>
          <button
            onClick={() => setActiveSubTab('horas')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSubTab === 'horas'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Horas Trabajadas
          </button>
        </div>

        <button
          onClick={activeSubTab === 'nomina' ? handleAddNomina : handleAddHoras}
          className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
        >
          <Plus size={20} />
          <span>{activeSubTab === 'nomina' ? 'Nueva Nómina' : 'Registrar Horas'}</span>
        </button>
      </div>

      {/* Content */}
      {activeSubTab === 'nomina' ? (
        <NominaList onEditNomina={handleEditNomina} />
      ) : (
        <HorasList onEditHoras={handleEditHoras} />
      )}

      {/* Forms */}
      {showNominaForm && (
        <NominaForm
          nomina={editingNomina}
          onClose={() => setShowNominaForm(false)}
        />
      )}

      {showHorasForm && (
        <HorasForm
          horas={editingHoras}
          onClose={() => setShowHorasForm(false)}
        />
      )}
    </div>
  );
}
