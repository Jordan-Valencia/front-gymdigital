import type React from "react"
import { useEffect } from "react"
import { X } from "lucide-react"

type ToastType = "success" | "error" | "info" | "warning"

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

const toastStyles = {
  success:
    "bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-600 text-green-700 dark:text-green-300",
  error: "bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-600 text-red-700 dark:text-red-300",
  info: "bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600 text-blue-700 dark:text-blue-300",
  warning:
    "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300",
}

const Toast: React.FC<ToastProps> = ({ message, type = "info", duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-6 py-4 border-l-4 rounded shadow-lg ${toastStyles[type]}`}
      role="alert"
    >
      <div className="flex items-center">
        <div className="py-1">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 
            focus:outline-none transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

export default Toast
