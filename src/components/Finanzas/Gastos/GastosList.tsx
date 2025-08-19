// src/components/Finanzas/Gastos/GastosList.tsx
"use client"

import { useState } from "react";
import { Search, Calendar, DollarSign, Edit2, Trash2, FileText, AlertTriangle } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useToast } from "../../../contexts/ToastContext";
import type { GastoDetallado, EstadoGasto } from "../../../types";

interface GastosListProps {
  onEditGasto: (gasto: GastoDetallado) => void;
}

export function GastosList({ onEditGasto }: GastosListProps) {
  const { gastosDetallados, categoriasGastos, eliminarGastoDetallado } = useFinanzas();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoGasto | 'TODOS'>('TODOS');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');

  const handleDelete = async (gasto: GastoDetallado) => {
    if (window.confirm(`¿Estás seguro de eliminar el gasto "${gasto.concepto}"?`)) {
      try {
        await eliminarGastoDetallado(gasto.id);
        showToast("Gasto eliminado exitosamente", "success");
      } catch (error) {
        showToast("Error al eliminar el gasto", "error");
      }
    }
  };

  const gastosFiltrados = gastosDetallados.filter(gasto => {
    const categoria = categoriasGastos.find(c => c.id === gasto.categoria_id);
    const matchSearch = gasto.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       gasto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       categoria?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filtroEstado === 'TODOS' || gasto.estado === filtroEstado;
    const matchCategoria = filtroCategoria === 'todos' || gasto.categoria_id === filtroCategoria;
    
    return matchSearch && matchEstado && matchCategoria;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const getEstadoColor = (estado: EstadoGasto) => {
    switch (estado) {
      case 'PAGADO':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'VENCIDO':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'CANCELADO':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar gastos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as EstadoGasto | 'TODOS')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="PAGADO">Pagado</option>
          <option value="VENCIDO">Vencido</option>
          <option value="CANCELADO">Cancelado</option>
        </select>

        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="todos">Todas las categorías</option>
          {categoriasGastos.map(categoria => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de gastos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gastosFiltrados.map((gasto) => {
          const categoria = categoriasGastos.find(c => c.id === gasto.categoria_id);
          return (
            <div key={gasto.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {gasto.concepto}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {categoria?.nombre}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEditGasto(gasto)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(gasto)}
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
                      {formatCurrency(gasto.monto)}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(gasto.estado)}`}>
                    {gasto.estado}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="text-gray-400 dark:text-gray-500" size={16} />
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatDate(gasto.fecha)}
                  </span>
                </div>

                {gasto.proveedor && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Proveedor:</strong> {gasto.proveedor}
                  </div>
                )}

                {gasto.descripcion && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {gasto.descripcion}
                  </p>
                )}

                {gasto.comprobante_url && (
                  <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                    <FileText size={16} />
                    <span>Comprobante adjunto</span>
                  </div>
                )}

                {gasto.estado === 'VENCIDO' && (
                  <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                    <AlertTriangle size={16} />
                    <span>Pago vencido</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {gastosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? "No se encontraron gastos con esos criterios" : "No hay gastos registrados"}
          </p>
        </div>
      )}
    </div>
  );
}
