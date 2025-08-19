import { useEffect, useState } from "react";
import {
  Users,
  DollarSign,
  ShoppingCart,
  UserCheck,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Gift,
  Cake,
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { useGymData } from "../../hooks/useGymData";
import { useFinanzas } from "../../hooks/useFinanzas";
import { DashboardStats } from "../../types";

export function Dashboard() {
  const { getDashboardStats, usuarios, eventos, membresias, planes } = useGymData();
  const { 
    obtenerEstadisticasDashboard, 
    obtenerMembresiasVencidas, 
    obtenerGastosPendientes,
    obtenerNominasPendientes 
  } = useFinanzas();

  // Estado para las estadísticas del dashboard
  const [stats, setStats] = useState({
    miembrosActivos: 0,
    ingresosMes: 0,
    ventasHoy: 0,
    entrenadores: 0,
    eventosProximos: 0,
    inventarioBajo: 0,
  });

  // Estado para estadísticas financieras
  const [statsFinancieras, setStatsFinancieras] = useState({
    ingresosMes: 0,
    gastosMes: 0,
    utilidadMes: 0,
    membresiasVencidas: 0,
    gastosPendientes: 0,
    nominaPendiente: 0,
    crecimientoMensual: 0
  });

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    getDashboardStats().then((data: DashboardStats | null) => {
      if (data) setStats(data);
    });

    // Cargar estadísticas financieras
    cargarEstadisticasFinancieras();
  }, []);

  const cargarEstadisticasFinancieras = async () => {
    try {
      const [dashboardStats, vencidas, gastosPend, nominaPend] = await Promise.all([
        obtenerEstadisticasDashboard(),
        obtenerMembresiasVencidas(),
        obtenerGastosPendientes(),
        obtenerNominasPendientes()
      ]);

      if (dashboardStats) {
        setStatsFinancieras({
          ingresosMes: dashboardStats.mesActual?.ingresos?.total || 0,
          gastosMes: dashboardStats.mesActual?.gastos?.total || 0,
          utilidadMes: dashboardStats.mesActual?.utilidadNeta || 0,
          membresiasVencidas: vencidas?.length || 0,
          gastosPendientes: gastosPend?.length || 0,
          nominaPendiente: nominaPend?.reduce((sum: number, n: any) => sum + n.total_pagar, 0) || 0,
          crecimientoMensual: dashboardStats.crecimiento?.ingresos || 0
        });
      }
    } catch (error) {
      console.error("Error cargando estadísticas financieras:", error);
    }
  };

  // Funciones para manejar cumpleaños
  const esCumpleanosHoy = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    return (
      hoy.getDate() === nacimiento.getDate() &&
      hoy.getMonth() === nacimiento.getMonth()
    );
  };

  const diasHastaCumpleanos = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    
    // Establecer el cumpleaños de este año
    const cumpleanosEsteAno = new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate());
    
    // Si ya pasó este año, calcular para el próximo año
    if (cumpleanosEsteAno < hoy) {
      cumpleanosEsteAno.setFullYear(hoy.getFullYear() + 1);
    }
    
    const diffTime = cumpleanosEsteAno.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  };

  // Filtrar usuarios con cumpleaños
  const usuariosConFechaNacimiento = usuarios.filter(u => u.fecha_nacimiento && u.activo);
  
  const cumpleanosHoy = usuariosConFechaNacimiento.filter(u => 
    esCumpleanosHoy(u.fecha_nacimiento!)
  );

  const cumpleanosProximos = usuariosConFechaNacimiento
    .filter(u => {
      const dias = diasHastaCumpleanos(u.fecha_nacimiento!);
      return dias > 0 && dias <= 7;
    })
    .sort((a, b) => diasHastaCumpleanos(a.fecha_nacimiento!) - diasHastaCumpleanos(b.fecha_nacimiento!))
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
      <div className="bg-gradient-to-br from-indigo-50/90 via-white/80 to-sky-50/90 dark:from-gray-900/90 dark:via-gray-800/80 dark:to-gray-900/90 backdrop-blur-[2px]">
        <div className="space-y-6 p-4 animate-fadeIn ml-20">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-slideUp">
            <StatsCard
              title="Miembros Activos"
              value={stats.miembrosActivos}
              icon={Users}
              color="violet"
            />
            <StatsCard
              title="Ingresos del Mes"
              value={formatCurrency(statsFinancieras.ingresosMes)}
              icon={DollarSign}
              color="emerald"
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

          {/* Resumen Financiero Rápido */}
          <div className="backdrop-blur-xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-900/50 dark:to-indigo-900/50 border border-blue-200/50 dark:border-blue-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
                Resumen Financiero del Mes
              </h3>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                statsFinancieras.crecimientoMensual >= 0 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {statsFinancieras.crecimientoMensual >= 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                {statsFinancieras.crecimientoMensual >= 0 ? '+' : ''}{statsFinancieras.crecimientoMensual.toFixed(1)}%
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">Ingresos</p>
                    <p className="text-xl font-bold text-green-800 dark:text-green-200">
                      {formatCurrency(statsFinancieras.ingresosMes)}
                    </p>
                  </div>
                  <DollarSign className="text-green-600 dark:text-green-400" size={24} />
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-red-200/50 dark:border-red-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">Gastos</p>
                    <p className="text-xl font-bold text-red-800 dark:text-red-200">
                      {formatCurrency(statsFinancieras.gastosMes)}
                    </p>
                  </div>
                  <Receipt className="text-red-600 dark:text-red-400" size={24} />
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Utilidad</p>
                    <p className={`text-xl font-bold ${
                      statsFinancieras.utilidadMes >= 0 
                        ? 'text-blue-800 dark:text-blue-200' 
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {formatCurrency(statsFinancieras.utilidadMes)}
                    </p>
                  </div>
                  {statsFinancieras.utilidadMes >= 0 ? (
                    <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
                  ) : (
                    <TrendingDown className="text-red-600 dark:text-red-400" size={24} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cumpleaños del día */}
          {cumpleanosHoy.length > 0 && (
            <div className="backdrop-blur-xl bg-gradient-to-r from-pink-50/90 to-purple-50/90 dark:from-pink-900/50 dark:to-purple-900/50 border-l-4 border-pink-400 dark:border-pink-600 rounded-xl p-6 shadow-lg animate-bounce-slow hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <Cake className="text-pink-600 dark:text-pink-400 animate-pulse" size={24} />
                <h3 className="font-bold text-pink-800 dark:text-pink-200 text-lg">
                  🎉 ¡Cumpleaños de Hoy! 🎂
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cumpleanosHoy.map((usuario) => {
                  const edad = calcularEdad(usuario.fecha_nacimiento!);
                  return (
                    <div
                      key={usuario.id}
                      className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border border-pink-200/50 dark:border-pink-700/50 hover:scale-105 transition-transform"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {usuario.nombre.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-pink-800 dark:text-pink-200">
                            {usuario.nombre}
                          </p>
                          <p className="text-sm text-pink-600 dark:text-pink-300">
                            Cumple {edad + 1} años 🎈
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alertas importantes - Financieras y Operativas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Alertas Financieras */}
            {(statsFinancieras.membresiasVencidas > 0 || statsFinancieras.gastosPendientes > 0 || statsFinancieras.nominaPendiente > 0) && (
              <div className="backdrop-blur-xl bg-gradient-to-r from-red-50/90 to-rose-50/90 dark:from-red-900/50 dark:to-rose-900/50 border-l-4 border-red-400 dark:border-red-600 rounded-xl p-6 shadow-lg animate-pulse-slow hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-2 mb-3">
                  <CreditCard className="text-red-600 dark:text-red-400" size={20} />
                  <h3 className="font-semibold text-red-800 dark:text-red-300">
                    Alertas Financieras
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  {statsFinancieras.membresiasVencidas > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-red-700 dark:text-red-300">Membresías vencidas:</span>
                      <span className="font-bold text-red-800 dark:text-red-200">{statsFinancieras.membresiasVencidas}</span>
                    </div>
                  )}
                  {statsFinancieras.gastosPendientes > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-red-700 dark:text-red-300">Gastos pendientes:</span>
                      <span className="font-bold text-red-800 dark:text-red-200">{statsFinancieras.gastosPendientes}</span>
                    </div>
                  )}
                  {statsFinancieras.nominaPendiente > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-red-700 dark:text-red-300">Nómina pendiente:</span>
                      <span className="font-bold text-red-800 dark:text-red-200">{formatCurrency(statsFinancieras.nominaPendiente)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Alertas Operativas */}
            {membresiasPorVencer.length > 0 && (
              <div className="backdrop-blur-xl bg-gradient-to-r from-amber-50/90 to-orange-50/90 dark:from-amber-900/50 dark:to-orange-900/50 border-l-4 border-amber-400 dark:border-amber-600 rounded-xl p-6 shadow-lg animate-pulse-slow hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle
                    className="text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform"
                    size={20}
                  />
                  <h3 className="font-semibold text-amber-800 dark:text-amber-300">
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
                        <span className="text-amber-800 dark:text-amber-300">
                          {membresia.usuario?.nombre} - {membresia.plan?.nombre}
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
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
          </div>

          {/* Sección de información adicional */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Próximos Eventos */}
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-xl p-5 shadow-lg border border-sky-100/50 dark:border-sky-900/50 hover:border-sky-200 dark:hover:border-sky-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group animate-fadeIn">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Calendar
                  className="text-sky-600 dark:text-sky-400 group-hover:rotate-12 transition-transform"
                  size={18}
                />
                <span className="text-sky-600 dark:text-sky-400">Eventos Próximos</span>
              </h3>
              <div className="space-y-2">
                {proximosEventos.length > 0 ? (
                  proximosEventos.map((evento) => (
                    <div
                      key={evento.id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-200">
                          {evento.titulo}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
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
                        className={`px-2 py-0.5 text-xs rounded-full ${evento.color === "blue"
                            ? "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300"
                            : evento.color === "green"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                              : evento.color === "orange"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                          }`}
                      >
                        {evento.tipo}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-3 text-sm">
                    No hay eventos próximos
                  </p>
                )}
              </div>
            </div>

            {/* Miembros Recientes */}
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-xl p-5 shadow-lg border border-emerald-100/50 dark:border-emerald-900/50 hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group animate-fadeIn delay-100">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Users
                  className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform"
                  size={18}
                />
                <span>Miembros Recientes</span>
              </h3>
              <div className="space-y-2">
                {miembrosRecientes.length > 0 ? (
                  miembrosRecientes.map((usuario) => (
                    <div
                      key={usuario.id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {usuario.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-200">
                            {usuario.nombre}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {usuario.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${usuario.activo
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300"
                          }`}
                      >
                        {usuario.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-3 text-sm">
                    No hay miembros nuevos
                  </p>
                )}
              </div>
            </div>

            {/* Cumpleaños Próximos */}
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-xl p-5 shadow-lg border border-pink-100/50 dark:border-pink-900/50 hover:border-pink-200 dark:hover:border-pink-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group animate-fadeIn delay-200">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Gift
                  className="text-pink-600 dark:text-pink-400 group-hover:bounce transition-transform"
                  size={18}
                />
                <span className="text-pink-600 dark:text-pink-400">Próximos Cumpleaños</span>
              </h3>
              <div className="space-y-2">
                {cumpleanosProximos.length > 0 ? (
                  cumpleanosProximos.map((usuario) => {
                    const dias = diasHastaCumpleanos(usuario.fecha_nacimiento!);
                    const edad = calcularEdad(usuario.fecha_nacimiento!);
                    return (
                      <div
                        key={usuario.id}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {usuario.nombre
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-gray-200">
                              {usuario.nombre}
                            </p>
                            <p className="text-xs text-pink-600 dark:text-pink-400">
                              Cumple {edad + 1} años
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 font-medium">
                          {dias === 1 ? "Mañana" : `${dias} días`}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-3 text-sm">
                    No hay cumpleaños próximos
                  </p>
                )}
              </div>
            </div>

            {/* Panel de Estado Financiero Rápido */}
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-xl p-5 shadow-lg border border-purple-100/50 dark:border-purple-900/50 hover:border-purple-200 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group animate-fadeIn delay-300">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <CreditCard
                  className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform"
                  size={18}
                />
                <span>Estado Financiero</span>
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Margen de utilidad:</span>
                    <span className={`text-sm font-bold ${
                      statsFinancieras.ingresosMes > 0 && (statsFinancieras.utilidadMes / statsFinancieras.ingresosMes) * 100 >= 20
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      {statsFinancieras.ingresosMes > 0 
                        ? `${((statsFinancieras.utilidadMes / statsFinancieras.ingresosMes) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        statsFinancieras.ingresosMes > 0 && (statsFinancieras.utilidadMes / statsFinancieras.ingresosMes) * 100 >= 20
                          ? 'bg-green-500'
                          : 'bg-orange-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, Math.max(0, statsFinancieras.ingresosMes > 0 
                          ? (statsFinancieras.utilidadMes / statsFinancieras.ingresosMes) * 100 
                          : 0))}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Meta mensual:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Días del mes:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date().getDate()}/{new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}
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
