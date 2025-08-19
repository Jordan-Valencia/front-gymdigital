// src/components/Finanzas/FinanzasMain.tsx
"use client"

import { useState } from "react";
import { 
  TrendingUp, 
  Receipt, 
  Users, 
  FileText, 
  PieChart,
  DollarSign,
  Calendar,
  Plus
} from "lucide-react";
import { GastosMain } from "./Gastos/GastosMain";
import { NominaMain } from "./Nomina/NominaMain";
import { ReportesMain } from "./Reportes/ReportesMain";
import { DashboardFinanciero } from "./Dashboard/DashboardFinanciero";
import { FacturacionMain } from "./Facturacion/FacturacionMain";
import { IngresosMain } from "./Ingresos/IngresosMain";

export function FinanzasMain() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gastos' | 'nomina' | 'facturacion' | 'ingresos' | 'reportes'>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: PieChart, color: 'text-blue-600 dark:text-blue-400' },
    { id: 'gastos', label: 'Gastos', icon: Receipt, color: 'text-red-600 dark:text-red-400' },
    { id: 'nomina', label: 'Nómina', icon: Users, color: 'text-purple-600 dark:text-purple-400' },
    { id: 'facturacion', label: 'Facturación', icon: Calendar, color: 'text-orange-600 dark:text-orange-400' },
    { id: 'ingresos', label: 'Ingresos Extra', icon: Plus, color: 'text-green-600 dark:text-green-400' },
    { id: 'reportes', label: 'Reportes', icon: FileText, color: 'text-indigo-600 dark:text-indigo-400' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardFinanciero />;
      case 'gastos':
        return <GastosMain />;
      case 'nomina':
        return <NominaMain />;
      case 'facturacion':
        return <FacturacionMain />;
      case 'ingresos':
        return <IngresosMain />;
      case 'reportes':
        return <ReportesMain />;
      default:
        return <DashboardFinanciero />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-3">
            <DollarSign className="text-green-600 dark:text-green-400" size={32} />
            <span>Sistema Financiero</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestión integral de finanzas, gastos, nómina, facturación y reportes
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? `border-current ${tab.color}`
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {renderContent()}
      </div>
    </div>
  );
}
