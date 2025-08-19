// src/components/Finanzas/Ingresos/IngresoForm.tsx
"use client"

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useToast } from "../../../contexts/ToastContext";
import type { IngresoAdicional } from "../../../types";

interface IngresoFormProps {
  ingreso?: IngresoAdicional | null;
  onClose: () => void;
}

export function IngresoForm({ ingreso, onClose }: IngresoFormProps) {
  const { agregarIngresoAdicional, actualizarIngresoAdicional } = useFinanzas();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    concepto: ingreso?.concepto || "",
    monto: ingreso?.monto || 0,
    fecha: ingreso?.fecha ? new Date(ingreso.fecha).toISOString().split('T')[0] : new Date().toISOString().split('T'),
    categoria: ingreso?.categoria || "otros",
    descripcion: ingreso?.descripcion || "",
    metodo_pago: ingreso?.metodo_pago || "efectivo"
  });

  useEffect(() => {
    if (ingreso) {
      setFormData({
        concepto: ingreso.concepto,
        monto: ingreso.monto,
        fecha: new Date(ingreso.fecha).toISOString().split('T')[0],
        categoria: ingreso.categoria,
        descripcion: ingreso.descripcion || "",
        metodo_pago: ingreso.metodo_pago
      });
    }
  }, [ingreso]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const dataToSubmit = {
        ...formData,
        fecha: new Date(formData.fecha.toString())
      };

      if (ingreso) {
        await actualizarIngresoAdicional(ingreso.id, dataToSubmit);
        showToast("Ingreso actualizado exitosamente", "success");
      } else {
        await agregarIngresoAdicional(dataToSubmit);
        showToast("Ingreso creado exitosamente", "success");
      }
      
      onClose();
    } catch (error) {
      showToast("Error al guardar el ingreso", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const categorias = [
    { value: 'entrenamiento-personal', label: 'Entrenamiento Personal' },
    { value: 'eventos', label: 'Eventos Especiales' },
    { value: 'nutricion', label: 'Servicios de Nutrición' },
    { value: 'clases-especiales', label: 'Clases Especiales' },
    { value: 'servicios-extra', label: 'Servicios Extra' },
    { value: 'patrocinios', label: 'Patrocinios' },
    { value: 'alquileres', label: 'Alquiler de Espacios' },
    { value: 'certificaciones', label: 'Certificaciones' },
    { value: 'otros', label: 'Otros' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {ingreso ? "Editar Ingreso Adicional" : "Nuevo Ingreso Adicional"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Concepto *
              </label>
              <input
                type="text"
                name="concepto"
                value={formData.concepto}
                onChange={handleChange}
                required
                disabled={isSaving}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción del ingreso"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monto *
              </label>
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                required
                min="0"
                step="1000"
                disabled={isSaving}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                Categoría *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
                disabled={isSaving}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categorias.map(categoria => (
                  <option key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Método de Pago
              </label>
              <select
                name="metodo_pago"
                value={formData.metodo_pago}
                onChange={handleChange}
                disabled={isSaving}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="cheque">Cheque</option>
                <option value="deposito">Depósito</option>
              </select>
            </div>
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
              placeholder="Descripción adicional del ingreso..."
            />
          </div>

          {/* Ejemplos de categorías */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Ejemplos por categoría:</h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <div><strong>Entrenamiento Personal:</strong> Sesiones privadas, planes personalizados</div>
              <div><strong>Eventos:</strong> Competencias, talleres, celebraciones</div>
              <div><strong>Servicios Extra:</strong> Masajes, fisioterapia, evaluaciones</div>
              <div><strong>Patrocinios:</strong> Ingresos por sponsors o colaboraciones</div>
            </div>
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
              className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors flex items-center justify-center space-x-2"
            >
              <Save size={18} />
              <span>{ingreso ? "Guardar cambios" : "Crear ingreso"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
