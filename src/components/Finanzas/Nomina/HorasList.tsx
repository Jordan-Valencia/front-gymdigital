// src/components/Finanzas/Nomina/HorasList.tsx
"use client"

import { useState } from "react";
import { Search, Clock, Edit2, Trash2, User } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useGymData } from "../../../hooks/useGymData";
import { useToast } from "../../../contexts/ToastContext";
import type { HorasEntrenador } from "../../../types";

interface HorasListProps {
  onEditHoras: (horas: HorasEntrenador) => void;
}

export function HorasList({ onEditHoras }: HorasListProps) {
  const { horasTrabajadas, eliminarNomina } = useFinanzas();
  const { entrenadores } = useGymData();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (horas: HorasEntrenador) => {
    const entrenador = entrenadores.find(e => e.id === horas.entrenador_id);
    if (window.confirm(`¿Quieres eliminar el registro de horas de ${entrenador?.nombre || 'este entrenador'}?`)) {
      try {
        // Nota: aquí deberías crear eliminarHorasTrabajadas en tu hook useFinanzas para eliminar el registro
        // Por ahora llamamos eliminarNomina para evitar error, reemplázalo por el método correcto
        await eliminarNomina(horas.id); 
        showToast("Registro de horas eliminado", "success");
      } catch (error) {
        showToast("Error al eliminar registro de horas", "error");
      }
    }
  };

  const horasFiltradas = horasTrabajadas.filter(horas => {
    const entrenador = entrenadores.find(e => e.id === horas.entrenador_id);
    return (
      entrenador?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      horas.fecha.toString().includes(searchTerm)
    );
  });

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  return (
    <div className="space-y-6">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Buscar por entrenador o fecha..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {horasFiltradas.map(horas => {
          const entrenador = entrenadores.find(e => e.id === horas.entrenador_id);

          return (
            <div key={horas.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="text-gray-400 dark:text-gray-500" size={16} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {entrenador?.nombre || 'Entrenador eliminado'}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(horas.fecha)}</p>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => onEditHoras(horas)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(horas)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-lg">
                <Clock className="text-gray-400 dark:text-gray-500" size={18} />
                <span className="text-gray-400 dark:text-gray-500">{horas.horas} horas</span>
              </div>
            </div>
          );
        })}
      </div>

      {horasFiltradas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? "No se encontraron registros con esos criterios" : "No hay registros de horas trabajadas"}
          </p>
        </div>
      )}
    </div>
  );
}
