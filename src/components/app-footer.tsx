export function AppFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-8 text-center text-xs text-muted-foreground space-y-1">
      <p className="font-bold">© {currentYear} SPESA SMART - RISPARMIO INTELLIGENTE</p>
      <p>CREATO CON PASSIONE DA CHI HA A CUORE IL RISPARMIO</p>
    </footer>
  );
}
