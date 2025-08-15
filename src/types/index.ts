// Tipos principales del sistema
export interface Usuario {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  fecha_nacimiento: string;
  fecha_registro: string;
  activo: boolean;
  notas?: string;
}

export interface Plan {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
}

export interface Membresia {
  id: string;
  usuario_id: string;
  plan_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  precio_pagado: number;
  metodo_pago: string;
  fecha_pago: string;
  usuario?: Usuario;
  plan?: Plan;
}

export interface CategoriaInventario {
  id: string;
  nombre: string;
  tipo: "implemento" | "producto";
  descripcion?: string;
}

export interface ItemInventario {
  id: string;
  nombre: string;
  categoria_id: string;
  cantidad: number;
  stock_minimo: number;
  precio_unitario?: number;
  descripcion?: string;
  fecha_registro: string;
  categoria?: CategoriaInventario;
}

export interface Producto {
  id: string;
  nombre: string;
  categoria_id: string;
  cantidad: number;
  stock_minimo: number;
  precio_venta: number;
  costo: number;
  descripcion?: string;
  fecha_registro: string;
  categoria?: CategoriaInventario;
}

export interface Venta {
  id: string;
  usuario_id?: string;
  fecha_venta: string;
  total: number;
  metodo_pago: string;
  notas?: string;
  usuario?: Usuario;
  detalles?: DetalleVenta[];
  items?: Array<{
    producto_id: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    producto?: Producto;
  }>;
}

export interface DetalleVenta {
  id: string;
  venta_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: Producto;
}

export interface Entrenador {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  especialidad?: string;
  tarifa_hora: number;
  fecha_registro: string;
  activo: boolean;
}

export interface HoraTrabajada {
  id: string;
  entrenador_id: string;
  fecha: string;
  horas: number;
  descripcion?: string;
  fecha_registro: string;
  entrenador?: Entrenador;
}

export interface Gasto {
  id: string;
  concepto: string;
  monto: number;
  fecha: string;
  categoria: string;
  descripcion?: string;
  fecha_registro: string;
}

export interface Evento {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  tipo: string;
  color?: string;
  ubicacion?: string;
  fecha_registro: string;
}

export interface ItemGaleria {
  id: string;
  titulo: string;
  descripcion?: string;
  ruta_imagen: string;
  fecha: string;
  fecha_registro: string;
}

export interface Notificacion {
  id: string;
  tipo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
  referencia_id?: string;
  referencia_tipo?: string;
}

export interface DashboardStats {
  miembrosActivos: number;
  ingresosMes: number;
  ventasHoy: number;
  entrenadores: number;
  eventosProximos: number;
  inventarioBajo: number;
}
