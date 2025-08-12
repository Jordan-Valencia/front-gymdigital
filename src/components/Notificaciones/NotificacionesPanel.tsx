import React from "react";
import {
  X,
  Bell,
  CheckCheck,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  Package,
} from "lucide-react";
import { useGymData } from "../../hooks/useGymData";

interface NotificacionesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificacionesPanel({
  isOpen,
  onClose,
}: NotificacionesPanelProps) {
  const { notificaciones, marcarNotificacionLeida, marcarTodasLeidas } =
    useGymData();

  if (!isOpen) return null;

  const getIconoTipo = (tipo: string) => {
    const iconClasses = "transition-all duration-200 group-hover:scale-110";
    switch (tipo) {
      case "stock_bajo":
        return (
          <div className="bg-orange-100 p-2 rounded-lg">
            <AlertTriangle
              className={`text-orange-600 ${iconClasses}`}
              size={18}
            />
          </div>
        );
      case "membresia_vencimiento":
        return (
          <div className="bg-red-100 p-2 rounded-lg">
            <Clock className={`text-red-600 ${iconClasses}`} size={18} />
          </div>
        );
      case "nuevo_miembro":
      case "nueva_membresia":
        return (
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Users className={`text-emerald-600 ${iconClasses}`} size={18} />
          </div>
        );
      case "evento_proximo":
        return (
          <div className="bg-blue-100 p-2 rounded-lg">
            <Calendar className={`text-blue-600 ${iconClasses}`} size={18} />
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-2 rounded-lg">
            <Bell className={`text-gray-600 ${iconClasses}`} size={18} />
          </div>
        );
    }
  };

  const getColorFondo = (tipo: string, leida: boolean) => {
    if (leida) return "bg-gray-50";

    switch (tipo) {
      case "stock_bajo":
        return "bg-orange-50 border-l-4 border-orange-400";
      case "membresia_vencimiento":
        return "bg-red-50 border-l-4 border-red-400";
      case "nuevo_miembro":
      case "nueva_membresia":
        return "bg-green-50 border-l-4 border-green-400";
      case "evento_proximo":
        return "bg-blue-50 border-l-4 border-blue-400";
      default:
        return "bg-white border-l-4 border-gray-400";
    }
  };

  const formatearFecha = (fecha: string) => {
    const ahora = new Date();
    const fechaNotificacion = new Date(fecha);
    const diffMs = ahora.getTime() - fechaNotificacion.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffHoras / 24);

    if (diffHoras < 1) {
      return "Hace unos minutos";
    } else if (diffHoras < 24) {
      return `Hace ${diffHoras} hora${diffHoras > 1 ? "s" : ""}`;
    } else if (diffDias < 7) {
      return `Hace ${diffDias} día${diffDias > 1 ? "s" : ""}`;
    } else {
      return fechaNotificacion.toLocaleDateString("es-ES");
    }
  };

  const notificacionesOrdenadas = [...notificaciones].sort(
    (a, b) =>
      new Date(b.fecha_creacion).getTime() -
      new Date(a.fecha_creacion).getTime(),
  );

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <div className="fixed inset-0 flex items-start justify-end z-50">
      <div
        className="fixed inset-0 bg-black/20 transition-opacity duration-300 z-[1500]"
        style={{ backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />
      <div className="relative w-[420px] h-screen bg-white shadow-2xl animate-slideInRight z-[1501]">
        <div className="p-5 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2.5 rounded-xl">
                <Bell className="text-indigo-600" size={20} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Notificaciones
              </h2>
              {noLeidas > 0 && (
                <span className="bg-indigo-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                  {noLeidas}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 
                rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {noLeidas > 0 && (
            <button
              onClick={marcarTodasLeidas}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
            >
              <CheckCheck size={14} />
              <span>Marcar todas como leídas</span>
            </button>
          )}
        </div>

        <div className="overflow-y-auto h-[calc(100vh-90px)] pb-20">
          {notificacionesOrdenadas.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {notificacionesOrdenadas.map((notificacion) => (
                <div
                  key={notificacion.id}
                  className={`group p-4 hover:bg-gradient-to-r hover:from-gray-50/80 hover:via-white 
                    hover:to-gray-50/20 transition-all duration-300 cursor-pointer relative overflow-hidden
                    hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] hover:-translate-x-1
                    ${notificacion.leida ? "bg-transparent" : getColorFondo(notificacion.tipo, notificacion.leida)}`}
                  onClick={() =>
                    !notificacion.leida &&
                    marcarNotificacionLeida(notificacion.id)
                  }
                >
                  <div className="flex gap-4 items-start relative z-10">
                    <div
                      className="flex-shrink-0 transform transition-transform duration-300 
                      group-hover:scale-110 group-hover:-rotate-3"
                    >
                      {getIconoTipo(notificacion.tipo)}
                    </div>
                    <div
                      className="flex-1 min-w-0 transform transition-transform duration-300 
                      group-hover:translate-x-1"
                    >
                      <p
                        className={`text-sm leading-relaxed mb-1 transition-colors duration-300
                        group-hover:text-gray-900 ${
                          notificacion.leida
                            ? "text-gray-600"
                            : "text-gray-900 font-medium"
                        }`}
                      >
                        {notificacion.mensaje}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <div
                          className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full
                          group-hover:bg-gray-200 transition-colors duration-300"
                        >
                          <Clock
                            size={12}
                            className="group-hover:text-indigo-500 transition-colors duration-300"
                          />
                          {formatearFecha(notificacion.fecha_creacion)}
                        </div>
                      </p>
                    </div>
                    {!notificacion.leida && (
                      <div
                        className="w-2.5 h-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 
                        rounded-full flex-shrink-0 mt-2 group-hover:scale-150 transition-all duration-300
                        group-hover:shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                      ></div>
                    )}
                  </div>
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-white/20 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
              <div className="bg-gray-100/80 p-4 rounded-full mb-4">
                <Bell size={32} className="text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-600">
                No hay notificaciones
              </p>
              <p className="text-sm text-gray-400">
                Las notificaciones aparecerán aquí
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
