// src/components/Finanzas/Ingresos/IngresosEstadisticas.tsx
"use client"

import { useState, useEffect } from "react";
import { DollarSign, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";

export function IngresosEstadisticas() {
  const { ingresosAdicionales } = useFinanzas();
  const [estadisticas, setEstadisticas] = useState({
    totalMes: 0,
    totalAño: 0,
    cantidadMes: 0,
    promedioPorIngreso: 0
  });

  useEffect(() => {
    calcularEstadisticas();
  }, [ingresosAdicionales]);

  const calcularEstadisticas = () => {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const añoActual = fechaActual.getFullYear();

    // Ingresos del mes actual
    const ingresosMes = ingresosAdicionales.filter(ingreso => {
      const fechaIngreso = new Date(ingreso.fecha);
      return fechaIngreso.getMonth() === mesActual && fechaIngreso.getFullYear() === añoActual;
    });

    // Ingresos del año actual
    const ingresosAño = ingresosAdicionales.filter(ingreso => {
      const fechaIngreso = new Date(ingreso.fecha);
      return fechaIngreso.getFullYear() === añoActual;
    });

    const totalMes = ingresosMes.reduce((sum, ingreso) => sum + ingreso.monto, 0);
    const totalAño = ingresosAño.reduce((sum, ingreso) => sum + ingreso.monto, 0);
    const cantidadMes = ingresosMes.length;
    const promedioPorIngreso = cantidadMes > 0 ? totalMes / cantidadMes : 0;

    setEstadisticas({
      totalMes,
      totalAño,
      cantidadMes,
      promedioPorIngreso
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const cards = [
    {
      title: "Ingresos Este Mes",
      value: formatCurrency(estadisticas.totalMes),
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      title: "Ingresos Este Año",
      value: formatCurrency(estadisticas.totalAño),
      icon: TrendingUp,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Cantidad Este Mes",
      value: estadisticas.cantidadMes.toString(),
      icon: BarChart3,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    },
    {
      title: "Promedio por Ingreso",
      value: formatCurrency(estadisticas.promedioPorIngreso),
      icon: Calendar,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <Icon className={card.color} size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
