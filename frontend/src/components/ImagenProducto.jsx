import { useState, useEffect } from "react";

function ImagenProducto({ url, nombre, className = "", fallbackText = "📦" }) {
const [error, setError] = useState(false);
const [imagenUrl, setImagenUrl] = useState("");

useEffect(() => {
    if (!url) {
    setImagenUrl("");
    return;
    }

    // Si la URL ya es completa (empieza con http), usarla directamente
    if (url.startsWith("http://") || url.startsWith("https://")) {
    setImagenUrl(url);
    return;
    }

    // Si la URL empieza con /uploads, construir la URL completa
    if (url.startsWith("/uploads")) {
    const baseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:4000/api";
      // Quitar /api de la baseUrl si es necesario
    const cleanBaseUrl = baseUrl.replace(/\/api$/, "");
    setImagenUrl(`${cleanBaseUrl}${url}`);
    return;
    }

    // Si es una URL relativa sin /uploads, asumir que es directa
    setImagenUrl(url);
}, [url]);

  // Resetear error cuando cambia la URL
useEffect(() => {
    setError(false);
}, [imagenUrl]);

if (!imagenUrl || error) {
    return (
    <div
        className={`flex items-center justify-center bg-gray-100 text-2xl ${className}`}
        title={nombre || "Producto sin imagen"}
    >
        {fallbackText}
    </div>
    );
}

return (
    <img
    src={imagenUrl}
    alt={nombre || "Producto"}
    className={`object-cover ${className}`}
    onError={() => setError(true)}
    loading="lazy"
    />
);
}

export default ImagenProducto;
