// src/hooks/useFinanzas.ts
import { useState, useEffect } from "react";
import axios from "axios";
import {
  GastoDetallado,
  CategoriaGasto,
  Nomina,
  HorasEntrenador,
  EstadisticasFinancieras,
  IngresoAdicional,
  PagoMembresia,
  ReporteFinanciero,
  FiltroReporte
} from "../types";

export function useFinanzas() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Estados específicos de finanzas
  const [gastosDetallados, setGastosDetallados] = useState<GastoDetallado[]>([]);
  const [categoriasGastos, setCategoriasGastos] = useState<CategoriaGasto[]>([]);
  const [nominas, setNominas] = useState<Nomina[]>([]);
  const [horasTrabajadas, setHorasTrabajadas] = useState<HorasEntrenador[]>([]);
  const [ingresosAdicionales, setIngresosAdicionales] = useState<IngresoAdicional[]>([]);
  const [pagosMembresiasPendientes, setPagosMembresiasPendientes] = useState<PagoMembresia[]>([]);
  const [estadisticasFinancieras, setEstadisticasFinancieras] = useState<EstadisticasFinancieras | null>(null);

  useEffect(() => {
    fetchFinanzasData();
  }, []);

  const fetchFinanzasData = async () => {
    try {
      const [gastos, catGastos, nom, horas, ingresos, pagos] = await Promise.all([
        axios.get(`${API_URL}/gastos-detallados`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/categorias-gastos`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/nomina`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/horas-entrenador`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/ingresos-adicionales`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/pagos-membresias`).catch(() => ({ data: [] }))
      ]);

      setGastosDetallados(gastos.data);
      setCategoriasGastos(catGastos.data);
      setNominas(nom.data);
      setHorasTrabajadas(horas.data);
      setIngresosAdicionales(ingresos.data);
      setPagosMembresiasPendientes(pagos.data);
    } catch (error) {
      console.error("Error cargando datos financieros:", error);
    }
  };

  // ===== GASTOS DETALLADOS =====
  const agregarGastoDetallado = async (gasto: Omit<GastoDetallado, "id" | "fecha_registro">) => {
    try {
      const res = await axios.post(`${API_URL}/gastos-detallados`, gasto);
      setGastosDetallados(prev => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.error("Error agregando gasto detallado:", error);
      throw error;
    }
  };

  const actualizarGastoDetallado = async (id: string, datos: Partial<GastoDetallado>) => {
    try {
      const res = await axios.put(`${API_URL}/gastos-detallados/${id}`, datos);
      setGastosDetallados(prev => prev.map(g => g.id === id ? res.data : g));
      return res.data;
    } catch (error) {
      console.error("Error actualizando gasto detallado:", error);
      throw error;
    }
  };

  const eliminarGastoDetallado = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/gastos-detallados/${id}`);
      setGastosDetallados(prev => prev.filter(g => g.id !== id));
    } catch (error) {
      console.error("Error eliminando gasto detallado:", error);
      throw error;
    }
  };

  // ===== CATEGORÍAS DE GASTOS =====
  const agregarCategoriaGasto = async (categoria: Omit<CategoriaGasto, "id">) => {
    try {
      const res = await axios.post(`${API_URL}/categorias-gastos`, categoria);
      setCategoriasGastos(prev => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.error("Error agregando categoría de gasto:", error);
      throw error;
    }
  };

  const actualizarCategoriaGasto = async (id: string, datos: Partial<CategoriaGasto>) => {
    try {
      const res = await axios.put(`${API_URL}/categorias-gastos/${id}`, datos);
      setCategoriasGastos(prev => prev.map(c => c.id === id ? res.data : c));
      return res.data;
    } catch (error) {
      console.error("Error actualizando categoría de gasto:", error);
      throw error;
    }
  };

  const eliminarCategoriaGasto = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/categorias-gastos/${id}`);
      setCategoriasGastos(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error eliminando categoría de gasto:", error);
      throw error;
    }
  };

  // ===== NÓMINA =====
  const agregarNomina = async (nomina: Omit<Nomina, "id" | "fecha_registro">) => {
    try {
      const res = await axios.post(`${API_URL}/nomina`, nomina);
      setNominas(prev => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.error("Error agregando nómina:", error);
      throw error;
    }
  };

  const actualizarNomina = async (id: string, datos: Partial<Nomina>) => {
    try {
      const res = await axios.put(`${API_URL}/nomina/${id}`, datos);
      setNominas(prev => prev.map(n => n.id === id ? res.data : n));
      return res.data;
    } catch (error) {
      console.error("Error actualizando nómina:", error);
      throw error;
    }
  };

  const eliminarNomina = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/nomina/${id}`);
      setNominas(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error eliminando nómina:", error);
      throw error;
    }
  };

  // ===== HORAS TRABAJADAS =====
  const agregarHorasTrabajadas = async (horas: Omit<HorasEntrenador, "id">) => {
    try {
      const res = await axios.post(`${API_URL}/horas-entrenador`, horas);
      setHorasTrabajadas(prev => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.error("Error agregando horas trabajadas:", error);
      throw error;
    }
  };

  const actualizarHorasTrabajadas = async (id: string, datos: Partial<HorasEntrenador>) => {
    try {
      const res = await axios.put(`${API_URL}/horas-entrenador/${id}`, datos);
      setHorasTrabajadas(prev => prev.map(h => h.id === id ? res.data : h));
      return res.data;
    } catch (error) {
      console.error("Error actualizando horas trabajadas:", error);
      throw error;
    }
  };

  const eliminarHorasTrabajadas = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/horas-entrenador/${id}`);
      setHorasTrabajadas(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      console.error("Error eliminando horas trabajadas:", error);
      throw error;
    }
  };

  // ===== INGRESOS ADICIONALES =====
  const agregarIngresoAdicional = async (ingreso: Omit<IngresoAdicional, "id" | "fecha_registro">) => {
    try {
      const res = await axios.post(`${API_URL}/ingresos-adicionales`, ingreso);
      setIngresosAdicionales(prev => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.error("Error agregando ingreso adicional:", error);
      throw error;
    }
  };

  const actualizarIngresoAdicional = async (id: string, datos: Partial<IngresoAdicional>) => {
    try {
      const res = await axios.put(`${API_URL}/ingresos-adicionales/${id}`, datos);
      setIngresosAdicionales(prev => prev.map(i => i.id === id ? res.data : i));
      return res.data;
    } catch (error) {
      console.error("Error actualizando ingreso adicional:", error);
      throw error;
    }
  };

  const eliminarIngresoAdicional = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/ingresos-adicionales/${id}`);
      setIngresosAdicionales(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error("Error eliminando ingreso adicional:", error);
      throw error;
    }
  };

  // ===== FACTURACIÓN Y PAGOS DE MEMBRESÍAS =====
  const agregarPagoMembresia = async (pago: Omit<PagoMembresia, "id">) => {
    try {
      const res = await axios.post(`${API_URL}/pagos-membresias`, pago);
      setPagosMembresiasPendientes(prev => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.error("Error agregando pago de membresía:", error);
      throw error;
    }
  };

  const actualizarPagoMembresia = async (id: string, datos: Partial<PagoMembresia>) => {
    try {
      const res = await axios.put(`${API_URL}/pagos-membresias/${id}`, datos);
      setPagosMembresiasPendientes(prev => prev.map(p => p.id === id ? res.data : p));
      return res.data;
    } catch (error) {
      console.error("Error actualizando pago de membresía:", error);
      throw error;
    }
  };

  const obtenerMembresiasPorVencer = async (dias: number = 7) => {
    try {
      const res = await axios.get(`${API_URL}/membresias/por-vencer?dias=${dias}`);
      return res.data;
    } catch (error) {
      console.error("Error obteniendo membresías por vencer:", error);
      return [];
    }
  };

  const obtenerMembresiasVencidas = async () => {
    try {
      const res = await axios.get(`${API_URL}/membresias/vencidas`);
      return res.data;
    } catch (error) {
      console.error("Error obteniendo membresías vencidas:", error);
      return [];
    }
  };

  const generarFacturaMembresia = async (membresiaId: string) => {
    try {
      const res = await axios.post(`${API_URL}/facturas/membresia/${membresiaId}`, {}, {
        responseType: 'blob'
      });
      return res.data;
    } catch (error) {
      console.error("Error generando factura de membresía:", error);
      throw error;
    }
  };

  // ===== REPORTES (CORREGIDOS) =====
  const generarReporteGeneral = async (filtros: FiltroReporte) => {
    try {
      const res = await axios.post(`${API_URL}/reportes`, {
        ...filtros,
        tipo: 'general'
      });
      return res.data;
    } catch (error) {
      console.error("Error generando reporte general:", error);
      throw error;
    }
  };

  const generarReporteIngresos = async (filtros: FiltroReporte) => {
    try {
      const res = await axios.post(`${API_URL}/reportes`, {
        ...filtros,
        tipo: 'ingresos'
      });
      return res.data;
    } catch (error) {
      console.error("Error generando reporte de ingresos:", error);
      throw error;
    }
  };

  const generarReporteGastos = async (filtros: FiltroReporte) => {
    try {
      const res = await axios.post(`${API_URL}/reportes`, {
        ...filtros,
        tipo: 'gastos'
      });
      return res.data;
    } catch (error) {
      console.error("Error generando reporte de gastos:", error);
      throw error;
    }
  };

  const generarReporteNomina = async (filtros: FiltroReporte) => {
    try {
      const res = await axios.post(`${API_URL}/reportes`, {
        ...filtros,
        tipo: 'nomina'
      });
      return res.data;
    } catch (error) {
      console.error("Error generando reporte de nómina:", error);
      throw error;
    }
  };

  const exportarReporteExcel = async (tipo: string, filtros: any) => {
    try {
      const res = await axios.post(`${API_URL}/reportes/exportar/excel`, { tipo, filtros }, {
        responseType: 'blob'
      });
      return res.data;
    } catch (error) {
      console.error("Error exportando reporte a Excel:", error);
      throw error;
    }
  };

  const exportarReportePDF = async (tipo: string, filtros: any) => {
    try {
      const res = await axios.post(`${API_URL}/reportes/exportar/pdf`, { tipo, filtros }, {
        responseType: 'blob'
      });
      return res.data;
    } catch (error) {
      console.error("Error exportando reporte a PDF:", error);
      throw error;
    }
  };

  // ===== ESTADÍSTICAS (CORREGIDAS) =====
  const obtenerEstadisticasFinancieras = async (periodo?: { inicio: string; fin: string }) => {
    try {
      const params = periodo ? `?inicio=${periodo.inicio}&fin=${periodo.fin}` : '';
      const res = await axios.get(`${API_URL}/estadisticas/financieras${params}`);
      setEstadisticasFinancieras(res.data);
      return res.data;
    } catch (error) {
      console.error("Error obteniendo estadísticas financieras:", error);
      return null;
    }
  };

  // ===== NUEVAS FUNCIONES AGREGADAS =====
  const obtenerEstadisticasDashboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/estadisticas/dashboard`);
      return res.data;
    } catch (error) {
      console.error("Error obteniendo estadísticas del dashboard:", error);
      return null;
    }
  };

  const obtenerIngresosDiarios = async (mes?: number, año?: number) => {
    try {
      const params = new URLSearchParams();
      if (mes) params.append('mes', mes.toString());
      if (año) params.append('año', año.toString());
      
      const res = await axios.get(`${API_URL}/estadisticas/ingresos-diarios?${params.toString()}`);
      return res.data;
    } catch (error) {
      console.error("Error obteniendo ingresos diarios:", error);
      return null;
    }
  };

  const obtenerGastosVencidos = async () => {
    try {
      const res = await axios.get(`${API_URL}/gastos-detallados/vencidos`);
      return res.data;
    } catch (error) {
      console.error("Error obteniendo gastos vencidos:", error);
      return [];
    }
  };

  const obtenerGastosPendientes = async () => {
    try {
      const res = await axios.get(`${API_URL}/gastos-detallados/pendientes`);
      return res.data;
    } catch (error) {
      console.error("Error obteniendo gastos pendientes:", error);
      return [];
    }
  };

  const obtenerNominasPendientes = async () => {
    try {
      const res = await axios.get(`${API_URL}/nomina/pendientes`);
      return res.data;
    } catch (error) {
      console.error("Error obteniendo nóminas pendientes:", error);
      return [];
    }
  };

  const calcularSalarioPorHoras = async (entrenadorId: string, año: number, mes: number) => {
    try {
      const res = await axios.get(`${API_URL}/nomina/calcular-salario/${entrenadorId}/${año}/${mes}`);
      return res.data;
    } catch (error) {
      console.error("Error calculando salario por horas:", error);
      throw error;
    }
  };

  // ===== UTILIDADES (CORREGIDA) =====
  const actualizarMembresia = async (id: string, datos: any) => {
    try {
      const res = await axios.put(`${API_URL}/membresia/${id}`, datos);
      return res.data;
    } catch (error) {
      console.error("Error actualizando membresía:", error);
      throw error;
    }
  };

  return {
    // Estados
    gastosDetallados,
    categoriasGastos,
    nominas,
    horasTrabajadas,
    ingresosAdicionales,
    pagosMembresiasPendientes,
    estadisticasFinancieras,
    
    // Métodos generales
    fetchFinanzasData,
    
    // Gastos Detallados
    agregarGastoDetallado,
    actualizarGastoDetallado,
    eliminarGastoDetallado,
    obtenerGastosVencidos,
    obtenerGastosPendientes,
    
    // Categorías de Gastos
    agregarCategoriaGasto,
    actualizarCategoriaGasto,
    eliminarCategoriaGasto,
    
    // Nómina
    agregarNomina,
    actualizarNomina,
    eliminarNomina,
    obtenerNominasPendientes,
    calcularSalarioPorHoras,
    
    // Horas Trabajadas
    agregarHorasTrabajadas,
    actualizarHorasTrabajadas,
    eliminarHorasTrabajadas,
    
    // Ingresos Adicionales
    agregarIngresoAdicional,
    actualizarIngresoAdicional,
    eliminarIngresoAdicional,
    
    // Facturación y Pagos
    agregarPagoMembresia,
    actualizarPagoMembresia,
    obtenerMembresiasPorVencer,
    obtenerMembresiasVencidas,
    generarFacturaMembresia,
    actualizarMembresia,
    
    // Reportes
    generarReporteGeneral,
    generarReporteIngresos,
    generarReporteGastos,
    generarReporteNomina,
    exportarReporteExcel,
    exportarReportePDF,
    
    // Estadísticas
    obtenerEstadisticasFinancieras,
    obtenerEstadisticasDashboard,
    obtenerIngresosDiarios
  };
}
