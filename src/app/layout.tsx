import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { BottomNav } from '@/components/bottom-nav';
import { AppFooter } from '@/components/app-footer';
import { DataProvider } from '@/context/data-context';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { ThemeProvider } from '@/context/theme-provider';

export const metadata: Metadata = {
  title: 'Spesa Smart',
  description: 'Gestisci la tua spesa in modo intelligente.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider>
          <FirebaseClientProvider>
            <DataProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="flex flex-col bg-gray-50 overflow-x-hidden">
                  <div className="flex-grow pb-16 md:pb-0">{children}</div>
                  <AppFooter />
                </SidebarInset>
              </SidebarProvider>
              <Toaster />
              <BottomNav />
              <FirebaseErrorListener />
            </DataProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
