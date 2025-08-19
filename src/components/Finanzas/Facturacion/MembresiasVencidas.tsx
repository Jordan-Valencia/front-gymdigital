// src/components/Finanzas/Facturacion/MembresiasVencidas.tsx
"use client"

import { useState, useEffect } from "react";
import { Calendar, User, DollarSign, FileText, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useGymData } from "../../../hooks/useGymData";
import { useToast } from "../../../contexts/ToastContext";
import { PagoMembresiaForm } from "./PagoMembresiaForm";
import type { Membresia } from "../../../types";

export function MembresiasVencidas() {
  const { obtenerMembresiasVencidas, generarFacturaMembresia } = useFinanzas();
  const { usuarios, planes } = useGymData();
  const { showToast } = useToast();
  const [membresiasVencidas, setMembresiasVencidas] = useState<Membresia[]>([]);
  const [showPagoForm, setShowPagoForm] = useState(false);
  const [membresiaSeleccionada, setMembresiaSeleccionada] = useState<Membresia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMembresiasVencidas();
  }, []);

  const cargarMembresiasVencidas = async () => {
    try {
      const membresias = await obtenerMembresiasVencidas();
      setMembresiasVencidas(membresias);
    } catch (error) {
      console.error("Error cargando membresías vencidas:", error);
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
      a.download = `factura-vencida-${membresiaId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("Factura generada exitosamente", "success");
    } catch (error) {
      showToast("Error al generar la factura", "error");
    }
  };

  const handleRegistrarPago = (membresia: Membresia) => {
    setMembresiaSeleccionada(membresia);
    setShowPagoForm(true);
  };

  const handlePagoCompletado = () => {
    cargarMembresiasVencidas();
    setShowPagoForm(false);
    setMembresiaSeleccionada(null);
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

  const getDiasVencido = (fechaFin: string) => {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diff = Math.ceil((hoy.getTime() - fin.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getColorPorDiasVencido = (dias: number) => {
    if (dias > 30) return "text-white bg-red-600 dark:bg-red-500";
    if (dias > 7) return "text-white bg-red-500 dark:bg-red-400";
    return "text-white bg-orange-500 dark:bg-orange-400";
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <p className="mt-2 text-gray-700 dark:text-gray-200">Cargando membresías vencidas...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Alerta general */}
      {membresiasVencidas.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-600 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
            <span className="text-red-800 dark:text-red-100 font-semibold text-lg">
              {membresiasVencidas.length} membresías vencidas requieren atención inmediata
            </span>
          </div>
        </div>
      )}

      {/* Lista de membresías vencidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {membresiasVencidas.map((membresia) => {
          const usuario = usuarios.find(u => u.id === membresia.usuario_id);
          const plan = planes.find(p => p.id === membresia.plan_id);
          const diasVencido = getDiasVencido(membresia.fecha_fin);
          const colorClass = getColorPorDiasVencido(diasVencido);
          
          return (
            <div key={membresia.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-red-500 shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <User className="text-red-600 dark:text-red-400" size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {usuario?.nombre || 'Usuario eliminado'}
                      </h3>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Plan: {plan?.nombre || 'Plan eliminado'}
                      </p>
                    </div>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${colorClass} shadow-md`}>
                  {diasVencido} día{diasVencido !== 1 ? 's' : ''} vencido{diasVencido !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-base">
                  <Calendar className="text-red-500 dark:text-red-400" size={20} />
                  <span className="text-gray-800 dark:text-gray-100 font-medium">
                    Venció el {formatDate(membresia.fecha_fin)}
                  </span>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-4 rounded-xl border border-blue-200 dark:border-blue-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="text-blue-600 dark:text-blue-400" size={20} />
                      <span className="text-blue-800 dark:text-blue-100 font-semibold">Precio de renovación:</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {formatCurrency(membresia.precio_pagado)}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-200 mt-2 font-medium">
                    💡 El monto puede ser ajustado al registrar el pago
                  </p>
                </div>

                {usuario && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-gray-200 dark:border-gray-500">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                      📞 Información de contacto:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="text-gray-800 dark:text-gray-100">
                        <strong>Email:</strong> <span className="text-blue-600 dark:text-blue-300">{usuario.email}</span>
                      </div>
                      {usuario.telefono && (
                        <div className="text-gray-800 dark:text-gray-100">
                          <strong>Teléfono:</strong> <span className="text-green-600 dark:text-green-300">{usuario.telefono}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleRegistrarPago(membresia)}
                    className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-700 dark:to-green-800 dark:hover:from-green-800 dark:hover:to-green-900 text-white rounded-lg transition-all duration-200 text-sm font-bold shadow-lg"
                  >
                    <CreditCard size={18} />
                    <span>Registrar Pago</span>
                  </button>
                  
                  <button
                    onClick={() => handleGenerarFactura(membresia.id)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 text-white rounded-lg transition-all duration-200 text-sm font-bold shadow-lg"
                  >
                    <FileText size={18} />
                    <span>Factura</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {membresiasVencidas.length === 0 && (
        <div className="text-center py-16">
          <div className="text-green-600 dark:text-green-400 mb-6">
            <CheckCircle size={80} className="mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            🎉 ¡Excelente trabajo!
          </h3>
          <p className="text-lg text-gray-700 dark:text-gray-200">
            No hay membresías vencidas en este momento
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Todas las membresías están al día 👍
          </p>
        </div>
      )}

      {/* Modal de registro de pago */}
      {showPagoForm && membresiaSeleccionada && (
        <PagoMembresiaForm
          membresia={membresiaSeleccionada}
          onClose={() => setShowPagoForm(false)}
          onPagoCompletado={handlePagoCompletado}
        />
      )}
    </div>
  );
}
