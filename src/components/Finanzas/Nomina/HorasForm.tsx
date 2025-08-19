// src/components/Finanzas/Nomina/HorasForm.tsx
"use client"

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useGymData } from "../../../hooks/useGymData";
import { useToast } from "../../../contexts/ToastContext";
import type { HorasEntrenador } from "../../../types";

interface HorasFormProps {
  horas?: HorasEntrenador | null;
  onClose: () => void;
}

export function HorasForm({ horas, onClose }: HorasFormProps) {
  const { agregarHorasTrabajadas /* crea eliminarHorasTrabajadas cuando puedas */ } = useFinanzas();
  const { entrenadores } = useGymData();
  const { showToast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    entrenador_id: horas?.entrenador_id || "",
    fecha: horas?.fecha ? new Date(horas.fecha).toISOString().split('T') : new Date().toISOString().split('T')[0],

    horas: horas?.horas || 0,
  });

  useEffect(() => {
    if (horas) {
      setFormData({
        entrenador_id: horas.entrenador_id,
        fecha: new Date(horas.fecha).toISOString().split('T')[0],
        horas: horas.horas,
      });
    }
  }, [horas]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
  
    try {
      if (!formData.entrenador_id) {
        showToast("Selecciona un entrenador", "warning");
        setIsSaving(false);
        return;
      }
      if (formData.horas <= 0) {
        showToast("Horas trabajadas debe ser mayor a cero", "warning");
        setIsSaving(false);
        return;
      }
  
      const dataToSubmit = {
        entrenador_id: formData.entrenador_id,
        fecha: new Date(formData.fecha.toString()),
        horas: formData.horas,
      };
  
      if (horas) {
        // actualizarHorasTrabajadas pendiente implementar
        showToast("Funcionalidad de actualización en desarrollo", "info");
      } else {
        await agregarHorasTrabajadas(dataToSubmit);
        showToast("Horas trabajadas registradas correctamente", "success");
      }
      onClose();
    } catch (error) {
      showToast("Error al guardar registro de horas", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {horas ? "Editar Horas Trabajadas" : "Registrar Horas Trabajadas"}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Entrenador *
            </label>
            <select
              name="entrenador_id"
              value={formData.entrenador_id}
              onChange={handleChange}
              required
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar entrenador</option>
              {entrenadores.filter(e => e.activo).map(entrenador => (
                <option key={entrenador.id} value={entrenador.id}>
                  {entrenador.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Horas Trabajadas *
            </label>
            <input
              type="number"
              name="horas"
              value={formData.horas}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors flex items-center justify-center space-x-2"
            >
              <Save size={18} />
              <span>{horas ? "Guardar cambios" : "Registrar horas"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
