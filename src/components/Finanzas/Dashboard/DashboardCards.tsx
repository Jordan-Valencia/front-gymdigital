// src/components/Finanzas/Dashboard/DashboardCards.tsx
"use client"

import { DollarSign, TrendingUp, TrendingDown, Percent } from "lucide-react";

interface DashboardCardsProps {
  resumen: {
    ingresosMes: number;
    gastosMes: number;
    utilidadMes: number;
    crecimientoMensual: number;
    margenUtilidad: number;
  };
}

export function DashboardCards({ resumen }: DashboardCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const cards = [
    {
      title: "Ingresos del Mes",
      value: formatCurrency(resumen.ingresosMes),
      change: `${resumen.crecimientoMensual >= 0 ? '+' : ''}${resumen.crecimientoMensual.toFixed(1)}%`,
      changeType: resumen.crecimientoMensual >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800"
    },
    {
      title: "Gastos del Mes",
      value: formatCurrency(resumen.gastosMes),
      change: "vs mes anterior",
      changeType: 'neutral',
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800"
    },
    {
      title: "Utilidad del Mes",
      value: formatCurrency(resumen.utilidadMes),
      change: `${resumen.margenUtilidad.toFixed(1)}% margen`,
      changeType: resumen.utilidadMes >= 0 ? 'positive' : 'negative',
      icon: resumen.utilidadMes >= 0 ? TrendingUp : TrendingDown,
      color: resumen.utilidadMes >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400",
      bgColor: resumen.utilidadMes >= 0 ? "bg-blue-100 dark:bg-blue-900/20" : "bg-red-100 dark:bg-red-900/20",
      borderColor: resumen.utilidadMes >= 0 ? "border-blue-200 dark:border-blue-800" : "border-red-200 dark:border-red-800"
    },
    {
      title: "Margen de Utilidad",
      value: `${resumen.margenUtilidad.toFixed(1)}%`,
      change: resumen.margenUtilidad >= 20 ? "Excelente" : resumen.margenUtilidad >= 10 ? "Bueno" : "Mejorar",
      changeType: resumen.margenUtilidad >= 20 ? 'positive' : resumen.margenUtilidad >= 10 ? 'neutral' : 'negative',
      icon: Percent,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div 
            key={index} 
            className={`bg-white dark:bg-gray-800 p-6 rounded-xl border-2 ${card.borderColor} hover:shadow-lg transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {card.value}
                </p>
                <p className={`text-xs font-medium ${
                  card.changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
                  card.changeType === 'negative' ? 'text-red-600 dark:text-red-400' :
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {card.change}
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
