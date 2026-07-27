export default function Footer() {
  return (
    <footer className="mt-8 py-4 border-t border-stone/20">
      <p className="text-center text-stone text-xs font-sans">
        © {new Date().getFullYear()} Tienda de Barrio. Todos los derechos
        reservados.
      </p>
    </footer>
  );
}
