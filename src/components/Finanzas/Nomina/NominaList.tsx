// src/components/Finanzas/Nomina/NominaList.tsx
"use client"

import { useState } from "react";
import { Search, Calendar, DollarSign, Edit2, Trash2, User, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useGymData } from "../../../hooks/useGymData";
import { useToast } from "../../../contexts/ToastContext";
import type { Nomina, EstadoPago } from "../../../types";

interface NominaListProps {
  onEditNomina: (nomina: Nomina) => void;
}

export function NominaList({ onEditNomina }: NominaListProps) {
  const { nominas, eliminarNomina } = useFinanzas();
  const { entrenadores } = useGymData();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoPago | 'TODOS'>('TODOS');
  const [filtroAño, setFiltroAño] = useState<string>('todos');

  const handleDelete = async (nomina: Nomina) => {
    const entrenador = entrenadores.find(e => e.id === nomina.entrenador_id);
    if (window.confirm(`¿Estás seguro de eliminar la nómina de ${entrenador?.nombre || 'este entrenador'}?`)) {
      try {
        await eliminarNomina(nomina.id);
        showToast("Nómina eliminada exitosamente", "success");
      } catch (error) {
        showToast("Error al eliminar la nómina", "error");
      }
    }
  };

  const nominasFiltradas = nominas.filter(nomina => {
    const entrenador = entrenadores.find(e => e.id === nomina.entrenador_id);
    const matchSearch = entrenador?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       nomina.notas?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filtroEstado === 'TODOS' || nomina.estado === filtroEstado;
    const matchAño = filtroAño === 'todos' || nomina.año.toString() === filtroAño;
    
    return matchSearch && matchEstado && matchAño;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getEstadoColor = (estado: EstadoPago) => {
    switch (estado) {
      case 'PAGADO':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'VENCIDO':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'PARCIAL':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getEstadoIcon = (estado: EstadoPago) => {
    switch (estado) {
      case 'PAGADO':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'PENDIENTE':
        return <Clock size={16} className="text-yellow-600" />;
      case 'VENCIDO':
        return <AlertTriangle size={16} className="text-red-600" />;
      case 'PARCIAL':
        return <Clock size={16} className="text-blue-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const años = [...new Set(nominas.map(n => n.año))].sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar por entrenador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as EstadoPago | 'TODOS')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="PAGADO">Pagado</option>
          <option value="VENCIDO">Vencido</option>
          <option value="PARCIAL">Parcial</option>
        </select>

        <select
          value={filtroAño}
          onChange={(e) => setFiltroAño(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="todos">Todos los años</option>
          {años.map(año => (
            <option key={año} value={año.toString()}>
              {año}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de nóminas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nominasFiltradas.map((nomina) => {
          const entrenador = entrenadores.find(e => e.id === nomina.entrenador_id);
          const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ];
          
          return (
            <div key={nomina.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="text-gray-400 dark:text-gray-500" size={16} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {entrenador?.nombre || 'Entrenador eliminado'}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {meses[nomina.mes - 1]} {nomina.año}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEditNomina(nomina)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(nomina)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="text-gray-400 dark:text-gray-500" size={16} />
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(nomina.total_pagar)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getEstadoIcon(nomina.estado)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(nomina.estado)}`}>
                      {nomina.estado}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Salario base:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(nomina.salario_base)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Bonificaciones:</span>
                    <p className="font-medium text-green-600">
                      +{formatCurrency(nomina.bonificaciones)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Deducciones:</span>
                    <p className="font-medium text-red-600">
                      -{formatCurrency(nomina.deducciones)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Fecha pago:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {nomina.fecha_pago ? new Date(nomina.fecha_pago).toLocaleDateString('es-ES') : 'Pendiente'}
                    </p>
                  </div>
                </div>

                {nomina.notas && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                    {nomina.notas}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {nominasFiltradas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? "No se encontraron nóminas con esos criterios" : "No hay nóminas registradas"}
          </p>
        </div>
      )}
    </div>
  );
}
