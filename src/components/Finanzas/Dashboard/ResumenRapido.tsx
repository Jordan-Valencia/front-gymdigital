// src/components/Finanzas/Dashboard/ResumenRapido.tsx
"use client"

import { Users, UserCheck, ShoppingCart, Receipt } from "lucide-react";

interface ResumenRapidoProps {
  totalMiembros: number;
  totalEntrenadores: number;
  ventasHoy: number;
  gastosMes: number;
}

export function ResumenRapido({ 
  totalMiembros, 
  totalEntrenadores, 
  ventasHoy, 
  gastosMes 
}: ResumenRapidoProps) {
  
  const estadisticas = [
    {
      titulo: "Miembros Activos",
      valor: totalMiembros,
      icono: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      titulo: "Entrenadores",
      valor: totalEntrenadores,
      icono: UserCheck,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      titulo: "Ventas Hoy",
      valor: ventasHoy,
      icono: ShoppingCart,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    },
    {
      titulo: "Gastos Este Mes",
      valor: gastosMes,
      icono: Receipt,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20"
    }
  ];

  const getStatusColor = (titulo: string, valor: number) => {
    switch (titulo) {
      case "Miembros Activos":
        return valor >= 50 ? "text-green-600" : valor >= 20 ? "text-yellow-600" : "text-red-600";
      case "Entrenadores":
        return valor >= 3 ? "text-green-600" : valor >= 1 ? "text-yellow-600" : "text-red-600";
      case "Ventas Hoy":
        return valor >= 5 ? "text-green-600" : valor >= 2 ? "text-yellow-600" : "text-red-600";
      default:
        return "text-gray-600";
    }
  };


  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <Users className="mr-2 text-blue-600 dark:text-blue-400" size={20} />
        Resumen Rápido
      </h3>

      <div className="space-y-4">
        {estadisticas.map((stat, index) => {
          const Icon = stat.icono;
          const statusColor = getStatusColor(stat.titulo, stat.valor);
          
          return (
            <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={stat.color} size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {stat.titulo}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.valor}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicadores de rendimiento */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Estado General
        </h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
              totalMiembros >= 50 ? 'bg-green-500' : totalMiembros >= 20 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Membresías</p>
          </div>
          <div className="p-2 rounded">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
              totalEntrenadores >= 3 ? 'bg-green-500' : totalEntrenadores >= 1 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Personal</p>
          </div>
          <div className="p-2 rounded">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
              ventasHoy >= 5 ? 'bg-green-500' : ventasHoy >= 2 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Ventas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
