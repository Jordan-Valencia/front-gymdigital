import { useState } from "react";
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
  DashboardStats,
  CategoriaInventario,
  ItemInventario,
  Notificacion,
  DetalleVenta,
} from "../types";

// Datos simulados para demostración
const mockUsuarios: Usuario[] = [
  {
    id: "1",
    nombre: "Ana García Pérez",
    telefono: "+57 600 123 456",
    email: "ana.garcia@email.com",
    fecha_nacimiento: "1990-05-15",
    fecha_registro: "2024-01-15T10:00:00Z",
    activo: true,
    notas: "Interesada en clases de yoga",
  },
  {
    id: "2",
    nombre: "Carlos Rodríguez López",
    telefono: "+57 600 789 012",
    email: "carlos.rodriguez@email.com",
    fecha_nacimiento: "1985-03-22",
    fecha_registro: "2024-02-01T14:30:00Z",
    activo: true,
  },
  {
    id: "3",
    nombre: "María José Fernández",
    telefono: "+57 655 234 567",
    email: "maria.fernandez@email.com",
    fecha_nacimiento: "1992-08-10",
    fecha_registro: "2024-01-20T09:15:00Z",
    activo: true,
    notas: "Prefiere entrenamientos matutinos",
  },
  {
    id: "4",
    nombre: "David Martín Sánchez",
    telefono: "+57 678 345 678",
    email: "david.martin@email.com",
    fecha_nacimiento: "1988-12-03",
    fecha_registro: "2024-02-10T16:45:00Z",
    activo: true,
    notas: "Interesado en musculación",
  },
  {
    id: "5",
    nombre: "Laura González Ruiz",
    telefono: "+57 612 456 789",
    email: "laura.gonzalez@email.com",
    fecha_nacimiento: "1995-04-18",
    fecha_registro: "2024-02-15T11:30:00Z",
    activo: true,
  },
  {
    id: "6",
    nombre: "Javier Moreno Castro",
    telefono: "+57 634 567 890",
    email: "javier.moreno@email.com",
    fecha_nacimiento: "1987-09-25",
    fecha_registro: "2024-01-25T14:20:00Z",
    activo: false,
    notas: "Membresía suspendida temporalmente",
  },
  {
    id: "7",
    nombre: "Carmen Jiménez Vega",
    telefono: "+57 645 678 901",
    email: "carmen.jimenez@email.com",
    fecha_nacimiento: "1993-06-12",
    fecha_registro: "2024-02-05T10:10:00Z",
    activo: true,
    notas: "Clases de pilates y spinning",
  },
  {
    id: "8",
    nombre: "Roberto Silva Herrera",
    telefono: "+57 623 789 012",
    email: "roberto.silva@email.com",
    fecha_nacimiento: "1991-11-08",
    fecha_registro: "2024-01-30T13:45:00Z",
    activo: true,
  },
];

const mockPlanes: Plan[] = [
  {
    id: "1",
    nombre: "Plan Mensual",
    descripcion: "Acceso completo por 1 mes",
    precio: 45.0,
  },
  {
    id: "2",
    nombre: "Plan Trimestral",
    descripcion: "Acceso completo por 3 meses",
    precio: 120.0,
  },
  {
    id: "3",
    nombre: "Plan Anual",
    descripcion: "Acceso completo por 12 meses",
    precio: 400.0,
  },
  {
    id: "4",
    nombre: "Plan Pareja Mensual",
    descripcion: "Acceso para 2 personas por 1 mes",
    precio: 75.0,
  },
  {
    id: "5",
    nombre: "Plan Estudiante",
    descripcion: "Descuento especial para estudiantes",
    precio: 35.0,
  },
];

const mockCategorias: CategoriaInventario[] = [
  {
    id: "1",
    nombre: "Pesas",
    tipo: "implemento",
    descripcion: "Equipos de peso libre",
  },
  {
    id: "2",
    nombre: "Suplementos",
    tipo: "producto",
    descripcion: "Productos nutricionales",
  },
  {
    id: "3",
    nombre: "Máquinas",
    tipo: "implemento",
    descripcion: "Equipos de ejercicio",
  },
  {
    id: "4",
    nombre: "Accesorios",
    tipo: "producto",
    descripcion: "Accesorios deportivos",
  },
];

