// src/components/Finanzas/Reportes/FiltrosReporte.tsx
"use client"

import { Download, Calendar, Filter } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useToast } from "../../../contexts/ToastContext";
import type { FiltroReporte } from "../../../types";

interface FiltrosReporteProps {
  filtros: FiltroReporte;
  onFiltrosChange: (filtros: FiltroReporte) => void;
}

export function FiltrosReporte({ filtros, onFiltrosChange }: FiltrosReporteProps) {
  const { exportarReporteExcel, exportarReportePDF } = useFinanzas();
  const { showToast } = useToast();

  const handleChange = (campo: keyof FiltroReporte, valor: string) => {
    onFiltrosChange({
      ...filtros,
      [campo]: valor
    });
  };

  const handleExportar = async (formato: 'xlsx' | 'pdf') => {
    try {
      let blob;
      if (formato === 'xlsx') {
        blob = await exportarReporteExcel(filtros.tipo, filtros);
      } else {
        blob = await exportarReportePDF(filtros.tipo, filtros);
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${filtros.tipo}-${filtros.fechaInicio}-${filtros.fechaFin}.${formato}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToast(`Reporte exportado en formato ${formato.toUpperCase()}`, "success");
    } catch (error) {
      showToast(`Error al exportar reporte en ${formato.toUpperCase()}`, "error");
    }
  };

  const getRangosRapidos = () => {
    const hoy = new Date();
    return {
      'este-mes': {
        inicio: new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0],
        fin: hoy.toISOString().split('T'),
        label: 'Este Mes'
      },
      'mes-anterior': {
        inicio: new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1).toISOString().split('T'),
        fin: new Date(hoy.getFullYear(), hoy.getMonth(), 0).toISOString().split('T'),
        label: 'Mes Anterior'
      },
      'este-año': {
        inicio: new Date(hoy.getFullYear(), 0, 1).toISOString().split('T'),
        fin: hoy.toISOString().split('T'),
        label: 'Este Año'
      },
      'año-anterior': {
        inicio: new Date(hoy.getFullYear() - 1, 0, 1).toISOString().split('T'),
        fin: new Date(hoy.getFullYear() - 1, 11, 31).toISOString().split('T'),
        label: 'Año Anterior'
      }
    };
  };

  const aplicarRangoRapido = (rango: keyof ReturnType<typeof getRangosRapidos>) => {
    const rangos = getRangosRapidos();
    const rangoSeleccionado = rangos[rango];
    onFiltrosChange({
      ...filtros,
      fechaInicio: Array.isArray(rangoSeleccionado.inicio) 
        ? rangoSeleccionado.inicio[0] 
        : rangoSeleccionado.inicio,
      fechaFin: Array.isArray(rangoSeleccionado.fin) 
        ? rangoSeleccionado.fin[0] 
        : rangoSeleccionado.fin
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="text-gray-600 dark:text-gray-400" size={20} />
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Filtros y Exportación</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fecha inicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha Inicio
          </label>
          <input
            type="date"
            value={filtros.fechaInicio}
            onChange={(e) => handleChange('fechaInicio', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Fecha fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha Fin
          </label>
          <input
            type="date"
            value={filtros.fechaFin}
            onChange={(e) => handleChange('fechaFin', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Rangos rápidos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rangos Rápidos
          </label>
          <select
            onChange={(e) => e.target.value && aplicarRangoRapido(e.target.value as any)}
            value=""
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar rango</option>
            {Object.entries(getRangosRapidos()).map(([key, rango]) => (
              <option key={key} value={key}>
                {rango.label}
              </option>
            ))}
          </select>
        </div>

        {/* Exportar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Exportar
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportar('xlsx')}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors text-sm"
            >
              <Download size={20} />
              <span>Excel</span>
            </button>
            <button
              onClick={() => handleExportar('pdf')}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors text-sm"
            >
              <Download size={20} />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
