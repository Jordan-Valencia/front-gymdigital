import { useState, useEffect } from "react";
import axios from "axios";
import {
  Usuario, Plan, Membresia, Producto, Venta,
  Entrenador, Gasto, Evento, ItemGaleria,
  CategoriaInventario, ItemInventario, Notificacion, DashboardStats
} from "../types";

export function useGymData() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // ---------------------
  // Estados
  // ---------------------
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [galeria, setGaleria] = useState<ItemGaleria[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [categorias, setCategorias] = useState<CategoriaInventario[]>([]);

  // ---------------------
  // GET Inicial
  // ---------------------
  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      const [
        u, p, m, prod, v, e, g, ev, inv, gal, noti, cat
      ] = await Promise.all([
        axios.get<Usuario[]>(`${API_URL}/usuario`),
        axios.get<Plan[]>(`${API_URL}/plan`),
        axios.get<Membresia[]>(`${API_URL}/membresia`),
        axios.get<Producto[]>(`${API_URL}/producto`),
        axios.get<Venta[]>(`${API_URL}/venta`),
        axios.get<Entrenador[]>(`${API_URL}/entrenador`),
        axios.get<Gasto[]>(`${API_URL}/gasto`),
        axios.get<Evento[]>(`${API_URL}/evento`),
        axios.get<ItemInventario[]>(`${API_URL}/item-inventario`),
        axios.get<ItemGaleria[]>(`${API_URL}/item-galeria`),
        axios.get<Notificacion[]>(`${API_URL}/notificacion`),
        axios.get<CategoriaInventario[]>(`${API_URL}/categoria-inventario`),
      ]);
      setUsuarios(u.data);
      setPlanes(p.data);
      setMembresias(m.data);
      setProductos(prod.data);
      setVentas(v.data);
      setEntrenadores(e.data);
      setGastos(g.data);
      setEventos(ev.data);
      setInventario(inv.data);
      setGaleria(gal.data);
      setNotificaciones(noti.data);
      setCategorias(cat.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  // ---------------------
  // USUARIOS
  // ---------------------
  const agregarUsuario = async (usuario: Omit<Usuario, "id"|"fecha_registro">) => {
    const res = await axios.post(`${API_URL}/usuarios`, usuario);
    setUsuarios(prev => [...prev, res.data]);
    return res.data;
  };
  const actualizarUsuario = async (id: string, datos: Partial<Usuario>) => {
    const res = await axios.put(`${API_URL}/usuarios/${id}`, datos);
    setUsuarios(prev => prev.map(u => u.id === id ? res.data : u));
    return res.data;
  };
  const eliminarUsuario = async (id: string) => {
    await axios.delete(`${API_URL}/usuarios/${id}`);
    setUsuarios(prev => prev.filter(u => u.id !== id));
  };

  // ---------------------
  // PLANES
  // ---------------------
  const agregarPlan = async (plan: Omit<Plan, "id">) => {
    const res = await axios.post(`${API_URL}/planes`, plan);
    setPlanes(prev => [...prev, res.data]);
    return res.data;
  };
  const actualizarPlan = async (id: string, datos: Partial<Plan>) => {
    const res = await axios.put(`${API_URL}/planes/${id}`, datos);
    setPlanes(prev => prev.map(p => p.id === id ? res.data : p));
    return res.data;
  };
  const eliminarPlan = async (id: string) => {
    await axios.delete(`${API_URL}/planes/${id}`);
    setPlanes(prev => prev.filter(p => p.id !== id));
  };

  // ---------------------
  // MEMBRESÍAS
  // ---------------------
  const agregarMembresia = async (membresia: Omit<Membresia, "id">) => {
    const res = await axios.post(`${API_URL}/membresias`, membresia);
    setMembresias(prev => [...prev, res.data]);
    return res.data;
  };
  const actualizarMembresia = async (id: string, datos: Partial<Membresia>) => {
    const res = await axios.put(`${API_URL}/membresias/${id}`, datos);
    setMembresias(prev => prev.map(m => m.id === id ? res.data : m));
    return res.data;
  };
  const eliminarMembresia = async (id: string) => {
    await axios.delete(`${API_URL}/membresias/${id}`);
    setMembresias(prev => prev.filter(m => m.id !== id));
  };

  // ---------------------
// INVENTARIO
// ---------------------
const agregarItemInventario = async (item: Omit<ItemInventario, "id" | "fecha_registro">) => {
  const res = await axios.post(`${API_URL}/inventario`, item);
  setInventario(prev => [...prev, res.data]);
  return res.data;
};

const actualizarItemInventario = async (id: string, datos: Partial<ItemInventario>) => {
  const res = await axios.put(`${API_URL}/inventario/${id}`, datos);
  setInventario(prev => prev.map(i => i.id === id ? res.data : i));
  return res.data;
};

const eliminarItemInventario = async (id: string) => {
  await axios.delete(`${API_URL}/inventario/${id}`);
  setInventario(prev => prev.filter(i => i.id !== id));
};

// ---------------------
// PRODUCTOS
// ---------------------
const agregarProducto = async (producto: Omit<Producto, "id" | "fecha_registro">) => {
  const res = await axios.post(`${API_URL}/productos`, producto);
  setProductos(prev => [...prev, res.data]);
  return res.data;
};

const actualizarProducto = async (id: string, datos: Partial<Producto>) => {
  const res = await axios.put(`${API_URL}/productos/${id}`, datos);
  setProductos(prev => prev.map(p => p.id === id ? res.data : p));
  return res.data;
};

const eliminarProducto = async (id: string) => {
  await axios.delete(`${API_URL}/productos/${id}`);
  setProductos(prev => prev.filter(p => p.id !== id));
};

// ---------------------
// VENTAS
// ---------------------
const agregarVenta = async (venta: Omit<Venta, "id">) => {
  const res = await axios.post(`${API_URL}/ventas`, venta);
  setVentas(prev => [...prev, res.data]);
  return res.data;
};

const actualizarVenta = async (id: string, datos: Partial<Venta>) => {
  const res = await axios.put(`${API_URL}/ventas/${id}`, datos);
  setVentas(prev => prev.map(v => v.id === id ? res.data : v));
  return res.data;
};

const eliminarVenta = async (id: string) => {
  await axios.delete(`${API_URL}/ventas/${id}`);
  setVentas(prev => prev.filter(v => v.id !== id));
};
// ---------------------
// ENTRENADORES
// ---------------------
const agregarEntrenador = async (entrenador: Omit<Entrenador, "id" | "fecha_registro">) => {
  const res = await axios.post(`${API_URL}/entrenadores`, entrenador);
  setEntrenadores(prev => [...prev, res.data]);
  return res.data;
};

const actualizarEntrenador = async (id: string, datos: Partial<Entrenador>) => {
  const res = await axios.put(`${API_URL}/entrenadores/${id}`, datos);
  setEntrenadores(prev => prev.map(e => e.id === id ? res.data : e));
  return res.data;
};

const eliminarEntrenador = async (id: string) => {
  await axios.delete(`${API_URL}/entrenadores/${id}`);
  setEntrenadores(prev => prev.filter(e => e.id !== id));
};

// ---------------------
// GASTOS
// ---------------------
const agregarGasto = async (gasto: Omit<Gasto, "id" | "fecha_registro">) => {
  const res = await axios.post(`${API_URL}/gastos`, gasto);
  setGastos(prev => [...prev, res.data]);
  return res.data;
};

const actualizarGasto = async (id: string, datos: Partial<Gasto>) => {
  const res = await axios.put(`${API_URL}/gastos/${id}`, datos);
  setGastos(prev => prev.map(g => g.id === id ? res.data : g));
  return res.data;
};

const eliminarGasto = async (id: string) => {
  await axios.delete(`${API_URL}/gastos/${id}`);
  setGastos(prev => prev.filter(g => g.id !== id));
};

// ---------------------
// EVENTOS
// ---------------------
const agregarEvento = async (evento: Omit<Evento, "id" | "fecha_registro">) => {
  const res = await axios.post(`${API_URL}/eventos`, evento);
  setEventos(prev => [...prev, res.data]);
  return res.data;
};

const actualizarEvento = async (id: string, datos: Partial<Evento>) => {
  const res = await axios.put(`${API_URL}/eventos/${id}`, datos);
  setEventos(prev => prev.map(ev => ev.id === id ? res.data : ev));
  return res.data;
};

const eliminarEvento = async (id: string) => {
  await axios.delete(`${API_URL}/eventos/${id}`);
  setEventos(prev => prev.filter(ev => ev.id !== id));
};
// ---------------------
// GALERÍA
// ---------------------
const agregarItemGaleria = async (item: Omit<ItemGaleria, "id" | "fecha_registro">) => {
  const res = await axios.post(`${API_URL}/galeria`, item);
  setGaleria(prev => [...prev, res.data]);
  return res.data;
};

const actualizarItemGaleria = async (id: string, datos: Partial<ItemGaleria>) => {
  const res = await axios.put(`${API_URL}/galeria/${id}`, datos);
  setGaleria(prev => prev.map(g => g.id === id ? res.data : g));
  return res.data;
};

const eliminarItemGaleria = async (id: string) => {
  await axios.delete(`${API_URL}/galeria/${id}`);
  setGaleria(prev => prev.filter(g => g.id !== id));
};

// ---------------------
// NOTIFICACIONES
// ---------------------
const agregarNotificacion = async (notificacion: Omit<Notificacion, "id" | "fecha_creacion">) => {
  const res = await axios.post(`${API_URL}/notificacion`, notificacion);
  setNotificaciones(prev => [res.data, ...prev]);
  return res.data;
};

const actualizarNotificacion = async (id: string, datos: Partial<Notificacion>) => {
  const res = await axios.put(`${API_URL}/notificacion/${id}`, datos);
  setNotificaciones(prev => prev.map(n => n.id === id ? res.data : n));
  return res.data;
};

const eliminarNotificacion = async (id: string) => {
  await axios.delete(`${API_URL}/notificacion/${id}`);
  setNotificaciones(prev => prev.filter(n => n.id !== id));
};

// ---------------------
// CATEGORÍAS
// ---------------------
const agregarCategoria = async (categoria: Omit<CategoriaInventario, "id">) => {
  const res = await axios.post(`${API_URL}/categorias`, categoria);
  setCategorias(prev => [...prev, res.data]);
  return res.data;
};

const actualizarCategoria = async (id: string, datos: Partial<CategoriaInventario>) => {
  const res = await axios.put(`${API_URL}/categorias/${id}`, datos);
  setCategorias(prev => prev.map(c => c.id === id ? res.data : c));
  return res.data;
};

const eliminarCategoria = async (id: string) => {
  await axios.delete(`${API_URL}/categorias/${id}`);
  setCategorias(prev => prev.filter(c => c.id !== id));
};
// ---------------------
// Función para obtener notificaciones no leídas
// ---------------------
const getNotificacionesNoLeidas = async (): Promise<Notificacion[]> => {
  try {
    const res = await axios.get<Notificacion[]>(`${API_URL}/notificacion/no-leidas`);
    return res.data;
  } catch (error) {
    console.error("Error al obtener notificaciones no leídas:", error);
    return [];
  }
};

// ---------------------
// Función para obtener estadisticas del dashboard
// ---------------------


const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await axios.get<DashboardStats>(`${API_URL}/dashboard/stats`);
  return res.data;
};


  return {
  // ---------------------
  // Estados
  // ---------------------
  usuarios,
  planes,
  membresias,
  productos,
  ventas,
  entrenadores,
  gastos,
  eventos,
  inventario,
  galeria,
  notificaciones,
  categorias,

  // ---------------------
  // Funciones
  // ---------------------
  fetchAllData,

  // Usuarios
  agregarUsuario,
  actualizarUsuario,
  eliminarUsuario,

  // Planes
  agregarPlan,
  actualizarPlan,
  eliminarPlan,

  // Membresías
  agregarMembresia,
  actualizarMembresia,
  eliminarMembresia,

  // Inventario
  agregarItemInventario,
  actualizarItemInventario,
  eliminarItemInventario,

  // Productos
  agregarProducto,
  actualizarProducto,
  eliminarProducto,

  // Ventas
  agregarVenta,
  actualizarVenta,
  eliminarVenta,

  // Entrenadores
  agregarEntrenador,
  actualizarEntrenador,
  eliminarEntrenador,

  // Gastos
  agregarGasto,
  actualizarGasto,
  eliminarGasto,

  // Eventos
  agregarEvento,
  actualizarEvento,
  eliminarEvento,

  // Galería
  agregarItemGaleria,
  actualizarItemGaleria,
  eliminarItemGaleria,

  // Notificaciones
  agregarNotificacion,
  actualizarNotificacion,
  eliminarNotificacion,

  // Categorías
  agregarCategoria,
  actualizarCategoria,
  eliminarCategoria,

  getNotificacionesNoLeidas,
  getDashboardStats,
};

}
