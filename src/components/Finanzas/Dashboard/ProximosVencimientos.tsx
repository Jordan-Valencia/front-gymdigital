// src/components/Finanzas/Dashboard/ProximosVencimientos.tsx
"use client"

import { Calendar, User, AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface ProximosVencimientosProps {
  membresiasPorVencer: any[];
  membresiasVencidas: any[];
}

export function ProximosVencimientos({ 
  membresiasPorVencer, 
  membresiasVencidas 
}: ProximosVencimientosProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: 'numeric',
      month: 'short'
    });
  };

  const getDiasRestantes = (fechaFin: string) => {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diff = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDiasVencido = (fechaFin: string) => {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diff = Math.ceil((hoy.getTime() - fin.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Combinar y ordenar por urgencia
  const todasLasMembresias = [
    ...membresiasVencidas.map(m => ({ ...m, tipo: 'vencida' })),
    ...membresiasPorVencer.map(m => ({ ...m, tipo: 'por-vencer' }))
  ].slice(0, 8); // Mostrar solo los primeros 8

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <Calendar className="mr-2 text-orange-600 dark:text-orange-400" size={20} />
        Próximos Vencimientos
      </h3>

      <div className="space-y-3">
        {todasLasMembresias.length > 0 ? (
          todasLasMembresias.map((membresia, index) => {
            const esVencida = membresia.tipo === 'vencida';
            console.log(membresia);
            const diasRestantes = esVencida 
              ? getDiasVencido(membresia.fecha_fin)
              : getDiasRestantes(membresia.fecha_fin);

            return (
              <div 
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  esVencida 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500' 
                    : diasRestantes <= 1
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1 rounded-full ${
                      esVencida 
                        ? 'bg-red-100 dark:bg-red-900/30' 
                        : 'bg-orange-100 dark:bg-orange-900/30'
                    }`}>
                      {esVencida ? (
                        <AlertTriangle className="text-red-600 dark:text-red-400" size={16} />
                      ) : (
                        <Clock className="text-orange-600 dark:text-orange-400" size={16} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {membresia.Usuario?.nombre }
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {membresia.Plan?.nombre}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      esVencida 
                        ? 'text-red-600 dark:text-red-400' 
                        : diasRestantes <= 1
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {esVencida 
                        ? `${diasRestantes}d vencido` 
                        : diasRestantes === 0 
                        ? 'Hoy' 
                        : `${diasRestantes}d restantes`
                      }
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(membresia.fecha_fin)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="text-green-600 dark:text-green-400 mx-auto mb-2" size={32} />
            <p className="text-green-600 dark:text-green-400 font-medium">
              ¡Todo está al día!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No hay membresías próximas a vencer
            </p>
          </div>
        )}
      </div>

      {/* Resumen */}
      {(membresiasPorVencer.length > 0 || membresiasVencidas.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {membresiasPorVencer.length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Por vencer</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {membresiasVencidas.length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Vencidas</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
