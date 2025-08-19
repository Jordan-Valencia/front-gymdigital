// src/components/Finanzas/Facturacion/FacturacionMain.tsx
"use client"

import { useState } from "react";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { MembresiasPorVencer } from "./MembresiasPorVencer";
import { MembresiasVencidas } from "./MembresiasVencidas";
import { PagosRealizados } from "./PagosRealizados";
import { EstadisticasFacturacion } from "./EstadisticasFacturacion";

export function FacturacionMain() {
  const [activeTab, setActiveTab] = useState<'por-vencer' | 'vencidas' | 'pagos'>('por-vencer');

  const tabs = [
    { 
      id: 'por-vencer', 
      label: 'Por Vencer', 
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    },
    { 
      id: 'vencidas', 
      label: 'Vencidas', 
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    },
    { 
      id: 'pagos', 
      label: 'Pagos Realizados', 
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'por-vencer':
        return <MembresiasPorVencer />;
      case 'vencidas':
        return <MembresiasVencidas />;
      case 'pagos':
        return <PagosRealizados />;
      default:
        return <MembresiasPorVencer />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Estadísticas rápidas */}
      <EstadisticasFacturacion />

      {/* Tabs Navigation */}
      <div className="flex space-x-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? `${tab.bgColor} ${tab.color}`
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {renderContent()}
      </div>
    </div>
  );
}
