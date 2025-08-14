import { useState } from "react";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useGymData } from "../../hooks/useGymData";

export function GaleriaPage() {
  const { galeria, agregarItemGaleria, eliminarItemGaleria } = useGymData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [nuevaImagen, setNuevaImagen] = useState({
    titulo: "",
    descripcion: "",
    archivo: null as File | null,
    vistaPrevia: "",
  });

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? galeria.length - 1 : prevIndex - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === galeria.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNuevaImagen({
        ...nuevaImagen,
        archivo: file,
        vistaPrevia: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaImagen.archivo) return;

    // En una aplicación real, aquí subirías la imagen a un servidor
    // Por ahora, simulamos la subida con datos locales
    const nuevoItem = {
      titulo: nuevaImagen.titulo || "Sin título",
      descripcion: nuevaImagen.descripcion,
      ruta_imagen: nuevaImagen.vistaPrevia,
      fecha: new Date().toISOString(),
      id: Date.now().toString(),
      fecha_registro: new Date().toISOString(),
    };

    agregarItemGaleria(nuevoItem);
    setShowUploadForm(false);
    setNuevaImagen({
      titulo: "",
      descripcion: "",
      archivo: null,
      vistaPrevia: "",
    });
  };

  const handleEliminarImagen = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta imagen?")) {
      eliminarItemGaleria(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Galería de Fotos</h1>
        <button
          onClick={() => setShowUploadForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Subir Imagen</span>
        </button>
      </div>

      {galeria.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No hay imágenes en la galería. Sube tu primera imagen.
          </p>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-lg bg-gray-100 max-w-3xl mx-auto">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {galeria.map((item) => (
              <div
                key={item.id}
                className="w-full flex-shrink-0 relative group"
              >
                <div className="aspect-w-16 aspect-h-9 max-h-96">
                  <img
                    src={item.ruta_imagen}
                    alt={item.titulo}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-between p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleEliminarImagen(item.id)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Eliminar imagen"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="text-white">
                    <h3 className="text-xl font-bold">{item.titulo}</h3>
                    {item.descripcion && (
                      <p className="mt-2 text-gray-200">{item.descripcion}</p>
                    )}
                    <p className="text-sm text-gray-300 mt-2">
                      {new Date(item.fecha).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {galeria.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                aria-label="Siguiente imagen"
              >
                <ChevronRight size={24} />
              </button>

              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {galeria.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full ${currentIndex === index ? "bg-white" : "bg-white bg-opacity-50"}`}
                    aria-label={`Ir a la imagen ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal para subir imagen */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Subir Nueva Imagen</h2>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={nuevaImagen.titulo}
                  onChange={(e) =>
                    setNuevaImagen({ ...nuevaImagen, titulo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Título de la imagen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={nuevaImagen.descripcion}
                  onChange={(e) =>
                    setNuevaImagen({
                      ...nuevaImagen,
                      descripcion: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descripción de la imagen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    {nuevaImagen.vistaPrevia ? (
                      <div className="mt-2">
                        <img
                          src={nuevaImagen.vistaPrevia}
                          alt="Vista previa"
                          className="mx-auto h-32 w-auto object-cover rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          {nuevaImagen.archivo?.name}
                        </p>
                      </div>
                    ) : (
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Subir un archivo</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">o arrastra y suelta</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF hasta 10MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!nuevaImagen.archivo}
                  className={`px-4 py-2 rounded-lg text-white ${nuevaImagen.archivo ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"}`}
                >
                  Subir Imagen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
