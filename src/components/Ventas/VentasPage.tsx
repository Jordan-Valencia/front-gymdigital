"use client"

import { useState } from "react"
import { ShoppingCart, Plus, Minus, X, Search } from "lucide-react"
import { useGymData } from "../../hooks/useGymData"
import type { ItemInventario } from "../../types"

type CarritoItem = {
  producto: ItemInventario
  cantidad: number
}

export function VentasPage() {
  const { inventario, categorias } = useGymData()
  const [carrito, setCarrito] = useState<CarritoItem[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("todos")

  const categoriasProductos = categorias.filter(categoria => categoria.tipo === "producto");

  const productosFiltrados = inventario.filter((producto) => {
    const categoria = categorias.find((c) => c.id === producto.categoria_id)
    const esProducto = categoria && categoria.tipo === "producto"

    return (
      esProducto &&
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      (categoriaFiltro === "todos" || producto.categoria_id === categoriaFiltro)
    )
  })

  const categoriasUnicas = ["todos", ...new Set(categoriasProductos.map((c) => c.id))]
  const totalCarrito = carrito.reduce((total, item) => {
    return total + (item.producto.precio_unitario || 0) * item.cantidad
  }, 0)

  const agregarAlCarrito = (producto: ItemInventario) => {
    if (producto.cantidad <= 0) return

    setCarrito((prev) => {
      const existe = prev.find((item) => item.producto.id === producto.id)
      if (existe) {
        // Check if we have enough stock before adding more
        if (existe.cantidad >= producto.cantidad) return prev

        return prev.map((item) => (item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item))
      }
      // Only add to cart if we have at least 1 in stock
      if (producto.cantidad >= 1) {
        return [...prev, { producto, cantidad: 1 }]
      }
      return prev
    })
  }

  const quitarDelCarrito = (productoId: string) => {
    setCarrito((prev) => {
      const item = prev.find((item) => item.producto.id === productoId)
      if (!item) return prev

      if (item.cantidad > 1) {
        return prev.map((i) => (i.producto.id === productoId ? { ...i, cantidad: i.cantidad - 1 } : i))
      }
      return prev.filter((i) => i.producto.id !== productoId)
    })
  }

  const eliminarDelCarrito = (productoId: string) => {
    setCarrito((prev) => prev.filter((item) => item.producto.id !== productoId))
  }

  return (
    <div className="space-y-6 p-6 ml-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Punto de Venta</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Buscar productos..."
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-2/3">
          <div className="mb-4 flex items-center space-x-2 overflow-x-auto pb-2">
            {categoriasUnicas.map((catId) => {
              if (catId === "todos") {
                return (
                  <button
                    key="todos"
                    onClick={() => setCategoriaFiltro("todos")}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                      categoriaFiltro === "todos"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    Todos
                  </button>
                )
              }

              const categoria = categoriasProductos.find((c) => c.id === catId)
              if (!categoria) return null

              return (
                <button
                  key={categoria.id}
                  onClick={() => setCategoriaFiltro(categoria.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    categoriaFiltro === categoria.id
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {categoria.nombre}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 flex flex-col"
              >
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">{producto.nombre}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {producto.cantidad} en stock
                    {producto.cantidad <= (producto.stock_minimo || 0) && (
                      <span className="text-red-500 font-medium"> (Bajo stock)</span>
                    )}
                  </p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                    ${(producto.precio_unitario || 0).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => agregarAlCarrito(producto)}
                  disabled={producto.cantidad <= 0}
                  className="mt-3 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Carrito de Compras</h2>
            <ShoppingCart className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>

          {carrito.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>El carrito está vacío</p>
              <p className="text-sm mt-1">Agrega productos para comenzar</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {carrito.map((item) => (
                  <div key={item.producto.id} className="border-b border-gray-200 dark:border-gray-600 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-100">{item.producto.nombre}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ${(item.producto.precio_unitario || 0).toFixed(2)} c/u
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => quitarDelCarrito(item.producto.id)}
                          className="text-gray-500 dark:text-gray-400 hover:text-red-500 p-1"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center text-gray-900 dark:text-gray-100">{item.cantidad}</span>
                        <button
                          onClick={() => agregarAlCarrito(item.producto)}
                          className="text-gray-500 dark:text-gray-400 hover:text-green-500 p-1"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => eliminarDelCarrito(item.producto.id)}
                          className="text-gray-400 dark:text-gray-500 hover:text-red-500 ml-2 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Stock: {item.producto.cantidad}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        ${((item.producto.precio_unitario || 0) * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal:</span>
                    <span>${totalCarrito.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-2">
                    <span className="text-gray-900 dark:text-gray-100">Total:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">${totalCarrito.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => {
                      // Aquí iría la lógica para procesar el pago
                      alert("Funcionalidad de pago en desarrollo")
                    }}
                    disabled={carrito.length === 0}
                    className={`w-full mt-4 py-3 rounded-lg font-medium transition-colors ${
                      carrito.length === 0
                        ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    Realizar Pago
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
