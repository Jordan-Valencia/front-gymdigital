// src/components/Finanzas/Dashboard/GraficoIngresosMes.tsx
"use client"

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import type { Membresia, Venta, IngresoAdicional } from "../../../types";

interface GraficoIngresosMesProps {
  membresias: Membresia[];
  ventas: Venta[];
  ingresosAdicionales: IngresoAdicional[];
}

export function GraficoIngresosMes({ membresias, ventas, ingresosAdicionales }: GraficoIngresosMesProps) {
  const [datosGrafico, setDatosGrafico] = useState<Array<{
    dia: number;
    membresias: number;
    ventas: number;
    adicionales: number;
    total: number;
  }>>([]);

  useEffect(() => {
    generarDatosGrafico();
  }, [membresias, ventas, ingresosAdicionales]);

  const generarDatosGrafico = () => {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();
    const diasEnMes = new Date(añoActual, mesActual + 1, 0).getDate();
    
    const datos = Array.from({ length: diasEnMes }, (_, i) => {
      const dia = i + 1;
      const fechaDia = new Date(añoActual, mesActual, dia);
      
      // Ingresos por membresías del día
      const ingresoMembresias = membresias
        .filter(m => {
          const fechaPago = new Date(m.fecha_pago);
          return fechaPago.toDateString() === fechaDia.toDateString();
        })
        .reduce((sum, m) => sum + m.precio_pagado, 0);

      // Ingresos por ventas del día
      const ingresoVentas = ventas
        .filter(v => {
          const fechaVenta = new Date(v.fecha_venta);
          return fechaVenta.toDateString() === fechaDia.toDateString();
        })
        .reduce((sum, v) => sum + v.total, 0);

      // Ingresos adicionales del día
      const ingresoAdicionales = ingresosAdicionales
        .filter(i => {
          const fechaIngreso = new Date(i.fecha);
          return fechaIngreso.toDateString() === fechaDia.toDateString();
        })
        .reduce((sum, i) => sum + i.monto, 0);

      return {
        dia,
        membresias: ingresoMembresias,
        ventas: ingresoVentas,
        adicionales: ingresoAdicionales,
        total: ingresoMembresias + ingresoVentas + ingresoAdicionales
      };
    });

    setDatosGrafico(datos);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const maxValue = Math.max(...datosGrafico.map(d => d.total));
  const totalMes = datosGrafico.reduce((sum, d) => sum + d.total, 0);
  const promedioDiario = totalMes / datosGrafico.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <BarChart3 className="mr-2 text-blue-600 dark:text-blue-400" size={20} />
            Ingresos Diarios del Mes
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total: {formatCurrency(totalMes)} | Promedio: {formatCurrency(promedioDiario)}
          </p>
        </div>
        <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
      </div>

      <div className="space-y-2">
        {/* Leyenda */}
        <div className="flex justify-center space-x-6 text-sm mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Membresías</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Ventas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Adicionales</span>
          </div>
        </div>

        {/* Gráfico de barras simple */}
        <div className="h-64 flex items-end justify-between space-x-1 overflow-x-auto pb-4">
          {datosGrafico.slice(-14).map((dato) => { // Mostrar últimos 14 días
            const altura = maxValue > 0 ? (dato.total / maxValue) * 240 : 0;
            const alturaMembresias = maxValue > 0 ? (dato.membresias / maxValue) * 240 : 0;
            const alturaVentas = maxValue > 0 ? (dato.ventas / maxValue) * 240 : 0;
            const alturaAdicionales = maxValue > 0 ? (dato.adicionales / maxValue) * 240 : 0;

            return (
              <div key={dato.dia} className="flex flex-col items-center group">
                <div 
                  className="w-6 bg-gray-200 dark:bg-gray-700 rounded-t flex flex-col justify-end relative"
                  style={{ height: '240px' }}
                >
                  {/* Barras apiladas */}
                  {dato.membresias > 0 && (
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${alturaMembresias}px` }}
                    ></div>
                  )}
                  {dato.ventas > 0 && (
                    <div 
                      className="w-full bg-green-500"
                      style={{ height: `${alturaVentas}px` }}
                    ></div>
                  )}
                  {dato.adicionales > 0 && (
                    <div 
                      className="w-full bg-purple-500"
                      style={{ height: `${alturaAdicionales}px` }}
                    ></div>
                  )}
                </div>
                
                {/* Tooltip en hover */}
                <div className="opacity-0 group-hover:opacity-100 absolute bg-gray-900 text-white p-2 rounded text-xs -translate-y-2 z-10 transition-opacity">
                  <p>Día {dato.dia}</p>
                  <p>Total: {formatCurrency(dato.total)}</p>
                  {dato.membresias > 0 && <p>Membresías: {formatCurrency(dato.membresias)}</p>}
                  {dato.ventas > 0 && <p>Ventas: {formatCurrency(dato.ventas)}</p>}
                  {dato.adicionales > 0 && <p>Adicionales: {formatCurrency(dato.adicionales)}</p>}
                </div>

                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {dato.dia}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
