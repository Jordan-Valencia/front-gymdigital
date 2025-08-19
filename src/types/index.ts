// Tipos principales del sistema
export interface Usuario {
  id: string
  nombre: string
  telefono: string
  email: string
  documento: string
  fecha_registro: string
  activo: boolean
  notas?: string
}

export interface Plan {
  id: string
  nombre: string
  descripcion: string
  precio: number
}

export interface Membresia {
  id: string
  usuario_id: string
  plan_id: string
  fecha_inicio: string
  fecha_fin: string
  precio_pagado: number
  metodo_pago: string
  fecha_pago: string
  usuario?: Usuario
  plan?: Plan
}
export interface HorasEntrenador {
  id: string;
  entrenador_id: string;
  fecha: Date;
  horas: number;
  entrenador?: Entrenador;
}
export interface CategoriaInventario {
  id: string
  nombre: string
  tipo: "IMPLEMENTO" | "PRODUCTO"
  descripcion?: string
}

export interface ItemInventario {
  id: string
  nombre: string
  categoria_id: string
  cantidad: number
  stock_minimo: number
  precio_unitario?: number
  descripcion?: string
  fecha_registro: string
  categoria?: CategoriaInventario
}

export interface Producto {
  id: string
  nombre: string
  categoria_id: string
  cantidad: number
  stock_minimo: number
  precio_venta: number
  costo: number
  descripcion?: string
  fecha_registro: string
  categoria?: CategoriaInventario
}

export interface Venta {
  id: string
  usuario_id?: string
  fecha_venta: string
  total: number
  metodo_pago: string
  notas?: string
  usuario?: Usuario
  detalles?: DetalleVenta[]
  items?: Array<{
    producto_id: string
    cantidad: number
    precio_unitario: number
    subtotal: number
    producto?: Producto
  }>
}

export interface DetalleVenta {
  id: string
  venta_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  producto?: Producto
}

export interface Entrenador {
  id: string
  nombre: string
  telefono: string
  email: string
  especialidad?: string
  tarifa_hora: number
  fecha_registro: string
  activo: boolean
  fecha_primer_pago?: string
  fecha_ultimo_pago?: string
}

export interface Gasto {
  id: string
  concepto: string
  monto: number
  fecha: string
  categoria: string
  descripcion?: string
  fecha_registro: string
}

export interface Evento {
  id: string
  titulo: string
  descripcion?: string
  fecha_inicio: string
  fecha_fin?: string
  tipo: string
  color?: string
  ubicacion?: string
  fecha_registro: string
}

export interface ItemGaleria {
  id: string
  titulo: string
  descripcion?: string
  ruta_imagen: string
  fecha: string
  fecha_registro: string
}

export interface Notificacion {
  id: string
  tipo: string
  mensaje: string
  leida: boolean
  fecha_creacion: string
  referencia_id?: string
  referencia_tipo?: string
}

export interface DashboardStats {
  miembrosActivos: number
  ingresosMes: number
  ventasHoy: number
  entrenadores: number
  eventosProximos: number
  inventarioBajo: number
}

export interface PagoNomina {
  id: string
  entrenador_id: string
  mes: number
  año: number
  monto_base: number
  bonificaciones: number
  deducciones: number
  monto_total: number
  fecha_pago: string
  estado: "pendiente" | "pagado" | "vencido"
  notas?: string
  entrenador?: Entrenador
}

export interface EstadisticasFinancieras {
  ingresosMembresiasMes: number
  ingresosVentasMes: number
  totalIngresosMes: number
  gastosMes: number
  nominaMes: number
  totalEgresosMes: number
  utilidadMes: number
  membresiasPendientes: number
  gastosVencidos: number
  nominaPendiente: number
  flujoEfectivo: number
}

export interface ReporteFinanciero {
  id: string
  tipo: "mensual" | "anual" | "personalizado"
  fecha_inicio: string
  fecha_fin: string
  datos: any
  fecha_generacion: string
  generado_por?: string
}

export interface FiltroReporte {
  fechaInicio: string
  fechaFin: string
  tipo: "general" | "membresias" | "ventas" | "gastos" | "nomina"
  formato: "excel" | "pdf"
}

export interface PagoMembresia {
  id: string
  membresia_id: string
  monto: number
  fecha_pago: string
  fecha_vencimiento: string
  metodo_pago: string
  estado:  "PAGADO" | "PENDIENTE" | "VENCIDO"
  recargo?: number
  descuento?: number
  notas?: string
  membresia?: Membresia
}
export interface CategoriaGasto {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoGasto;
  activo: boolean;
  gastos_detallados?: GastoDetallado[];
  gastos?: Gasto[];
}

export interface GastoDetallado {
  id: string;
  concepto: string;
  monto: number;
  fecha: Date;
  categoria_id: string;
  descripcion?: string;
  comprobante_url?: string;
  proveedor?: string;
  metodo_pago: string;
  estado: EstadoGasto;
  fecha_registro: Date;
  fecha_vencimiento?: Date;

  categoria?: CategoriaGasto;
}

export interface Nomina {
  id: string;
  entrenador_id: string;
  mes: number;
  año: number;
  salario_base: number;
  bonificaciones: number;
  deducciones: number;
  total_pagar: number;
  fecha_pago?: Date;
  estado: EstadoPago;
  notas?: string;
  fecha_registro: Date;

  entrenador?: Entrenador;
}

export interface IngresoAdicional {
  id: string;
  concepto: string;
  monto: number;
  fecha: Date;
  categoria: string;
  descripcion?: string;
  metodo_pago: string;
  fecha_registro: Date;
}

export interface ResumenFinanciero {
  id: string;
  mes: number;
  año: number;
  total_ingresos: number;
  total_gastos: number;
  utilidad_bruta: number;
  ingresos_membresias: number;
  ingresos_ventas: number;
  ingresos_adicionales: number;
  gastos_operativos: number;
  gastos_nomina: number;
  fecha_calculo: Date;
}

export interface ConfiguracionFinanciera {
  id: string;
  nombre: string;
  valor: string;
  descripcion?: string;
  fecha_actualizacion: Date;
}

// Enums usados

export enum TipoGasto {
  OPERATIVO = "OPERATIVO",
  NOMINA = "NOMINA",
  MANTENIMIENTO = "MANTENIMIENTO",
  MARKETING = "MARKETING",
  SERVICIOS = "SERVICIOS",
  IMPUESTOS = "IMPUESTOS",
  OTROS = "OTROS",
}

export enum EstadoGasto {
  PENDIENTE = "PENDIENTE",
  PAGADO = "PAGADO",
  VENCIDO = "VENCIDO",
  CANCELADO = "CANCELADO",
}

export enum EstadoPago {
  PENDIENTE = "PENDIENTE",
  PAGADO = "PAGADO",
  VENCIDO = "VENCIDO",
  PARCIAL = "PARCIAL",
}

