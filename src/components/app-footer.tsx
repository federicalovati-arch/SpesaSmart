export function AppFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-4 text-center text-xs text-muted-foreground">
      © {currentYear} Creato con passione da chi ha a cuore il risparmio
    </footer>
  );
}