const mockMembresias: Membresia[] = [
  {
    id: "1",
    usuario_id: "1",
    plan_id: "2",
    fecha_inicio: "2024-02-01",
    fecha_fin: "2024-05-01",
    precio_pagado: 120.0,
    metodo_pago: "Tarjeta",
    fecha_pago: "2024-02-01T10:00:00Z",
  },
  {
    id: "2",
    usuario_id: "2",
    plan_id: "1",
    fecha_inicio: "2024-02-15",
    fecha_fin: "2024-03-15",
    precio_pagado: 45.0,
    metodo_pago: "Efectivo",
    fecha_pago: "2024-02-15T14:30:00Z",
  },
  {
    id: "3",
    usuario_id: "3",
    plan_id: "3",
    fecha_inicio: "2024-01-20",
    fecha_fin: "2025-01-20",
    precio_pagado: 400.0,
    metodo_pago: "Transferencia",
    fecha_pago: "2024-01-20T09:15:00Z",
  },
  {
    id: "4",
    usuario_id: "4",
    plan_id: "1",
    fecha_inicio: "2024-02-10",
    fecha_fin: "2024-03-10",
    precio_pagado: 45.0,
    metodo_pago: "Tarjeta",
    fecha_pago: "2024-02-10T16:45:00Z",
  },
  {
    id: "5",
    usuario_id: "5",
    plan_id: "5",
    fecha_inicio: "2024-02-15",
    fecha_fin: "2024-03-15",
    precio_pagado: 35.0,
    metodo_pago: "Efectivo",
    fecha_pago: "2024-02-15T11:30:00Z",
  },
];

const mockProductos: Producto[] = [
  {
    id: "1",
    nombre: "Proteína Whey 1kg",
    categoria_id: "2",
    cantidad: 25,
    stock_minimo: 5,
    precio_venta: 35.99,
    costo: 22.0,
    descripcion: "Proteína de suero de alta calidad",
    fecha_registro: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    nombre: "Creatina 300g",
    categoria_id: "2",
    cantidad: 15,
    stock_minimo: 3,
    precio_venta: 24.99,
    costo: 15.5,
    descripcion: "Creatina monohidrato pura",
    fecha_registro: "2024-01-20T14:30:00Z",
  },
  {
    id: "3",
    nombre: "Guantes de entrenamiento",
    categoria_id: "4",
    cantidad: 8,
    stock_minimo: 10,
    precio_venta: 19.99,
    costo: 12.0,
    descripcion: "Guantes acolchados para levantamiento",
    fecha_registro: "2024-02-01T09:15:00Z",
  },
  {
    id: "4",
    nombre: "Shaker 600ml",
    categoria_id: "4",
    cantidad: 30,
    stock_minimo: 15,
    precio_venta: 12.99,
    costo: 7.5,
    descripcion: "Botella mezcladora con compartimento",
    fecha_registro: "2024-02-05T11:20:00Z",
  },
];

const mockInventario: ItemInventario[] = [
  {
    id: "1",
    nombre: "Mancuernas 10kg (par)",
    categoria_id: "1",
    cantidad: 8,
    stock_minimo: 4,
    precio_unitario: 45.0,
    descripcion: "Mancuernas de hierro fundido",
    fecha_registro: "2024-01-10T10:00:00Z",
  },
  {
    id: "2",
    nombre: "Barra olímpica 20kg",
    categoria_id: "1",
    cantidad: 3,
    stock_minimo: 2,
    precio_unitario: 120.0,
    descripcion: "Barra estándar olímpica",
    fecha_registro: "2024-01-15T14:30:00Z",
  },
  {
    id: "3",
    nombre: "Cinta de correr",
    categoria_id: "3",
    cantidad: 1,
    stock_minimo: 2,
    precio_unitario: 1200.0,
    descripcion: "Cinta profesional con inclinación",
    fecha_registro: "2024-01-20T09:15:00Z",
  },
  {
    id: "4",
    nombre: "Banco ajustable",
    categoria_id: "3",
    cantidad: 4,
    stock_minimo: 3,
    precio_unitario: 180.0,
    descripcion: "Banco multiposición",
    fecha_registro: "2024-02-01T11:45:00Z",
  },
];

