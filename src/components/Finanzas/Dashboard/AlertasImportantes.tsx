// src/components/Finanzas/Dashboard/AlertasImportantes.tsx
"use client"

import { AlertTriangle, Clock, CheckCircle, CreditCard, Users, DollarSign } from "lucide-react";

interface AlertasImportantesProps {
  membresiasPendientes: number;
  gastosPendientes: number;
  nominaPendiente: number;
  membresiasPorVencer: number;
  membresiasVencidas: number;
}

export function AlertasImportantes({ 
  membresiasPendientes, 
  gastosPendientes, 
  nominaPendiente, 
  membresiasPorVencer,
  membresiasVencidas 
}: AlertasImportantesProps) {
  
  const alertas = [
    {
      tipo: 'critica',
      icono: AlertTriangle,
      titulo: 'Membresías Vencidas',
      valor: membresiasVencidas,
      descripcion: 'requieren renovación inmediata',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    },
    {
      tipo: 'advertencia',
      icono: Clock,
      titulo: 'Por Vencer (7 días)',
      valor: membresiasPorVencer,
      descripcion: 'membresías próximas a vencer',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      tipo: 'info',
      icono: CreditCard,
      titulo: 'Gastos Pendientes',
      valor: gastosPendientes,
      descripcion: 'gastos por pagar',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    {
      tipo: 'info',
      icono: DollarSign,
      titulo: 'Nómina Pendiente',
      valor: nominaPendiente,
      descripcion: 'en pagos de nómina',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      esDinero: true
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const alertasCriticas = alertas.filter(a => (a.tipo === 'critica' && a.valor > 0));
  const alertasAdvertencia = alertas.filter(a => (a.tipo === 'advertencia' && a.valor > 0));
  const alertasInfo = alertas.filter(a => (a.tipo === 'info' && a.valor > 0));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <AlertTriangle className="mr-2 text-red-600 dark:text-red-400" size={20} />
        Alertas Importantes
      </h3>

      <div className="space-y-4">
        {/* Alertas críticas */}
        {alertasCriticas.map((alerta, index) => {
          const Icon = alerta.icono;
          return (
            <div key={`critica-${index}`} className={`p-4 rounded-lg border-l-4 ${alerta.bgColor} ${alerta.borderColor}`}>
              <div className="flex items-center space-x-3">
                <Icon className={alerta.color} size={20} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {alerta.titulo}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {alerta.esDinero ? formatCurrency(alerta.valor) : alerta.valor} {alerta.descripcion}
                  </p>
                </div>
                <span className={`font-bold text-lg ${alerta.color}`}>
                  {alerta.esDinero ? formatCurrency(alerta.valor) : alerta.valor}
                </span>
              </div>
            </div>
          );
        })}

        {/* Alertas de advertencia */}
        {alertasAdvertencia.map((alerta, index) => {
          const Icon = alerta.icono;
          return (
            <div key={`advertencia-${index}`} className={`p-3 rounded-lg ${alerta.bgColor} border ${alerta.borderColor}`}>
              <div className="flex items-center space-x-3">
                <Icon className={alerta.color} size={18} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {alerta.titulo}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {alerta.valor} {alerta.descripcion}
                  </p>
                </div>
                <span className={`font-semibold ${alerta.color}`}>
                  {alerta.valor}
                </span>
              </div>
            </div>
          );
        })}

        {/* Alertas informativas */}
        {alertasInfo.map((alerta, index) => {
          const Icon = alerta.icono;
          return (
            <div key={`info-${index}`} className={`p-3 rounded-lg ${alerta.bgColor} border ${alerta.borderColor}`}>
              <div className="flex items-center space-x-3">
                <Icon className={alerta.color} size={18} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {alerta.titulo}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {alerta.esDinero ? formatCurrency(alerta.valor) : alerta.valor} {alerta.descripcion}
                  </p>
                </div>
                <span className={`font-semibold ${alerta.color}`}>
                  {alerta.esDinero ? formatCurrency(alerta.valor) : alerta.valor}
                </span>
              </div>
            </div>
          );
        })}

        {/* Si no hay alertas */}
        {alertasCriticas.length === 0 && alertasAdvertencia.length === 0 && alertasInfo.length === 0 && (
          <div className="text-center py-6">
            <CheckCircle className="text-green-600 dark:text-green-400 mx-auto mb-2" size={32} />
            <p className="text-green-600 dark:text-green-400 font-medium">
              ¡Todo está al día!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No hay alertas importantes en este momento
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
