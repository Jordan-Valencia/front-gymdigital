// src/components/Finanzas/Dashboard/DashboardFinanciero.tsx
"use client"

import { useEffect, useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Users,
  Receipt,
  CreditCard,
  Clock,
  BarChart3,
  PieChart
} from "lucide-react";
import { useFinanzas } from "../../../hooks/useFinanzas";
import { useGymData } from "../../../hooks/useGymData";
import { DashboardCards } from "./DashboardCards";
import { GraficoIngresosMes } from "./GraficoIngresosMes";
import { AlertasImportantes } from "./AlertasImportantes";
import { ResumenRapido } from "./ResumenRapido";
import { ProximosVencimientos } from "./ProximosVencimientos";

export function DashboardFinanciero() {
  const { 
    estadisticasFinancieras, 
    gastosDetallados, 
    nominas, 
    ingresosAdicionales,
    obtenerMembresiasPorVencer,
    obtenerMembresiasVencidas 
  } = useFinanzas();
  
  const { membresias, ventas, gastos, entrenadores } = useGymData();
  
  const [resumenFinanciero, setResumenFinanciero] = useState({
    ingresosMes: 0,
    gastosMes: 0,
    utilidadMes: 0,
    ingresosAño: 0,
    gastosAño: 0,
    utilidadAño: 0,
    membresiasPendientes: 0,
    gastosPendientes: 0,
    nominaPendiente: 0,
    crecimientoMensual: 0,
    margenUtilidad: 0
  });

  const [membresiasPorVencer, setMembresiasPorVencer] = useState([]);
  const [membresiasVencidas, setMembresiasVencidas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calcularResumenFinanciero();
    cargarDatosAdicionales();
  }, [membresias, ventas, gastos, gastosDetallados, nominas, ingresosAdicionales]);

  const calcularResumenFinanciero = () => {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const añoActual = fechaActual.getFullYear();
    const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
    const añoMesAnterior = mesActual === 0 ? añoActual - 1 : añoActual;

    // Calcular ingresos del mes actual
    const ingresosMembresiaMes = membresias
      .filter(m => {
        const fechaPago = new Date(m.fecha_pago);
        return fechaPago.getMonth() === mesActual && fechaPago.getFullYear() === añoActual;
      })
      .reduce((sum, m) => sum + m.precio_pagado, 0);

    const ingresosVentasMes = ventas
      .filter(v => {
        const fechaVenta = new Date(v.fecha_venta);
        return fechaVenta.getMonth() === mesActual && fechaVenta.getFullYear() === añoActual;
      })
      .reduce((sum, v) => sum + v.total, 0);

    const ingresosAdicionalesMes = ingresosAdicionales
      .filter(i => {
        const fechaIngreso = new Date(i.fecha);
        return fechaIngreso.getMonth() === mesActual && fechaIngreso.getFullYear() === añoActual;
      })
      .reduce((sum, i) => sum + i.monto, 0);

    const totalIngresosMes = ingresosMembresiaMes + ingresosVentasMes + ingresosAdicionalesMes;

    // Calcular gastos del mes actual
    const gastosSimplesMes = gastos
      .filter(g => {
        const fechaGasto = new Date(g.fecha);
        return fechaGasto.getMonth() === mesActual && fechaGasto.getFullYear() === añoActual;
      })
      .reduce((sum, g) => sum + g.monto, 0);

    const gastosDetalladosMes = gastosDetallados
      .filter(g => {
        const fechaGasto = new Date(g.fecha);
        return fechaGasto.getMonth() === mesActual && fechaGasto.getFullYear() === añoActual;
      })
      .reduce((sum, g) => sum + g.monto, 0);

    const nominaMes = nominas
      .filter(n => n.mes === mesActual + 1 && n.año === añoActual)
      .reduce((sum, n) => sum + n.total_pagar, 0);

    const totalGastosMes = gastosSimplesMes + gastosDetalladosMes + nominaMes;

    // Calcular ingresos del año
    const ingresosMembresiasAño = membresias
      .filter(m => new Date(m.fecha_pago).getFullYear() === añoActual)
      .reduce((sum, m) => sum + m.precio_pagado, 0);

    const ingresosVentasAño = ventas
      .filter(v => new Date(v.fecha_venta).getFullYear() === añoActual)
      .reduce((sum, v) => sum + v.total, 0);

    const ingresosAdicionalesAño = ingresosAdicionales
      .filter(i => new Date(i.fecha).getFullYear() === añoActual)
      .reduce((sum, i) => sum + i.monto, 0);

    const totalIngresosAño = ingresosMembresiasAño + ingresosVentasAño + ingresosAdicionalesAño;

    // Calcular gastos del año
    const gastosSimplesAño = gastos
      .filter(g => new Date(g.fecha).getFullYear() === añoActual)
      .reduce((sum, g) => sum + g.monto, 0);

    const gastosDetalladosAño = gastosDetallados
      .filter(g => new Date(g.fecha).getFullYear() === añoActual)
      .reduce((sum, g) => sum + g.monto, 0);

    const nominaAño = nominas
      .filter(n => n.año === añoActual)
      .reduce((sum, n) => sum + n.total_pagar, 0);

    const totalGastosAño = gastosSimplesAño + gastosDetalladosAño + nominaAño;

    // Calcular mes anterior para crecimiento
    const ingresosMesAnterior = membresias
      .filter(m => {
        const fechaPago = new Date(m.fecha_pago);
        return fechaPago.getMonth() === mesAnterior && fechaPago.getFullYear() === añoMesAnterior;
      })
      .reduce((sum, m) => sum + m.precio_pagado, 0) + 
      ventas
      .filter(v => {
        const fechaVenta = new Date(v.fecha_venta);
        return fechaVenta.getMonth() === mesAnterior && fechaVenta.getFullYear() === añoMesAnterior;
      })
      .reduce((sum, v) => sum + v.total, 0);

    // Calcular pendientes
    const membresiasPendientes = membresias.filter(m => new Date(m.fecha_fin) < new Date()).length;
    
    const gastosPendientes = gastosDetallados.filter(g => 
      g.estado === 'PENDIENTE' || g.estado === 'VENCIDO'
    ).length;

    const nominaPendiente = nominas.filter(n => 
      n.estado === 'PENDIENTE' || n.estado === 'VENCIDO'
    ).reduce((sum, n) => sum + n.total_pagar, 0);

    // Calcular métricas
    const utilidadMes = totalIngresosMes - totalGastosMes;
    const utilidadAño = totalIngresosAño - totalGastosAño;
    const crecimientoMensual = ingresosMesAnterior > 0 
      ? ((totalIngresosMes - ingresosMesAnterior) / ingresosMesAnterior) * 100 
      : 0;
    const margenUtilidad = totalIngresosMes > 0 
      ? (utilidadMes / totalIngresosMes) * 100 
      : 0;

    setResumenFinanciero({
      ingresosMes: totalIngresosMes,
      gastosMes: totalGastosMes,
      utilidadMes,
      ingresosAño: totalIngresosAño,
      gastosAño: totalGastosAño,
      utilidadAño,
      membresiasPendientes,
      gastosPendientes,
      nominaPendiente,
      crecimientoMensual,
      margenUtilidad
    });
  };

  const cargarDatosAdicionales = async () => {
    try {
      const [porVencer, vencidas] = await Promise.all([
        obtenerMembresiasPorVencer(7),
        obtenerMembresiasVencidas()
      ]);
      
      setMembresiasPorVencer(porVencer);
      setMembresiasVencidas(vencidas);
    } catch (error) {
      console.error("Error cargando datos adicionales:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando dashboard financiero...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cards principales */}
      <DashboardCards resumen={resumenFinanciero} />

      {/* Gráfico de ingresos y alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GraficoIngresosMes 
            membresias={membresias}
            ventas={ventas}
            ingresosAdicionales={ingresosAdicionales}
          />
        </div>
        <div>
          <AlertasImportantes 
            membresiasPendientes={resumenFinanciero.membresiasPendientes}
            gastosPendientes={resumenFinanciero.gastosPendientes}
            nominaPendiente={resumenFinanciero.nominaPendiente}
            membresiasPorVencer={membresiasPorVencer.length}
            membresiasVencidas={membresiasVencidas.length}
          />
        </div>
      </div>

      {/* Resumen rápido y próximos vencimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResumenRapido 
          totalMiembros={membresias.filter(m => new Date(m.fecha_fin) > new Date()).length}
          totalEntrenadores={entrenadores.filter(e => e.activo).length}
          ventasHoy={ventas.filter(v => {
            const hoy = new Date();
            const fechaVenta = new Date(v.fecha_venta);
            return fechaVenta.toDateString() === hoy.toDateString();
          }).length}
          gastosMes={gastos.filter(g => {
            const fechaGasto = new Date(g.fecha);
            const hoy = new Date();
            return fechaGasto.getMonth() === hoy.getMonth() && fechaGasto.getFullYear() === hoy.getFullYear();
          }).length}
        />
        
        <ProximosVencimientos 
          membresiasPorVencer={membresiasPorVencer}
          membresiasVencidas={membresiasVencidas}
        />
      </div>
    </div>
  );
}