const mockEntrenadores: Entrenador[] = [
  {
    id: "1",
    nombre: "Miguel Ángel Torres",
    telefono: "+57 666 111 222",
    email: "miguel.torres@gimnasio.com",
    especialidad: "Musculación y Fuerza",
    tarifa_hora: 25.0,
    fecha_registro: "2024-01-01T08:00:00Z",
    activo: true,
  },
  {
    id: "2",
    nombre: "Patricia Ruiz Morales",
    telefono: "+57 677 333 444",
    email: "patricia.ruiz@gimnasio.com",
    especialidad: "Yoga y Pilates",
    tarifa_hora: 30.0,
    fecha_registro: "2024-01-05T09:30:00Z",
    activo: true,
  },
  {
    id: "3",
    nombre: "Fernando López García",
    telefono: "+57 688 555 666",
    email: "fernando.lopez@gimnasio.com",
    especialidad: "Cardio y Spinning",
    tarifa_hora: 22.0,
    fecha_registro: "2024-01-10T10:15:00Z",
    activo: true,
  },
];

const mockEventos: Evento[] = [
  {
    id: "1",
    titulo: "Clase de Yoga Matutina",
    descripcion: "Sesión de yoga para principiantes",
    fecha_inicio: "2024-03-15T08:00:00Z",
    fecha_fin: "2024-03-15T09:00:00Z",
    tipo: "Clase",
    color: "green",
    fecha_registro: "2024-02-01T10:00:00Z",
  },
  {
    id: "2",
    titulo: "Torneo de Spinning",
    descripcion: "Competencia amistosa de spinning",
    fecha_inicio: "2024-03-20T18:00:00Z",
    fecha_fin: "2024-03-20T20:00:00Z",
    tipo: "Evento",
    color: "blue",
    fecha_registro: "2024-02-05T14:30:00Z",
  },
  {
    id: "3",
    titulo: "Mantenimiento Equipos",
    descripcion: "Revisión mensual de máquinas",
    fecha_inicio: "2024-03-25T07:00:00Z",
    fecha_fin: "2024-03-25T09:00:00Z",
    tipo: "Mantenimiento",
    color: "orange",
    fecha_registro: "2024-02-10T09:15:00Z",
  },
];

const mockGaleria: ItemGaleria[] = [
  {
    id: "1",
    titulo: "Clase de Yoga",
    descripcion: "Sesión de yoga matutina",
    ruta_imagen:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    fecha: "2024-08-01T09:00:00Z",
    fecha_registro: "2024-08-01T08:30:00Z",
  },
  {
    id: "2",
    titulo: "Entrenamiento Funcional",
    descripcion: "Sesión intensiva de entrenamiento funcional",
    ruta_imagen:
      "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    fecha: "2024-08-02T18:00:00Z",
    fecha_registro: "2024-08-02T17:45:00Z",
  },
  {
    id: "3",
    titulo: "Zumba",
    descripcion: "Clase de zumba para todos los niveles",
    ruta_imagen:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    fecha: "2024-08-03T17:00:00Z",
    fecha_registro: "2024-08-03T16:30:00Z",
  },
];

const mockNotificaciones: Notificacion[] = [
  {
    id: "1",
    tipo: "stock_bajo",
    mensaje: "Stock bajo: Guantes de entrenamiento (8 unidades)",
    leida: false,
    fecha_creacion: "2024-02-20T10:30:00Z",
    referencia_id: "3",
    referencia_tipo: "producto",
  },
  {
    id: "2",
    tipo: "membresia_vencimiento",
    mensaje: "La membresía de Carlos Rodríguez vence en 5 días",
    leida: false,
    fecha_creacion: "2024-02-20T09:15:00Z",
    referencia_id: "2",
    referencia_tipo: "membresia",
  },
  {
    id: "3",
    tipo: "nuevo_miembro",
    mensaje: "Nuevo miembro registrado: Roberto Silva Herrera",
    leida: true,
    fecha_creacion: "2024-01-30T13:45:00Z",
    referencia_id: "8",
    referencia_tipo: "usuario",
  },
  {
    id: "4",
    tipo: "stock_bajo",
    mensaje: "Stock crítico: Cinta de correr (1 unidad)",
    leida: false,
    fecha_creacion: "2024-02-19T16:20:00Z",
    referencia_id: "3",
    referencia_tipo: "inventario",
  },
  {
    id: "5",
    tipo: "evento_proximo",
    mensaje: "Evento próximo: Clase de Yoga Matutina mañana a las 8:00",
    leida: false,
    fecha_creacion: "2024-02-20T18:00:00Z",
    referencia_id: "1",
    referencia_tipo: "evento",
  },
];

