// src/components/Finanzas/Facturacion/EstadisticasFacturacion.tsx
"use client"

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, DollarSign, Users } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useGymData } from "../../../hooks/useGymData";

export function EstadisticasFacturacion() {
  const { obtenerMembresiasPorVencer, obtenerMembresiasVencidas } = useFinanzas();
  const { membresias } = useGymData();
  const [estadisticas, setEstadisticas] = useState({
    porVencer: 0,
    vencidas: 0,
    montoTotal: 0,
    membresiariosActivos: 0
  });

  useEffect(() => {
    calcularEstadisticas();
  }, [membresias]);

  const calcularEstadisticas = async () => {
    try {
      const [porVencer, vencidas] = await Promise.all([
        obtenerMembresiasPorVencer(7),
        obtenerMembresiasVencidas()
      ]);

      const hoy = new Date();
      const activos = membresias.filter(m => new Date(m.fecha_fin) > hoy).length;
      const montoTotal = [...porVencer, ...vencidas].reduce((sum, m) => sum + m.precio_pagado, 0);

      setEstadisticas({
        porVencer: porVencer.length,
        vencidas: vencidas.length,
        montoTotal,
        membresiariosActivos: activos
      });
    } catch (error) {
      console.error("Error calculando estadísticas:", error);
    }
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
      title: "Miembros Activos",
      value: estadisticas.membresiariosActivos.toString(),
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Por Vencer (7 días)",
      value: estadisticas.porVencer.toString(),
      icon: Clock,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20"
    },
    {
      title: "Membresías Vencidas",
      value: estadisticas.vencidas.toString(),
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20"
    },
    {
      title: "Monto Pendiente",
      value: formatCurrency(estadisticas.montoTotal),
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20"
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
