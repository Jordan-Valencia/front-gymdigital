"use client"

import { useState } from "react"
import { ShoppingCart, Plus, Minus, X, Search, History, Calendar, DollarSign } from "lucide-react"
import { useGymData } from "../../hooks/useGymData"
import { Venta } from "../../types"
import type { ItemInventario } from "../../types"
import { CategoriaInventario } from "../../types"

type CarritoItem = {
  producto: ItemInventario
  cantidad: number
}

const formatearPrecio = (precio: number): string => {
  return Math.round(precio).toLocaleString("es-CO")
}

export function VentasPage() {
  const { inventario, categorias, agregarVenta, actualizarItemInventario, ventas } = useGymData()

  const [pestanaActiva, setPestanaActiva] = useState<"venta" | "historial">("venta")
  const [carrito, setCarrito] = useState<CarritoItem[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todos")
  const [procesandoPago, setProcesandoPago] = useState(false)

  // Obtener solo las categorías de tipo 'producto'
  const categoriasProductos = categorias.filter((categoria: CategoriaInventario) => categoria.tipo === "PRODUCTO")
  const categoriasUnicas: string[] = ["todos", ...categoriasProductos.map((categoria: CategoriaInventario) => categoria.id)]

  // Filtrar inventario para mostrar solo productos (no implementos)
  const productosFiltrados = inventario.filter((producto: ItemInventario) => {
    // Verificar que el producto pertenezca a una categoría de tipo 'producto'
    const esProducto = categoriasProductos.some(cat => cat.id === producto.categoria_id);
    if (!esProducto) return false;

    // Aplicar filtros de búsqueda y categoría
    const coincideCategoria = categoriaFiltro === "todos" || producto.categoria_id === categoriaFiltro;
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase().trim());
    
    return coincideCategoria && coincideBusqueda && producto.cantidad > 0;
  })

  const totalCarrito = carrito.reduce((total, item) => total + (item.producto.precio_unitario || 0) * item.cantidad, 0)

  const agregarAlCarrito = (producto: ItemInventario): void => {
    const itemEnCarrito = carrito.find((item) => item.producto.id === producto.id)
    if (itemEnCarrito) {
      setCarrito(
        carrito.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: Math.min(item.cantidad + 1, producto.cantidad) }
            : item,
        ),
      )
    } else {
      setCarrito([...carrito, { producto, cantidad: 1 }])
    }
  }

  const quitarDelCarrito = (productoId: string): void => {
    setCarrito(
      carrito
        .map((item) => (item.producto.id === productoId ? { ...item, cantidad: item.cantidad - 1 } : item))
        .filter((item) => item.cantidad > 0),
    )
  }

  const eliminarDelCarrito = (productoId: string): void => {
    setCarrito(carrito.filter((item) => item.producto.id !== productoId))
  }

  const procesarPago = async (): Promise<void> => {
    if (carrito.length === 0) return

    setProcesandoPago(true)

    try {
      const ventaData = {
        fecha_venta: new Date().toISOString(),
        total: totalCarrito,
        metodo_pago: "efectivo",
        notas: `Venta de ${carrito.length} productos`,
        items: carrito.map((item) => ({
          producto_id: item.producto.id,
          cantidad: item.cantidad,
          precio_unitario: item.producto.precio_unitario || 0,
          subtotal: (item.producto.precio_unitario || 0) * item.cantidad,
        })),
      }

      await agregarVenta(ventaData)

      for (const item of carrito) {
        const nuevoStock = item.producto.cantidad - item.cantidad
        await actualizarItemInventario(item.producto.id, {
          cantidad: nuevoStock,
        })
      }

      setCarrito([])
      alert("¡Venta procesada exitosamente!")
    } catch (error) {
      console.error("Error al procesar la venta:", error)
      alert("Error al procesar la venta. Intenta nuevamente.")
    } finally {
      setProcesandoPago(false)
    }
  }

  return (
    <div className="p-3 ml-16 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          <button
            onClick={() => setPestanaActiva("venta")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              pestanaActiva === "venta"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <ShoppingCart className="h-4 w-4 inline mr-2" />
            Punto de Venta
          </button>
          <button
            onClick={() => setPestanaActiva("historial")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              pestanaActiva === "historial"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <History className="h-4 w-4 inline mr-2" />
            Historial
          </button>
        </div>
      </div>

      {pestanaActiva === "venta" ? (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 h-[calc(100vh-180px)]">
            <div className="flex-1 flex flex-col">
              <div className="mb-3 flex items-center space-x-2 overflow-x-auto pb-2">
                {categoriasUnicas.map((catId) => {
                  if (catId === "todos") {
                    return (
                      <button
                        key="todos"
                        onClick={() => setCategoriaFiltro("todos")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                          categoriaFiltro === "todos"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        Todos
                      </button>
                    )
                  }

                  const categoria = categoriasProductos.find((categoria: CategoriaInventario) => categoria.id === catId)
                  if (!categoria) return null

                  return (
                    <button
                      key={categoria.id}
                      onClick={() => setCategoriaFiltro(categoria.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                        categoriaFiltro === categoria.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {categoria.nombre}
                    </button>
                  )
                })}
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
                  {productosFiltrados.map((producto: ItemInventario) => (
                    <div
                      key={producto.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 flex flex-col"
                    >
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-800 dark:text-gray-100 text-xs leading-tight">
                          {producto.nombre}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Stock: {producto.cantidad}</p>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
                          ${formatearPrecio(producto.precio_unitario || 0)}
                        </p>
                      </div>
                      <button
                        onClick={() => agregarAlCarrito(producto)}
                        disabled={producto.cantidad <= 0}
                        className="mt-2 w-full bg-blue-600 text-white py-1 px-2 rounded text-xs hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Agregar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-80 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Carrito</h2>
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                  {carrito.length} items
                </div>
              </div>

              {carrito.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
                  <div>
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Carrito vacío</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                    {carrito.map((item: CarritoItem) => (
                      <div key={item.producto.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-gray-800 dark:text-gray-100 text-sm flex-1">
                            {item.producto.nombre}
                          </h4>
                          <button
                            onClick={() => eliminarDelCarrito(item.producto.id)}
                            className="text-gray-400 hover:text-red-500 ml-2"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => quitarDelCarrito(item.producto.id)}
                              className="text-gray-500 hover:text-red-500 p-1"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
                            <button
                              onClick={() => agregarAlCarrito(item.producto)}
                              disabled={item.cantidad >= item.producto.cantidad}
                              className="text-gray-500 hover:text-green-500 p-1 disabled:opacity-50"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              ${formatearPrecio(item.producto.precio_unitario || 0)} c/u
                            </p>
                            <p className="font-medium text-sm">
                              ${formatearPrecio((item.producto.precio_unitario || 0) * item.cantidad)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total:</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        ${formatearPrecio(totalCarrito)}
                      </span>
                    </div>
                    <button
                      onClick={procesarPago}
                      disabled={carrito.length === 0 || procesandoPago}
                      className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        carrito.length === 0 || procesandoPago
                          ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {procesandoPago ? "Procesando..." : "Realizar Pago"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Historial de Ventas</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Total: ${formatearPrecio(ventas?.reduce((sum: number, venta: Venta) => sum + venta.total, 0) || 0)}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {ventas?.length || 0} ventas
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
            {!ventas || ventas.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay ventas registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ventas.map((venta: Venta) => (
                  <div key={venta.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">Venta #{venta.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(venta.fecha_venta).toLocaleDateString("es-CO", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-600 dark:text-green-400">
                          ${formatearPrecio(venta.total)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{venta.metodo_pago}</p>
                      </div>
                    </div>
                    {venta.notas && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{venta.notas}</p>}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {venta.items?.length || 0} productos vendidos
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
