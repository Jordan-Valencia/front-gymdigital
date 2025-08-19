// src/components/Finanzas/Reportes/ReporteIngresos.tsx
"use client"

import { useState, useEffect } from "react";
import { TrendingUp, Users, ShoppingCart, Plus, Calendar } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useGymData } from "../../../hooks/useGymData";
import type { FiltroReporte } from "../../../types";

interface ReporteIngresosProps {
  filtros: FiltroReporte;
}

export function ReporteIngresos({ filtros }: ReporteIngresosProps) {
  const { ingresosAdicionales } = useFinanzas();
  const { membresias, ventas, usuarios, planes, productos } = useGymData();
  const [datosReporte, setDatosReporte] = useState({
    totalIngresos: 0,
    membresias: {
      total: 0,
      cantidad: 0,
      porPlan: [] as Array<{plan: string, cantidad: number, total: number}>
    },
    ventas: {
      total: 0,
      cantidad: 0,
      porProducto: [] as Array<{producto: string, cantidad: number, total: number}>
    },
    adicionales: {
      total: 0,
      cantidad: 0,
      porCategoria: [] as Array<{categoria: string, cantidad: number, total: number}>
    },
    promedios: {
      ingresosPorDia: 0,
      ingresosPorMembresia: 0,
      ingresosPorVenta: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generarReporteIngresos();
  }, [filtros]);

  const generarReporteIngresos = () => {
    setLoading(true);
    
    const fechaInicio = new Date(filtros.fechaInicio);
    const fechaFin = new Date(filtros.fechaFin);
    const diasPeriodo = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Filtrar membresías
    const membresiasFiltered = membresias.filter(m => {
      const fechaPago = new Date(m.fecha_pago);
      return fechaPago >= fechaInicio && fechaPago <= fechaFin;
    });

    // Filtrar ventas
    const ventasFiltered = ventas.filter(v => {
      const fechaVenta = new Date(v.fecha_venta);
      return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
    });

    // Filtrar ingresos adicionales
    const ingresosFiltered = ingresosAdicionales.filter(i => {
      const fechaIngreso = new Date(i.fecha);
      return fechaIngreso >= fechaInicio && fechaIngreso <= fechaFin;
    });

    // Calcular totales
    const totalMembresias = membresiasFiltered.reduce((sum, m) => sum + m.precio_pagado, 0);
    const totalVentas = ventasFiltered.reduce((sum, v) => sum + v.total, 0);
    const totalAdicionales = ingresosFiltered.reduce((sum, i) => sum + i.monto, 0);
    const totalIngresos = totalMembresias + totalVentas + totalAdicionales;

    // Ingresos por plan
    const membreasiasPorPlan = membresiasFiltered.reduce((acc, membresia) => {
      const plan = planes.find(p => p.id === membresia.plan_id);
      const nombrePlan = plan?.nombre || 'Plan eliminado';
      const existing = acc.find(item => item.plan === nombrePlan);
      
      if (existing) {
        existing.cantidad += 1;
        existing.total += membresia.precio_pagado;
      } else {
        acc.push({
          plan: nombrePlan,
          cantidad: 1,
          total: membresia.precio_pagado
        });
      }
      return acc;
    }, [] as Array<{plan: string, cantidad: number, total: number}>);

    // Ventas por producto
    const ventasPorProducto = ventasFiltered.reduce((acc, venta) => {
      if (venta.items) {
        venta.items.forEach(item => {
          const producto = productos.find(p => p.id === item.producto_id);
          const nombreProducto = producto?.nombre || 'Producto eliminado';
          const existing = acc.find(p => p.producto === nombreProducto);
          
          if (existing) {
            existing.cantidad += item.cantidad;
            existing.total += item.subtotal;
          } else {
            acc.push({
              producto: nombreProducto,
              cantidad: item.cantidad,
              total: item.subtotal
            });
          }
        });
      }
      return acc;
    }, [] as Array<{producto: string, cantidad: number, total: number}>);

    // Ingresos adicionales por categoría
    const adiconalesPorCategoria = ingresosFiltered.reduce((acc, ingreso) => {
      const categoria = ingreso.categoria.replace('-', ' ').replace(/^\w/, c => c.toUpperCase());
      const existing = acc.find(item => item.categoria === categoria);
      
      if (existing) {
        existing.cantidad += 1;
        existing.total += ingreso.monto;
      } else {
        acc.push({
          categoria,
          cantidad: 1,
          total: ingreso.monto
        });
      }
      return acc;
    }, [] as Array<{categoria: string, cantidad: number, total: number}>);

    setDatosReporte({
      totalIngresos,
      membresias: {
        total: totalMembresias,
        cantidad: membresiasFiltered.length,
        porPlan: membreasiasPorPlan.sort((a, b) => b.total - a.total)
      },
      ventas: {
        total: totalVentas,
        cantidad: ventasFiltered.length,
        porProducto: ventasPorProducto.sort((a, b) => b.total - a.total)
      },
      adicionales: {
        total: totalAdicionales,
        cantidad: ingresosFiltered.length,
        porCategoria: adiconalesPorCategoria.sort((a, b) => b.total - a.total)
      },
      promedios: {
        ingresosPorDia: totalIngresos / diasPeriodo,
        ingresosPorMembresia: membresiasFiltered.length > 0 ? totalMembresias / membresiasFiltered.length : 0,
        ingresosPorVenta: ventasFiltered.length > 0 ? totalVentas / ventasFiltered.length : 0
      }
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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Generando reporte de ingresos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Total Ingresos</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(datosReporte.totalIngresos)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2">
            <Users className="text-blue-600 dark:text-blue-400" size={20} />
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Membresías</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(datosReporte.membresias.total)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="text-purple-600 dark:text-purple-400" size={20} />
            <div>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Ventas</p>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                {formatCurrency(datosReporte.ventas.total)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center space-x-2">
            <Plus className="text-orange-600 dark:text-orange-400" size={20} />
            <div>
              <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Adicionales</p>
              <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                {formatCurrency(datosReporte.adicionales.total)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución de ingresos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Membresías por plan */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Ingresos por Plan
          </h4>
          <div className="space-y-3">
            {datosReporte.membresias.porPlan.slice(0, 5).map((plan, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{plan.plan}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{plan.cantidad} membresías</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(plan.total)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPorcentaje(plan.total, datosReporte.membresias.total)}
                  </p>
                </div>
              </div>
            ))}
            {datosReporte.membresias.porPlan.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No hay membresías en este período
              </p>
            )}
          </div>
        </div>

        {/* Ventas por producto */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Ventas por Producto
          </h4>
          <div className="space-y-3">
            {datosReporte.ventas.porProducto.slice(0, 5).map((producto, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{producto.producto}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{producto.cantidad} unidades</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(producto.total)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPorcentaje(producto.total, datosReporte.ventas.total)}
                  </p>
                </div>
              </div>
            ))}
            {datosReporte.ventas.porProducto.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No hay ventas en este período
              </p>
            )}
          </div>
        </div>

        {/* Ingresos adicionales por categoría */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Ingresos Adicionales
          </h4>
          <div className="space-y-3">
            {datosReporte.adicionales.porCategoria.slice(0, 5).map((categoria, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{categoria.categoria}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{categoria.cantidad} registros</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(categoria.total)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPorcentaje(categoria.total, datosReporte.adicionales.total)}
                  </p>
                </div>
              </div>
            ))}
            {datosReporte.adicionales.porCategoria.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No hay ingresos adicionales en este período
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Promedios y estadísticas */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Estadísticas y Promedios
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(datosReporte.promedios.ingresosPorDia)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos por día</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(datosReporte.promedios.ingresosPorMembresia)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Promedio por membresía</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(datosReporte.promedios.ingresosPorVenta)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Promedio por venta</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {datosReporte.membresias.cantidad + datosReporte.ventas.cantidad + datosReporte.adicionales.cantidad}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total transacciones</p>
          </div>
        </div>
      </div>
    </div>
  );
}
