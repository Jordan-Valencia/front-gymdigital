// src/components/Finanzas/Reportes/ReportesMain.tsx
"use client"

import { useState } from "react";
import { FileText, BarChart3, PieChart, Calendar, Download } from "lucide-react";
import { ReporteGeneral } from "./ReporteGeneral";
import { ReporteIngresos } from "./ReporteIngresos";
import { ReporteGastos } from "./ReporteGastos";
import { ReporteNomina } from "./ReporteNomina";
import { FiltrosReporte } from "./FiltrosReporte";
import type { FiltroReporte } from "../../../types";

export function ReportesMain() {
  const [activeReport, setActiveReport] = useState<'general' | 'ingresos' | 'gastos' | 'nomina'>('general');
  const [filtros, setFiltros] = useState<FiltroReporte>({
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    tipo: 'general',
    formato: 'excel'
  });

  const reportTypes = [
    {
      id: 'general',
      label: 'Reporte General',
      icon: BarChart3,
      description: 'Vista completa de ingresos y gastos',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      id: 'ingresos',
      label: 'Ingresos',
      icon: PieChart,
      description: 'Análisis detallado de ingresos',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      id: 'gastos',
      label: 'Gastos',
      icon: FileText,
      description: 'Desglose de gastos por categoría',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    },
    {
      id: 'nomina',
      label: 'Nómina',
      icon: Calendar,
      description: 'Reportes de pagos a empleados',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    }
  ];

  const handleFiltrosChange = (nuevosFiltros: FiltroReporte) => {
    setFiltros(nuevosFiltros);
  };

  const renderReporte = () => {
    switch (activeReport) {
      case 'general':
        return <ReporteGeneral filtros={filtros} />;
      case 'ingresos':
        return <ReporteIngresos filtros={filtros} />;
      case 'gastos':
        return <ReporteGastos filtros={filtros} />;
      case 'nomina':
        return <ReporteNomina filtros={filtros} />;
      default:
        return <ReporteGeneral filtros={filtros} />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <FileText className="text-blue-600 dark:text-blue-400" size={24} />
            <span>Reportes Financieros</span>
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Genera reportes detallados y exporta datos financieros
          </p>
        </div>
      </div>

      {/* Filtros generales */}
      <FiltrosReporte filtros={filtros} onFiltrosChange={handleFiltrosChange} />

      {/* Selector de tipo de reporte */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id as any)}
              className={`p-4 rounded-lg border-2 transition-all ${
                activeReport === report.id
                  ? `${report.bgColor} border-current ${report.color}`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <Icon className={activeReport === report.id ? report.color : 'text-gray-400 dark:text-gray-500'} size={24} />
                <h4 className={`font-medium ${activeReport === report.id ? report.color : 'text-gray-900 dark:text-gray-100'}`}>
                  {report.label}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {report.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Contenido del reporte */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        {renderReporte()}
      </div>
    </div>
  );
}
