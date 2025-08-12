import React, { useEffect } from "react";
import { X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const toastStyles = {
  success: "bg-green-100 border-green-500 text-green-700",
  error: "bg-red-100 border-red-500 text-red-700",
  info: "bg-blue-100 border-blue-500 text-blue-700",
  warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
};

const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  duration = 5000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

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
          className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
