import { useState, useEffect } from "react";
import { Sidebar } from "./components/Layout/Sidebar";
import { Header } from "./components/Layout/Header";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { UsuariosList } from "./components/Usuarios/UsuariosList";
import { UsuarioForm } from "./components/Usuarios/UsuarioForm";
import { MembresiasList } from "./components/Membresias/MembresiasList";
import { InventarioList } from "./components/Inventario/InventarioList";
import { VentasPage } from "./components/Ventas/VentasPage";
import { EntrenadoresPage } from "./components/Entrenadores/EntrenadoresPage";
import { GaleriaPage } from "./components/Galeria/GaleriaPage";
import { NotificacionesPanel } from "./components/Notificaciones/NotificacionesPanel";
import { Usuario } from "./types";
import { ToastProvider } from "./contexts/ToastContext";
import { LoadingScreen } from "./components/Layout/LoadingScreen";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowContent(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showUsuarioForm, setShowUsuarioForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | undefined>();
  const [showNotificaciones, setShowNotificaciones] = useState(false);

  const getSectionTitle = (section: string) => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      usuarios: "Gestión de Miembros",
      membresias: "Gestión de Membresías",
      inventario: "Control de Inventario",
      ventas: "Punto de Venta",
      entrenadores: "Gestión de Entrenadores",
      finanzas: "Control Financiero",
      eventos: "Calendario de Eventos",
      galeria: "Galería de Recuerdos",
    };
    return titles[section] || "Gimnasio Lina García";
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "ventas":
        return <VentasPage />;
      case "usuarios":
        return (
          <>
            <UsuariosList
              onAddUser={() => {
                setEditingUsuario(undefined);
                setShowUsuarioForm(true);
              }}
              onEditUser={(usuario) => {
                setEditingUsuario(usuario);
                setShowUsuarioForm(true);
              }}
            />
            {showUsuarioForm && (
              <UsuarioForm
                usuario={editingUsuario}
                onClose={() => {
                  setShowUsuarioForm(false);
                  setEditingUsuario(undefined);
                }}
                onSave={() => {
                  // Refresh data if needed
                }}
              />
            )}
          </>
        );
      case "membresias":
        return <MembresiasList />;
      case "inventario":
        return <InventarioList />;
      case "entrenadores":
        return <EntrenadoresPage />;
      case "finanzas":
        return (
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Control Financiero
            </h3>
            <p className="text-gray-600">Sistema financiero en desarrollo...</p>
          </div>
        );
      case "eventos":
        return (
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Calendario de Eventos
            </h3>
            <p className="text-gray-600">Sistema de eventos en desarrollo...</p>
          </div>
        );
      case "galeria":
        return <GaleriaPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      {!showContent && (
        <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
      )}
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header
              title={getSectionTitle(activeSection)}
              onNotificationsClick={() => setShowNotificaciones(true)}
            />
            <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {renderContent()}
            </main>
          </div>

          {showNotificaciones && (
            <NotificacionesPanel
              isOpen={showNotificaciones}
              onClose={() => setShowNotificaciones(false)}
            />
          )}
        </div>
      </ToastProvider>
    </>
  );
}

export default App;
