// src/components/Finanzas/Facturacion/PagoMembresiaForm.tsx
"use client"

import { useState } from "react";
import { X, Save, DollarSign } from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useGymData } from "../../../hooks/useGymData";
import { useToast } from "../../../contexts/ToastContext";
import type { Membresia, EstadoPago } from "../../../types";

interface PagoMembresiaFormProps {
    membresia: Membresia;
    onClose: () => void;
    onPagoCompletado: () => void;
}

export function PagoMembresiaForm({ membresia, onClose, onPagoCompletado }: PagoMembresiaFormProps) {
    const { agregarPagoMembresia, actualizarMembresia } = useFinanzas();
    const { usuarios, planes } = useGymData();
    const { showToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const usuario = usuarios.find(u => u.id === membresia.usuario_id);
    const plan = planes.find(p => p.id === membresia.plan_id);

    const getDiasVencido = (fechaFin: string) => {
        const hoy = new Date();
        const fin = new Date(fechaFin);
        return Math.ceil((hoy.getTime() - fin.getTime()) / (1000 * 60 * 60 * 24));
    };

    const diasVencido = getDiasVencido(membresia.fecha_fin);

    const [formData, setFormData] = useState({
        monto: membresia.precio_pagado,
        fecha_pago: new Date().toISOString().slice(0,10),
        fecha_vencimiento: "",
        metodo_pago: "efectivo",
        estado: "PAGADO" as "PAGADO" | "PENDIENTE" | "VENCIDO",
        notas: diasVencido > 0 ? `Renovación con ${diasVencido} días de retraso` : "Renovación"
      });

    // Calcular nueva fecha de vencimiento (1 mes desde el pago)
    const calcularNuevaFechaVencimiento = (fechaPago: string) => {
        const fecha = new Date(fechaPago);
        fecha.setMonth(fecha.getMonth() + 1);
        return fecha.toISOString().split('T')[0];
    };

    // Establecer fecha de vencimiento inicial
    useState(() => {
        setFormData(prev => ({
            ...prev,
            fecha_vencimiento: calcularNuevaFechaVencimiento(prev.fecha_pago)
        }));
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
            };

            // Recalcular fecha de vencimiento si cambia la fecha de pago
            if (name === 'fecha_pago') {
                newData.fecha_vencimiento = calcularNuevaFechaVencimiento(value);
            }

            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Registrar el pago
            await agregarPagoMembresia({
                membresia_id: membresia.id,
                monto: formData.monto,
                fecha_pago: formData.fecha_pago,
                fecha_vencimiento: formData.fecha_vencimiento,
                metodo_pago: formData.metodo_pago,
                estado: formData.estado,
                descuento: 0,
                recargo: 0,
                notas: formData.notas
            });

            // Actualizar la membresía con nueva fecha de vencimiento
            await actualizarMembresia(membresia.id, {
                fecha_fin: formData.fecha_vencimiento,
                fecha_pago: formData.fecha_pago
            });

            showToast("Pago registrado exitosamente", "success");
            onPagoCompletado();
        } catch (error) {
            showToast("Error al registrar el pago", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-ES");
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Registrar Pago de Membresía
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Información del miembro */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                        👤 Información del Miembro
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="text-gray-800 dark:text-gray-200">
                            <strong>Nombre:</strong> {usuario?.nombre || 'Usuario eliminado'}
                        </div>
                        <div className="text-gray-800 dark:text-gray-200">
                            <strong>Plan:</strong> {plan?.nombre || 'Plan eliminado'}
                        </div>
                        <div className="text-gray-800 dark:text-gray-200">
                            <strong>Precio del plan:</strong> {formatCurrency(membresia.precio_pagado)}
                        </div>
                        <div className="text-gray-800 dark:text-gray-200">
                            <strong>Fecha de vencimiento anterior:</strong> {formatDate(membresia.fecha_fin)}
                        </div>
                        {diasVencido > 0 && (
                            <div className="md:col-span-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                    ⚠️ Vencida hace {diasVencido} día{diasVencido !== 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Detalles del pago */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fecha de Pago *
                            </label>
                            <input
                                type="date"
                                name="fecha_pago"
                                value={formData.fecha_pago}
                                onChange={handleChange}
                                required
                                disabled={isSaving}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nueva Fecha de Vencimiento *
                            </label>
                            <input
                                type="date"
                                name="fecha_vencimiento"
                                value={formData.fecha_vencimiento}
                                onChange={handleChange}
                                required
                                disabled={isSaving}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Se actualiza automáticamente (+1 mes desde la fecha de pago)
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Método de Pago *
                            </label>
                            <select
                                name="metodo_pago"
                                value={formData.metodo_pago}
                                onChange={handleChange}
                                required
                                disabled={isSaving}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="efectivo">Efectivo</option>
                                <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                                <option value="transferencia">Transferencia Bancaria</option>
                                <option value="deposito">Depósito Bancario</option>
                                <option value="cheque">Cheque</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Estado del Pago *
                            </label>
                            <select
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                disabled={isSaving}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="PAGADO">Pagado</option>
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="VENCIDO">Vencido</option>
                            </select>
                        </div>
                    </div>

                    {/* Monto del pago */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center text-green-800 dark:text-green-200">
                            <DollarSign size={18} className="mr-2" />
                            Monto del Pago
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Monto a Cobrar *
                                </label>
                                <input
                                    type="number"
                                    name="monto"
                                    value={formData.monto}
                                    onChange={handleChange}
                                    min="0"
                                    step="1"
                                    required
                                    disabled={isSaving}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold"
                                    placeholder="0"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Puede ajustar el monto según sea necesario
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total a pagar:</p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                    {formatCurrency(formData.monto)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Notas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notas del Pago
                        </label>
                        <textarea
                            name="notas"
                            value={formData.notas}
                            onChange={handleChange}
                            rows={3}
                            disabled={isSaving}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Observaciones adicionales sobre el pago..."
                        />
                    </div>

                    {/* Botones */}
                    <div className="pt-4 flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || formData.monto <= 0}
                            className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors flex items-center justify-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Registrar Pago</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