export function useGymData() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios);
  const [planes, setPlanes] = useState<Plan[]>(mockPlanes);
  const [membresias, setMembresias] = useState<Membresia[]>(mockMembresias);
  const [productos, setProductos] = useState<Producto[]>(mockProductos);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [entrenadores, setEntrenadores] =
    useState<Entrenador[]>(mockEntrenadores);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [eventos, setEventos] = useState<Evento[]>(mockEventos);
  const [inventario, setInventario] =
    useState<ItemInventario[]>(mockInventario);
  const [galeria, setGaleria] = useState<ItemGaleria[]>(mockGaleria);
  const [notificaciones, setNotificaciones] =
    useState<Notificacion[]>(mockNotificaciones);
  // Usaremos las categorías directamente de los mocks ya que no se modifican
  const categorias = mockCategorias;

  const getDashboardStats = (): DashboardStats => {
    const miembrosActivos = usuarios.filter((u) => u.activo).length;
    const hoy = new Date().toISOString().split("T")[0];
    const ventasHoy = ventas.filter((v) =>
      v.fecha_venta.startsWith(hoy),
    ).length;
    const ingresosMes = ventas
      .filter((v) =>
        v.fecha_venta.startsWith(new Date().toISOString().substring(0, 7)),
      )
      .reduce((sum, v) => sum + v.total, 0);
    const inventarioBajo = inventario.filter(
      (i) => i.cantidad <= i.stock_minimo,
    ).length;

    return {
      miembrosActivos,
      ingresosMes,
      ventasHoy,
      entrenadores: entrenadores.filter((e) => e.activo).length,
      eventosProximos: eventos.filter(
        (e) => new Date(e.fecha_inicio) > new Date(),
      ).length,
      inventarioBajo,
    };
  };

  // Funciones para notificaciones
  const getNotificacionesNoLeidas = () => {
    return notificaciones.filter((n) => !n.leida);
  };

  const marcarNotificacionLeida = (id: string) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n)),
    );
  };

  const marcarTodasLeidas = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const agregarNotificacion = (
    notificacion: Omit<Notificacion, "id" | "fecha_creacion">,
  ) => {
    const nuevaNotificacion: Notificacion = {
      ...notificacion,
      id: Date.now().toString(),
      fecha_creacion: new Date().toISOString(),
    };
    setNotificaciones((prev) => [nuevaNotificacion, ...prev]);
    return nuevaNotificacion;
  };

  // Funciones para usuarios
  const agregarUsuario = (usuario: Omit<Usuario, "id" | "fecha_registro">) => {
    const nuevoUsuario: Usuario = {
      ...usuario,
      id: Date.now().toString(),
      fecha_registro: new Date().toISOString(),
    };
    setUsuarios((prev) => [...prev, nuevoUsuario]);

    // Crear notificación
    agregarNotificacion({
      tipo: "nuevo_miembro",
      mensaje: `Nuevo miembro registrado: ${nuevoUsuario.nombre}`,
      leida: false,
      referencia_id: nuevoUsuario.id,
      referencia_tipo: "usuario",
    });

    return nuevoUsuario;
  };

  const actualizarUsuario = (id: string, datos: Partial<Usuario>) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...datos } : u)),
    );
  };

  const eliminarUsuario = (id: string) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

  // Funciones para planes
  const agregarPlan = (plan: Omit<Plan, "id">) => {
    const nuevoPlan: Plan = {
      ...plan,
      id: Date.now().toString(),
    };
    setPlanes((prev) => [...prev, nuevoPlan]);

    // Crear notificación
    agregarNotificacion({
      tipo: "nuevo_plan",
      mensaje: `Nuevo plan creado: ${nuevoPlan.nombre}`,
      leida: false,
      referencia_id: nuevoPlan.id,
      referencia_tipo: "plan",
    });

    return nuevoPlan;
  };

  // Funciones para membresías
  const agregarMembresia = (
    membresia: Omit<Membresia, "id" | "fecha_pago">,
  ) => {
    const nuevaMembresia: Membresia = {
      ...membresia,
      id: Date.now().toString(),
      fecha_pago: new Date().toISOString(),
    };
    setMembresias((prev) => [...prev, nuevaMembresia]);

    // Crear notificación
    const usuario = usuarios.find((u) => u.id === membresia.usuario_id);
    const plan = planes.find((p) => p.id === membresia.plan_id);
    if (usuario && plan) {
      agregarNotificacion({
        tipo: "nueva_membresia",
        mensaje: `Nueva membresía: ${usuario.nombre} - ${plan.nombre}`,
        leida: false,
        referencia_id: nuevaMembresia.id,
        referencia_tipo: "membresia",
      });
    }

    return nuevaMembresia;
  };

  const actualizarMembresia = (id: string, datos: Partial<Membresia>) => {
    setMembresias((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...datos } : m)),
    );

    // Crear notificación de actualización
    const membresiaActualizada = {
      ...membresias.find((m) => m.id === id),
      ...datos,
    };
    const usuario = usuarios.find(
      (u) => u.id === membresiaActualizada.usuario_id,
    );
    const plan = planes.find((p) => p.id === membresiaActualizada.plan_id);

    if (usuario && plan) {
      agregarNotificacion({
        tipo: "membresia_actualizada",
        mensaje: `Membresía actualizada: ${usuario.nombre} - ${plan.nombre}`,
        leida: false,
        referencia_id: id,
        referencia_tipo: "membresia",
      });
    }

    return { ...membresias.find((m) => m.id === id), ...datos };
  };

  // Funciones para inventario
  const agregarItemInventario = (
    item: Omit<ItemInventario, "id" | "fecha_registro">,
  ) => {
    const nuevoItem: ItemInventario = {
      ...item,
      id: Date.now().toString(),
      fecha_registro: new Date().toISOString(),
    };
    setInventario((prev) => [...prev, nuevoItem]);

    // Verificar stock bajo
    if (nuevoItem.cantidad <= nuevoItem.stock_minimo) {
      agregarNotificacion({
        tipo: "stock_bajo",
        mensaje: `Stock bajo: ${nuevoItem.nombre} (${nuevoItem.cantidad} unidades)`,
        leida: false,
        referencia_id: nuevoItem.id,
        referencia_tipo: "inventario",
      });
    }

    return nuevoItem;
  };

  const actualizarItemInventario = (
    id: string,
    datos: Partial<ItemInventario>,
  ) => {
    const itemActual = inventario.find((i) => i.id === id);
    if (!itemActual) return null;

    const itemActualizado = { ...itemActual, ...datos };

    setInventario((prev) =>
      prev.map((i) => (i.id === id ? itemActualizado : i)),
    );

    // Verificar cambios en el stock
    if (
      datos.cantidad !== undefined &&
      datos.cantidad <= itemActual.stock_minimo
    ) {
      agregarNotificacion({
        tipo: "stock_bajo",
        mensaje: `Stock bajo: ${itemActualizado.nombre} (${datos.cantidad} unidades)`,
        leida: false,
        referencia_id: id,
        referencia_tipo: "inventario",
      });
    }

    return itemActualizado;
  };

  const eliminarItemInventario = (id: string) => {
    const item = inventario.find((i) => i.id === id);
    if (!item) return false;

    setInventario((prev) => prev.filter((i) => i.id !== id));

    // Crear notificación de eliminación
    agregarNotificacion({
      tipo: "inventario_eliminado",
      mensaje: `Se eliminó el item: ${item.nombre}`,
      leida: false,
      referencia_id: id,
      referencia_tipo: "inventario",
    });

    return true;
  };

  // Funciones para productos
  const agregarProducto = (
    producto: Omit<Producto, "id" | "fecha_registro">,
  ) => {
    const nuevoProducto: Producto = {
      ...producto,
      id: Date.now().toString(),
      fecha_registro: new Date().toISOString(),
    };
    setProductos((prev) => [...prev, nuevoProducto]);

    // Verificar stock bajo
    if (nuevoProducto.cantidad <= nuevoProducto.stock_minimo) {
      agregarNotificacion({
        tipo: "stock_bajo",
        mensaje: `Stock bajo: ${nuevoProducto.nombre} (${nuevoProducto.cantidad} unidades)`,
        leida: false,
        referencia_id: nuevoProducto.id,
        referencia_tipo: "producto",
      });
    }

    return nuevoProducto;
  };

  // Funciones para ventas
  const agregarVenta = (venta: Omit<Venta, "id" | "fecha_venta">) => {
    const nuevaVenta: Venta = {
      ...venta,
      id: Date.now().toString(),
      fecha_venta: new Date().toISOString(),
    };
    setVentas((prev) => [...prev, nuevaVenta]);

    // Crear notificación
    agregarNotificacion({
      tipo: "nueva_venta",
      mensaje: `Nueva venta registrada por $${venta.total.toFixed(2)}`,
      leida: false,
      referencia_id: nuevaVenta.id,
      referencia_tipo: "venta",
    });

    // Actualizar stock de productos si es necesario
    if (venta.detalles && venta.detalles.length > 0) {
      venta.detalles.forEach((detalle: DetalleVenta) => {
        const producto = productos.find((p) => p.id === detalle.producto_id);
        if (producto) {
          const nuevaCantidad = producto.cantidad - detalle.cantidad;
          actualizarProducto(producto.id, { cantidad: nuevaCantidad });
        }
      });
    }

    return nuevaVenta;
  };

  // Funciones para actualizar productos
  const actualizarProducto = (id: string, datos: Partial<Producto>) => {
    const productoActual = productos.find((p) => p.id === id);
    if (!productoActual) return null;

    const productoActualizado = { ...productoActual, ...datos };
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? productoActualizado : p)),
    );

    // Verificar stock bajo después de actualizar
    if (
      datos.cantidad !== undefined &&
      datos.cantidad <= productoActual.stock_minimo
    ) {
      agregarNotificacion({
        tipo: "stock_bajo",
        mensaje: `Stock bajo: ${productoActualizado.nombre} (${datos.cantidad} unidades)`,
        leida: false,
        referencia_id: id,
        referencia_tipo: "producto",
      });
    }

    return productoActualizado;
  };

  // Funciones para entrenadores
  const agregarEntrenador = (
    entrenador: Omit<Entrenador, "id" | "fecha_registro">,
  ) => {
    const nuevoEntrenador: Entrenador = {
      ...entrenador,
      id: Date.now().toString(),
      fecha_registro: new Date().toISOString(),
    };
    setEntrenadores((prev) => [...prev, nuevoEntrenador]);

    // Crear notificación
    agregarNotificacion({
      tipo: "nuevo_entrenador",
      mensaje: `Nuevo entrenador: ${nuevoEntrenador.nombre}`,
      leida: false,
      referencia_id: nuevoEntrenador.id,
      referencia_tipo: "entrenador",
    });

    return nuevoEntrenador;
  };

  const actualizarEntrenador = (
    id: string,
    datos: Partial<Omit<Entrenador, "id" | "fecha_registro">>,
  ) => {
    setEntrenadores((prev) =>
      prev.map((entrenador) =>
        entrenador.id === id ? { ...entrenador, ...datos } : entrenador,
      ),
    );

    // Crear notificación de actualización
    const entrenadorActualizado = {
      ...entrenadores.find((e) => e.id === id),
      ...datos,
    };
    if (entrenadorActualizado.nombre) {
      agregarNotificacion({
        tipo: "actualizacion_entrenador",
        mensaje: `Datos actualizados: ${entrenadorActualizado.nombre}`,
        leida: false,
        referencia_id: id,
        referencia_tipo: "entrenador",
      });
    }

    return entrenadorActualizado as Entrenador;
  };

  const eliminarEntrenador = (id: string) => {
    const entrenadorEliminado = entrenadores.find((e) => e.id === id);
    if (!entrenadorEliminado) return null;

    setEntrenadores((prev) =>
      prev.filter((entrenador) => entrenador.id !== id),
    );

    // Crear notificación de eliminación
    agregarNotificacion({
      tipo: "entrenador_eliminado",
      mensaje: `Entrenador eliminado: ${entrenadorEliminado.nombre}`,
      leida: false,
      referencia_id: id,
      referencia_tipo: "entrenador",
    });

    return entrenadorEliminado;
  };

  // Funciones para gastos
  const agregarGasto = (gasto: Omit<Gasto, "id" | "fecha_registro">) => {
    const nuevoGasto: Gasto = {
      ...gasto,
      id: Date.now().toString(),
      fecha_registro: new Date().toISOString(),
    };
    setGastos((prev) => [...prev, nuevoGasto]);

    // Crear notificación
    agregarNotificacion({
      tipo: "nuevo_gasto",
      mensaje: `Nuevo gasto registrado: $${gasto.monto.toFixed(2)} - ${gasto.descripcion || "Sin descripción"}`,
      leida: false,
      referencia_id: nuevoGasto.id,
      referencia_tipo: "gasto",
    });

    return nuevoGasto;
  };

  // Funciones para eventos
  const agregarEvento = (evento: Omit<Evento, "id" | "fecha_registro">) => {
    const nuevoEvento: Evento = {
      ...evento,
      id: Date.now().toString(),
      fecha_registro: new Date().toISOString(),
    };
    setEventos((prev) => [...prev, nuevoEvento]);

    // Crear notificación
    agregarNotificacion({
      tipo: "nuevo_evento",
      mensaje: `Nuevo evento: ${nuevoEvento.titulo} - ${new Date(nuevoEvento.fecha_inicio).toLocaleDateString()}`,
      leida: false,
      referencia_id: nuevoEvento.id,
      referencia_tipo: "evento",
    });

    return nuevoEvento;
  };

  // Funciones para galería
  const agregarItemGaleria = (
    item: Omit<ItemGaleria, "id" | "fecha_registro">,
  ) => {
    const nuevoItem: ItemGaleria = {
      ...item,
      id: Date.now().toString(),
      fecha_registro: new Date().toISOString(),
    };
    setGaleria((prev) => [...prev, nuevoItem]);

    // Crear notificación
    agregarNotificacion({
      tipo: "nuevo_item_galeria",
      mensaje: `Nuevo item agregado a la galería: ${item.titulo}`,
      leida: false,
      referencia_id: nuevoItem.id,
      referencia_tipo: "galeria",
    });

    return nuevoItem;
  };

  const eliminarItemGaleria = (id: string) => {
    const itemEliminado = galeria.find((i) => i.id === id);
    if (!itemEliminado) return null;

    setGaleria((prev) => prev.filter((item) => item.id !== id));

    // Crear notificación de eliminación
    agregarNotificacion({
      tipo: "item_galeria_eliminado",
      mensaje: `Item eliminado de la galería: ${itemEliminado.titulo}`,
      leida: false,
      referencia_id: id,
      referencia_tipo: "galeria",
    });

    return itemEliminado;
  };

  return {
    // Usuarios
    usuarios,
    agregarUsuario,
    actualizarUsuario,
    eliminarUsuario,

    // Membresías
    membresias,
    agregarMembresia,
    actualizarMembresia,

    // Inventario
    productos,
    categorias,
    agregarProducto,
    actualizarProducto,

    // Ventas
    ventas,
    agregarVenta,

    // Entrenadores
    entrenadores,
    agregarEntrenador,
    actualizarEntrenador,
    eliminarEntrenador,

    // Gastos
    gastos,
    agregarGasto,

    // Eventos
    eventos,
    agregarEvento,

    // Galería
    galeria,
    agregarItemGaleria,
    eliminarItemGaleria,

    // Notificaciones
    notificaciones,
    getNotificacionesNoLeidas,
    marcarNotificacionLeida,
    marcarTodasLeidas,
    agregarNotificacion,

    // Dashboard
    getDashboardStats,

    // Inventario
    inventario,
    agregarItemInventario,
    actualizarItemInventario,
    eliminarItemInventario,

    // Planes
    planes,

    // Categorías de inventario
    // agregarCategoriaInventario,
    // actualizarCategoriaInventario,
    // eliminarCategoriaInventario,

    // Horas trabajadas
    // horasTrabajadas,
    // agregarHoraTrabajada,
    // actualizarHoraTrabajada,
    // eliminarHoraTrabajada,

    // Detalles de venta
    // agregarDetalleVenta,
    // actualizarDetalleVenta,
    // eliminarDetalleVenta
  };
}
