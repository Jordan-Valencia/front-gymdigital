// src/components/Finanzas/Reportes/ReporteGastos.tsx
"use client"

import { useState, useEffect } from "react";
import { TrendingDown, AlertTriangle, CheckCircle, Clock, X } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useGymData } from "../../../hooks/useGymData";
import type { FiltroReporte, EstadoGasto } from "../../../types";

interface ReporteGastosProps {
  filtros: FiltroReporte;
}

export function ReporteGastos({ filtros }: ReporteGastosProps) {
  const { gastosDetallados, categoriasGastos } = useFinanzas();
  const { gastos } = useGymData();
  const [datosReporte, setDatosReporte] = useState({
    totalGastos: 0,
    porEstado: {
      pagado: 0,
      pendiente: 0,
      vencido: 0,
      cancelado: 0
    },
    porCategoria: [] as Array<{categoria: string, total: number, cantidad: number}>,
    porTipo: [] as Array<{tipo: string, total: number, cantidad: number}>,
    promedioPorDia: 0,
    promedioPorGasto: 0,
    gastoMasAlto: 0,
    gastoMasBajo: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generarReporteGastos();
  }, [filtros]);

  const generarReporteGastos = () => {
    setLoading(true);
    
    const fechaInicio = new Date(filtros.fechaInicio);
    const fechaFin = new Date(filtros.fechaFin);
    const diasPeriodo = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Usar gastos simples si no hay gastos detallados
    const gastosAUsar = gastosDetallados.length > 0 ? gastosDetallados : gastos.map(g => ({
      id: g.id,
      concepto: g.concepto,
      monto: g.monto,
      fecha: new Date(g.fecha),
      categoria_id: g.categoria,
      estado: 'PAGADO' as EstadoGasto,
      metodo_pago: 'efectivo',
      descripcion: g.descripcion
    }));

    // Filtrar gastos por fecha
    const gastosFiltered = gastosAUsar.filter(g => {
      const fechaGasto = new Date(g.fecha);
      return fechaGasto >= fechaInicio && fechaGasto <= fechaFin;
    });

    const totalGastos = gastosFiltered.reduce((sum, g) => sum + g.monto, 0);

    // Gastos por estado (solo si tenemos gastos detallados)
    const porEstado = {
      pagado: 0,
      pendiente: 0,
      vencido: 0,
      cancelado: 0
    };

    if (gastosDetallados.length > 0) {
      gastosFiltered.forEach(gasto => {
        switch (gasto.estado) {
          case 'PAGADO':
            porEstado.pagado += gasto.monto;
            break;
          case 'PENDIENTE':
            porEstado.pendiente += gasto.monto;
            break;
          case 'VENCIDO':
            porEstado.vencido += gasto.monto;
            break;
          case 'CANCELADO':
            porEstado.cancelado += gasto.monto;
            break;
        }
      });
    } else {
      porEstado.pagado = totalGastos; // Asumimos que todos están pagados si no tenemos info detallada
    }

    // Gastos por categoría
    const gastosCategoria = gastosFiltered.reduce((acc, gasto) => {
      const categoria = gastosDetallados.length > 0 
        ? categoriasGastos.find(c => c.id === gasto.categoria_id)?.nombre || 'Sin categoría'
        : gasto.categoria_id || 'Sin categoría';
      
      const existing = acc.find(item => item.categoria === categoria);
      if (existing) {
        existing.total += gasto.monto;
        existing.cantidad += 1;
      } else {
        acc.push({ categoria, total: gasto.monto, cantidad: 1 });
      }
      return acc;
    }, [] as Array<{categoria: string, total: number, cantidad: number}>);

    // Calcular estadísticas
    const montos = gastosFiltered.map(g => g.monto);
    const gastoMasAlto = montos.length > 0 ? Math.max(...montos) : 0;
    const gastoMasBajo = montos.length > 0 ? Math.min(...montos) : 0;

    setDatosReporte({
      totalGastos,
      porEstado,
      porCategoria: gastosCategoria.sort((a, b) => b.total - a.total),
      porTipo: [], // Se implementará cuando tengamos tipos de gasto
      promedioPorDia: totalGastos / diasPeriodo,
      promedioPorGasto: gastosFiltered.length > 0 ? totalGastos / gastosFiltered.length : 0,
      gastoMasAlto,
      gastoMasBajo
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

  const formatPorcentaje = (valor: number, total: number) => {
    return total > 0 ? ((valor / total) * 100).toFixed(1) + '%' : '0%';
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Generando reporte de gastos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2">
            <TrendingDown className="text-red-600 dark:text-red-400" size={20} />
            <div>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">Total Gastos</p>
              <p className="text-xl font-bold text-red-700 dark:text-red-300">
                {formatCurrency(datosReporte.totalGastos)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Pagados</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(datosReporte.porEstado.pagado)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-2">
            <Clock className="text-yellow-600 dark:text-yellow-400" size={20} />
            <div>
              <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Pendientes</p>
              <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                {formatCurrency(datosReporte.porEstado.pendiente)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-orange-600 dark:text-orange-400" size={20} />
            <div>
              <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Vencidos</p>
              <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                {formatCurrency(datosReporte.porEstado.vencido)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por estado */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Distribución por Estado
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pagados</p>
            <p className="text-lg font-semibold">{formatCurrency(datosReporte.porEstado.pagado)}</p>
            <p className="text-sm text-gray-500">
              {formatPorcentaje(datosReporte.porEstado.pagado, datosReporte.totalGastos)}
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pendientes</p>
            <p className="text-lg font-semibold">{formatCurrency(datosReporte.porEstado.pendiente)}</p>
            <p className="text-sm text-gray-500">
              {formatPorcentaje(datosReporte.porEstado.pendiente, datosReporte.totalGastos)}
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vencidos</p>
            <p className="text-lg font-semibold">{formatCurrency(datosReporte.porEstado.vencido)}</p>
            <p className="text-sm text-gray-500">
              {formatPorcentaje(datosReporte.porEstado.vencido, datosReporte.totalGastos)}
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
              <X className="text-gray-600 dark:text-gray-400" size={24} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cancelados</p>
            <p className="text-lg font-semibold">{formatCurrency(datosReporte.porEstado.cancelado)}</p>
            <p className="text-sm text-gray-500">
              {formatPorcentaje(datosReporte.porEstado.cancelado, datosReporte.totalGastos)}
            </p>
          </div>
        </div>
      </div>

      {/* Gastos por categoría */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Gastos por Categoría
        </h4>
        <div className="space-y-4">
          {datosReporte.porCategoria.slice(0, 8).map((categoria, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{categoria.categoria}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{categoria.cantidad} gastos</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(categoria.total)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatPorcentaje(categoria.total, datosReporte.totalGastos)}
                </p>
              </div>
            </div>
          ))}
          {datosReporte.porCategoria.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No hay gastos en este período
            </p>
          )}
        </div>
      </div>

      {/* Estadísticas avanzadas */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Estadísticas Avanzadas
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(datosReporte.promedioPorDia)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gasto promedio por día</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(datosReporte.promedioPorGasto)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Promedio por gasto</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(datosReporte.gastoMasAlto)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gasto más alto</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(datosReporte.gastoMasBajo)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gasto más bajo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
