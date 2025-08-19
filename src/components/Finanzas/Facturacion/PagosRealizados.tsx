// src/components/Finanzas/Facturacion/PagosRealizados.tsx
"use client"

import { useState, useEffect } from "react";
import { Search, Calendar, DollarSign, User, FileText, Filter } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useGymData } from "../../../hooks/useGymData";
import type { PagoMembresia, EstadoPago } from "../../../types";

export function PagosRealizados() {
  const { pagosMembresiasPendientes } = useFinanzas();
  const { usuarios, planes, membresias } = useGymData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoPago | 'TODOS'>('TODOS');
  const [filtroMes, setFiltroMes] = useState<string>('todos');

  const pagosFiltrados = pagosMembresiasPendientes.filter(pago => {
    const membresia = membresias.find(m => m.id === pago.membresia_id);
    const usuario = usuarios.find(u => u.id === membresia?.usuario_id);
    const plan = planes.find(p => p.id === membresia?.plan_id);
    
    const matchSearch = usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       plan?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       pago.metodo_pago.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchEstado = filtroEstado === 'TODOS' || pago.estado === filtroEstado.toLowerCase();
    
    let matchMes = true;
    if (filtroMes !== 'todos') {
      const fechaPago = new Date(pago.fecha_pago);
      const mesAño = `${fechaPago.getFullYear()}-${(fechaPago.getMonth() + 1).toString().padStart(2, '0')}`;
      matchMes = mesAño === filtroMes;
    }
    
    return matchSearch && matchEstado && matchMes;
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

  // Generar opciones de meses de los últimos 12 meses
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

  const totalPagado = pagosFiltrados.reduce((sum: number, pago: PagoMembresia) => sum + pago.monto, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar pagos..."
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
          <option value="PAGADO">Pagado</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="PARCIAL">Parcial</option>
          <option value="VENCIDO">Vencido</option>
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

        <div className="flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Total: {formatCurrency(totalPagado)}
          </span>
        </div>
      </div>

      {/* Lista de pagos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pagosFiltrados.map((pago: PagoMembresia) => {
          const membresia = membresias.find(m => m.id === pago.membresia_id);
          const usuario = usuarios.find(u => u.id === membresia?.usuario_id);
          const plan = planes.find(p => p.id === membresia?.plan_id);
          
          return (
            <div key={pago.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="text-gray-400 dark:text-gray-500" size={16} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {usuario?.nombre || 'Usuario eliminado'}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {plan?.nombre || 'Plan eliminado'}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(pago.estado as EstadoPago)}`}>
                  {pago.estado}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="text-gray-400 dark:text-gray-500" size={16} />
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(pago.monto)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {pago.metodo_pago}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="text-gray-400 dark:text-gray-500" size={16} />
                  <span className="text-gray-600 dark:text-gray-400">
                    Pagado: {formatDate(pago.fecha_pago)}
                  </span>
                </div>

                {pago.fecha_vencimiento && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Vencimiento:</strong> {formatDate(pago.fecha_vencimiento)}
                  </div>
                )}

                {(pago.descuento || pago.recargo) && (
                  <div className="text-sm space-y-1">
                    {pago.descuento && pago.descuento > 0 && (
                      <div className="text-green-600 dark:text-green-400">
                        Descuento aplicado: {formatCurrency(pago.descuento)}
                      </div>
                    )}
                    {pago.recargo && pago.recargo > 0 && (
                      <div className="text-red-600 dark:text-red-400">
                        Recargo por mora: {formatCurrency(pago.recargo)}
                      </div>
                    )}
                  </div>
                )}

                {pago.notas && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                    {pago.notas}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {pagosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filtroEstado !== 'TODOS' || filtroMes !== 'todos' 
              ? "No se encontraron pagos con esos criterios" 
              : "No hay pagos registrados"}
          </p>
        </div>
      )}
    </div>
  );
}
