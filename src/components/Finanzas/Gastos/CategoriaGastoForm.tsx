// src/components/Finanzas/Gastos/CategoriaGastoForm.tsx
"use client"

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useToast } from "../../../contexts/ToastContext";
import type { CategoriaGasto, TipoGasto } from "../../../types";

interface CategoriaGastoFormProps {
  categoria?: CategoriaGasto | null;
  onClose: () => void;
}

export function CategoriaGastoForm({ categoria, onClose }: CategoriaGastoFormProps) {
  const { agregarCategoriaGasto } = useFinanzas();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    nombre: categoria?.nombre || "",
    descripcion: categoria?.descripcion || "",
    tipo: categoria?.tipo || ("OPERATIVO" as TipoGasto),
    activo: categoria?.activo ?? true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await agregarCategoriaGasto(formData);
      showToast("Categoría creada exitosamente", "success");
      onClose();
    } catch (error) {
      showToast("Error al crear la categoría", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {categoria ? "Editar Categoría" : "Nueva Categoría de Gasto"}
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
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre de la categoría"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo *
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="OPERATIVO">Operativo</option>
              <option value="NOMINA">Nómina</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
              <option value="MARKETING">Marketing</option>
              <option value="SERVICIOS">Servicios</option>
              <option value="IMPUESTOS">Impuestos</option>
              <option value="OTROS">Otros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción de la categoría..."
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
              <span>Crear categoría</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
