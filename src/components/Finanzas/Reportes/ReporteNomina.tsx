// src/components/Finanzas/Reportes/ReporteNomina.tsx
"use client"

import { useState, useEffect } from "react";
import { Users, DollarSign, Calendar, Clock } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useGymData } from "../../../hooks/useGymData";
import type { FiltroReporte, EstadoPago } from "../../../types";

interface ReporteNominaProps {
  filtros: FiltroReporte;
}

export function ReporteNomina({ filtros }: ReporteNominaProps) {
  const { nominas, horasTrabajadas } = useFinanzas();
  const { entrenadores } = useGymData();
  const [datosReporte, setDatosReporte] = useState({
    totalNomina: 0,
    totalHoras: 0,
    porEstado: {
      pagado: 0,
      pendiente: 0,
      vencido: 0,
      parcial: 0
    },
    porEntrenador: [] as Array<{
      nombre: string, 
      salarioBase: number, 
      bonificaciones: number, 
      deducciones: number, 
      total: number,
      horas: number,
      estado: string
    }>,
    promedios: {
      salarioPorEntrenador: 0,
      horasPorEntrenador: 0,
      tarifaPromedioHora: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generarReporteNomina();
  }, [filtros]);

  const generarReporteNomina = () => {
    setLoading(true);
    
    const fechaInicio = new Date(filtros.fechaInicio);
    const fechaFin = new Date(filtros.fechaFin);

    // Filtrar nóminas por período
    const nominasFiltered = nominas.filter(nomina => {
      const fechaNomina = new Date(nomina.año, nomina.mes - 1, 1);
      return fechaNomina >= fechaInicio && fechaNomina <= fechaFin;
    });

    const totalNomina = nominasFiltered.reduce((sum, n) => sum + n.total_pagar, 0);

    // Calcular por estado
    const porEstado = {
      pagado: 0,
      pendiente: 0,
      vencido: 0,
      parcial: 0
    };

    nominasFiltered.forEach(nomina => {
      switch (nomina.estado) {
        case 'PAGADO':
          porEstado.pagado += nomina.total_pagar;
          break;
        case 'PENDIENTE':
          porEstado.pendiente += nomina.total_pagar;
          break;
        case 'VENCIDO':
          porEstado.vencido += nomina.total_pagar;
          break;
        case 'PARCIAL':
          porEstado.parcial += nomina.total_pagar;
          break;
      }
    });

    // Agrupar por entrenador
    const nominaPorEntrenador = nominasFiltered.reduce((acc, nomina) => {
      const entrenador = entrenadores.find(e => e.id === nomina.entrenador_id);
      const nombreEntrenador = entrenador?.nombre || 'Entrenador eliminado';
      
      const existing = acc.find(item => item.nombre === nombreEntrenador);
      if (existing) {
        existing.salarioBase += nomina.salario_base;
        existing.bonificaciones += nomina.bonificaciones;
        existing.deducciones += nomina.deducciones;
        existing.total += nomina.total_pagar;
      } else {
        acc.push({
          nombre: nombreEntrenador,
          salarioBase: nomina.salario_base,
          bonificaciones: nomina.bonificaciones,
          deducciones: nomina.deducciones,
          total: nomina.total_pagar,
          horas: 0, // Se calculará después
          estado: nomina.estado
        });
      }
      return acc;
    }, [] as Array<{
      nombre: string, 
      salarioBase: number, 
      bonificaciones: number, 
      deducciones: number, 
      total: number,
      horas: number,
      estado: string
    }>);

    // Calcular horas trabajadas por entrenador
    const horasFiltered = horasTrabajadas.filter(h => {
      const fechaHora = new Date(h.fecha);
      return fechaHora >= fechaInicio && fechaHora <= fechaFin;
    });

    const totalHoras = horasFiltered.reduce((sum, h) => sum + h.horas, 0);

    // Asignar horas a cada entrenador
    nominaPorEntrenador.forEach(nomina => {
      const entrenador = entrenadores.find(e => e.nombre === nomina.nombre);
      if (entrenador) {
        const horasEntrenador = horasFiltered
          .filter(h => h.entrenador_id === entrenador.id)
          .reduce((sum, h) => sum + h.horas, 0);
        nomina.horas = horasEntrenador;
      }
    });

    // Calcular promedios
    const entrenadoresActivos = nominaPorEntrenador.length;
    const promedios = {
      salarioPorEntrenador: entrenadoresActivos > 0 ? totalNomina / entrenadoresActivos : 0,
      horasPorEntrenador: entrenadoresActivos > 0 ? totalHoras / entrenadoresActivos : 0,
      tarifaPromedioHora: totalHoras > 0 ? totalNomina / totalHoras : 0
    };

    setDatosReporte({
      totalNomina,
      totalHoras,
      porEstado,
      porEntrenador: nominaPorEntrenador.sort((a, b) => b.total - a.total),
      promedios
    });

    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getEstadoColor = (estado: EstadoPago) => {
    switch (estado) {
      case 'PAGADO':
        return 'text-green-600 dark:text-green-400';
      case 'PENDIENTE':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'VENCIDO':
        return 'text-red-600 dark:text-red-400';
      case 'PARCIAL':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Generando reporte de nómina...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2">
            <DollarSign className="text-blue-600 dark:text-blue-400" size={20} />
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Nómina</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(datosReporte.totalNomina)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <Clock className="text-green-600 dark:text-green-400" size={20} />
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Total Horas</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">
                {datosReporte.totalHoras.toFixed(1)}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-2">
            <Users className="text-purple-600 dark:text-purple-400" size={20} />
            <div>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Entrenadores</p>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                {datosReporte.porEntrenador.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center space-x-2">
            <Calendar className="text-orange-600 dark:text-orange-400" size={20} />
            <div>
              <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Tarifa Promedio</p>
              <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                {formatCurrency(datosReporte.promedios.tarifaPromedioHora)}/h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por estado */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Estado de Pagos
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(datosReporte.porEstado).map(([estado, monto]) => (
            <div key={estado} className="text-center">
              <p className="text-2xl font-bold" style={{color: getEstadoColor(estado as EstadoPago).split(' ')[0].replace('text-', '')}}>
                {formatCurrency(monto)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{estado}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detalle por entrenador */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Detalle por Entrenador
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left pb-3 text-gray-600 dark:text-gray-400">Entrenador</th>
                <th className="text-right pb-3 text-gray-600 dark:text-gray-400">Horas</th>
                <th className="text-right pb-3 text-gray-600 dark:text-gray-400">Salario Base</th>
                <th className="text-right pb-3 text-gray-600 dark:text-gray-400">Bonificaciones</th>
                <th className="text-right pb-3 text-gray-600 dark:text-gray-400">Deducciones</th>
                <th className="text-right pb-3 text-gray-600 dark:text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {datosReporte.porEntrenador.map((entrenador, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 font-medium text-gray-900 dark:text-gray-100">
                    {entrenador.nombre}
                  </td>
                  <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                    {entrenador.horas.toFixed(1)}h
                  </td>
                  <td className="py-3 text-right">{formatCurrency(entrenador.salarioBase)}</td>
                  <td className="py-3 text-right text-green-600 dark:text-green-400">
                    +{formatCurrency(entrenador.bonificaciones)}
                  </td>
                  <td className="py-3 text-right text-red-600 dark:text-red-400">
                    -{formatCurrency(entrenador.deducciones)}
                  </td>
                  <td className="py-3 text-right font-semibold">
                    {formatCurrency(entrenador.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {datosReporte.porEntrenador.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No hay registros de nómina en este período
            </p>
          )}
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Estadísticas Adicionales
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(datosReporte.promedios.salarioPorEntrenador)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Salario promedio por entrenador</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {datosReporte.promedios.horasPorEntrenador.toFixed(1)}h
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Horas promedio por entrenador</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(datosReporte.promedios.tarifaPromedioHora)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tarifa promedio por hora</p>
          </div>
        </div>
      </div>
    </div>
  );
}
