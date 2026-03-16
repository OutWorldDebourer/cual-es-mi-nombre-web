import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Cuál es mi nombre — Tu asistente inteligente en WhatsApp",
    template: "%s | Cuál es mi nombre",
  },
  description:
    "Gestiona tu calendario, toma notas y configura recordatorios — todo desde una conversación natural en WhatsApp con IA.",
  keywords: [
    "asistente virtual",
    "WhatsApp",
    "IA",
    "calendario",
    "notas",
    "recordatorios",
    "inteligencia artificial",
  ],
  authors: [{ name: "Cuál es mi nombre" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://cual-es-mi-nombre.vercel.app",
  ),
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "Cuál es mi nombre",
    title: "Cuál es mi nombre — Tu asistente inteligente en WhatsApp",
    description:
      "Gestiona tu calendario, toma notas y configura recordatorios — todo desde una conversación natural en WhatsApp con IA.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cuál es mi nombre — Tu asistente inteligente en WhatsApp",
    description:
      "Gestiona tu calendario, notas y recordatorios desde WhatsApp con IA.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast: "font-sans",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
