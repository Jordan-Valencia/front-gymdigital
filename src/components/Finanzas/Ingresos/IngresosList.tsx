// src/components/Finanzas/Ingresos/IngresosList.tsx
"use client"

import { useState } from "react";
import { Search, Calendar, DollarSign, Edit2, Trash2, Tag, CreditCard } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useToast } from "../../../contexts/ToastContext";
import type { IngresoAdicional } from "../../../types";

interface IngresosListProps {
  onEditIngreso: (ingreso: IngresoAdicional) => void;
}

export function IngresosList({ onEditIngreso }: IngresosListProps) {
  const { ingresosAdicionales, eliminarIngresoAdicional } = useFinanzas();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroMes, setFiltroMes] = useState<string>('todos');

  const handleDelete = async (ingreso: IngresoAdicional) => {
    if (window.confirm(`¿Estás seguro de eliminar el ingreso "${ingreso.concepto}"?`)) {
      try {
        await eliminarIngresoAdicional(ingreso.id);
        showToast("Ingreso eliminado exitosamente", "success");
      } catch (error) {
        showToast("Error al eliminar el ingreso", "error");
      }
    }
  };

  const ingresosFiltrados = ingresosAdicionales.filter(ingreso => {
    const matchSearch = ingreso.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ingreso.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ingreso.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchCategoria = filtroCategoria === 'todas' || ingreso.categoria === filtroCategoria;
    
    let matchMes = true;
    if (filtroMes !== 'todos') {
      const fechaIngreso = new Date(ingreso.fecha);
      const mesAño = `${fechaIngreso.getFullYear()}-${(fechaIngreso.getMonth() + 1).toString().padStart(2, '0')}`;
      matchMes = mesAño === filtroMes;
    }
    
    return matchSearch && matchCategoria && matchMes;
  });

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoriaColor = (categoria: string) => {
    const colors = {
      'entrenamiento-personal': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'eventos': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'nutricion': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'clases-especiales': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'servicios-extra': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      'patrocinios': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'otros': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return colors[categoria as keyof typeof colors] || colors.otros;
  };

  // Obtener categorías únicas
  const categorias = [...new Set(ingresosAdicionales.map(i => i.categoria))];

  // Generar opciones de meses
  const generarMeses = () => {
    const meses = [];
    const fechaActual = new Date();
    for (let i = 0; i < 12; i++) {
      const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1);
      const valor = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
      const etiqueta = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
      meses.push({ valor, etiqueta });
    }
    return meses;
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar ingresos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map(categoria => (
            <option key={categoria} value={categoria}>
              {categoria.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}
            </option>
          ))}
        </select>

        <select
          value={filtroMes}
          onChange={(e) => setFiltroMes(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="todos">Todos los meses</option>
          {generarMeses().map(mes => (
            <option key={mes.valor} value={mes.valor}>
              {mes.etiqueta}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de ingresos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ingresosFiltrados.map((ingreso) => (
          <div key={ingreso.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {ingreso.concepto}
                </h3>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getCategoriaColor(ingreso.categoria)}`}>
                  {ingreso.categoria.replace('-', ' ')}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEditIngreso(ingreso)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(ingreso)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="text-green-600 dark:text-green-400" size={18} />
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(ingreso.monto)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CreditCard size={14} />
                  <span>{ingreso.metodo_pago}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="text-gray-400 dark:text-gray-500" size={16} />
                <span className="text-gray-600 dark:text-gray-400">
                  {formatDate(ingreso.fecha)}
                </span>
              </div>

              {ingreso.descripcion && (
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                  {ingreso.descripcion}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {ingresosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filtroCategoria !== 'todas' || filtroMes !== 'todos' 
              ? "No se encontraron ingresos con esos criterios" 
              : "No hay ingresos adicionales registrados"}
          </p>
        </div>
      )}
    </div>
  );
}
