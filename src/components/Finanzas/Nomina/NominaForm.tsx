// src/components/Finanzas/Nomina/NominaForm.tsx
"use client"

import { useState, useEffect } from "react";
import { X, Save, Calculator } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useGymData } from "../../../hooks/useGymData";
import { useToast } from "../../../contexts/ToastContext";
import type { Nomina, EstadoPago } from "../../../types";

interface NominaFormProps {
  nomina?: Nomina | null;
  onClose: () => void;
}

export function NominaForm({ nomina, onClose }: NominaFormProps) {
  const { agregarNomina, actualizarNomina, horasTrabajadas } = useFinanzas();
  const { entrenadores } = useGymData();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [autoCalcular, setAutoCalcular] = useState(false);

  const fechaActual = new Date();
  const [formData, setFormData] = useState({
    entrenador_id: nomina?.entrenador_id || "",
    mes: nomina?.mes || fechaActual.getMonth() + 1,
    año: nomina?.año || fechaActual.getFullYear(),
    salario_base: nomina?.salario_base || 0,
    bonificaciones: nomina?.bonificaciones || 0,
    deducciones: nomina?.deducciones || 0,
    total_pagar: nomina?.total_pagar || 0,
    fecha_pago: nomina?.fecha_pago ? new Date(nomina.fecha_pago).toISOString().split('T')[0] : "",
    estado: nomina?.estado || ("PENDIENTE" as EstadoPago),
    notas: nomina?.notas || ""
  });

  useEffect(() => {
    if (autoCalcular && formData.entrenador_id && formData.mes && formData.año) {
      calcularSalarioPorHoras();
    }
  }, [formData.entrenador_id, formData.mes, formData.año, autoCalcular]);

  useEffect(() => {
    // Recalcular total cuando cambien los componentes del salario
    const total = formData.salario_base + formData.bonificaciones - formData.deducciones;
    setFormData(prev => ({ ...prev, total_pagar: total }));
  }, [formData.salario_base, formData.bonificaciones, formData.deducciones]);

  const calcularSalarioPorHoras = () => {
    const entrenador = entrenadores.find(e => e.id === formData.entrenador_id);
    if (!entrenador?.tarifa_hora) {
      showToast("El entrenador no tiene tarifa por hora configurada", "warning");
      return;
    }

    // Filtrar horas del mes y año seleccionados
    const horasDelMes = horasTrabajadas.filter(h => {
      const fechaHoras = new Date(h.fecha);
      return h.entrenador_id === formData.entrenador_id &&
             fechaHoras.getMonth() + 1 === formData.mes &&
             fechaHoras.getFullYear() === formData.año;
    });

    const totalHoras = horasDelMes.reduce((sum, h) => sum + h.horas, 0);
    const salarioCalculado = totalHoras * entrenador.tarifa_hora;

    setFormData(prev => ({
      ...prev,
      salario_base: salarioCalculado
    }));

    showToast(`Salario calculado: ${totalHoras} horas × $${entrenador.tarifa_hora.toLocaleString()} = $${salarioCalculado.toLocaleString()}`, "info");
  };

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
        fecha_pago: formData.fecha_pago ? new Date(formData.fecha_pago) : undefined
      };

      if (nomina) {
        await actualizarNomina(nomina.id, dataToSubmit);
        showToast("Nómina actualizada exitosamente", "success");
      } else {
        await agregarNomina(dataToSubmit);
        showToast("Nómina creada exitosamente", "success");
      }
      
      onClose();
    } catch (error) {
      showToast("Error al guardar la nómina", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const meses = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
  ];

  const añosDisponibles = [];
  for (let i = fechaActual.getFullYear() - 2; i <= fechaActual.getFullYear() + 1; i++) {
    añosDisponibles.push(i);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {nomina ? "Editar Nómina" : "Nueva Nómina"}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                Mes *
              </label>
              <select
                name="mes"
                value={formData.mes}
                onChange={handleChange}
                required
                disabled={isSaving}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {meses.map(mes => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Año *
              </label>
              <select
                name="año"
                value={formData.año}
                onChange={handleChange}
                required
                disabled={isSaving}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {añosDisponibles.map(año => (
                  <option key={año} value={año}>
                    {año}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Opción de cálculo automático */}
          <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <input
              type="checkbox"
              id="autoCalcular"
              checked={autoCalcular}
              onChange={(e) => setAutoCalcular(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="autoCalcular" className="flex items-center space-x-2 text-sm text-gray-900 dark:text-gray-100">
              <Calculator size={16} />
              <span>Calcular salario automáticamente por horas trabajadas</span>
            </label>
          </div>

          {/* Detalles del salario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salario Base *
              </label>
              <input
                type="number"
                name="salario_base"
                value={formData.salario_base}
                onChange={handleChange}
                required
                min="0"
                step="1000"
                disabled={isSaving || autoCalcular}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bonificaciones
              </label>
              <input
                type="number"
                name="bonificaciones"
                value={formData.bonificaciones}
                onChange={handleChange}
                min="0"
                step="1000"
                disabled={isSaving}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Deducciones
              </label>
              <input
                type="number"
                name="deducciones"
                value={formData.deducciones}
                onChange={handleChange}
                min="0"
                step="1000"
                disabled={isSaving}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total a Pagar
              </label>
              <input
                type="number"
                name="total_pagar"
                value={formData.total_pagar}
                readOnly
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-100 text-lg font-semibold"
              />
            </div>
          </div>

          {/* Estado y fecha de pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                disabled={isSaving}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="PAGADO">Pagado</option>
                <option value="VENCIDO">Vencido</option>
                <option value="PARCIAL">Parcial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de Pago
              </label>
              <input
                type="date"
                name="fecha_pago"
                value={formData.fecha_pago}
                onChange={handleChange}
                disabled={isSaving}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notas
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={3}
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notas adicionales sobre la nómina..."
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
              <span>{nomina ? "Actualizar nómina" : "Crear nómina"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
