import { useState, useEffect } from "react";
import axios from "axios";
import {
  Usuario,
  Plan,
  Membresia,
  Producto,
  Venta,
  Entrenador,
  Gasto,
  Evento,
  ItemGaleria,
  CategoriaInventario,
  ItemInventario,
  Notificacion,
  DashboardStats,
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
  // GET inicial
  // ---------------------
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [u, p, m, prod, v, e, g, ev, inv, gal, noti, cat] =
        await Promise.all([
          axios.get(`${API_URL}/usuario`),
          axios.get(`${API_URL}/plan`),
          axios.get(`${API_URL}/membresia`),
          axios.get(`${API_URL}/producto`),
          axios.get(`${API_URL}/venta`),
          axios.get(`${API_URL}/entrenador`),
          axios.get(`${API_URL}/gasto`),
          axios.get(`${API_URL}/evento`),
          axios.get(`${API_URL}/item-inventario`),
          axios.get(`${API_URL}/item-galeria`),
          axios.get(`${API_URL}/notificacion`),
          axios.get(`${API_URL}/categoria-inventario`),
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
  const agregarUsuario = async (
    usuario: Omit<Usuario, "id" | "fecha_registro">
  ) => {
    const res = await axios.post<Usuario>(`${API_URL}/usuario`, usuario);
    setUsuarios((prev) => [...prev, res.data]);
    return res.data;
  };

  const actualizarUsuario = async (id: string, datos: Partial<Usuario>) => {
    const res = await axios.put(`${API_URL}/usuario/${id}`, datos);
    setUsuarios((prev) => prev.map((u) => (u.id === id ? res.data : u)));
    return res.data;
  };

  const eliminarUsuario = async (id: string) => {
    await axios.delete(`${API_URL}/usuario/${id}`);
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

  // ---------------------
  // PLANES
  // ---------------------
  const agregarPlan = async (plan: Omit<Plan, "id">) => {
    const res = await axios.post(`${API_URL}/plan`, plan);
    setPlanes((prev) => [...prev, res.data]);
    return res.data;
  };

  const actualizarPlan = async (id: string, datos: Partial<Plan>) => {
    const res = await axios.put(`${API_URL}/plan/${id}`, datos);
    setPlanes((prev) => prev.map((p) => (p.id === id ? res.data : p)));
    return res.data;
  };

  const eliminarPlan = async (id: string) => {
    await axios.delete(`${API_URL}/plan/${id}`);
    setPlanes((prev) => prev.filter((p) => p.id !== id));
  };

  // ---------------------
  // MEMBRESÍAS
  // ---------------------
  const agregarMembresia = async (membresia: Omit<Membresia, "id">) => {
    const res = await axios.post(`${API_URL}/membresia`, membresia);
    setMembresias((prev) => [...prev, res.data]);
    return res.data;
  };

  const actualizarMembresia = async (id: string, datos: Partial<Membresia>) => {
    const res = await axios.put(`${API_URL}/membresia/${id}`, datos);
    setMembresias((prev) => prev.map((m) => (m.id === id ? res.data : m)));
    return res.data;
  };

  const eliminarMembresia = async (id: string) => {
    await axios.delete(`${API_URL}/membresia/${id}`);
    setMembresias((prev) => prev.filter((m) => m.id !== id));
  };

  // ---------------------
  // INVENTARIO
  // ---------------------
  const agregarItemInventario = async (
    item: Omit<ItemInventario, "id" | "fecha_registro" | "categoria">
  ) => {
    const res = await axios.post(`${API_URL}/item-inventario`, item);
    setInventario((prev) => [...prev, res.data]);
    return res.data;
  };

  const actualizarItemInventario = async (
    id: string,
    datos: Partial<ItemInventario>
  ) => {
    const res = await axios.put(`${API_URL}/item-inventario/${id}`, datos);
    setInventario((prev) => prev.map((i) => (i.id === id ? res.data : i)));
    return res.data;
  };

  const eliminarItemInventario = async (id: string) => {
    await axios.delete(`${API_URL}/item-inventario/${id}`);
    setInventario((prev) => prev.filter((i) => i.id !== id));
  };

  // ---------------------
  // PRODUCTOS
  // ---------------------
  const agregarProducto = async (producto: Omit<Producto, "id">) => {
    const res = await axios.post(`${API_URL}/producto`, producto);
    setProductos((prev) => [...prev, res.data]);
    return res.data;
  };

  const actualizarProducto = async (id: string, datos: Partial<Producto>) => {
    const res = await axios.put(`${API_URL}/producto/${id}`, datos);
    setProductos((prev) => prev.map((p) => (p.id === id ? res.data : p)));
    return res.data;
  };

  const eliminarProducto = async (id: string) => {
    await axios.delete(`${API_URL}/producto/${id}`);
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  // ---------------------
  // VENTAS
  // ---------------------
  const agregarVenta = async (venta: Omit<Venta, "id">) => {
    const res = await axios.post(`${API_URL}/venta`, venta);
    setVentas((prev) => [...prev, res.data]);
    return res.data;
  };

  const actualizarVenta = async (id: string, datos: Partial<Venta>) => {
    const res = await axios.put(`${API_URL}/venta/${id}`, datos);
    setVentas((prev) => prev.map((v) => (v.id === id ? res.data : v)));
    return res.data;
  };

  const eliminarVenta = async (id: string) => {
    await axios.delete(`${API_URL}/venta/${id}`);
    setVentas((prev) => prev.filter((v) => v.id !== id));
  };

  // ---------------------
  // ENTRENADORES
  // ---------------------
  const agregarEntrenador = async (
    entrenador: Omit<Entrenador, "id" | "fecha_registro">
  ) => {
    console.log(entrenador)
    const res = await axios.post(`${API_URL}/entrenador`, entrenador);
    setEntrenadores((prev) => [...prev, res.data]);
    return res.data;
  };

  const actualizarEntrenador = async (
    id: string,
    datos: Partial<Entrenador>
  ) => {
    const res = await axios.put(`${API_URL}/entrenador/${id}`, datos);
    setEntrenadores((prev) => prev.map((e) => (e.id === id ? res.data : e)));
    return res.data;
  };

  const eliminarEntrenador = async (id: string) => {
    await axios.delete(`${API_URL}/entrenador/${id}`);
    setEntrenadores((prev) => prev.filter((e) => e.id !== id));
  };

  // ---------------------
  // GASTOS
  // ---------------------
  const agregarGasto = async (gasto: Omit<Gasto, "id" | "fecha_registro">) => {
    const res = await axios.post(`${API_URL}/gasto`, gasto);
    setGastos((prev) => [...prev, res.data]);
    return res.data;
  };

  const actualizarGasto = async (id: string, datos: Partial<Gasto>) => {
    const res = await axios.put(`${API_URL}/gasto/${id}`, datos);
    setGastos((prev) => prev.map((g) => (g.id === id ? res.data : g)));
    return res.data;
  };

  const eliminarGasto = async (id: string) => {
    await axios.delete(`${API_URL}/gasto/${id}`);
    setGastos((prev) => prev.filter((g) => g.id !== id));
  };

  // ---------------------
  // EVENTOS
  // ---------------------
  const agregarEvento = async (
    evento: Omit<Evento, "id" | "fecha_registro">
  ) => {
    const res = await axios.post<Evento>(`${API_URL}/evento`, evento);
    setEventos((prev) => [...prev, res.data]);
    return res.data;
  };

  const actualizarEvento = async (id: string, datos: Partial<Evento>) => {
    const res = await axios.put(`${API_URL}/evento/${id}`, datos);
    setEventos((prev) => prev.map((ev) => (ev.id === id ? res.data : ev)));
    return res.data;
  };

  const eliminarEvento = async (id: string) => {
    await axios.delete(`${API_URL}/evento/${id}`);
    setEventos((prev) => prev.filter((ev) => ev.id !== id));
  };

  // ---------------------
  // GALERÍA
  // ---------------------
  const agregarItemGaleria = async (item: Omit<ItemGaleria, "id">) => {
    const res = await axios.post(`${API_URL}/item-galeria`, item);
    setGaleria((prev) => [...prev, res.data]);
    return res.data;
  };

  const actualizarItemGaleria = async (
    id: string,
    datos: Partial<ItemGaleria>
  ) => {
    const res = await axios.put(`${API_URL}/item-galeria/${id}`, datos);
    setGaleria((prev) => prev.map((g) => (g.id === id ? res.data : g)));
    return res.data;
  };

  const eliminarItemGaleria = async (id: string) => {
    await axios.delete(`${API_URL}/item-galeria/${id}`);
    setGaleria((prev) => prev.filter((g) => g.id !== id));
  };

  // ---------------------
  // NOTIFICACIONES
  // ---------------------
  const agregarNotificacion = async (
    noti: Omit<Notificacion, "id" | "fecha_creacion">
  ) => {
    const res = await axios.post<Notificacion>(`${API_URL}/notificacion`, noti);
    setNotificaciones((prev) => [res.data, ...prev]);
    return res.data;
  };

  const actualizarNotificacion = async (
    id: string,
    datos: Partial<Notificacion>
  ) => {
    const res = await axios.put(`${API_URL}/notificacion/${id}`, datos);
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? res.data : n)));
    return res.data;
  };

  const eliminarNotificacion = async (id: string) => {
    await axios.delete(`${API_URL}/notificacion/${id}`);
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificacionesNoLeidas = async (): Promise<Notificacion[]> => {
    try {
      const res = await axios.get(`${API_URL}/notificacion/no-leidas`);
      return res.data;
    } catch (error) {
      console.error("Error al obtener notificaciones no leídas:", error);
      return [];
    }
  };

  // ---------------------
  // CATEGORÍAS
  // ---------------------
  const agregarCategoria = async (
    categoria: Omit<CategoriaInventario, "id">
  ) => {
    const res = await axios.post(`${API_URL}/categoria-inventario`, categoria);
    setCategorias((prev) => [...prev, res.data]);
    return res.data;
  };

  const actualizarCategoria = async (
    id: string,
    datos: Partial<CategoriaInventario>
  ) => {
    const res = await axios.put(`${API_URL}/categoria-inventario/${id}`, datos);
    setCategorias((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    return res.data;
  };

  const eliminarCategoria = async (id: string) => {
    await axios.delete(`${API_URL}/categoria-inventario/${id}`);
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  };

  // ---------------------
  // Dashboard Stats
  // ---------------------
  const getDashboardStats = async (): Promise<DashboardStats | null> => {
    try {
      const res = await axios.get(`${API_URL}/dashboard/stats`);
      return res.data;
    } catch (error) {
      console.error("Error al obtener estadísticas del dashboard:", error);
      return null;
    }
  };
  const marcarNotificacionLeida = async (id: string) => {
    try {
      // llamamos al backend para marcar como leída
      await axios.put(`${API_URL}/notificacion/${id}/leida`);

      // Actualizamos el estado local
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      // llamamos al backend para marcar todas como leídas
      await axios.put(`${API_URL}/notificacion/marcar-todas-leidas`);

      // Actualizamos el estado local
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (error) {
      console.error(
        "Error al marcar todas las notificaciones como leídas:",
        error
      );
    }
  };
  return {
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
    fetchAllData,
    agregarUsuario,
    actualizarUsuario,
    eliminarUsuario,
    agregarPlan,
    actualizarPlan,
    eliminarPlan,
    agregarMembresia,
    actualizarMembresia,
    eliminarMembresia,
    agregarItemInventario,
    actualizarItemInventario,
    eliminarItemInventario,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    agregarVenta,
    actualizarVenta,
    eliminarVenta,
    agregarEntrenador,
    actualizarEntrenador,
    eliminarEntrenador,
    agregarGasto,
    actualizarGasto,
    eliminarGasto,
    agregarEvento,
    actualizarEvento,
    eliminarEvento,
    agregarItemGaleria,
    actualizarItemGaleria,
    eliminarItemGaleria,
    agregarNotificacion,
    actualizarNotificacion,
    eliminarNotificacion,
    agregarCategoria,
    actualizarCategoria,
    eliminarCategoria,
    getNotificacionesNoLeidas,
    getDashboardStats,
    marcarTodasLeidas,
    marcarNotificacionLeida,
  };
}
