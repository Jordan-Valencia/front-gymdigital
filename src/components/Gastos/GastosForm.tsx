import type React from "react"
import { useState, useEffect } from "react"
import { X, Save } from "lucide-react"
import type { Gasto } from "../../types"
import { useGymData } from "../../hooks/useGymData"
import { useToast } from "../../contexts/ToastContext" 

interface GastoFormProps {
  gasto?: Gasto
  onClose: () => void
  onSave: () => void
}

const categorias = [
    "Instalaciones y Alquiler",
    "Equipamiento y Mantenimiento",
    "Servicios",
    "Personal",
    "Marketing y Publicidad",
    "Suministros y Compras",
    "Administración y Legal",
    "Otros",
  ]
  

export function GastoForm({ gasto, onClose, onSave }: GastoFormProps) {
  const { agregarGasto, actualizarGasto } = useGymData()
  const { showToast } = useToast() 
  const [formData, setFormData] = useState({
    descripcion: "",
    monto: "",
    categoria: "",
    fecha: new Date().toISOString().split("T")[0],
    concepto: "",
  })

  useEffect(() => {
    if (gasto) {
      setFormData({
        descripcion: gasto.descripcion || "",
        monto: gasto.monto.toString(),
        categoria: gasto.categoria || "",
        fecha: gasto.fecha,
        concepto: gasto.concepto || "",
      })
    }
  }, [gasto])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const gastoData = {
      ...formData,
      monto: Number.parseFloat(formData.monto),
    }

    try {
      if (gasto) {
        await actualizarGasto(gasto.id, gastoData)
        showToast("Gasto actualizado correctamente", "success")
      } else {
        await agregarGasto(gastoData)
        showToast("Gasto creado correctamente", "success")
      }

      onSave()
      onClose()
    } catch (error) {
      showToast("Error al guardar el gasto", "error")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ml-20">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {gasto ? "Editar Gasto" : "Agregar Gasto"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción *</label>
            <input
              type="text"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              placeholder="Ej: Compra de pesas, Pago de electricidad..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto *</label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría *</label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha *</label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
            <textarea
              name="concepto"
              value={formData.concepto}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
              placeholder="Información adicional sobre el gasto..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
            >
              <Save size={16} />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
