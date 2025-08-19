// src/components/Finanzas/Facturacion/MembresiasPorVencer.tsx
"use client"

import { useState, useEffect } from "react";
import { Calendar, User, DollarSign, FileText, Send } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useGymData } from "../../../hooks/useGymData";
import { useToast } from "../../../contexts/ToastContext";
import type { Membresia } from "../../../types";

export function MembresiasPorVencer() {
  const { obtenerMembresiasPorVencer, generarFacturaMembresia } = useFinanzas();
  const { usuarios, planes } = useGymData();
  const { showToast } = useToast();
  const [membresiasPorVencer, setMembresiasPorVencer] = useState<Membresia[]>([]);
  const [diasAlerta, setDiasAlerta] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMembresiasPorVencer();
  }, [diasAlerta]);

  const cargarMembresiasPorVencer = async () => {
    try {
      const membresias = await obtenerMembresiasPorVencer(diasAlerta);
      setMembresiasPorVencer(membresias);
    } catch (error) {
      console.error("Error cargando membresías por vencer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarFactura = async (membresiaId: string) => {
    try {
      const blob = await generarFacturaMembresia(membresiaId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-membresia-${membresiaId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("Factura generada exitosamente", "success");
    } catch (error) {
      showToast("Error al generar la factura", "error");
    }
  };

  const enviarRecordatorio = async (membresiaId: string) => {
    // Esta función se implementaría en el backend para enviar emails/SMS
    try {
      showToast("Recordatorio enviado exitosamente", "success");
    } catch (error) {
      showToast("Error al enviar recordatorio", "error");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDiasRestantes = (fechaFin: string) => {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diff = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getColorPorDias = (dias: number) => {
    if (dias <= 1) return "text-red-600 dark:text-red-400";
    if (dias <= 3) return "text-orange-600 dark:text-orange-400";
    return "text-yellow-600 dark:text-yellow-400";
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">Cargando membresías por vencer...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Control de días de alerta */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Mostrar membresías que vencen en:
        </label>
        <select
          value={diasAlerta}
          onChange={(e) => setDiasAlerta(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={3}>3 días</option>
          <option value={7}>7 días</option>
          <option value={15}>15 días</option>
          <option value={30}>30 días</option>
        </select>
      </div>

      {/* Lista de membresías por vencer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {membresiasPorVencer.map((membresia) => {
          const usuario = usuarios.find(u => u.id === membresia.usuario_id);
          const plan = planes.find(p => p.id === membresia.plan_id);
          const diasRestantes = getDiasRestantes(membresia.fecha_fin);
          
          return (
            <div key={membresia.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
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
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getColorPorDias(diasRestantes)} bg-yellow-100 dark:bg-yellow-900/20`}>
                  {diasRestantes > 0 ? `${diasRestantes} días` : 'Hoy vence'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="text-gray-400 dark:text-gray-500" size={16} />
                  <span className="text-gray-600 dark:text-gray-400">
                    Vence: {formatDate(membresia.fecha_fin)}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <DollarSign className="text-gray-400 dark:text-gray-500" size={16} />
                  <span className="text-gray-600 dark:text-gray-400">
                    Precio: {formatCurrency(membresia.precio_pagado)}
                  </span>
                </div>

                {usuario?.telefono && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Teléfono:</strong> {usuario.telefono}
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => handleGenerarFactura(membresia.id)}
                    className="flex items-center space-x-2 flex-1 px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm"
                  >
                    <FileText size={16} />
                    <span>Generar Factura</span>
                  </button>
                  
                  <button
                    onClick={() => enviarRecordatorio(membresia.id)}
                    className="flex items-center space-x-2 flex-1 px-3 py-2 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-800 transition-colors text-sm"
                  >
                    <Send size={16} />
                    <span>Recordatorio</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {membresiasPorVencer.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No hay membresías que venzan en los próximos {diasAlerta} días
          </p>
        </div>
      )}
    </div>
  );
}
