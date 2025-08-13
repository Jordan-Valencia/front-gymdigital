import React, { useEffect, useState } from "react";
import {
  Users,
  DollarSign,
  ShoppingCart,
  UserCheck,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { useGymData } from "../../hooks/useGymData";
import { DashboardStats } from "../../types";

export function Dashboard() {
  const { getDashboardStats, usuarios, eventos, membresias, planes } =
    useGymData();

  // Estado para las estadísticas del dashboard
  const [stats, setStats] = useState({
    miembrosActivos: 0,
    ingresosMes: 0,
    ventasHoy: 0,
    entrenadores: 0,
    eventosProximos: 0,
    inventarioBajo: 0,
  });

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    getDashboardStats().then((data:DashboardStats | null) => {
      if (data) setStats(data);
    });
  }, [getDashboardStats]);

  const proximosEventos = eventos
    .filter((e) => new Date(e.fecha_inicio) > new Date())
    .sort(
      (a, b) =>
        new Date(a.fecha_inicio).getTime() -
        new Date(b.fecha_inicio).getTime()
    )
    .slice(0, 5);

  const miembrosRecientes = usuarios
    .sort(
      (a, b) =>
        new Date(b.fecha_registro).getTime() -
        new Date(a.fecha_registro).getTime()
    )
    .slice(0, 5);

  const membresiasPorVencer = membresias
    .filter((m) => {
      const fechaVencimiento = new Date(m.fecha_fin);
      const hoy = new Date();
      const diffTime = fechaVencimiento.getTime() - hoy.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    })
    .map((m) => ({
      ...m,
      usuario: usuarios.find((u) => u.id === m.usuario_id),
      plan: planes.find((p) => p.id === m.plan_id),
    }))
    .slice(0, 3);

  return (
    <div className="bg-dot-pattern bg-fixed">
      <div className="bg-gradient-to-br from-indigo-50/90 via-white/80 to-sky-50/90 backdrop-blur-[2px]">
        <div className="space-y-6 p-4 animate-fadeIn ml-20">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-slideUp">
            <StatsCard
              title="Miembros Activos"
              value={stats.miembrosActivos}
              icon={Users}
              color="indigo"
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Ingresos del Mes"
              value={`$${stats.ingresosMes.toFixed(2)}`}
              icon={DollarSign}
              color="emerald"
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="Ventas Hoy"
              value={stats.ventasHoy}
              icon={ShoppingCart}
              color="amber"
            />
            <StatsCard
              title="Entrenadores"
              value={stats.entrenadores}
              icon={UserCheck}
              color="violet"
            />
            <StatsCard
              title="Eventos Próximos"
              value={stats.eventosProximos}
              icon={Calendar}
              color="sky"
            />
            <StatsCard
              title="Stock Bajo"
              value={stats.inventarioBajo}
              icon={AlertTriangle}
              color="rose"
            />
          </div>

          {/* Alertas importantes */}
          {membresiasPorVencer.length > 0 && (
            <div className="backdrop-blur-xl bg-gradient-to-r from-amber-50/90 to-orange-50/90 border-l-4 border-amber-400 rounded-xl p-6 shadow-lg animate-pulse-slow hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle
                  className="text-amber-600 group-hover:scale-110 transition-transform"
                  size={20}
                />
                <h3 className="font-semibold text-amber-800">
                  Membresías por vencer
                </h3>
              </div>
              <div className="space-y-2">
                {membresiasPorVencer.map((membresia) => {
                  const diasRestantes = Math.ceil(
                    (new Date(membresia.fecha_fin).getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={membresia.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-amber-800">
                        {membresia.usuario?.nombre} - {membresia.plan?.nombre}
                      </span>
                      <span className="text-amber-600 font-medium">
                        {diasRestantes === 0
                          ? "Vence hoy"
                          : `${diasRestantes} días`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sección de información adicional */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Próximos Eventos */}
            <div className="backdrop-blur-xl bg-white/80 rounded-xl p-5 shadow-lg border border-sky-100/50 hover:border-sky-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group animate-fadeIn">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar
                  className="text-sky-600 group-hover:rotate-12 transition-transform"
                  size={18}
                />
                <span>Próximos Eventos</span>
              </h3>
              <div className="space-y-2">
                {proximosEventos.length > 0 ? (
                  proximosEventos.map((evento) => (
                    <div
                      key={evento.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {evento.titulo}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(
                            evento.fecha_inicio
                          ).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          evento.color === "blue"
                            ? "bg-sky-100 text-sky-800"
                            : evento.color === "green"
                            ? "bg-emerald-100 text-emerald-800"
                            : evento.color === "orange"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {evento.tipo}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-3 text-sm">
                    No hay eventos próximos
                  </p>
                )}
              </div>
            </div>

            {/* Miembros Recientes */}
            <div className="backdrop-blur-xl bg-white/80 rounded-xl p-5 shadow-lg border border-emerald-100/50 hover:border-emerald-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group animate-fadeIn delay-100">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users
                  className="text-emerald-600 group-hover:scale-110 transition-transform"
                  size={18}
                />
                <span>Miembros Recientes</span>
              </h3>
              <div className="space-y-3">
                {miembrosRecientes.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="flex items-center justify-between p-3 bg-white/80 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {usuario.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {usuario.nombre}
                        </p>
                        <p className="text-xs text-gray-600">{usuario.email}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        usuario.activo
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen Financiero */}
            <div className="backdrop-blur-xl bg-white/80 rounded-xl p-5 shadow-lg border border-violet-100/50 hover:border-violet-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group animate-fadeIn delay-200">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign
                  className="text-violet-600 group-hover:rotate-12 transition-transform"
                  size={18}
                />
                <span>Resumen Financiero</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Ingresos por membresías
                  </span>
                  <span className="font-semibold text-emerald-600">
                    $
                    {membresias
                      .reduce((sum, m) => sum + m.precio_pagado, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Membresías activas
                  </span>
                  <span className="font-semibold text-indigo-600">
                    {
                      membresias.filter(
                        (m) => new Date(m.fecha_fin) > new Date()
                      ).length
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Promedio por membresía
                  </span>
                  <span className="font-semibold text-gray-900">
                    $
                    {membresias.length > 0
                      ? (
                          membresias.reduce(
                            (sum, m) => sum + m.precio_pagado,
                            0
                          ) / membresias.length
                        ).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div className="pt-4 border-t-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Total del mes
                    </span>
                    <span className="text-lg font-bold text-emerald-600">
                      ${stats.ingresosMes.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
