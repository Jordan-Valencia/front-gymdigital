// src/components/Finanzas/Reportes/ReporteGeneral.tsx
"use client"

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useGymData } from "../../../hooks/useGymData";
import type { FiltroReporte } from "../../../types";

interface ReporteGeneralProps {
  filtros: FiltroReporte;
}

export function ReporteGeneral({ filtros }: ReporteGeneralProps) {
  const { generarReporteGeneral } = useFinanzas();
  const { membresias, ventas, gastos } = useGymData();
  const [datosReporte, setDatosReporte] = useState({
    totalIngresos: 0,
    totalGastos: 0,
    utilidadNeta: 0,
    ingresosPorFuente: {
      membresias: 0,
      ventas: 0,
      adicionales: 0
    },
    gastosPorCategoria: [] as Array<{categoria: string, total: number}>,
    evolutionMensual: [] as Array<{mes: string, ingresos: number, gastos: number}>
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generarDatosReporte();
  }, [filtros]);

  const generarDatosReporte = async () => {
    setLoading(true);
    try {
      // Filtrar datos por fechas
      const fechaInicio = new Date(filtros.fechaInicio);
      const fechaFin = new Date(filtros.fechaFin);

      // Calcular ingresos de membresías
      const ingresosMemberias = membresias
        .filter(m => {
          const fechaPago = new Date(m.fecha_pago);
          return fechaPago >= fechaInicio && fechaPago <= fechaFin;
        })
        .reduce((sum, m) => sum + m.precio_pagado, 0);

      // Calcular ingresos de ventas
      const ingresosVentas = ventas
        .filter(v => {
          const fechaVenta = new Date(v.fecha_venta);
          return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
        })
        .reduce((sum, v) => sum + v.total, 0);

      // Calcular gastos
      const gastosFiltered = gastos
        .filter(g => {
          const fechaGasto = new Date(g.fecha);
          return fechaGasto >= fechaInicio && fechaGasto <= fechaFin;
        });

      const totalGastos = gastosFiltered.reduce((sum, g) => sum + g.monto, 0);
      const totalIngresos = ingresosMemberias + ingresosVentas;

      // Gastos por categoría
      const gastosPorCategoria = gastosFiltered.reduce((acc, gasto) => {
        const categoria = gasto.categoria || 'Sin categoría';
        const existing = acc.find(item => item.categoria === categoria);
        if (existing) {
          existing.total += gasto.monto;
        } else {
          acc.push({ categoria, total: gasto.monto });
        }
        return acc;
      }, [] as Array<{categoria: string, total: number}>);

      setDatosReporte({
        totalIngresos,
        totalGastos,
        utilidadNeta: totalIngresos - totalGastos,
        ingresosPorFuente: {
          membresias: ingresosMemberias,
          ventas: ingresosVentas,
          adicionales: 0 // Se calculará cuando tengamos ingresosAdicionales
        },
        gastosPorCategoria: gastosPorCategoria.sort((a, b) => b.total - a.total),
        evolutionMensual: [] // Se implementará en una versión más avanzada
      });
    } catch (error) {
      console.error("Error generando reporte:", error);
    } finally {
      setLoading(false);
    }
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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Generando reporte...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Total Ingresos</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(datosReporte.totalIngresos)}
              </p>
            </div>
            <TrendingUp className="text-green-600 dark:text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">Total Gastos</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {formatCurrency(datosReporte.totalGastos)}
              </p>
            </div>
            <TrendingDown className="text-red-600 dark:text-red-400" size={32} />
          </div>
        </div>

        <div className={`p-6 rounded-lg border ${
          datosReporte.utilidadNeta >= 0 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                datosReporte.utilidadNeta >= 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                Utilidad Neta
              </p>
              <p className={`text-2xl font-bold ${
                datosReporte.utilidadNeta >= 0 
                  ? 'text-blue-700 dark:text-blue-300' 
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {formatCurrency(datosReporte.utilidadNeta)}
              </p>
            </div>
            <DollarSign className={
              datosReporte.utilidadNeta >= 0 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-red-600 dark:text-red-400'
            } size={32} />
          </div>
        </div>
      </div>

      {/* Desglose de ingresos y gastos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos por fuente */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <BarChart3 className="mr-2 text-green-600 dark:text-green-400" size={20} />
            Ingresos por Fuente
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Membresías</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{formatCurrency(datosReporte.ingresosPorFuente.membresias)}</span>
                <span className="text-sm text-gray-500">
                  ({formatPorcentaje(datosReporte.ingresosPorFuente.membresias, datosReporte.totalIngresos)})
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Ventas</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{formatCurrency(datosReporte.ingresosPorFuente.ventas)}</span>
                <span className="text-sm text-gray-500">
                  ({formatPorcentaje(datosReporte.ingresosPorFuente.ventas, datosReporte.totalIngresos)})
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Ingresos Adicionales</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{formatCurrency(datosReporte.ingresosPorFuente.adicionales)}</span>
                <span className="text-sm text-gray-500">
                  ({formatPorcentaje(datosReporte.ingresosPorFuente.adicionales, datosReporte.totalIngresos)})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gastos por categoría */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <BarChart3 className="mr-2 text-red-600 dark:text-red-400" size={20} />
            Gastos por Categoría
          </h4>
          <div className="space-y-4">
            {datosReporte.gastosPorCategoria.slice(0, 5).map((categoria, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 capitalize">{categoria.categoria}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{formatCurrency(categoria.total)}</span>
                  <span className="text-sm text-gray-500">
                    ({formatPorcentaje(categoria.total, datosReporte.totalGastos)})
                  </span>
                </div>
              </div>
            ))}
            {datosReporte.gastosPorCategoria.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No hay gastos en el período seleccionado
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Resumen del período */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Resumen del Período
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Período:</span>
            <p className="font-medium">{filtros.fechaInicio} a {filtros.fechaFin}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Margen de utilidad:</span>
            <p className="font-medium">
              {datosReporte.totalIngresos > 0 
                ? formatPorcentaje(datosReporte.utilidadNeta, datosReporte.totalIngresos)
                : '0%'}
            </p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Fuente principal:</span>
            <p className="font-medium">
              {datosReporte.ingresosPorFuente.membresias > datosReporte.ingresosPorFuente.ventas 
                ? 'Membresías' : 'Ventas'}
            </p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Estado:</span>
            <p className={`font-medium ${
              datosReporte.utilidadNeta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {datosReporte.utilidadNeta >= 0 ? 'Rentable' : 'Pérdidas'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
